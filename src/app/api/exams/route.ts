import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const gradeLevel = searchParams.get("gradeLevel");
    const status = searchParams.get("status");

    const where: any = {};
    if (classId) where.classId = classId;
    if (gradeLevel && gradeLevel !== "ALL") where.gradeLevel = parseInt(gradeLevel, 10);
    if (status && status !== "ALL") where.status = status;

    const exams = await prisma.exam.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, gradeLevel: true } },
        versions: { select: { id: true, versionCode: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Exams GET API Error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách đề thi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      classId,
      subject = "Toán học",
      gradeLevel = 7,
      durationMinutes = 45,
      totalScore = 10.0,
      questionCount = 10,
      matrixConfig,
      questionIds = [],
      schoolName = "Trường THCS Tân Phong - Vĩnh Long",
      examType = "REGULAR",
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Vui lòng nhập tiêu đề bài kiểm tra" }, { status: 400 });
    }

    const teacher = await prisma.user.findFirst();
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // 1. Create Exam record
    const exam = await prisma.exam.create({
      data: {
        teacherId: teacher.id,
        classId: classId || undefined,
        title,
        subject,
        gradeLevel: parseInt(gradeLevel.toString(), 10),
        durationMinutes: parseInt(durationMinutes.toString(), 10),
        totalScore: parseFloat(totalScore.toString()),
        questionCount: parseInt(questionCount.toString(), 10),
        matrixConfig: matrixConfig ? JSON.stringify(matrixConfig) : null,
        schoolName,
        examType,
        status: "READY",
      },
    });

    // 2. Attach Questions to Exam
    const scorePerQ = totalScore / (questionIds.length || 1);
    for (let i = 0; i < questionIds.length; i++) {
      await prisma.examQuestion.create({
        data: {
          examId: exam.id,
          questionId: questionIds[i],
          orderNumber: i + 1,
          scorePoints: Math.round(scorePerQ * 100) / 100,
        },
      });

      // Increment number of uses for this question
      await prisma.question.update({
        where: { id: questionIds[i] },
        data: { numberOfUses: { increment: 1 } },
      });
    }

    // 3. Automatically generate 4 initial standard versions: 101, 102, 103, 104
    const versionCodes = ["101", "102", "103", "104"];
    for (let v = 0; v < versionCodes.length; v++) {
      const code = versionCodes[v];
      // Shuffle question order for versions 102, 103, 104
      const orderIndices = questionIds.map((_: string, idx: number) => idx + 1);
      if (v > 0) {
        orderIndices.sort(() => Math.random() - 0.5);
      }

      await prisma.examVersion.create({
        data: {
          examId: exam.id,
          versionCode: code,
          questionOrder: JSON.stringify(orderIndices),
          answerKey: JSON.stringify(
            orderIndices.reduce((acc: any, currQNum: number, index: number) => {
              // Map question number to answer
              acc[index + 1] = "A";
              return acc;
            }, {})
          ),
        },
      });
    }

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("Create Exam API Error:", error);
    return NextResponse.json({ error: "Không thể tạo đề kiểm tra" }, { status: 500 });
  }
}
