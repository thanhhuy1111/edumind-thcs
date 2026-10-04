import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai/provider";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        examAttempts: {
          include: {
            exam: {
              select: { title: true, subject: true, gradeLevel: true, durationMinutes: true },
            },
            version: {
              select: { versionCode: true },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
        studentSkills: {
          include: {
            skill: {
              include: {
                lesson: {
                  include: {
                    chapter: true,
                  },
                },
              },
            },
          },
          orderBy: { masteryScore: "asc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Không tìm thấy học sinh" }, { status: 404 });
    }

    // Call AI Provider to generate deep individual student insight
    const aiProvider = getAIProvider();
    const aiAnalysis = await aiProvider.analyzeStudent({
      studentName: student.name,
      grade: student.class.gradeLevel,
      classTitle: student.class.name,
      recentScores: student.examAttempts.map((a) => ({
        examTitle: a.exam.title,
        score: a.score,
        maxScore: a.maxScore,
        date: a.submittedAt ? a.submittedAt.toISOString() : "",
      })),
      skillMasteries: student.studentSkills.map((sk) => ({
        skillName: sk.skill.name,
        score: sk.masteryScore,
      })),
    });

    return NextResponse.json({
      ...student,
      aiAnalysis,
    });
  } catch (error) {
    console.error("Student Detail API Error:", error);
    return NextResponse.json({ error: "Lỗi tải thông tin học sinh" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, gender, birthday, parentPhone, status, notes } = body;

    const updated = await prisma.student.update({
      where: { id },
      data: {
        name,
        gender,
        birthday,
        parentPhone,
        status,
        notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Student API Error:", error);
    return NextResponse.json({ error: "Không thể cập nhật học sinh" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Student API Error:", error);
    return NextResponse.json({ error: "Không thể xóa học sinh" }, { status: 500 });
  }
}
