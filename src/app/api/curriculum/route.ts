import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectCode = searchParams.get("subject") || "MUSIC";
    const gradeLevel = searchParams.get("grade") ? parseInt(searchParams.get("grade")!, 10) : undefined;

    const subject = await prisma.subject.findUnique({
      where: { code: subjectCode },
      include: {
        chapters: {
          where: gradeLevel ? { gradeLevel } : undefined,
          include: {
            lessons: {
              include: {
                skills: true,
              },
              orderBy: { orderNumber: "asc" },
            },
          },
          orderBy: [{ gradeLevel: "asc" }, { orderNumber: "asc" }],
        },
      },
    });

    const allSubjects = await prisma.subject.findMany({
      select: { id: true, code: true, name: true, icon: true },
    });

    return NextResponse.json({
      activeSubject: subject,
      availableSubjects: allSubjects,
    });
  } catch (error) {
    console.error("Curriculum API Error:", error);
    return NextResponse.json({ error: "Lỗi tải chương trình giáo dục" }, { status: 500 });
  }
}
