import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "GENERATE_PACKAGE", params } = body;
    const ai = getAIProvider();
    const teacher = await prisma.user.findFirst();

    if (action === "GENERATE_PACKAGE") {
      const pkg = await ai.generateExamCV7991({
        title: params?.title || "Kiểm tra định kỳ môn Âm nhạc theo Công văn 7991",
        subject: params?.subject || "Âm nhạc",
        grade: params?.grade || 7,
        semester: params?.semester || 1,
        durationMinutes: params?.durationMinutes || 45,
        totalScore: params?.totalScore || 10.0,
        examType: params?.examType || "GIUA_KY",
        topics: params?.topics || ["Thực hành Hát & Nhạc cụ gõ", "Lí thuyết âm nhạc & Đọc nhạc"],
        learningOutcomes: params?.learningOutcomes || [],
        matrixRatio: params?.matrixRatio || {
          nhanBiet: 40,
          thongHieu: 30,
          vanDung: 20,
          vanDungCao: 10,
        },
      });

      return NextResponse.json(pkg);
    }

    if (action === "VALIDATE_CONSISTENCY") {
      const { questions, totalScore = 10, matrix } = params;
      const warnings: string[] = [];

      let calculatedScore = 0;
      questions.forEach((q: any, idx: number) => {
        const pts = q.scorePoints || (q.type === "ESSAY" ? 3.0 : q.type === "TRUE_FALSE" ? 1.5 : 1.0);
        calculatedScore += pts;
        if (!q.answers || q.answers.length === 0) {
          warnings.push(`Câu ${idx + 1} chưa có phương án trả lời.`);
        }
        if (!q.correct_answer && (!q.answers || !q.answers.some((a: any) => a.isCorrect))) {
          warnings.push(`Câu ${idx + 1} chưa được xác định đáp án đúng.`);
        }
      });

      calculatedScore = Math.round(calculatedScore * 10) / 10;
      if (Math.abs(calculatedScore - totalScore) > 0.1) {
        warnings.push(`Tổng điểm các câu hỏi (${calculatedScore}đ) chưa khớp với Thang điểm cấu hình (${totalScore}đ).`);
      }

      return NextResponse.json({
        isValid: warnings.length === 0,
        calculatedScore,
        totalScore,
        warnings,
      });
    }

    if (action === "SAVE_EXAM_PACKAGE") {
      if (!teacher) {
        return NextResponse.json({ error: "Chưa có tài khoản giáo viên" }, { status: 400 });
      }

      const {
        title,
        subject = "Toán học",
        gradeLevel = 7,
        durationMinutes = 45,
        totalScore = 10.0,
        examType = "GIUA_KY",
        lessonId,
        questions = [],
        matrix,
        specification,
        scoringGuide,
        status = "APPROVED",
      } = params;

      // 1. Create Exam record
      const exam = await prisma.exam.create({
        data: {
          teacherId: teacher.id,
          title,
          subject,
          gradeLevel,
          durationMinutes,
          totalScore,
          questionCount: questions.length,
          examType,
          lessonId: lessonId || null,
          curriculumDoc: "CONG_VAN_7991",
          matrixJson: JSON.stringify(matrix),
          specJson: JSON.stringify(specification),
          gradingGuideJson: JSON.stringify(scoringGuide),
          status,
        },
      });

      // 2. Create Questions & Answers, then link via ExamQuestion
      const dbSubject = await prisma.subject.findFirst({
        where: { name: { contains: subject } },
      }) || await prisma.subject.findFirst();

      const createdQuestionIds: string[] = [];

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const pts = q.scorePoints || (q.type === "ESSAY" ? 3.0 : q.type === "TRUE_FALSE" ? 1.5 : 1.0);

        const newQ = await prisma.question.create({
          data: {
            teacherId: teacher.id,
            subjectId: dbSubject?.id || "default",
            gradeLevel,
            lessonId: lessonId || null,
            questionType: q.type || "SINGLE_CHOICE",
            difficulty: q.difficulty || "THONG_HIEU",
            content: q.content,
            explanation: q.explanation || "Áp dụng công thức và tính chất chuẩn.",
            source: "EduMind AI - CV 7991",
            answers: {
              create: (q.answers || []).map((ans: any, aIdx: number) => ({
                label: ans.label || String.fromCharCode(65 + aIdx),
                content: ans.content,
                isCorrect: Boolean(ans.isCorrect),
                orderNumber: aIdx + 1,
              })),
            },
          },
        });

        createdQuestionIds.push(newQ.id);

        await prisma.examQuestion.create({
          data: {
            examId: exam.id,
            questionId: newQ.id,
            orderNumber: i + 1,
            scorePoints: pts,
          },
        });
      }

      // 3. Generate 4 Versions (101, 102, 103, 104)
      const versionCodes = ["101", "102", "103", "104"];
      for (let vIdx = 0; vIdx < versionCodes.length; vIdx++) {
        const vCode = versionCodes[vIdx];
        const answerKey: Record<number, string> = {};
        for (let qIdx = 0; qIdx < questions.length; qIdx++) {
          const keys = ["A", "B", "C", "D"];
          answerKey[qIdx + 1] = keys[(qIdx + vIdx) % 4];
        }

        await prisma.examVersion.create({
          data: {
            examId: exam.id,
            versionCode: vCode,
            questionOrder: JSON.stringify(createdQuestionIds),
            answerKey: JSON.stringify(answerKey),
          },
        });
      }

      return NextResponse.json({
        success: true,
        examId: exam.id,
        title: exam.title,
      });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("Exam Wizard API Error:", error);
    return NextResponse.json({ error: "Lỗi tạo đề kiểm tra 7991" }, { status: 500 });
  }
}
