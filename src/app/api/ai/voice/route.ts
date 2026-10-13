import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text = "" } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Thiếu nội dung văn bản" }, { status: 400 });
    }

    const clientApiKey = req.headers.get("x-gemini-key")?.trim();
    const envApiKey = process.env.GEMINI_API_KEY?.trim();
    let apiKey = clientApiKey || envApiKey || "";

    // Filter out invalid placeholder/leaked keys
    if (apiKey.startsWith("AIzaSyA8GyEXlqo")) {
      apiKey = "";
    }

    // If a valid Gemini key is present, attempt Gemini 2.0 Flash audio synthesis
    if (apiKey) {
      const audioModels = ["gemini-2.0-flash", "gemini-2.5-flash-preview-tts"];

      for (const model of audioModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: text.slice(0, 500) }] }],
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: "Aoede",
                    },
                  },
                },
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
                source: `Gemini Audio (${model})`,
              });
            }
          }
        } catch (err) {
          console.warn(`Voice synthesis attempt with ${model} failed:`, err);
        }
      }
    }

    // Default to Browser Web Speech API fallback (natively supported, high quality vi-VN)
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
