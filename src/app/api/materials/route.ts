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

    // Check if subject is Music
    const isMusic =
      teacher.subjects?.includes("Âm nhạc") ||
      (lessonName && (lessonName.toLowerCase().includes("hát") || lessonName.toLowerCase().includes("nhạc"))) ||
      (title && (title.toLowerCase().includes("hát") || title.toLowerCase().includes("nhạc")));

    // If requested AI generation
    if (isAIGenerated || !finalContent) {
      if (type === "LESSON_PLAN") {
        if (isMusic) {
          finalContent = `# KẾ HOẠCH BÀI DẠY (CÔNG VĂN 5512) - MÔN ÂM NHẠC ${gradeLevel}
**TÊN BÀI HỌC:** ${lessonName || title || "Chủ đề 2: Tình bạn - Bài 3: Học hát bài Nụ cười"}
**Trường:** THCS Tân Phong - Vĩnh Long &bull; **Tổ:** Nghệ thuật (Âm nhạc - Mĩ thuật)
**Giáo viên giảng dạy:** Cô Phan Thị Ngọc Huyền
**Thời lượng:** 45 phút (1 tiết) &bull; Chương trình GDPT 2018

---

### I. MỤC TIÊU BÀI HỌC
1. **Về kiến thức:**
   - Học sinh hát đúng giai điệu, lời ca của bài hát, thể hiện sắc thái tình cảm vui tươi, hồn nhiên.
   - Biết hát kết hợp gõ đệm thanh phách theo phách, theo nhịp 2/4 hoặc vận động cơ thể (body percussion).
2. **Về năng lực:**
   - *Năng lực thể hiện âm nhạc:* Biết lấy hơi, phát âm rõ lời, duy trì cao độ và trường độ chuẩn xác.
   - *Năng lực cảm thụ và hiểu biết âm nhạc:* Cảm nhận được nét đẹp giai điệu, cấu trúc câu hát và thông điệp tình bạn.
   - *Năng lực ứng dụng và sáng tạo âm nhạc:* Tự tin biểu diễn trước lớp, sáng tạo động tác phụ họa phù hợp.
3. **Về phẩm chất:**
   - Bồi dưỡng tình yêu quê hương, tình bạn bè trong sáng; tinh thần chăm chỉ luyện thanh và trách nhiệm giữ gìn nhạc cụ.

---

### II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
- **Giáo viên:** Đàn phím điện tử (Organ), máy tính kết nối Smart Tivi / loa kéo, thanh phách gỗ, song loan, file beat âm thanh chuẩn.
- **Học sinh:** SGK Âm nhạc, thanh phách gõ tự chuẩn bị, tập ghi bài.

---

### III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN CÔNG VĂN 5512)

#### 1. Hoạt động 1: Mở đầu / Khởi động (5 phút)
- **Mục tiêu:** Tạo không khí vui tươi, khai mở giọng hát cho học sinh.
- **Nội dung:** Luyện thanh theo mẫu âm 'La - Ma - Mi' theo gam Đô trưởng (C major) tăng dần nửa cung theo tiếng đàn Organ.
- **Sản phẩm:** Cột hơi ổn định, khẩu hình mở tròn và học sinh sẵn sàng đón nhận bài học mới.

#### 2. Hoạt động 2: Hình thành kiến thức mới (Khám phá - 18 phút)
- **Nội dung 1:** Giới thiệu bài hát, tác giả và hoàn cảnh sáng tác. Nghe bài hát mẫu qua video/audio.
- **Nội dung 2:** Đọc lời ca theo tiết tấu kết hợp gõ phách.
- **Nội dung 3:** Dạy hát từng câu ngắn theo lối móc xích (Giáo viên đàn câu mẫu 2 lần, học sinh hát lại).
- **Sản phẩm:** Học sinh hát đúng cao độ, trường độ từng câu và ghép nối hoàn chỉnh bài hát.

#### 3. Hoạt động 3: Luyện tập (15 phút)
- **Mục tiêu:** Củng cố kỹ năng hát thuần thục và kết hợp nhạc cụ gõ đệm.
- **Nội dung:** Hát kết hợp gõ đệm thanh phách theo 2 hình thức: gõ theo phách (phách 1 mạnh, phách 2 nhẹ) và gõ theo nhịp.
- **Tổ chức:** Thực hiện theo lớp -> Dãy bàn đối đáp -> Nhóm 4 học sinh -> Cá nhân đơn ca.
- **Sản phẩm:** Tiếng gõ phách giòn giã đồng đều, giữ vững nhịp độ toàn bài.

#### 4. Hoạt động 4: Vận dụng - Sáng tạo (7 phút)
- **Mục tiêu:** Khuyến khích sự tự tin và sáng tạo nghệ thuật.
- **Nhiệm vụ:** Biểu diễn kết hợp động tác phụ họa nhẹ nhàng. Dặn dò ôn luyện tại nhà để chuẩn bị tiết Đọc nhạc tuần sau.`;
        } else {
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
        }
      } else {
        // WORKSHEET
        if (isMusic) {
          finalContent = `# PHIẾU HỌC TẬP & THỰC HÀNH ÂM NHẠC ${gradeLevel}
**CHỦ ĐỀ:** ${lessonName || title || "Lí thuyết âm nhạc & Thực hành gõ đệm"}
**Trường THCS Tân Phong - Vĩnh Long** &bull; **GVBM:** Cô Phan Thị Ngọc Huyền
**Họ và tên học sinh:** ................................................................ **Lớp:** ....................

---

### PHẦN 1: KIẾN THỨC CẦN NHỚ
- **Khuông nhạc & Khóa Sol:** Xác định vị trí 7 nốt nhạc cơ bản: Đô, Rê, Mi, Fa, Sol, La, Si.
- **Dấu hóa:** Dấu thăng (#) nâng cao độ lên 1/2 cung; Dấu giáng (b) hạ cao độ xuống 1/2 cung; Dấu bình (♮) hủy bỏ hiệu lực.
- **Số chỉ nhịp:** Nhịp 2/4 (mỗi ô nhịp có 2 phách nốt đen, phách 1 mạnh, phách 2 nhẹ).
- **Kỹ thuật gõ thanh phách:** Cầm thanh phách chắc tay, điểm gõ dứt khoát, âm vang giòn đều.

---

### PHẦN 2: BÀI TẬP VÀ THỰC HÀNH
1. **Bài 1 (Nhận biết):** Điền tên các nốt nhạc xuất hiện trên khuông nhạc khóa Sol vào chỗ chấm.
2. **Bài 2 (Thông hiểu):** Nêu ý nghĩa của dấu thăng và dấu giáng trong bản nhạc.
3. **Bài 3 (Vận dụng):** Đánh dấu các phách mạnh (M) và phách nhẹ (N) vào từng ô nhịp của đoạn nhạc cho sẵn.
4. **Bài 4 (Thực hành biểu diễn):** Luyện tập hát hoàn chỉnh bài hát đã học kết hợp gõ đệm thanh phách theo nhịp 2/4.`;
        } else {
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
