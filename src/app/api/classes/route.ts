import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade");

    const whereClause: any = {};
    if (grade) {
      whereClause.gradeLevel = parseInt(grade, 10);
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { students: true, exams: true },
        },
        students: {
          select: {
            id: true,
            status: true,
            examAttempts: {
              select: { score: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Compute average score for each class
    const classesWithStats = classes.map((c) => {
      let totalScore = 0;
      let scoreCount = 0;
      let warningCount = 0;

      c.students.forEach((s) => {
        if (s.status === "WARNING") warningCount++;
        s.examAttempts.forEach((a) => {
          totalScore += a.score;
          scoreCount++;
        });
      });

      const averageScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : "—";

      return {
        id: c.id,
        name: c.name,
        gradeLevel: c.gradeLevel,
        subject: c.subject,
        schoolYear: c.schoolYear,
        roomNumber: c.roomNumber,
        notes: c.notes,
        studentCount: c._count.students,
        examCount: c._count.exams,
        averageScore,
        warningCount,
      };
    });

    return NextResponse.json(classesWithStats);
  } catch (error) {
    console.error("Classes API Error:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, gradeLevel, subject = "Âm nhạc", schoolYear = "2026-2027", roomNumber, notes } = body;

    if (!name || !gradeLevel) {
      return NextResponse.json({ error: "Vui lòng nhập tên lớp và khối" }, { status: 400 });
    }

    const teacher = await prisma.user.findFirst();
    if (!teacher) {
      return NextResponse.json({ error: "Không tìm thấy giáo viên" }, { status: 404 });
    }

    const newClass = await prisma.class.create({
      data: {
        teacherId: teacher.id,
        name,
        gradeLevel: parseInt(gradeLevel, 10),
        subject,
        schoolYear,
        roomNumber,
        notes,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Create Class API Error:", error);
    return NextResponse.json({ error: "Không thể tạo lớp học" }, { status: 500 });
  }
}
