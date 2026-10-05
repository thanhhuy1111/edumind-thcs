"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  Presentation,
  FileCheck2,
  Printer,
  Sparkles,
  Check,
  Layers,
  Settings,
  Eye,
  FileSpreadsheet,
  ArrowRight,
  BookOpen,
  Award,
  ShieldCheck,
} from "lucide-react";
import { MathContent } from "@/components/ui/MathContent";
import katex from "katex";

interface TemplateItem {
  id: string;
  name: string;
  type: string;
  description: string;
  isDefault: boolean;
  contentJson: string;
}

export default function ExportCenterPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Export package parameters
  const [exportSubject, setExportSubject] = useState("Âm nhạc");
  const [exportGrade, setExportGrade] = useState("7");
  const [exportTitle, setExportTitle] = useState("Kiểm tra định kỳ Giữa Học kỳ I - Môn Âm nhạc 7");
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTemplates(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportFullExamPackage = () => {
    const renderMath = (text: string) => {
      if (!text) return "";
      return text.replace(/\$([^$]+)\$/g, (_, math) => {
        try {
          return katex.renderToString(math, { throwOnError: false });
        } catch {
          return math;
        }
      });
    };

    const isMusic = exportSubject.toLowerCase().includes("nhạc");

    const docContent = isMusic ? `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Hồ Sơ Kiểm Tra Định Kỳ Môn Âm Nhạc - Chuẩn Công Văn 7991</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; color: #000; margin: 2cm; }
    h1 { font-size: 15pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 4px; color: #1e3a8a; }
    h2 { font-size: 13.5pt; font-weight: bold; margin-top: 18px; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 4px; color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 12px; }
    th, td { border: 1pt solid #000; padding: 6px 8px; font-size: 11pt; text-align: left; }
    th { background-color: #f1f5f9; text-align: center; font-weight: bold; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <table style="border: none; width: 100%; margin-bottom: 16px;">
    <tr style="border: none;">
      <td style="border: none; text-align: center; width: 50%; font-size: 11pt;">
        <strong>SỞ GD&ĐT TỈNH VĨNH LONG</strong><br>
        <strong>TRƯỜNG THCS TÂN PHONG</strong><br>
        <strong>TỔ NGHỆ THUẬT (ÂM NHẠC - MĨ THUẬT)</strong>
      </td>
      <td style="border: none; text-align: center; width: 50%; font-size: 11pt;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
        <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
        <em>Tân Phong, ngày ..... tháng ..... năm 2026</em>
      </td>
    </tr>
  </table>

  <div style="text-align: center; margin-bottom: 18px;">
    <strong style="font-size: 14pt;">BỘ HỒ SƠ KIỂM TRA ĐÁNH GIÁ ĐỊNH KỲ MÔN ÂM NHẠC</strong><br>
    <strong>ĐỊNH HƯỚNG CÔNG VĂN 7991/BGDĐT-GDTrH</strong><br>
    <em>Giáo viên bộ môn: Cô Phan Thị Ngọc Huyền - Số điện thoại: 0987313889</em><br>
    <em>Lớp: ${exportGrade} - Năm học 2026-2027</em>
  </div>

  <h1>${exportTitle.toUpperCase()}</h1>
  <p style="text-align: center;"><em>Thời gian làm bài: 45 phút - Hình thức: Lí thuyết kết hợp Thực hành nghệ thuật</em></p>

  <h2>PHẦN 1. MA TRẬN ĐỀ KIỂM TRA 2 CHIỀU (CHUẨN CV 7991)</h2>
  <table>
    <thead>
      <tr>
        <th rowspan="2">TT</th>
        <th rowspan="2">Mạch nội dung / Chủ đề</th>
        <th colspan="4">Mức độ nhận thức</th>
        <th rowspan="2">Tổng câu</th>
        <th rowspan="2">Điểm</th>
      </tr>
      <tr>
        <th>Nhận biết</th>
        <th>Thông hiểu</th>
        <th>Vận dụng</th>
        <th>Vận dụng cao</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td><strong>Lí thuyết âm nhạc & Đọc nhạc</strong> (Nhịp 4/4, Dấu nối, Thang âm Đô trưởng)</td>
        <td style="text-align: center;">2 câu (TN)</td>
        <td style="text-align: center;">1 câu (TN)</td>
        <td style="text-align: center;">1 câu (TL)</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center; font-weight: bold;">4</td>
        <td style="text-align: center; font-weight: bold;">3.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td><strong>Thưởng thức âm nhạc</strong> (Dân ca Nam Bộ - Lý cây bông, Đàn bầu VN)</td>
        <td style="text-align: center;">2 câu (TN)</td>
        <td style="text-align: center;">1 câu (TN)</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center; font-weight: bold;">3</td>
        <td style="text-align: center; font-weight: bold;">2.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td><strong>Thực hành Hát</strong> (Bài hát Nụ cười, Mùa khai trường - Đúng sắc thái, lấy hơi)</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">1 bài (TH)</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center; font-weight: bold;">1</td>
        <td style="text-align: center; font-weight: bold;">3.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">4</td>
        <td><strong>Thực hành Nhạc cụ gõ & Vận động</strong> (Gõ thanh phách, Triangle, Vận động phụ họa)</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">1 bài (TH)</td>
        <td style="text-align: center; font-weight: bold;">1</td>
        <td style="text-align: center; font-weight: bold;">2.0đ</td>
      </tr>
      <tr style="background: #f9f9f9; font-weight: bold;">
        <td colspan="2" style="text-align: right;">TỔNG CỘNG</td>
        <td style="text-align: center;">4 câu (25%)</td>
        <td style="text-align: center;">2 câu (25%)</td>
        <td style="text-align: center;">2 bài (30%)</td>
        <td style="text-align: center;">1 bài (20%)</td>
        <td style="text-align: center;">9 phần</td>
        <td style="text-align: center;">10.0đ</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>PHẦN 2. BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA MÔN ÂM NHẠC</h2>
  <table>
    <thead>
      <tr>
        <th>TT</th>
        <th>Nội dung</th>
        <th>Yêu cầu cần đạt</th>
        <th>Mức độ</th>
        <th>Hình thức</th>
        <th>Điểm</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td>Lí thuyết âm nhạc</td>
        <td>Nhận biết số chỉ nhịp 4/4 và tính chất gõ nhịp</td>
        <td style="text-align: center;">Nhận biết</td>
        <td style="text-align: center;">Trắc nghiệm</td>
        <td style="text-align: center;">1.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td>Kí hiệu âm nhạc</td>
        <td>Phân biệt tác dụng dấu nối và dấu quay lại trong bài</td>
        <td style="text-align: center;">Thông hiểu</td>
        <td style="text-align: center;">Trắc nghiệm</td>
        <td style="text-align: center;">1.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td>Thưởng thức âm nhạc</td>
        <td>Nhận diện nhạc cụ Đàn bầu và làn điệu Lý cây bông</td>
        <td style="text-align: center;">Nhận biết</td>
        <td style="text-align: center;">Trắc nghiệm</td>
        <td style="text-align: center;">2.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">4</td>
        <td>Thực hành biểu diễn Hát</td>
        <td>Hát đúng cao độ, giai điệu, biểu cảm bài hát Nụ cười</td>
        <td style="text-align: center;">Vận dụng</td>
        <td style="text-align: center;">Thực hành</td>
        <td style="text-align: center;">3.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">5</td>
        <td>Gõ nhạc cụ & Vận động</td>
        <td>Sử dụng thanh phách đệm chuẩn xác theo phách bài hát</td>
        <td style="text-align: center;">Vận dụng cao</td>
        <td style="text-align: center;">Thực hành</td>
        <td style="text-align: center;">3.0đ</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>PHẦN 3. ĐỀ KIỂM TRA CHÍNH THỨC (MÃ ĐỀ 101)</h2>
  <div style="line-height: 1.6;">
    <h3 style="font-size: 12pt; font-weight: bold; margin-top: 10px;">A. PHẦN TRẮC NGHIỆM & LÍ THUYẾT (4.0 ĐIỂM)</h3>
    <p><strong>Câu 1 (1.0 điểm):</strong> Trong số chỉ nhịp 4/4, con số 4 ở phía trên có ý nghĩa gì?</p>
    <p style="margin-left: 20px;">
      A. Mỗi ô nhịp có 4 phách<br>
      B. Mỗi phách có giá trị bằng 4 nốt đen<br>
      C. Bài hát có 4 đoạn nhạc riêng biệt<br>
      D. Có 4 nhạc cụ cùng tham gia hòa tấu
    </p>

    <p><strong>Câu 2 (1.0 điểm):</strong> Nhạc cụ dân tộc truyền thống Việt Nam nào chỉ có duy nhất một dây nhưng phát ra âm thanh du dương, da diết?</p>
    <p style="margin-left: 20px;">
      A. Đàn T'rưng &nbsp;&nbsp;&nbsp;&nbsp; B. Đàn Tranh &nbsp;&nbsp;&nbsp;&nbsp; C. Đàn Bầu (Độc huyền cầm) &nbsp;&nbsp;&nbsp;&nbsp; D. Đàn Nguyệt
    </p>

    <p><strong>Câu 3 (1.0 điểm):</strong> Bài hát "Lý cây bông" là một làn điệu dân ca thuộc vùng miền nào của đất nước ta?</p>
    <p style="margin-left: 20px;">
      A. Dân ca Bắc Bộ &nbsp;&nbsp;&nbsp;&nbsp; B. Dân ca Quan họ &nbsp;&nbsp;&nbsp;&nbsp; C. Dân ca Nam Bộ &nbsp;&nbsp;&nbsp;&nbsp; D. Dân ca Tây Nguyên
    </p>

    <p><strong>Câu 4 (1.0 điểm):</strong> Kí hiệu âm nhạc dùng để liên kết hai nốt nhạc có cùng cao độ với nhau được gọi là:</p>
    <p style="margin-left: 20px;">
      A. Dấu nối &nbsp;&nbsp;&nbsp;&nbsp; B. Dấu luyến &nbsp;&nbsp;&nbsp;&nbsp; C. Dấu nhắc lại &nbsp;&nbsp;&nbsp;&nbsp; D. Dấu lặng
    </p>

    <h3 style="font-size: 12pt; font-weight: bold; margin-top: 20px;">B. PHẦN THỰC HÀNH NGHỆ THUẬT (6.0 ĐIỂM)</h3>
    <p><strong>Nhiệm vụ 1 (3.0 điểm):</strong> Em hãy trình bày bài hát <em>"Nụ cười" (Nhạc Nga)</em> theo hình thức đơn ca hoặc song ca, chú ý sắc thái vui tươi và nhịp nhàng.</p>
    <p><strong>Nhiệm vụ 2 (3.0 điểm):</strong> Em hãy sử dụng nhạc cụ gõ (thanh phách hoặc triangle) hoặc vận động cơ thể (body percussion) để gõ đệm theo phách cho bài hát vừa trình bày.</p>
  </div>

  <div class="page-break"></div>

  <h2>PHẦN 4. HƯỚNG DẪN CHẤM & RUBRIC ĐÁNH GIÁ NĂNG LỰC ÂM NHẠC</h2>
  <h3 style="font-size: 12pt; font-weight: bold;">1. Đáp án trắc nghiệm (4.0 điểm - Mỗi câu đúng 1.0 điểm)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Câu 1</th>
        <th style="width: 25%;">Câu 2</th>
        <th style="width: 25%;">Câu 3</th>
        <th style="width: 25%;">Câu 4</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center; font-weight: bold; color: #1e3a8a;">A</td>
        <td style="text-align: center; font-weight: bold; color: #1e3a8a;">C</td>
        <td style="text-align: center; font-weight: bold; color: #1e3a8a;">C</td>
        <td style="text-align: center; font-weight: bold; color: #1e3a8a;">A</td>
      </tr>
    </tbody>
  </table>

  <h3 style="font-size: 12pt; font-weight: bold; margin-top: 16px;">2. Rubric chấm điểm thực hành Hát và Nhạc cụ (6.0 điểm)</h3>
  <table>
    <thead>
      <tr>
        <th>Tiêu chí đánh giá</th>
        <th>Mức Tốt (Hoàn thành xuất sắc)</th>
        <th>Mức Đạt (Hoàn thành)</th>
        <th>Mức Chưa đạt</th>
        <th>Điểm tối đa</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Cao độ & Nhịp điệu</strong></td>
        <td>Hát đúng hoàn toàn cao độ, trường độ; nhịp phách ổn định, không chênh phô.</td>
        <td>Hát tương đối đúng, đôi chỗ còn dao động nhẹ về cao độ nhưng sửa kịp.</td>
        <td>Hát sai giai điệu, chênh phô nhiều đoạn, lệch nhịp.</td>
        <td style="text-align: center; font-weight: bold;">2.0đ</td>
      </tr>
      <tr>
        <td><strong>2. Phát âm & Sắc thái biểu cảm</strong></td>
        <td>Phát âm tròn vành rõ chữ, lấy hơi tự nhiên; thể hiện nét mặt vui tươi, xúc cảm.</td>
        <td>Phát âm rõ ràng, sắc thái phù hợp nhưng chưa thật tự nhiên.</td>
        <td>Hát lí nhí, không rõ lời ca, thiếu sắc thái biểu cảm.</td>
        <td style="text-align: center; font-weight: bold;">1.5đ</td>
      </tr>
      <tr>
        <td><strong>3. Thực hành nhạc cụ gõ đệm</strong></td>
        <td>Gõ thanh phách chắc chắn, đúng nhịp 4/4 xuyên suốt cả bài hát.</td>
        <td>Gõ đệm đúng phần lớn bài hát, đôi chỗ còn lúng túng khi chuyển đoạn.</td>
        <td>Không gõ đệm được hoặc gõ sai lệch phách hoàn toàn.</td>
        <td style="text-align: center; font-weight: bold;">1.5đ</td>
      </tr>
      <tr>
        <td><strong>4. Tự tin & Tác phong biểu diễn</strong></td>
        <td>Tác phong nghiêm túc, đứng thẳng, tự tin giao lưu ánh mắt, chào hỏi lễ phép.</td>
        <td>Có tự tin nhưng còn rụt rè nhẹ trước đám đông.</td>
        <td>Quá rụt rè, cần giáo viên hướng dẫn và động viên nhiều.</td>
        <td style="text-align: center; font-weight: bold;">1.0đ</td>
      </tr>
      <tr style="background: #f1f5f9; font-weight: bold;">
        <td colspan="4" style="text-align: right;">TỔNG ĐIỂM THỰC HÀNH</td>
        <td style="text-align: center; color: #1e3a8a;">6.0đ</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 30px; text-align: right;">
    <p><em>Tân Phong, ngày ..... tháng ..... năm 2026</em></p>
    <strong>GIÁO VIÊN RA ĐỀ & CHẤM THI</strong><br><br><br>
    <strong>Cô Phan Thị Ngọc Huyền</strong><br>
    <em>Trường THCS Tân Phong - Vĩnh Long</em>
  </div>
</body>
</html>
    ` : `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Hồ Sơ Kiểm Tra Định Kỳ Chuẩn Công Văn 7991</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; color: #000; margin: 2cm; }
    h1 { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 4px; }
    h2 { font-size: 14pt; font-weight: bold; margin-top: 20px; border-bottom: 1.5pt solid #000; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 12px; }
    th, td { border: 1pt solid #000; padding: 6px 8px; font-size: 11pt; text-align: left; }
    th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 20px;">
    <strong>PHÒNG GD&ĐT QUẬN / HUYỆN - TRƯỜNG THCS TÂN PHONG</strong><br>
    <strong>BỘ HỒ SƠ KIỂM TRA ĐÁNH GIÁ THEO ĐỊNH HƯỚNG CÔNG VĂN 7991/BGDĐT-GDTrH</strong><br>
    <em>Môn: ${exportSubject} - Lớp ${exportGrade}</em>
  </div>

  <h1>ĐỀ KIỂM TRA ĐỊNH KỲ: ${exportTitle.toUpperCase()}</h1>
  <p style="text-align: center;"><em>Thời gian: 45 phút - Thang điểm: 10.0 điểm</em></p>

  <h2>PHẦN 1. MA TRẬN ĐỀ KIỂM TRA 2 CHIỀU</h2>
  <table>
    <thead>
      <tr>
        <th rowspan="2">TT</th>
        <th rowspan="2">Chủ đề kiến thức</th>
        <th colspan="4">Mức độ nhận thức</th>
        <th rowspan="2">Tổng câu</th>
        <th rowspan="2">Điểm</th>
      </tr>
      <tr>
        <th>Nhận biết</th>
        <th>Thông hiểu</th>
        <th>Vận dụng</th>
        <th>Vận dụng cao</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td>Khái niệm và tính chất cơ bản</td>
        <td style="text-align: center;">2 câu</td>
        <td style="text-align: center;">1 câu</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center; font-weight: bold;">3</td>
        <td style="text-align: center; font-weight: bold;">3.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td>Vận dụng tính toán và quy tắc biến đổi</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">2 câu</td>
        <td style="text-align: center;">1 câu</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center; font-weight: bold;">3</td>
        <td style="text-align: center; font-weight: bold;">4.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td>Giải quyết vấn đề thực tế</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">1 câu</td>
        <td style="text-align: center;">1 câu</td>
        <td style="text-align: center; font-weight: bold;">2</td>
        <td style="text-align: center; font-weight: bold;">3.0đ</td>
      </tr>
      <tr style="background: #f9f9f9; font-weight: bold;">
        <td colspan="2" style="text-align: right;">TỔNG CỘNG</td>
        <td style="text-align: center;">2 câu (20%)</td>
        <td style="text-align: center;">3 câu (30%)</td>
        <td style="text-align: center;">2 câu (30%)</td>
        <td style="text-align: center;">1 câu (20%)</td>
        <td style="text-align: center;">8 câu</td>
        <td style="text-align: center;">10.0đ</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>PHẦN 2. BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA</h2>
  <table>
    <thead>
      <tr>
        <th>TT</th>
        <th>Nội dung</th>
        <th>Yêu cầu cần đạt</th>
        <th>Mức độ</th>
        <th>Dạng câu hỏi</th>
        <th>Điểm</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td>Kiến thức trọng tâm</td>
        <td>Nhận biết định nghĩa và tính chất cơ bản</td>
        <td style="text-align: center;">Nhận biết</td>
        <td style="text-align: center;">Trắc nghiệm</td>
        <td style="text-align: center;">2.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td>Kỹ năng biến đổi</td>
        <td>Vận dụng định lí tính toán thành thạo</td>
        <td style="text-align: center;">Thông hiểu</td>
        <td style="text-align: center;">Tự luận ngắn</td>
        <td style="text-align: center;">4.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td>Toán thực tế</td>
        <td>Vận dụng giải bài toán thực tiễn</td>
        <td style="text-align: center;">Vận dụng</td>
        <td style="text-align: center;">Tự luận</td>
        <td style="text-align: center;">4.0đ</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>PHẦN 3. ĐỀ KIỂM TRA CHÍNH THỨC</h2>
  <div>
    <p><strong>Câu 1 (2.0 điểm):</strong> Nhận biết và phát biểu định nghĩa theo chuẩn chương trình GDPT 2018.</p>
    <p><strong>Câu 2 (4.0 điểm):</strong> Thực hiện các yêu cầu tính toán và biến đổi hợp lý.</p>
    <p><strong>Câu 3 (4.0 điểm):</strong> Vận dụng kiến thức đã học vào tình huống thực tiễn đời sống.</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([docContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Full_Package_7991_${exportSubject}_${exportGrade}.doc`;
    link.click();
    URL.revokeObjectURL(url);

    setExportSuccess("Đã xuất trọn gói hồ sơ kiểm tra Công văn 7991 sang Word (.doc)!");
    setTimeout(() => setExportSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Download className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Trung Tâm Xuất Bản Học Liệu THCS
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Xuất bản trọn gói hồ sơ giảng dạy: Kế hoạch bài dạy (CV 5512), Slide bài giảng, Đề kiểm tra định kỳ (CV 7991) kèm ma trận, đặc tả và barem điểm
            </p>
          </div>

          <button
            onClick={handleExportFullExamPackage}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all self-start md:self-auto cursor-pointer"
          >
            <Award className="w-4 h-4" /> Xuất Trọn Gói CV 7991 ({exportSubject} {exportGrade})
          </button>
        </div>

        {/* Dynamic Selection Bar for Export */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Môn học:</span>
            <select
              value={exportSubject}
              onChange={(e) => {
                const s = e.target.value;
                setExportSubject(s);
                if (s === "Âm nhạc") {
                  setExportTitle(`Kiểm tra định kỳ Giữa Học kỳ I - Môn Âm nhạc ${exportGrade}`);
                } else if (s === "Toán học") {
                  setExportTitle(`Kiểm tra định kỳ Giữa Học kỳ I - Môn Toán ${exportGrade}`);
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="Âm nhạc">Âm nhạc</option>
              <option value="Toán học">Toán học</option>
              <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Khối:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              {["6", "7", "8", "9"].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setExportGrade(g);
                    if (exportSubject === "Âm nhạc") {
                      setExportTitle(`Kiểm tra định kỳ Giữa Học kỳ I - Môn Âm nhạc ${g}`);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    exportGrade === g
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Lớp {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              value={exportTitle}
              onChange={(e) => setExportTitle(e.target.value)}
              placeholder="Tiêu đề bài kiểm tra..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
            />
          </div>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" /> {exportSuccess}
        </div>
      )}

      {/* QUICK EXPORT CHANNELS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Channel 1: Kế hoạch bài dạy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all">
          <div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3.5">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kế Hoạch Bài Dạy (Giáo Án)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Chuẩn Công văn 5512/BGDĐT gồm 4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Định dạng hỗ trợ:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">DOCX, Word, PDF</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Hỗ trợ công thức:</span>
                <span className="font-semibold text-indigo-600">Toán học KaTeX chuẩn</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Link
              href="/materials/lesson-plan"
              className="flex-1 py-2 text-center bg-slate-50 hover:bg-indigo-50 text-indigo-600 border border-slate-200/60 hover:border-indigo-200 rounded-xl text-xs font-semibold transition-all"
            >
              Mở Soạn Giáo Án
            </Link>
          </div>
        </div>

        {/* Channel 2: Slide Bài Giảng */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all">
          <div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3.5">
              <Presentation className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Slide Bài Giảng Trực Quan
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Bộ trình chiếu 16:9 với 10 trang bài giảng, mini-game trắc nghiệm, hình ảnh minh họa và ghi chú sư phạm.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Định dạng hỗ trợ:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">HTML Trình chiếu, PPTX</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Chế độ:</span>
                <span className="font-semibold text-indigo-600">Thuyết trình Toàn màn hình</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Link
              href="/materials/slides"
              className="flex-1 py-2 text-center bg-slate-50 hover:bg-indigo-50 text-indigo-600 border border-slate-200/60 hover:border-indigo-200 rounded-xl text-xs font-semibold transition-all"
            >
              Mở Studio Slide
            </Link>
          </div>
        </div>

        {/* Channel 3: Trọn Bộ Đề Kiểm Tra 7991 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all">
          <div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3.5">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hồ Sơ Đề Kiểm Tra (CV 7991)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Bao gồm: Đề thi gốc, 4 mã đề hoán vị (101-104), Bảng đáp án, Ma trận 2 chiều, Bản đặc tả và Barem chấm tự luận.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Kiểm tra nhất quán:</span>
                <span className="font-semibold text-indigo-600">Consistency Guard (10đ)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Định dạng:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Trọn bộ Word (.doc) &amp; PDF</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Link
              href="/exams/wizard"
              className="flex-1 py-2 text-center bg-slate-50 hover:bg-indigo-50 text-indigo-600 border border-slate-200/60 hover:border-indigo-200 rounded-xl text-xs font-semibold transition-all"
            >
              Mở Exam Wizard 7991
            </Link>
          </div>
        </div>
      </div>

      {/* TEMPLATE SYSTEM SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Hệ Thống Mẫu Tài Liệu (Template System)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Tùy biến theo quy định của nhà trường hoặc Sở/Bộ GD&ĐT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {tpl.type}
                  </span>
                  {tpl.isDefault && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Mặc định
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{tpl.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <button
                  onClick={() => setPreviewTemplate(tpl)}
                  className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Xem trước cấu trúc
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TEMPLATE PREVIEW MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Cấu Trúc Mẫu: {previewTemplate.name}
              </h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">{previewTemplate.description}</p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-xs font-mono overflow-x-auto text-slate-700 dark:text-slate-300">
              <pre>{JSON.stringify(JSON.parse(previewTemplate.contentJson), null, 2)}</pre>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
