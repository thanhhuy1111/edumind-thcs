import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";
import { prisma } from "@/lib/prisma";

/**
 * Build a rich classroom context string for the AI to understand real data.
 * This is the key improvement: we serialize actual DB data into a system prompt
 * so Gemini can answer questions about specific students, classes, and skills.
 */
function buildClassroomContext(teacher: any, classes: any[]): string {
  if (!teacher && classes.length === 0) return "";

  const lines: string[] = [];

  if (teacher) {
    lines.push(`=== GIÁO VIÊN ===`);
    lines.push(`Tên: ${teacher.name || "Giáo viên"}`);
    lines.push(`Email: ${teacher.email || ""}`);
  }

  lines.push(`\n=== DỮ LIỆU LỚP HỌC (${classes.length} lớp) ===`);

  for (const cls of classes) {
    lines.push(`\nLớp: ${cls.name} | Môn: ${cls.subject || "Âm nhạc"} | Sĩ số: ${cls.students?.length || 0}`);

    if (cls.students && cls.students.length > 0) {
      lines.push(`Danh sách học sinh:`);

      for (const student of cls.students) {
        const skills = student.studentSkills || [];
        const avgMastery =
          skills.length > 0
            ? Math.round(skills.reduce((sum: number, sk: any) => sum + (sk.masteryScore || 0), 0) / skills.length)
            : null;

        const weakSkills = skills
          .filter((sk: any) => sk.masteryScore < 60)
          .map((sk: any) => `${sk.skill?.name || "Kỹ năng"} (${sk.masteryScore}%)`);

        const strongSkills = skills
          .filter((sk: any) => sk.masteryScore >= 80)
          .map((sk: any) => `${sk.skill?.name || "Kỹ năng"} (${sk.masteryScore}%)`);

        lines.push(
          `  - ${student.name} [${student.studentCode || ""}]` +
            (avgMastery !== null ? ` | TB: ${avgMastery}%` : "") +
            (student.status === "WARNING" ? " | ⚠️ CẦN CHÚ Ý" : "") +
            (weakSkills.length > 0 ? ` | Yếu: ${weakSkills.slice(0, 3).join(", ")}` : "") +
            (strongSkills.length > 0 ? ` | Mạnh: ${strongSkills.slice(0, 2).join(", ")}` : "")
        );
      }

      // Class-level skill aggregation
      const allSkillData: Record<string, number[]> = {};
      for (const student of cls.students) {
        for (const sk of student.studentSkills || []) {
          const name = sk.skill?.name || sk.skillId;
          if (!allSkillData[name]) allSkillData[name] = [];
          allSkillData[name].push(sk.masteryScore || 0);
        }
      }

      if (Object.keys(allSkillData).length > 0) {
        lines.push(`Trung bình kỹ năng cả lớp:`);
        for (const [skill, scores] of Object.entries(allSkillData)) {
          const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          lines.push(`  - ${skill}: ${avg}% (${scores.filter((s) => s < 60).length}/${scores.length} học sinh dưới 60%)`);
        }
      }
    }
  }

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, stream: useStream = false, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message parameter" }, { status: 400 });
    }

    // Retrieve active teacher and classes context with full student data
    const teacher = await prisma.user.findFirst();
    const classes = await prisma.class.findMany({
      include: {
        students: {
          include: {
            studentSkills: {
              include: { skill: true },
            },
            examAttempts: {
              orderBy: { gradedAt: "desc" },
              take: 3,
              include: { exam: { select: { title: true } } },
            },
          },
          orderBy: { name: "asc" },
        },
      },
    });

    // Build a rich, structured context for the AI
    const classroomContext = buildClassroomContext(teacher, classes);

    // Build multi-turn chat messages
    const chatMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        if (h && typeof h.content === "string" && h.content.trim()) {
          chatMessages.push({
            role: h.role === "assistant" ? "assistant" : "user",
            content: h.content,
          });
        }
      }
    } else if (conversationId) {
      const dbMsgs = await prisma.aIMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        take: 10,
      });
      for (const m of dbMsgs) {
        chatMessages.push({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        });
      }
    }

    // Ensure the current user message is at the end
    if (chatMessages.length === 0 || chatMessages[chatMessages.length - 1].content !== message) {
      chatMessages.push({ role: "user", content: message });
    }

    const aiProvider = getAIProvider(req);

    // Pass the serialized classroom context and full message turns into chat
    const response = await aiProvider.chat(
      chatMessages,
      {
        teacher,
        classes,
        classroomContextText: classroomContext,
      }
    );

    // Save message to conversation
    if (teacher) {
      let conv = conversationId
        ? await prisma.aIConversation.findUnique({ where: { id: conversationId } })
        : await prisma.aIConversation.findFirst({ where: { teacherId: teacher.id } });

      if (!conv) {
        conv = await prisma.aIConversation.create({
          data: {
            teacherId: teacher.id,
            title: message.slice(0, 40) + "...",
          },
        });
      }

      await prisma.aIMessage.create({
        data: {
          conversationId: conv.id,
          role: "user",
          content: message,
        },
      });

      await prisma.aIMessage.create({
        data: {
          conversationId: conv.id,
          role: "assistant",
          content: response.content,
          structuredData: response.structuredData ? JSON.stringify(response.structuredData) : null,
          suggestedActions: response.suggestedActions ? JSON.stringify(response.suggestedActions) : null,
        },
      });
    }

    return NextResponse.json({
      ...response,
      conversationId: conversationId,
    });
  } catch (error) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal server error processing AI chat" },
      { status: 500 }
    );
  }
}
