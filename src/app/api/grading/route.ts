import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai/provider";

/**
 * Generate AI-personalized feedback for a student based on score, correct count, and skill gaps.
 * Returns a concise, pedagogically sound Vietnamese remark.
 */
async function generateAIFeedback(
  req: NextRequest,
  studentName: string,
  finalScore: number,
  maxScore: number,
  correctCount: number,
  totalQ: number,
  weakSkillNames: string[],
  examTitle: string
): Promise<string> {
  const pct = Math.round((finalScore / maxScore) * 100);
  // Use a lightweight prompt to generate AI feedback
  try {
    const aiProvider = getAIProvider(req);
    const response = await aiProvider.chat(
      [
        {
          role: "user",
          content: `Tạo nhận xét ngắn gọn (1-2 câu) bằng tiếng Việt theo phong cách giáo viên, dựa trên kết quả sau:\n- Học sinh: ${studentName}\n- Bài kiểm tra: ${examTitle}\n- Điểm: ${finalScore}/${maxScore} (${pct}%)\n- Số câu đúng: ${correctCount}/${totalQ}\n${weakSkillNames.length > 0 ? `- Kỹ năng cần rèn thêm: ${weakSkillNames.join(", ")}` : ""}\nYêu cầu: Nhận xét ấm áp, cụ thể, không chung chung. Nếu điểm tốt hãy khuyến khích; nếu điểm thấp hãy nhẹ nhàng chỉ ra cần cải thiện gì.`,
        },
      ],
      {}
    );
    // Remove markdown and keep it short
    return response.content.replace(/[*_#]/g, "").trim().slice(0, 300);
  } catch {
    // Fallback to rule-based feedback
    if (pct >= 85) return `${studentName} làm bài rất tốt, nắm vững kiến thức và trình bày rõ ràng. Tiếp tục phát huy!`;
    if (pct >= 70) return `${studentName} đã hoàn thành bài ở mức khá. Cần ôn luyện thêm một số phần để đạt kết quả tốt hơn.`;
    if (pct >= 55) return `${studentName} cần cố gắng hơn. ${weakSkillNames.length > 0 ? `Đặc biệt chú ý ôn luyện: ${weakSkillNames.slice(0, 2).join(", ")}.` : "Cần ôn tập lại toàn bộ kiến thức chương này."}`;
    return `${studentName} cần được hỗ trợ thêm. ${weakSkillNames.length > 0 ? `Các em nên ôn tập kỹ phần: ${weakSkillNames.slice(0, 2).join(", ")}.` : "Giáo viên nên gặp gỡ trực tiếp để hỗ trợ học sinh."}`;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");

    if (!examId) {
      return NextResponse.json({ error: "Missing examId" }, { status: 400 });
    }

    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      include: {
        student: true,
        version: true,
      },
      orderBy: { student: { studentCode: "asc" } },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Grading GET Error:", error);
    return NextResponse.json({ error: "Lỗi tải kết quả chấm bài" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { examId, submissions = [] } = body;

    if (!examId || !Array.isArray(submissions)) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        versions: true,
        questions: {
          include: {
            question: {
              include: { answers: true, skill: true },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Không tìm thấy đề thi" }, { status: 404 });
    }

    const results = [];

    for (const sub of submissions) {
      const { studentId, versionId, answers = {}, manualScore } = sub;
      if (!studentId) continue;

      let finalScore = 0;
      let correctCount = 0;
      const totalQ = exam.questions.length || 1;
      const pointsPerQ = exam.totalScore / totalQ;

      // Find version to check answer key
      const version = exam.versions.find((v) => v.id === versionId) || exam.versions[0];
      const answerKey = version?.answerKey ? JSON.parse(version.answerKey) : {};

      // Track which questions were wrong for skill-level feedback
      const wrongQuestionNums: string[] = [];

      if (manualScore !== undefined && manualScore !== null && manualScore !== "") {
        finalScore = Math.min(Math.max(parseFloat(manualScore), 0), exam.totalScore);
      } else {
        // Auto grade by comparing with answer key
        Object.keys(answerKey).forEach((qNum) => {
          const expected = answerKey[qNum];
          const studentAns = answers[qNum];
          if (expected && studentAns && expected.toUpperCase() === studentAns.toUpperCase()) {
            correctCount++;
            finalScore += pointsPerQ;
          } else {
            wrongQuestionNums.push(qNum);
          }
        });
        finalScore = Math.round(finalScore * 10) / 10;
      }

      // Lookup student name for AI feedback
      const student = await prisma.student.findUnique({ where: { id: studentId }, select: { name: true } });
      const studentName = student?.name || "Học sinh";

      // Determine weak skill names from wrong questions
      const weakSkillNames: string[] = [];
      for (const eq of exam.questions) {
        const qOrderStr = ((eq as any).orderNumber ?? (eq as any).order)?.toString();
        if (qOrderStr && wrongQuestionNums.includes(qOrderStr) && (eq.question as any).skill?.name) {
          const skillName = (eq.question as any).skill.name;
          if (!weakSkillNames.includes(skillName)) {
            weakSkillNames.push(skillName);
          }
        }
      }

      // Generate AI-powered personalized feedback (async, non-blocking per student)
      const aiFeedback = await generateAIFeedback(
        req,
        studentName,
        finalScore,
        exam.totalScore,
        correctCount,
        totalQ,
        weakSkillNames,
        exam.title
      );

      // Upsert ExamAttempt
      const existingAttempt = await prisma.examAttempt.findFirst({
        where: { examId, studentId },
      });

      let attemptRecord;
      const gradingDetail = JSON.stringify({
        correctCount,
        totalQuestions: totalQ,
        wrongQuestions: wrongQuestionNums,
        weakSkills: weakSkillNames,
        feedback: aiFeedback,
        aiGenerated: true,
      });

      if (existingAttempt) {
        attemptRecord = await prisma.examAttempt.update({
          where: { id: existingAttempt.id },
          data: {
            versionId: version?.id,
            score: finalScore,
            maxScore: exam.totalScore,
            studentAnswers: JSON.stringify(answers),
            gradingDetail,
            status: "GRADED",
            gradedAt: new Date(),
          },
        });
      } else {
        attemptRecord = await prisma.examAttempt.create({
          data: {
            examId,
            studentId,
            versionId: version?.id,
            score: finalScore,
            maxScore: exam.totalScore,
            studentAnswers: JSON.stringify(answers),
            gradingDetail,
            status: "GRADED",
            gradedAt: new Date(),
          },
        });
      }

      // Update student skills mastery with question-level accuracy
      for (const eq of exam.questions) {
        if ((eq.question as any).skillId) {
          const skillId = (eq.question as any).skillId;
          const qOrderStr = ((eq as any).orderNumber ?? (eq as any).order)?.toString();
          // Check if this specific question was correct
          const qAnswerKey = answerKey[qOrderStr || ""];
          const qStudentAns = answers[qOrderStr || ""];
          const isQuestionCorrect =
            qAnswerKey && qStudentAns
              ? qAnswerKey.toUpperCase() === qStudentAns.toUpperCase()
              : finalScore >= exam.totalScore * 0.6;

          const currentSkill = await prisma.studentSkill.findUnique({
            where: { studentId_skillId: { studentId, skillId } },
          });

          const newAttemptCount = (currentSkill?.attemptCount || 0) + 1;
          const newCorrectCount = (currentSkill?.correctCount || 0) + (isQuestionCorrect ? 1 : 0);
          const newMasteryScore = Math.min(
            100,
            Math.max(10, Math.round((newCorrectCount / newAttemptCount) * 100))
          );

          await prisma.studentSkill.upsert({
            where: { studentId_skillId: { studentId, skillId } },
            update: {
              attemptCount: newAttemptCount,
              correctCount: newCorrectCount,
              masteryScore: newMasteryScore,
              lastUpdated: new Date(),
            },
            create: {
              studentId,
              skillId,
              attemptCount: newAttemptCount,
              correctCount: newCorrectCount,
              masteryScore: newMasteryScore,
            },
          });
        }
      }

      // Update student status based on score
      if (finalScore < exam.totalScore * 0.55) {
        await prisma.student.update({
          where: { id: studentId },
          data: { status: "WARNING" },
        });
      } else {
        await prisma.student.update({
          where: { id: studentId },
          data: { status: "ACTIVE" },
        });
      }

      results.push(attemptRecord);
    }

    // Mark exam status as COMPLETED
    await prisma.exam.update({
      where: { id: examId },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({
      success: true,
      gradedCount: results.length,
      attempts: results,
    });
  } catch (error) {
    console.error("Grading POST Error:", error);
    return NextResponse.json({ error: "Lỗi lưu kết quả chấm bài" }, { status: 500 });
  }
}
