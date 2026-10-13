import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Build classroom context text for Gemini system prompt
 */
function buildClassroomContext(teacher: any, classes: any[]): string {
  const lines: string[] = [];

  if (teacher) {
    lines.push(`=== GIÁO VIÊN: ${teacher.name || "Giáo viên"} ===`);
  }

  lines.push(`\n=== DỮ LIỆU LỚP HỌC (${classes.length} lớp) ===`);

  for (const cls of classes) {
    lines.push(`\nLớp: ${cls.name} | Môn: ${cls.subject || "Âm nhạc"} | Sĩ số: ${cls.students?.length || 0}`);

    if (cls.students && cls.students.length > 0) {
      for (const student of cls.students) {
        const skills = student.studentSkills || [];
        const avgMastery =
          skills.length > 0
            ? Math.round(skills.reduce((sum: number, sk: any) => sum + (sk.masteryScore || 0), 0) / skills.length)
            : null;

        const weakSkills = skills
          .filter((sk: any) => sk.masteryScore < 60)
          .map((sk: any) => `${sk.skill?.name || "Kỹ năng"} (${sk.masteryScore}%)`);

        lines.push(
          `  - ${student.name}` +
            (avgMastery !== null ? ` | TB: ${avgMastery}%` : "") +
            (student.status === "WARNING" ? " | ⚠️ CẦN CHÚ Ý" : "") +
            (weakSkills.length > 0 ? ` | Yếu: ${weakSkills.slice(0, 2).join(", ")}` : "")
        );
      }
    }
  }

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY || "";

  if (!apiKey || apiKey.startsWith("AIzaSyA8GyEXlqo")) {
    return new Response(
      JSON.stringify({ error: "Chưa cấu hình Gemini API Key" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { message, history } = await req.json();

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Load classroom data
    const teacher = await prisma.user.findFirst();
    const classes = await prisma.class.findMany({
      include: {
        students: {
          include: {
            studentSkills: { include: { skill: true } },
          },
          orderBy: { name: "asc" },
        },
      },
    });

    const classroomContextText = buildClassroomContext(teacher, classes);
    const teacherName = teacher?.name || "Giáo viên";
    const isDataQuery = /học sinh|lớp|điểm|kỹ năng|yếu|mạnh|kết quả|tiến bộ|phân tích|so sánh|nguy cơ|cần chú ý/i.test(message);

    const dataSection = classroomContextText
      ? `\n\n=== DỮ LIỆU THỰC TẾ LỚP HỌC ===\n${classroomContextText}\n=== HẾT DỮ LIỆU ===\n\nKhi hỏi về học sinh/lớp cụ thể, hãy dùng dữ liệu trên. Đừng bịa.`
      : "";

    const systemPrompt = `Bạn là Trợ lý AI Sư phạm THCS EduMind, hỗ trợ ${teacherName}:\n1. Phân tích dữ liệu học sinh/lớp dựa trên số liệu thực.\n2. Tạo đề kiểm tra theo Công văn 7991.\n3. Soạn giáo án theo Công văn 5512.\n4. Tư vấn phương pháp dạy học phân hóa.\nGiọng điệu: sư phạm, ân cần, chuẩn mực tiếng Việt.${dataSection}`;

    // Build multi-turn contents for Gemini
    const geminiContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      for (let i = 0; i < history.length; i++) {
        const h = history[i];
        if (!h || !h.content) continue;
        const role: "user" | "model" = h.role === "assistant" ? "model" : "user";
        const text = i === 0 ? `${systemPrompt}\n\n---\n${h.content}` : h.content;
        if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === role) {
          geminiContents[geminiContents.length - 1].parts[0].text += `\n\n${text}`;
        } else {
          geminiContents.push({ role, parts: [{ text }] });
        }
      }
    }

    // Append current turn
    if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === "user") {
      geminiContents[geminiContents.length - 1].parts[0].text += `\n\n${message}`;
    } else {
      const userText = geminiContents.length === 0 ? `${systemPrompt}\n\n---\nCÂU HỎI CỦA GIÁO VIÊN:\n${message}` : message;
      geminiContents.push({ role: "user", parts: [{ text: userText }] });
    }

    if (geminiContents.length > 0 && geminiContents[0].role !== "user") {
      geminiContents.unshift({ role: "user", parts: [{ text: systemPrompt }] });
    }

    const fallbackModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash-latest"];
    let streamResponse: Response | null = null;

    for (const model of fallbackModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

      try {
        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: {
              temperature: 0.3,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
            ...(isDataQuery ? {} : { tools: [{ googleSearch: {} }] }),
          }),
        });

        if (geminiRes.ok && geminiRes.body) {
          streamResponse = geminiRes;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!streamResponse?.body) {
      return new Response(
        JSON.stringify({ error: "Không thể kết nối Gemini. Hãy thử lại sau." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Transform Gemini SSE stream → simple text/event-stream with just text chunks
    const reader = streamResponse.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const transformStream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr || jsonStr === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(jsonStr);
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    const chunk = JSON.stringify({ text });
                    controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
                  }
                } catch {
                  // skip malformed JSON chunks
                }
              }
            }
          }
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(transformStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("AI Stream Error:", error);
    return new Response(JSON.stringify({ error: "Lỗi streaming AI" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
