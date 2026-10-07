import katex from "katex";
import {
  CV7991ExamPackage,
  CV7991MatrixRow,
  CV7991SpecificationRow,
  GeneratedLessonPlan,
  GeneratedSlideDeck,
  SlideItem,
  LessonPlanActivity,
} from "@/lib/ai/types";

export function renderKaTeXMath(text: string): string {
  if (!text) return "";
  return text.replace(/\$([^$]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math, { throwOnError: false });
    } catch {
      return math;
    }
  });
}

/**
 * Tạo tài liệu Word (.doc) cho Hồ sơ Đề kiểm tra định kỳ theo Công văn 7991/BGDĐT-GDTrH
 */
export function buildCV7991ExamWordContent(
  pkg: CV7991ExamPackage,
  options?: { schoolName?: string; teacherName?: string; departmentName?: string }
): string {
  const schoolName = options?.schoolName || "TRƯỜNG THCS TÂN PHONG";
  const teacherName = options?.teacherName || "Phan Thị Ngọc Huyền";
  const departmentName = options?.departmentName || "TỔ CHUYÊN MÔN THCS";
  const { title, subject, grade, durationMinutes, totalScore, questions, matrix, specification } = pkg;

  return `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.45; color: #000; margin: 2cm; }
    h1 { font-size: 15pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 4px; color: #1e3a8a; }
    h2 { font-size: 13pt; font-weight: bold; margin-top: 20px; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 4px; color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 14px; }
    th, td { border: 1pt solid #000; padding: 6px 8px; font-size: 11pt; text-align: left; vertical-align: top; }
    th { background-color: #f1f5f9; text-align: center; font-weight: bold; }
    .page-break { page-break-before: always; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
  </style>
</head>
<body>
  <!-- HEADER CHÍNH THỨC THEO NGHỊ ĐỊNH 30/2020/NĐ-CP -->
  <table style="border: none; width: 100%; margin-bottom: 16px;">
    <tr style="border: none;">
      <td style="border: none; text-align: center; width: 45%; font-size: 11pt; padding: 0;">
        SỞ GD&ĐT TỈNH VĨNH LONG<br>
        <strong>${schoolName.toUpperCase()}</strong><br>
        <em>${departmentName}</em>
      </td>
      <td style="border: none; text-align: center; width: 55%; font-size: 11pt; padding: 0;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
        <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
        <em>Tân Phong, ngày ..... tháng ..... năm 2026</em>
      </td>
    </tr>
  </table>

  <div style="text-align: center; margin-bottom: 18px;">
    <strong style="font-size: 14pt;">BỘ HỒ SƠ KIỂM TRA ĐÁNH GIÁ ĐỊNH KỲ</strong><br>
    <strong style="font-size: 12pt; color: #1e3a8a;">THEO ĐỊNH HƯỚNG CÔNG VĂN 7991/BGDĐT-GDTrH (17/12/2024)</strong><br>
    <em>Môn: ${subject} - Khối: ${grade} | Giáo viên: ${teacherName}</em>
  </div>

  <h1>${title.toUpperCase()}</h1>
  <p class="text-center" style="margin-bottom: 24px;">
    <em>Thời gian làm bài: ${durationMinutes} phút (Không kể phát đề) - Thang điểm chuẩn: ${totalScore} điểm</em>
  </p>

  <!-- PHẦN I: MA TRẬN ĐỀ KIỂM TRA -->
  <h2>PHẦN I. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ 2 CHIỀU (CHUẨN CÔNG VĂN 7991)</h2>
  <p style="font-size: 11pt; font-style: italic; margin-bottom: 8px;">
    Bảng ma trận xác định số lượng câu hỏi và tỉ lệ điểm giữa 4 dạng thức và 4 mức độ nhận thức GDPT 2018:
  </p>

  <table>
    <thead>
      <tr>
        <th rowspan="3">TT</th>
        <th rowspan="3" style="text-align: left;">Chủ đề / Đơn vị kiến thức</th>
        <th colspan="11">Mức độ đánh giá (Số câu theo từng dạng thức)</th>
        <th colspan="2" rowspan="2">Tổng hợp</th>
        <th rowspan="3">Tỉ lệ %</th>
      </tr>
      <tr>
        <th colspan="3">I. Nhiều lựa chọn</th>
        <th colspan="3">II. Đúng - Sai</th>
        <th colspan="3">III. Trả lời ngắn</th>
        <th colspan="2">IV. Tự luận</th>
      </tr>
      <tr style="font-size: 10pt;">
        <th>Biết</th><th>Hiểu</th><th>VD</th>
        <th>Biết</th><th>Hiểu</th><th>VD</th>
        <th>Biết</th><th>Hiểu</th><th>VD</th>
        <th>VD</th><th>VDC</th>
        <th>Số câu</th><th>Điểm</th>
      </tr>
    </thead>
    <tbody>
      ${(matrix || [])
        .map((r: CV7991MatrixRow, idx: number) => {
          const rowScore = r.totalPoints || (r as any).totalScore || 0;
          return `
      <tr>
        <td class="text-center font-bold">${idx + 1}</td>
        <td>${r.topic || r.knowledgeUnit}</td>
        <td class="text-center">${r.multipleChoice?.nhanBiet || "-"}</td>
        <td class="text-center">${r.multipleChoice?.thongHieu || "-"}</td>
        <td class="text-center">${r.multipleChoice?.vanDung || "-"}</td>
        <td class="text-center">${r.trueFalse?.nhanBiet || "-"}</td>
        <td class="text-center">${r.trueFalse?.thongHieu || "-"}</td>
        <td class="text-center">${r.trueFalse?.vanDung || "-"}</td>
        <td class="text-center">${r.shortAnswer?.nhanBiet || "-"}</td>
        <td class="text-center">${r.shortAnswer?.thongHieu || "-"}</td>
        <td class="text-center">${r.shortAnswer?.vanDung || "-"}</td>
        <td class="text-center">${r.essay?.vanDung || "-"}</td>
        <td class="text-center">${r.essay?.vanDungCao || "-"}</td>
        <td class="text-center font-bold">${r.totalQuestions}</td>
        <td class="text-center font-bold">${rowScore}đ</td>
        <td class="text-center font-bold">${r.percentage || Math.round((rowScore / totalScore) * 100)}%</td>
      </tr>
      `;
        })
        .join("")}
    </tbody>
  </table>

  <!-- GHI CHÚ BAREM ĐÚNG SAI CV 7991 -->
  <table style="width: 100%; border: 1pt solid #cbd5e1; background-color: #f8fafc; margin-top: 6px;">
    <tr>
      <td style="border: none; font-size: 10.5pt;">
        <strong>* Quy định cách tính điểm dạng trắc nghiệm Đúng - Sai theo Công văn 7991:</strong><br>
        - Trả lời đúng <strong>01 ý</strong> trong 01 câu hỏi: được <strong>0,10 điểm</strong>.<br>
        - Trả lời đúng <strong>02 ý</strong> trong 01 câu hỏi: được <strong>0,25 điểm</strong>.<br>
        - Trả lời đúng <strong>03 ý</strong> trong 01 câu hỏi: được <strong>0,50 điểm</strong>.<br>
        - Trả lời đúng cả <strong>04 ý</strong> trong 01 câu hỏi: được <strong>1,00 điểm</strong>.
      </td>
    </tr>
  </table>

  <!-- PHẦN II: BẢN ĐẶC TẢ ĐỀ KIỂM TRA -->
  <h2>PHẦN II. BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">TT</th>
        <th style="width: 25%;">Chủ đề</th>
        <th style="width: 40%;">Yêu cầu cần đạt (GDPT 2018)</th>
        <th style="width: 15%;">Mức độ</th>
        <th style="width: 15%;">Dạng câu hỏi</th>
      </tr>
    </thead>
    <tbody>
      ${(specification || [])
        .map(
          (s: CV7991SpecificationRow, idx: number) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td>${s.topic || s.knowledgeUnit}</td>
        <td>${renderKaTeXMath(s.learningOutcome || (s as any).outcome || "")}</td>
        <td class="text-center">${s.assessmentLevel || (s as any).level || "Nhận biết"}</td>
        <td class="text-center">${s.questionType}</td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- PHẦN III: NỘI DUNG ĐỀ KIỂM TRA -->
  <h2>PHẦN III. ĐỀ KIỂM TRA CHÍNH THỨC (MÃ ĐỀ GỐC - 101)</h2>

  <!-- KHUNG THÔNG TIN HỌC SINH -->
  <table style="width: 100%; border: 1.5pt solid #000; margin-bottom: 16px; margin-top: 10px;">
    <tr>
      <td style="border: 1pt solid #000; width: 65%; padding: 8px;">
        <strong>Họ và tên học sinh:</strong> ............................................................................<br>
        <strong>Lớp:</strong> ..................................... <strong>Số báo danh:</strong> ........................................
      </td>
      <td style="border: 1pt solid #000; width: 35%; padding: 8px; text-align: center;">
        <strong>ĐIỂM SỐ</strong><br><br>
        <em>............................../${totalScore} điểm</em>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1pt solid #000; padding: 6px;">
        <strong>Lời nhận xét của Thầy / Cô:</strong> ....................................................................................................................................
      </td>
    </tr>
  </table>

  <div style="margin-top: 12px;">
    ${questions
      .map(
        (q, idx) => `
    <div style="margin-bottom: 16px;">
      <p><strong>Câu ${idx + 1} (${q.scorePoints || 0.5} điểm) [${q.difficulty}]:</strong> ${renderKaTeXMath(q.content)}</p>
      ${
        q.type === "SINGLE_CHOICE"
          ? `
      <div style="margin-left: 20px;">
        ${(q.answers || [])
          .map((a, aIdx) => `<div><strong>${String.fromCharCode(65 + aIdx)}.</strong> ${renderKaTeXMath(a.content)}</div>`)
          .join("")}
      </div>
      `
          : q.type === "TRUE_FALSE" && q.subItems
          ? `
      <div style="margin-left: 20px;">
        ${q.subItems
          .map((sub) => `<div>${sub.label}) ${renderKaTeXMath(sub.text)}: <em>[ Đúng / Sai ]</em></div>`)
          .join("")}
      </div>
      `
          : q.type === "SHORT_ANSWER"
          ? `<p style="margin-left: 20px; color: #555;"><em>Học sinh ghi kết quả / đáp số: ..........................................................................</em></p>`
          : `<p style="margin-left: 20px; color: #555;"><em>(Học sinh trình bày bài giải chi tiết vào giấy làm bài)</em></p>`
      }
    </div>
    `
      )
      .join("")}
  </div>

  <div class="page-break"></div>

  <!-- PHẦN IV: HƯỚNG DẪN CHẤM VÀ BAREM ĐIỂM -->
  <h2>PHẦN IV. ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM (BAREM CHI TIẾT TỪNG BƯỚC)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">Câu</th>
        <th style="width: 20%;">Đáp án</th>
        <th style="width: 55%;">Hướng dẫn giải chi tiết / Tiêu chí đánh giá</th>
        <th style="width: 15%;">Điểm</th>
      </tr>
    </thead>
    <tbody>
      ${questions
        .map((q, idx) => {
          const correctAns =
            q.type === "SINGLE_CHOICE"
              ? (q.answers || []).find((a) => a.isCorrect)?.label || "A"
              : q.type === "TRUE_FALSE" && q.subItems
              ? q.subItems.map((s) => `${s.label}:${s.isCorrect ? "Đ" : "S"}`).join(", ")
              : q.type === "SHORT_ANSWER"
              ? "Đáp số chính xác"
              : "Lời giải tự luận";
          return `
      <tr>
        <td class="text-center font-bold">Câu ${idx + 1}</td>
        <td class="text-center font-bold" style="color: #0066cc;">${correctAns}</td>
        <td>
          <p>${renderKaTeXMath(q.explanation)}</p>
          ${
            q.rubric && q.rubric.length > 0
              ? `
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            ${q.rubric
              .map((r) => `<li><strong>${r.points}đ:</strong> ${renderKaTeXMath(r.step)}</li>`)
              .join("")}
          </ul>
          `
              : ""
          }
        </td>
        <td class="text-center font-bold">${q.scorePoints || 0.5}đ</td>
      </tr>
      `;
        })
        .join("")}
    </tbody>
  </table>

  <!-- KHUNG PHÊ DUYỆT HÀNH CHÍNH 3 BÊN -->
  <table style="width: 100%; border: none; margin-top: 36px;">
    <tr style="border: none;">
      <td style="border: none; width: 33%; text-align: center;">
        <strong>DUYỆT CỦA BGH</strong><br>
        <em>(Ký và ghi rõ họ tên)</em>
        <br><br><br><br><br>
        ...................................................
      </td>
      <td style="border: none; width: 33%; text-align: center;">
        <strong>TỔ TRƯỞNG CHUYÊN MÔN</strong><br>
        <em>(Ký và ghi rõ họ tên)</em>
        <br><br><br><br><br>
        ...................................................
      </td>
      <td style="border: none; width: 34%; text-align: center;">
        <strong>GIÁO VIÊN RA ĐỀ</strong><br>
        <em>(Ký và ghi rõ họ tên)</em>
        <br><br><br><br><br>
        ${teacherName}
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Tạo tài liệu Word (.doc) cho Kế hoạch bài dạy theo Công văn 5512/BGDĐT-GDTrH
 */
export function buildLessonPlan5512WordContent(
  plan: GeneratedLessonPlan,
  options?: { schoolName?: string; teacherName?: string }
): string {
  const schoolName = options?.schoolName || "TRƯỜNG THCS TÂN PHONG";
  const teacherName = options?.teacherName || "Phan Thị Ngọc Huyền";

  return `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Kế Hoạch Bài Dạy - ${plan.title}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.45; color: #000; margin: 2cm; }
    h1 { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 4px; color: #1e3a8a; }
    h2 { font-size: 13.5pt; font-weight: bold; margin-top: 18px; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 4px; color: #1e3a8a; }
    h3 { font-size: 12.5pt; font-weight: bold; margin-top: 12px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 12px; }
    th, td { border: 1pt solid #000; padding: 6px 8px; font-size: 11pt; text-align: left; vertical-align: top; }
    th { background-color: #f1f5f9; text-align: center; font-weight: bold; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <table style="border: none; width: 100%; margin-bottom: 16px;">
    <tr style="border: none;">
      <td style="border: none; text-align: center; width: 45%; font-size: 11pt; padding: 0;">
        SỞ GD&ĐT TỈNH VĨNH LONG<br>
        <strong>${schoolName.toUpperCase()}</strong><br>
        <em>Tổ Chuyên Môn THCS</em>
      </td>
      <td style="border: none; text-align: center; width: 55%; font-size: 11pt; padding: 0;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
        <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
        <em>Tân Phong, ngày ..... tháng ..... năm 2026</em>
      </td>
    </tr>
  </table>

  <div style="text-align: center; margin-bottom: 18px;">
    <strong style="font-size: 14pt;">KẾ HOẠCH BÀI DẠY (GIÁO ÁN ĐIỆN TỬ)</strong><br>
    <strong style="font-size: 12pt; color: #1e3a8a;">THEO CÔNG VĂN 5512/BGDĐT-GDTrH (18/12/2020)</strong><br>
    <em>Môn: ${plan.subject} - Lớp ${plan.grade} | Thời lượng: ${plan.duration || "45 phút"} | GV: ${teacherName}</em>
  </div>

  <h1>${plan.title.toUpperCase()}</h1>

  <h2>I. MỤC TIÊU DẠY HỌC</h2>
  <p><strong>1. Kiến thức:</strong></p>
  <ul>
    ${plan.objectives?.knowledge?.map((k) => `<li>${renderKaTeXMath(k)}</li>`).join("") || "<li>Nắm vững kiến thức trọng tâm của bài học.</li>"}
  </ul>
  <p><strong>2. Năng lực:</strong></p>
  <ul>
    ${plan.objectives?.competencies?.map((c) => `<li>${renderKaTeXMath(c)}</li>`).join("") || "<li>Phát triển năng lực tự chủ, giao tiếp và giải quyết vấn đề.</li>"}
  </ul>
  <p><strong>3. Phẩm chất:</strong></p>
  <ul>
    ${plan.objectives?.qualities?.map((q) => `<li>${renderKaTeXMath(q)}</li>`).join("") || "<li>Chăm chỉ, trung thực và có trách nhiệm trong học tập.</li>"}
  </ul>

  <h2>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h2>
  <p><strong>1. Chuẩn bị của giáo viên:</strong> ${plan.equipment?.teacher?.join(", ") || "Máy tính, máy chiếu, bài giảng số, phiếu bài tập."}</p>
  <p><strong>2. Chuẩn bị của học sinh:</strong> ${plan.equipment?.student?.join(", ") || "Sách giáo khoa, vở ghi chép, dụng cụ học tập."}</p>

  <h2>III. TIẾN TRÌNH DẠY HỌC (CHUẨN 4 HOẠT ĐỘNG CÔNG VĂN 5512)</h2>
  ${plan.activities
    .map(
      (act: LessonPlanActivity, idx: number) => `
  <div style="margin-bottom: 20px;">
    <h3>Hoạt động ${idx + 1}: ${act.name}</h3>
    <p><strong>a) Mục tiêu:</strong> ${renderKaTeXMath(act.objective)}</p>
    <p><strong>b) Nội dung:</strong> ${renderKaTeXMath(act.content)}</p>
    <p><strong>c) Sản phẩm:</strong> ${renderKaTeXMath(act.product)}</p>
    <p><strong>d) Tổ chức thực hiện:</strong></p>
    <div style="background-color: #f8fafc; border: 1pt solid #cbd5e1; padding: 10px; border-radius: 4px;">
      ${renderKaTeXMath(act.execution).replace(/\n/g, "<br>")}
    </div>
  </div>
  `
    )
    .join("")}

  <div class="page-break"></div>

  <h2>IV. HỒ SƠ DẠY HỌC VÀ PHỤ LỤC PHIẾU BÀI TẬP</h2>
  <p>Hệ thống câu hỏi củng cố và phiếu học tập đi kèm kế hoạch bài dạy bám sát yêu cầu cần đạt của bài học.</p>

  <table style="width: 100%; border: none; margin-top: 36px;">
    <tr style="border: none;">
      <td style="border: none; width: 50%; text-align: center;">
        <strong>TỔ TRƯỞNG CHUYÊN MÔN KÝ DUYỆT</strong><br>
        <em>(Ký và ghi rõ họ tên)</em>
        <br><br><br><br><br>
        ...................................................
      </td>
      <td style="border: none; width: 50%; text-align: center;">
        <strong>GIÁO VIÊN SOẠN BÀI</strong><br>
        <em>(Ký và ghi rõ họ tên)</em>
        <br><br><br><br><br>
        ${teacherName}
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Tạo tài liệu Word (.doc) cho Kịch bản Slide trình chiếu 16:9
 */
export function buildSlideDeckWordContent(
  deck: GeneratedSlideDeck,
  options?: { schoolName?: string; teacherName?: string }
): string {
  const schoolName = options?.schoolName || "TRƯỜNG THCS TÂN PHONG";
  const teacherName = options?.teacherName || "Phan Thị Ngọc Huyền";

  return `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Kịch Bản Bài Giảng Điện Tử - ${deck.title}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.45; color: #000; margin: 2cm; }
    h1 { font-size: 15pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 4px; color: #1e3a8a; }
    h2 { font-size: 13pt; font-weight: bold; margin-top: 18px; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 4px; color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 12px; }
    th, td { border: 1pt solid #000; padding: 6px 8px; font-size: 11pt; text-align: left; vertical-align: top; }
    th { background-color: #f1f5f9; text-align: center; font-weight: bold; }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 20px;">
    <strong>${schoolName.toUpperCase()} - HỆ THỐNG SLIDES STUDIO GDPT 2018</strong><br>
    <h1>KỊCH BẢN TRÌNH CHIẾU BÀI GIẢNG ĐIỆN TỬ</h1>
    <em>Môn: ${deck.subject} - Lớp ${deck.grade} | Tổng số: ${deck.slides.length} trang slide trình chiếu</em><br>
    <em>Giáo viên thiết kế: ${teacherName}</em>
  </div>

  <h2>DANH SÁCH CHI TIẾT CÁC SLIDE TRÌNH CHIẾU</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">Slide</th>
        <th style="width: 22%;">Tiêu đề Slide</th>
        <th style="width: 45%;">Nội dung hiển thị trên màn hình</th>
        <th style="width: 25%;">Lời thoại & Ghi chú sư phạm của GV</th>
      </tr>
    </thead>
    <tbody>
      ${deck.slides
        .map(
          (sl: SlideItem) => `
      <tr>
        <td style="text-align: center; font-weight: bold;">Trang ${sl.slideNumber}</td>
        <td><strong>${sl.title}</strong><br><span style="font-size: 10pt; color: #64748b;">[${sl.subtitle || "Nội dung"}]</span></td>
        <td>
          <ul style="margin: 0; padding-left: 16px;">
            ${sl.bullets?.map((b) => `<li>${renderKaTeXMath(b)}</li>`).join("") || `<li>${renderKaTeXMath(sl.mainContent || "")}</li>`}
          </ul>
        </td>
        <td><em>${renderKaTeXMath(sl.teacherNote || "Giáo viên trình chiếu và dẫn dắt học sinh tương tác.")}</em></td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>
  `;
}

/**
 * Trình kích hoạt tải file Word về máy
 */
export function triggerWordDownload(htmlContent: string, fileName: string) {
  const blob = new Blob([htmlContent], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".doc") ? fileName : `${fileName}.doc`;
  link.click();
  URL.revokeObjectURL(url);
}
