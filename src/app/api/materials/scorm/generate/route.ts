import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      documentText = "",
      lessonTitle = "Bài giảng THCS Chuyển đổi số",
      subject = "Toán học",
      grade = 7,
      slideCount = 8,
    } = body;

    if (!documentText || documentText.trim().length < 20) {
      return NextResponse.json(
        { error: "Văn bản bài giảng quá ngắn hoặc chưa được bóc tách nội dung." },
        { status: 400 }
      );
    }

    const ai = getAIProvider();

    // Call interactive lesson generation on provider
    if (ai.generateInteractiveLesson) {
      const lesson = await ai.generateInteractiveLesson({
        documentText,
        lessonTitle,
        subject,
        grade: Number(grade) || 7,
        slideCount: Number(slideCount) || 8,
      });

      return NextResponse.json({
        success: true,
        lesson,
      });
    }

    return NextResponse.json(
      { error: "AI Provider không hỗ trợ khởi tạo bài giảng tương tác." },
      { status: 500 }
    );
  } catch (error) {
    console.error("SCORM Interactive Lesson API Error:", error);
    return NextResponse.json(
      { error: "Lỗi trong quá trình AI phân tích tài liệu bài giảng." },
      { status: 500 }
    );
  }
}
