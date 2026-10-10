import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai/provider";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const teacher = await prisma.user.findFirst();

    const lessonPlans = await prisma.teacherMaterial.findMany({
      where: {
        type: "LESSON_PLAN",
        ...(lessonId ? { lessonId } : {}),
        ...(teacher ? { teacherId: teacher.id } : {}),
      },
      include: {
        lesson: {
          include: {
            chapter: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(lessonPlans);
  } catch (error) {
    console.error("Fetch Lesson Plans Error:", error);
    return NextResponse.json({ error: "Lỗi khi tải danh sách kế hoạch bài dạy" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || (body.params ? body.action : "GENERATE");
    const params = body.params || body;
    const ai = getAIProvider();
    const teacher = await prisma.user.findFirst();

    if (action === "ANALYZE_SGK") {
      try {
        if (ai.analyzeTextbook) {
          const analysis = await ai.analyzeTextbook({
            documentText: params?.documentText,
            fileName: params?.fileName,
            imageBase64: params?.imageBase64,
            imageMimeType: params?.imageMimeType,
            bookSeries: params?.bookSeries,
          });
          return NextResponse.json({ success: true, analysis });
        }
      } catch (sgkErr) {
        console.warn("AI analyzeTextbook error, falling back to SmartLocalAIProvider:", sgkErr);
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { SmartLocalAIProvider } = require("@/lib/ai/provider");
      const local = new SmartLocalAIProvider();
      const analysis = await local.analyzeTextbook({
        documentText: params?.documentText,
        fileName: params?.fileName,
        bookSeries: params?.bookSeries,
      });
      return NextResponse.json({ success: true, analysis });
    }

    if (action === "GENERATE") {
      const generated = await ai.generateLessonPlan({
        subject: params?.subject || "Toán học",
        grade: Number(params?.grade) || 7,
        chapter: params?.chapter || "Chương trình GDPT 2018",
        lessonTitle: params?.lessonTitle || params?.topic || "Bài học chuẩn GDPT 2018",
        durationMinutes: Number(params?.durationMinutes || parseInt(params?.duration || "45", 10)) || 45,
        learningOutcomes: params?.learningOutcomes,
        keyContent: params?.keyContent,
        method: params?.method,
        notes: params?.notes,
        bookSeries: params?.bookSeries,
        textbookContent: params?.textbookContent,
        textbookImageBase64: params?.textbookImageBase64,
        textbookImageMimeType: params?.textbookImageMimeType,
      });

      return NextResponse.json(generated);
    }

    if (action === "REGENERATE_ACTIVITY") {
      const { activity, instruction } = params;
      // Tailor the individual activity based on instruction (shorten, expand, add game, etc.)
      const isShorten = instruction === "shorten";
      const isExpand = instruction === "expand";

      let adjustedContent = activity.content;
      let adjustedProduct = activity.product;
      let adjustedExecution = activity.execution;

      if (isShorten) {
        adjustedContent = activity.content.split("\n")[0] || activity.content;
        adjustedExecution = "Bước 1: GV giao nhiệm vụ ngắn gọn.\nBước 2: HS làm việc cá nhân 3 phút.\nBước 3: Báo cáo nhanh và GV chốt kết luận.";
      } else if (isExpand) {
        adjustedContent = `${activity.content}\n- Bổ sung câu hỏi mở rộng: Học sinh liên hệ ứng dụng trong thực tế đời sống và khoa học tự nhiên.`;
        adjustedProduct = `${activity.product}\n- Sản phẩm nâng cao: Bảng phân tích so sánh các trường hợp đặc biệt.`;
        adjustedExecution = `${activity.execution}\nBước 5 (Đánh giá mở rộng): Học sinh tự đánh giá chéo giữa các tổ theo tiêu chí rubric.`;
      }

      return NextResponse.json({
        ...activity,
        content: adjustedContent,
        product: adjustedProduct,
        execution: adjustedExecution,
      });
    }

    if (action === "SAVE") {
      if (!teacher) {
        return NextResponse.json({ error: "Chưa có tài khoản giáo viên" }, { status: 400 });
      }

      const {
        id,
        title,
        lessonId,
        content,
        metaJson,
        activitiesJson,
        status = "APPROVED",
      } = params;

      let saved;
      if (id) {
        saved = await prisma.teacherMaterial.update({
          where: { id },
          data: {
            title,
            lessonId: lessonId || null,
            content,
            metaJson: typeof metaJson === "string" ? metaJson : JSON.stringify(metaJson),
            activitiesJson: typeof activitiesJson === "string" ? activitiesJson : JSON.stringify(activitiesJson),
            status,
            updatedAt: new Date(),
          },
        });
      } else {
        saved = await prisma.teacherMaterial.create({
          data: {
            teacherId: teacher.id,
            type: "LESSON_PLAN",
            title,
            lessonId: lessonId || null,
            content,
            metaJson: typeof metaJson === "string" ? metaJson : JSON.stringify(metaJson),
            activitiesJson: typeof activitiesJson === "string" ? activitiesJson : JSON.stringify(activitiesJson),
            status,
          },
        });
      }

      return NextResponse.json(saved);
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("Lesson Plan API Error:", error);
    return NextResponse.json({ error: "Lỗi xử lý Kế hoạch bài dạy" }, { status: 500 });
  }
}
