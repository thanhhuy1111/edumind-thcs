import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cls = await prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            examAttempts: {
              select: { score: true, maxScore: true, submittedAt: true },
              orderBy: { submittedAt: "desc" },
            },
            studentSkills: {
              include: { skill: true },
            },
          },
          orderBy: { studentCode: "asc" },
        },
        exams: {
          include: {
            versions: true,
            _count: { select: { attempts: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!cls) {
      return NextResponse.json({ error: "Không tìm thấy lớp học" }, { status: 404 });
    }

    // Compute stats
    let totalScore = 0;
    let scoreCount = 0;
    const gradeDistribution = {
      gioi: 0, // >= 8.0
      kha: 0, // 6.5 - 7.9
      tb: 0, // 5.0 - 6.4
      yeu: 0, // < 5.0
    };

    const studentsWithAverage = cls.students.map((s) => {
      const scores = s.examAttempts.map((a) => a.score);
      const studentAvg =
        scores.length > 0
          ? scores.reduce((sum, curr) => sum + curr, 0) / scores.length
          : null;

      if (studentAvg !== null) {
        totalScore += studentAvg;
        scoreCount++;
        if (studentAvg >= 8.0) gradeDistribution.gioi++;
        else if (studentAvg >= 6.5) gradeDistribution.kha++;
        else if (studentAvg >= 5.0) gradeDistribution.tb++;
        else gradeDistribution.yeu++;
      }

      // Compute lowest skill
      const lowestSkill = s.studentSkills.sort((a, b) => a.masteryScore - b.masteryScore)[0];

      return {
        id: s.id,
        studentCode: s.studentCode,
        name: s.name,
        gender: s.gender,
        birthday: s.birthday,
        parentPhone: s.parentPhone,
        status: s.status,
        averageScore: studentAvg !== null ? studentAvg.toFixed(1) : "—",
        lowestSkill: lowestSkill ? `${lowestSkill.skill.name} (${lowestSkill.masteryScore}%)` : "—",
        recentAttemptsCount: s.examAttempts.length,
      };
    });

    const classAverage = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : "—";

    return NextResponse.json({
      ...cls,
      classAverage,
      gradeDistribution,
      students: studentsWithAverage,
    });
  } catch (error) {
    console.error("Get Class Detail API Error:", error);
    return NextResponse.json({ error: "Lỗi tải thông tin lớp" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, gradeLevel, subject, schoolYear, roomNumber, notes } = body;

    const updated = await prisma.class.update({
      where: { id },
      data: {
        name,
        gradeLevel: gradeLevel ? parseInt(gradeLevel, 10) : undefined,
        subject,
        schoolYear,
        roomNumber,
        notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Class API Error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật lớp học" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.class.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Class API Error:", error);
    return NextResponse.json({ error: "Lỗi xóa lớp học" }, { status: 500 });
  }
}
