import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // LESSON_PLAN, WORKSHEET, DOCUMENT

    const where: any = {};
    if (type && type !== "ALL") where.type = type;

    const materials = await prisma.teacherMaterial.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, gradeLevel: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error("Materials GET Error:", error);
    return NextResponse.json({ error: "Lỗi tải tài liệu giáo án" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      type = "LESSON_PLAN",
      content,
      classId,
      metaJson,
      isAIGenerated = false,
      lessonName,
      gradeLevel = 7,
    } = body;

    const teacher = await prisma.user.findFirst();
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    let finalContent = content;

    // If requested AI generation
    if (isAIGenerated || !finalContent) {
      if (type === "LESSON_PLAN") {
        finalContent = `# KẾ HOẠCH BÀI DẠY (GIÁO ÁN) TOÁN ${gradeLevel}
**TÊN BÀI HỌC:** ${lessonName || title}
**Thời lượng:** 45 phút (1 tiết) &bull; Bộ sách: Kết Nối Tri Thức & Cánh Diều

---

### I. MỤC TIÊU BÀI HỌC
1. **Về kiến thức:**
   - Học sinh nắm vững định nghĩa, khái niệm và tính chất cơ bản của bài học.
   - Nhận diện các dấu hiệu, dạng toán trọng tâm và các bước giải tiêu chuẩn.
2. **Về năng lực:**
   - *Năng lực tư duy và lập luận toán học:* Biết giải thích, chứng minh và suy luận từng bước.
   - *Năng lực giải quyết vấn đề:* Vận dụng kiến thức để giải quyết bài toán thực tế đời sống.
   - *Năng lực mô hình hóa toán học:* Chuyển đổi ngôn ngữ thực tế thành biểu thức toán học.
3. **Về phẩm chất:**
   - Chăm chỉ, tích cực hợp tác nhóm, tự giác hoàn thành nhiệm vụ học tập.

---

### II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
- **Giáo viên:** Kế hoạch bài dạy, bài trình chiếu (Slide), máy chiếu TV, phiếu học tập nhóm.
- **Học sinh:** SGK, vở ghi, máy tính cầm tay, thước kẻ, bút viết bảng nhóm.

---

### III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN BỘ GD&ĐT)

#### 1. Hoạt động 1: Mở đầu / Khởi động (5 phút)
- **Mục tiêu:** Tạo hứng thú và kết nối kiến thức cũ với tình huống bài mới.
- **Nội dung:** Cho học sinh quan sát bài toán đố thực tế hoặc chơi trò chơi trắc nghiệm 3 câu nhanh.
- **Sản phẩm:** Câu trả lời của học sinh, giáo viên dẫn dắt vào bài mới.

#### 2. Hoạt động 2: Hình thành kiến thức mới (20 phút)
- **Nội dung 1:** Khái niệm và tính chất trọng tâm (Giáo viên giảng giải kết hợp câu hỏi gợi mở).
- **Nội dung 2:** Phân tích ví dụ mẫu trong SGK (Học sinh thực hiện theo cá nhân và cặp đôi).
- **Sản phẩm:** Học sinh ghi chép kiến thức vào vở và phát biểu được quy tắc.

#### 3. Hoạt động 3: Luyện tập (15 phút)
- **Mục tiêu:** Củng cố kỹ năng tính toán và nhận dạng bài tập cơ bản.
- **Nội dung:** Làm phiếu bài tập cá nhân (2 câu nhận biết, 2 câu thông hiểu).
- **Tổ chức:** Học sinh làm việc cá nhân, đổi chéo chấm bài, giáo viên chữa câu điển hình.

#### 4. Hoạt động 4: Vận dụng & Hướng dẫn tự học (5 phút)
- **Mục tiêu:** Ứng dụng vào thực tiễn và giao nhiệm vụ về nhà.
- **Nhiệm vụ:** Tìm một tình huống thực tế liên quan đến bài học và hoàn thành bài tập SGK.`;
      } else {
        // WORKSHEET
        finalContent = `# PHIẾU HỌC TẬP TỰ LUYỆN TOÁN ${gradeLevel}
**CHỦ ĐỀ:** ${lessonName || title}
**Họ và tên học sinh:** ................................................................ **Lớp:** ....................

---

### PHẦN 1: KIẾN THỨC CẦN NHỚ
- Ghi nhớ các công thức tính toán và quy tắc biến đổi tương đương.
- Chú ý các điều kiện có nghĩa của phân số và căn thức.

### PHẦN 2: BÀI TẬP RÈN LUYỆN
1. **Bài 1 (Nhận biết):** Tìm số thích hợp điền vào chỗ chấm.
2. **Bài 2 (Thông hiểu):** Thực hiện phép tính và rút gọn biểu thức.
3. **Bài 3 (Vận dụng):** Giải bài toán có lời văn và ý nghĩa thực tế.
4. **Bài 4 (Vận dụng cao):** Tìm giá trị lớn nhất / nhỏ nhất hoặc bài toán mở rộng.`;
      }
    }

    const material = await prisma.teacherMaterial.create({
      data: {
        teacherId: teacher.id,
        classId: classId || undefined,
        type,
        title: title || `${type === "LESSON_PLAN" ? "Giáo án" : "Worksheet"}: ${lessonName}`,
        content: finalContent,
        metaJson: metaJson ? JSON.stringify(metaJson) : null,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("Materials POST Error:", error);
    return NextResponse.json({ error: "Lỗi tạo tài liệu" }, { status: 500 });
  }
}
