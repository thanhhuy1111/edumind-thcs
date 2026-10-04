import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    // Fetch all student skills
    const studentSkills = await prisma.studentSkill.findMany({
      where: classId ? { student: { classId } } : undefined,
      include: {
        skill: true,
        student: {
          include: { class: true },
        },
      },
    });

    // Group by skill
    const skillStatsMap: Record<
      string,
      { skillId: string; name: string; totalScore: number; count: number; below60Count: number }
    > = {};

    studentSkills.forEach((ss) => {
      const sId = ss.skillId;
      if (!skillStatsMap[sId]) {
        skillStatsMap[sId] = {
          skillId: sId,
          name: ss.skill.name,
          totalScore: 0,
          count: 0,
          below60Count: 0,
        };
      }
      skillStatsMap[sId].totalScore += ss.masteryScore;
      skillStatsMap[sId].count++;
      if (ss.masteryScore < 60) {
        skillStatsMap[sId].below60Count++;
      }
    });

    const skillMasterySummary = Object.values(skillStatsMap).map((item) => ({
      skillId: item.skillId,
      name: item.name,
      averageMastery: Math.round(item.totalScore / (item.count || 1)),
      studentCount: item.count,
      below60Count: item.below60Count,
    }));

    // Find top struggling students
    const warningStudents = await prisma.student.findMany({
      where: {
        status: "WARNING",
        ...(classId ? { classId } : {}),
      },
      include: {
        class: true,
        studentSkills: {
          include: { skill: true },
          orderBy: { masteryScore: "asc" },
        },
        examAttempts: {
          select: { score: true },
        },
      },
      take: 10,
    });

    const strugglingStudents = warningStudents.map((s) => {
      const scores = s.examAttempts.map((a) => a.score);
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";
      const lowest = s.studentSkills[0];

      return {
        id: s.id,
        name: s.name,
        studentCode: s.studentCode,
        className: s.class.name,
        averageScore: avg,
        weakSkillName: lowest?.skill.name || "Tỉ lệ thức",
        weakSkillScore: lowest?.masteryScore || 45,
      };
    });

    return NextResponse.json({
      skillMasterySummary,
      strugglingStudents,
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Lỗi tải dữ liệu phân tích" }, { status: 500 });
  }
}
