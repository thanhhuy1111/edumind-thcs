import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message parameter" }, { status: 400 });
    }

    // Retrieve active teacher and classes context
    const teacher = await prisma.user.findFirst();
    const classes = await prisma.class.findMany({
      include: {
        students: {
          include: {
            studentSkills: {
              include: { skill: true },
            },
          },
        },
      },
    });

    const aiProvider = getAIProvider();
    const response = await aiProvider.chat(
      [{ role: "user", content: message }],
      { teacher, classes }
    );

    // Save message to conversation if conversationId or default
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

    return NextResponse.json(response);
  } catch (error) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal server error processing AI chat" },
      { status: 500 }
    );
  }
}
