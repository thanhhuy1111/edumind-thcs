import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAIProvider, getAIProvider } from "@/lib/ai/provider";
import { GeminiAIProvider } from "@/lib/ai/geminiProvider";

export async function GET() {
  try {
    const teacher = await prisma.user.findFirst();
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const currentProvider = getAIProvider();
    const isGemini = currentProvider instanceof GeminiAIProvider;

    return NextResponse.json({
      profile: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone || "0987313889",
        school: teacher.school || "Trường THCS Tân Phong - Vĩnh Long",
        subjects: teacher.subjects || "Âm nhạc",
        grades: teacher.grades || "Khối 6, 7, 8, 9",
      },
      aiEngine: isGemini ? "GEMINI" : "SMART_LOCAL",
      hasCustomKey: isGemini && currentProvider.hasApiKey(),
    });
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ error: "Lỗi tải cấu hình cài đặt" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, aiEngine, apiKey } = body;

    const teacher = await prisma.user.findFirst();
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Update user profile in database
    const updated = await prisma.user.update({
      where: { id: teacher.id },
      data: {
        name: profile?.name || teacher.name,
        email: profile?.email || teacher.email,
        phone: profile?.phone || teacher.phone,
        school: profile?.school || teacher.school,
        subjects: profile?.subjects || teacher.subjects,
        grades: profile?.grades || teacher.grades,
      },
    });

    // Update AI Provider configuration if changed
    if (aiEngine === "GEMINI") {
      const activeKey = apiKey || process.env.GEMINI_API_KEY || "";
      if (activeKey && !activeKey.startsWith("AIzaSyA8GyEXlqo")) {
        setAIProvider(new GeminiAIProvider(activeKey));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { SmartLocalAIProvider } = require("@/lib/ai/provider");
        setAIProvider(new SmartLocalAIProvider());
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { SmartLocalAIProvider } = require("@/lib/ai/provider");
      setAIProvider(new SmartLocalAIProvider());
    }

    return NextResponse.json({
      success: true,
      profile: updated,
      aiEngine,
    });
  } catch (error) {
    console.error("Settings POST Error:", error);
    return NextResponse.json({ error: "Lỗi lưu cấu hình cài đặt" }, { status: 500 });
  }
}
