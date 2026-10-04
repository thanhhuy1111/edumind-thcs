import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        class: true,
        versions: { orderBy: { versionCode: "asc" } },
        questions: {
          include: {
            question: {
              include: {
                answers: { orderBy: { orderNumber: "asc" } },
                skill: true,
              },
            },
          },
          orderBy: { orderNumber: "asc" },
        },
        attempts: {
          include: {
            student: true,
            version: true,
          },
          orderBy: { score: "desc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Không tìm thấy đề thi" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Get Exam API Error:", error);
    return NextResponse.json({ error: "Lỗi tải đề thi" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, durationMinutes, totalScore, status, schoolName } = body;

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        title,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
        totalScore: totalScore ? parseFloat(totalScore) : undefined,
        status,
        schoolName,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Exam API Error:", error);
    return NextResponse.json({ error: "Không thể cập nhật đề thi" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.exam.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Exam API Error:", error);
    return NextResponse.json({ error: "Không thể xóa đề thi" }, { status: 500 });
  }
}
