import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        subject: true,
        chapter: true,
        lesson: true,
        skill: true,
        answers: { orderBy: { orderNumber: "asc" } },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Không tìm thấy câu hỏi" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Get Question API Error:", error);
    return NextResponse.json({ error: "Lỗi tải câu hỏi" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      gradeLevel,
      chapterId,
      lessonId,
      skillId,
      questionType,
      difficulty,
      content,
      answers,
      answer,
      explanation,
      source,
      tags,
    } = body;

    // Update main question
    const updated = await prisma.question.update({
      where: { id },
      data: {
        gradeLevel: gradeLevel ? parseInt(gradeLevel, 10) : undefined,
        chapterId: chapterId || undefined,
        lessonId: lessonId || undefined,
        skillId: skillId || undefined,
        questionType,
        difficulty,
        content,
        answer,
        explanation,
        source,
        tags,
      },
    });

    // If answers provided, re-create them
    if (Array.isArray(answers) && answers.length > 0) {
      await prisma.questionAnswer.deleteMany({ where: { questionId: id } });
      await prisma.questionAnswer.createMany({
        data: answers.map((a: any, idx: number) => ({
          questionId: id,
          label: a.label || String.fromCharCode(65 + idx),
          content: a.content,
          isCorrect: a.isCorrect || false,
          orderNumber: idx + 1,
        })),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Question API Error:", error);
    return NextResponse.json({ error: "Không thể cập nhật câu hỏi" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (action === "TOGGLE_FAVORITE") {
      const q = await prisma.question.findUnique({ where: { id } });
      if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const updated = await prisma.question.update({
        where: { id },
        data: { isFavorite: !q.isFavorite },
      });
      return NextResponse.json(updated);
    }

    if (action === "DUPLICATE") {
      const q = await prisma.question.findUnique({
        where: { id },
        include: { answers: true },
      });
      if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const duplicated = await prisma.question.create({
        data: {
          teacherId: q.teacherId,
          subjectId: q.subjectId,
          gradeLevel: q.gradeLevel,
          chapterId: q.chapterId,
          lessonId: q.lessonId,
          skillId: q.skillId,
          questionType: q.questionType,
          difficulty: q.difficulty,
          content: `${q.content} (Bản sao)`,
          answer: q.answer,
          explanation: q.explanation,
          source: q.source,
          tags: q.tags,
          answers: {
            create: q.answers.map((a) => ({
              label: a.label,
              content: a.content,
              isCorrect: a.isCorrect,
              orderNumber: a.orderNumber,
            })),
          },
        },
        include: { answers: true },
      });
      return NextResponse.json(duplicated, { status: 201 });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("PATCH Question API Error:", error);
    return NextResponse.json({ error: "Lỗi thực thi" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Question API Error:", error);
    return NextResponse.json({ error: "Không thể xóa câu hỏi" }, { status: 500 });
  }
}
