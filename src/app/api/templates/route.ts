import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let templates = await prisma.documentTemplate.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: "desc" },
    });

    // If empty, seed default templates for Vietnamese curriculum
    if (templates.length === 0) {
      const defaultTemplates = [
        {
          name: "Kế hoạch bài dạy chuẩn Công văn 5512/BGDĐT",
          type: "LESSON_PLAN",
          description: "Mẫu giáo án 4 hoạt động (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng) chuẩn Bộ GD&ĐT.",
          isDefault: true,
          contentJson: JSON.stringify({
            sections: ["I. MỤC TIÊU", "II. THIẾT BỊ DẠY HỌC", "III. TIẾN TRÌNH DẠY HỌC (4 HĐ)"],
            standard: "CV 5512",
          }),
        },
        {
          name: "Ma trận & Bản đặc tả chuẩn Công văn 7991/BGDĐT",
          type: "EXAM",
          description: "Mẫu đề kiểm tra định kỳ kết hợp ma trận 2 chiều, bản đặc tả và thang điểm từng bước.",
          isDefault: true,
          contentJson: JSON.stringify({
            sections: ["MA TRẬN ĐỀ", "BẢN ĐẶC TẢ", "ĐỀ THI", "HƯỚNG DẪN CHẤM"],
            standard: "CV 7991",
          }),
        },
        {
          name: "Slide Bài Giảng Tương Tác Hiện Đại",
          type: "SLIDE",
          description: "Bộ slide 10 trang thiết kế chuẩn sư phạm, hỗ trợ công thức toán KaTeX và mini-game kiểm tra.",
          isDefault: true,
          contentJson: JSON.stringify({
            theme: "Indigo Modern",
            slideCount: 10,
          }),
        },
      ];

      for (const t of defaultTemplates) {
        await prisma.documentTemplate.create({ data: t });
      }

      templates = await prisma.documentTemplate.findMany();
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Fetch Templates Error:", error);
    return NextResponse.json({ error: "Lỗi tải mẫu tài liệu" }, { status: 500 });
  }
}
