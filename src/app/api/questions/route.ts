import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const gradeLevel = searchParams.get("gradeLevel");
    const chapterId = searchParams.get("chapterId");
    const difficulty = searchParams.get("difficulty");
    const questionType = searchParams.get("questionType");
    const isFavorite = searchParams.get("isFavorite");
    const search = searchParams.get("search");

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (gradeLevel && gradeLevel !== "ALL") where.gradeLevel = parseInt(gradeLevel, 10);
    if (chapterId && chapterId !== "ALL") where.chapterId = chapterId;
    if (difficulty && difficulty !== "ALL") where.difficulty = difficulty;
    if (questionType && questionType !== "ALL") where.questionType = questionType;
    if (isFavorite === "true") where.isFavorite = true;
    if (search) {
      where.OR = [
        { content: { contains: search } },
        { tags: { contains: search } },
        { explanation: { contains: search } },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        subject: { select: { name: true, code: true } },
        chapter: { select: { title: true } },
        lesson: { select: { title: true } },
        skill: { select: { name: true, code: true } },
        answers: { orderBy: { orderNumber: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Questions GET API Error:", error);
    return NextResponse.json({ error: "Lỗi tải ngân hàng câu hỏi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subjectId,
      gradeLevel,
      chapterId,
      lessonId,
      skillId,
      questionType = "SINGLE_CHOICE",
      difficulty = "THONG_HIEU",
      content,
      answers = [],
      answer,
      explanation,
      source = "Tự soạn",
      tags = "toan-thcs",
    } = body;

    if (!content || !gradeLevel) {
      return NextResponse.json({ error: "Vui lòng nhập nội dung câu hỏi và khối lớp" }, { status: 400 });
    }

    // Default subject to Math if not provided
    let finalSubjectId = subjectId;
    if (!finalSubjectId) {
      const math = await prisma.subject.findFirst({ where: { code: "MATH" } });
      finalSubjectId = math?.id;
    }

    const teacher = await prisma.user.findFirst();

    const newQuestion = await prisma.question.create({
      data: {
        teacherId: teacher?.id,
        subjectId: finalSubjectId,
        gradeLevel: parseInt(gradeLevel.toString(), 10),
        chapterId: chapterId || undefined,
        lessonId: lessonId || undefined,
        skillId: skillId || undefined,
        questionType,
        difficulty,
        content,
        answer: answer || (answers.find((a: any) => a.isCorrect)?.label ?? "A"),
        explanation,
        source,
        tags,
        answers: {
          create: answers.map((a: any, index: number) => ({
            label: a.label || String.fromCharCode(65 + index),
            content: a.content,
            isCorrect: a.isCorrect || false,
            orderNumber: index + 1,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Create Question API Error:", error);
    return NextResponse.json({ error: "Không thể lưu câu hỏi" }, { status: 500 });
  }
}
