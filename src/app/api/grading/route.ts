import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
          }
        });
        finalScore = Math.round(finalScore * 10) / 10;
      }

      // Upsert ExamAttempt
      const existingAttempt = await prisma.examAttempt.findFirst({
        where: { examId, studentId },
      });

      let attemptRecord;
      if (existingAttempt) {
        attemptRecord = await prisma.examAttempt.update({
          where: { id: existingAttempt.id },
          data: {
            versionId: version?.id,
            score: finalScore,
            maxScore: exam.totalScore,
            studentAnswers: JSON.stringify(answers),
            gradingDetail: JSON.stringify({
              correctCount,
              totalQuestions: totalQ,
              feedback: finalScore >= 8 ? "Nắm chắc lý thuyết và làm bài tốt." : "Cần rèn luyện thêm kỹ năng tính toán.",
            }),
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
            gradingDetail: JSON.stringify({
              correctCount,
              totalQuestions: totalQ,
              feedback: finalScore >= 8 ? "Nắm chắc lý thuyết và làm bài tốt." : "Cần rèn luyện thêm kỹ năng tính toán.",
            }),
            status: "GRADED",
            gradedAt: new Date(),
          },
        });
      }

      // Update student skills mastery
      for (const eq of exam.questions) {
        if (eq.question.skillId) {
          const skillId = eq.question.skillId;
          const currentSkill = await prisma.studentSkill.findUnique({
            where: {
              studentId_skillId: {
                studentId,
                skillId,
              },
            },
          });

          const isCorrect = finalScore >= (exam.totalScore * 0.6);
          const newAttemptCount = (currentSkill?.attemptCount || 0) + 1;
          const newCorrectCount = (currentSkill?.correctCount || 0) + (isCorrect ? 1 : 0);
          const newMasteryScore = Math.min(
            100,
            Math.max(20, Math.round((newCorrectCount / newAttemptCount) * 100))
          );

          await prisma.studentSkill.upsert({
            where: {
              studentId_skillId: {
                studentId,
                skillId,
              },
            },
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

      // If student score is low, update status to WARNING
      if (finalScore < (exam.totalScore * 0.55)) {
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
