import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subject = "Toán học",
      grade = 7,
      chapter,
      lesson,
      skill,
      questionType = "SINGLE_CHOICE",
      difficulty = "THONG_HIEU",
      count = 5,
      promptNote = "",
    } = body;

    const aiProvider = getAIProvider();
    const generatedQuestions = await aiProvider.generateQuestions({
      subject,
      grade: parseInt(grade.toString(), 10),
      chapter,
      lesson,
      skill,
      questionType,
      difficulty,
      count: Math.min(Math.max(parseInt(count.toString(), 10) || 5, 1), 20),
      promptNote,
    });

    return NextResponse.json({
      success: true,
      count: generatedQuestions.length,
      questions: generatedQuestions,
    });
  } catch (error) {
    console.error("Generate Questions API Error:", error);
    return NextResponse.json(
      { error: "Lỗi tạo câu hỏi bằng AI" },
      { status: 500 }
    );
  }
}
