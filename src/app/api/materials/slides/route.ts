import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai/provider";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const teacher = await prisma.user.findFirst();

    const slideDecks = await prisma.teacherMaterial.findMany({
      where: {
        type: "SLIDE_DECK",
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

    return NextResponse.json(slideDecks);
  } catch (error) {
    console.error("Fetch Slide Decks Error:", error);
    return NextResponse.json({ error: "Lỗi tải bài giảng slide" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "GENERATE_DECK", params } = body;
    const ai = getAIProvider();
    const teacher = await prisma.user.findFirst();

    if (action === "GENERATE_OUTLINE") {
      const { lessonTitle = "Bài 6: Tỉ lệ thức và dãy tỉ số bằng nhau", subject = "Toán học", grade = 7 } = params || {};
      const outline = [
        { slideNumber: 1, title: lessonTitle, subtitle: `Môn ${subject} ${grade} - Giới thiệu bài giảng` },
        { slideNumber: 2, title: "Mục Tiêu Bài Học", subtitle: "Yêu cầu cần đạt chuẩn GDPT 2018" },
        { slideNumber: 3, title: "Khởi Động Tình Huống", subtitle: "Pha chế tỉ lệ thức thực tiễn" },
        { slideNumber: 4, title: "Khái Niệm Cốt Lõi", subtitle: "Định nghĩa tỉ lệ thức và các số hạng" },
        { slideNumber: 5, title: "Tính Chất Tích Chéo", subtitle: "Quy tắc ad = bc và tìm ẩn x" },
        { slideNumber: 6, title: "Dãy Tỉ Số Bằng Nhau", subtitle: "Công thức mở rộng cộng trừ tử mẫu" },
        { slideNumber: 7, title: "Ví Dụ Mẫu Giải Chi Tiết", subtitle: "Tìm hai số x, y biết tổng và tỉ số" },
        { slideNumber: 8, title: "Trắc Nghiệm Tương Tác", subtitle: "Mini-game tính nhanh 60 giây" },
        { slideNumber: 9, title: "Sơ Đồ Tư Duy Tổng Kết", subtitle: "Khắc sâu 3 chìa khóa vàng bài học" },
        { slideNumber: 10, title: "Hướng Dẫn Về Nhà", subtitle: "Giao nhiệm vụ và chuẩn bị bài mới" },
      ];
      return NextResponse.json({ outline });
    }

    if (action === "GENERATE_DECK") {
      const generated = await ai.generateSlideDeck({
        lessonTitle: params?.lessonTitle || "Bài 6: Tỉ lệ thức và dãy tỉ số bằng nhau",
        subject: params?.subject || "Toán học",
        grade: params?.grade || 7,
        slideCount: params?.slideCount || 10,
        style: params?.style || "Học tập tương tác",
      });

      return NextResponse.json(generated);
    }

    if (action === "REGENERATE_SLIDE") {
      const { slide, instruction } = params;
      let newSlide = { ...slide };

      if (instruction === "shorten") {
        newSlide.bullets = newSlide.bullets.slice(0, 2);
        newSlide.mainContent = newSlide.mainContent.split(".")[0] + ".";
      } else if (instruction === "expand") {
        newSlide.bullets = [
          ...newSlide.bullets,
          "Bổ sung: Phân tích các trường hợp điều kiện mẫu số khác 0.",
          "Liên hệ thực tế: Ứng dụng trong bản đồ địa lý tỉ lệ 1:100.000.",
        ];
      } else if (instruction === "add_quiz") {
        newSlide.quizQuestion = {
          question: "Nếu $\\frac{x}{3} = \\frac{4}{6}$ thì $x$ bằng:",
          options: ["x = 1", "x = 2", "x = 3", "x = 4"],
          answer: "B",
        };
      }

      return NextResponse.json(newSlide);
    }

    if (action === "SAVE") {
      if (!teacher) {
        return NextResponse.json({ error: "Chưa có tài khoản giáo viên" }, { status: 400 });
      }

      const {
        id,
        title,
        lessonId,
        content = "",
        slidesJson,
        metaJson,
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
            slidesJson: typeof slidesJson === "string" ? slidesJson : JSON.stringify(slidesJson),
            metaJson: typeof metaJson === "string" ? metaJson : JSON.stringify(metaJson),
            status,
            updatedAt: new Date(),
          },
        });
      } else {
        saved = await prisma.teacherMaterial.create({
          data: {
            teacherId: teacher.id,
            type: "SLIDE_DECK",
            title,
            lessonId: lessonId || null,
            content,
            slidesJson: typeof slidesJson === "string" ? slidesJson : JSON.stringify(slidesJson),
            metaJson: typeof metaJson === "string" ? metaJson : JSON.stringify(metaJson),
            status,
          },
        });
      }

      return NextResponse.json(saved);
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("Slide Deck API Error:", error);
    return NextResponse.json({ error: "Lỗi xử lý bài giảng slide" }, { status: 500 });
  }
}
