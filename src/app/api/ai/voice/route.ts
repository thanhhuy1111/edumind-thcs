import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text = "" } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Thiếu nội dung văn bản" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyA8GyEXlqo77FrnMEncgmQu0ujXoFUUbYg";

    // Attempt Gemini TTS models
    const ttsModels = ["gemini-2.5-flash-preview-tts", "gemini-3.8-flash-tts", "gemini-3.1-flash-tts-preview"];

    for (const model of ttsModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: text.slice(0, 500) }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const part = data.candidates?.[0]?.content?.parts?.[0];
          if (part?.inlineData?.data) {
            return NextResponse.json({
              success: true,
              audioBase64: part.inlineData.data,
              mimeType: part.inlineData.mimeType || "audio/mp3",
              source: `Gemini TTS (${model})`,
            });
          }
        }
      } catch (err) {
        console.warn(`TTS attempt with ${model} failed:`, err);
      }
    }

    // Default to Browser Web Speech API fallback
    return NextResponse.json({
      success: true,
      audioBase64: null,
      useBrowserTTS: true,
      text,
      source: "Web Speech API (vi-VN)",
    });
  } catch (error) {
    console.error("Voice synthesis API error:", error);
    return NextResponse.json({ error: "Lỗi tạo giọng nói AI" }, { status: 500 });
  }
}
