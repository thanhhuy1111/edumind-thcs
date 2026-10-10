import { NextRequest, NextResponse } from "next/server";
import { GeminiAIProvider } from "@/lib/ai/geminiProvider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = body.apiKey?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập API Key để kiểm tra." },
        { status: 400 }
      );
    }

    if (apiKey.startsWith("AIzaSyA8GyEXlqo")) {
      return NextResponse.json(
        {
          success: false,
          error: "Khóa API này đã bị vô hiệu hóa vì lý do bảo mật. Vui lòng tạo khóa mới trên Google AI Studio.",
        },
        { status: 400 }
      );
    }

    const provider = new GeminiAIProvider(apiKey);
    const testResult = await provider.testConnection();

    return NextResponse.json(testResult);
  } catch (error: any) {
    console.error("Test Key API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi kiểm tra kết nối." },
      { status: 500 }
    );
  }
}
