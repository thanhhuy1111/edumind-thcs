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
    const action = body.action || (body.params ? body.action : "GENERATE_DECK");
    const params = body.params || body;
    const ai = getAIProvider();
    const teacher = await prisma.user.findFirst();

    if (action === "GENERATE_OUTLINE") {
      const { lessonTitle = "Bài học chuẩn GDPT 2018", subject = "Toán học", grade = 7 } = params || {};
      const isMusic = subject.toLowerCase().includes("nhạc");
      const outline = isMusic ? [
        { slideNumber: 1, title: lessonTitle, subtitle: `Môn Âm nhạc ${grade} - Giới thiệu bài học` },
        { slideNumber: 2, title: "Mục Tiêu & Cảm Thụ Âm Nhạc", subtitle: "Yêu cầu cần đạt chuẩn GDPT 2018" },
        { slideNumber: 3, title: "Khởi Động Luyện Thanh", subtitle: "Bài tập lấy hơi, mở khẩu hình và ngân dài âm A-O-U" },
        { slideNumber: 4, title: "Giới Thiệu Tác Giả & Tác Phẩm", subtitle: "Hoàn cảnh sáng tác bài hát Nụ cười (Nhạc Nga)" },
        { slideNumber: 5, title: "Tập Hát Từng Câu & Khớp Lời Ca", subtitle: "Nghe giai điệu mẫu, xướng âm chuẩn cao độ nhịp nhàng" },
        { slideNumber: 6, title: "Luyện Tập Hát Hòa Giọng & Lĩnh Xướng", subtitle: "Phân chia bè nhóm, thể hiện sắc thái vui tươi rạng rỡ" },
        { slideNumber: 7, title: "Thực Hành Gõ Đệm Thanh Phách", subtitle: "Gõ đệm theo phách và theo tiết tấu lời ca" },
        { slideNumber: 8, title: "Vận Động Cơ Thể (Body Percussion)", subtitle: "Vỗ tay, giậm chân, búng tay theo nhịp điệu bài hát" },
        { slideNumber: 9, title: "Góc Cảm Nhận & Đố Vui Âm Nhạc", subtitle: "Cảm thụ thông điệp tình bạn và trắc nghiệm vui" },
        { slideNumber: 10, title: "Hướng Dẫn Tự Luyện Về Nhà", subtitle: "Biểu diễn cho người thân và chuẩn bị bài học tiếp theo" },
      ] : [
        { slideNumber: 1, title: lessonTitle, subtitle: `Môn ${subject} ${grade} - Giới thiệu bài giảng` },
        { slideNumber: 2, title: "Mục Tiêu Bài Học", subtitle: "Yêu cầu cần đạt chuẩn GDPT 2018" },
        { slideNumber: 3, title: "Khởi Động Tình Huống", subtitle: "Kết nối thực tiễn bài học" },
        { slideNumber: 4, title: "Khái Niệm Cốt Lõi", subtitle: "Nội dung trọng tâm bài học" },
        { slideNumber: 5, title: "Quy Tắc & Tính Chất", subtitle: "Hệ thống hóa kiến thức" },
        { slideNumber: 6, title: "Luyện Tập Thực Hành", subtitle: "Hướng dẫn vận dụng bài bản" },
        { slideNumber: 7, title: "Ví Dụ Mẫu Giải Chi Tiết", subtitle: "Các bước làm bài chuẩn" },
        { slideNumber: 8, title: "Trắc Nghiệm Tương Tác", subtitle: "Mini-game củng cố 60 giây" },
        { slideNumber: 9, title: "Sơ Đồ Tư Duy Tổng Kết", subtitle: "Khắc sâu chìa khóa vàng bài học" },
        { slideNumber: 10, title: "Hướng Dẫn Về Nhà", subtitle: "Giao nhiệm vụ và chuẩn bị bài mới" },
      ];
      return NextResponse.json({ outline });
    }

    if (action === "GENERATE_DECK") {
      const generated = await ai.generateSlideDeck({
        lessonTitle: params?.lessonTitle || params?.topic || "Bài học chuẩn GDPT 2018",
        subject: params?.subject || "Toán học",
        grade: Number(params?.grade) || 7,
        slideCount: Number(params?.slideCount) || 10,
        style: params?.style || "Học tập tương tác & Trực quan",
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
