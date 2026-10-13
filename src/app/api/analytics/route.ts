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
        weakSkillName: lowest?.skill.name || "Kỹ năng cần củng cố",
        weakSkillScore: lowest?.masteryScore || 45,
      };
    });

    // Dynamically diagnose the most critical skill needing intervention
    const sortedByNeed = [...skillMasterySummary].sort(
      (a, b) => b.below60Count - a.below60Count || a.averageMastery - b.averageMastery
    );
    const criticalSkill = sortedByNeed[0];

    const totalAssessedStudents = skillMasterySummary.reduce((max, s) => Math.max(max, s.studentCount), 0);

    const aiDiagnostic =
      criticalSkill && criticalSkill.below60Count > 0
        ? {
            title: `Kỹ năng "${criticalSkill.name}" có tỷ lệ hổng kiến thức cao nhất`,
            weakSkillName: criticalSkill.name,
            weakSkillId: criticalSkill.skillId,
            below60Count: criticalSkill.below60Count,
            averageMastery: criticalSkill.averageMastery,
            description: `Có ${criticalSkill.below60Count} học sinh đạt dưới 60% ở kỹ năng này (mức độ thành thạo trung bình đạt ${criticalSkill.averageMastery}%). Cần tổ chức phụ đạo và cho làm bài tập phân hóa để bù đắp kịp thời.`,
            recommendedAction: `Tạo bài luyện tập bổ trợ: ${criticalSkill.name}`,
            actionTopic: criticalSkill.name,
          }
        : {
            title: "Mặt bằng năng lực học sinh đạt mức ổn định và làm chủ bài học tốt",
            weakSkillName: criticalSkill?.name || "Kỹ năng cơ bản",
            weakSkillId: criticalSkill?.skillId || "",
            below60Count: 0,
            averageMastery:
              skillMasterySummary.length > 0
                ? Math.round(
                    skillMasterySummary.reduce((sum, s) => sum + s.averageMastery, 0) /
                      skillMasterySummary.length
                  )
                : 85,
            description: `Học sinh nắm vững các mục tiêu cần đạt của chương trình GDPT 2018. Giáo viên có thể triển khai thêm bài tập vận dụng sáng tạo để phát huy năng khiếu.`,
            recommendedAction: "Giao nhiệm vụ dự án & hoạt động sáng tạo",
            actionTopic: criticalSkill?.name || "Nâng cao",
          };

    return NextResponse.json({
      skillMasterySummary,
      strugglingStudents,
      aiDiagnostic,
      totalAssessedStudents,
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Lỗi tải dữ liệu phân tích" }, { status: 500 });
  }
}
