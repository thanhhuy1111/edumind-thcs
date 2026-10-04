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
  const [exportSubject, setExportSubject] = useState("Toán học");
  const [exportGrade, setExportGrade] = useState("7");
  const [exportTitle, setExportTitle] = useState("Bài 6: Tỉ lệ thức và dãy tỉ số bằng nhau");
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

    const docContent = `
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
    <strong>PHÒNG GD&ĐT QUẬN / HUYỆN - TRƯỜNG THCS</strong><br>
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
        <td>Định nghĩa tỉ lệ thức và tính chất tích chéo</td>
        <td style="text-align: center;">2 câu</td>
        <td style="text-align: center;">1 câu</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center; font-weight: bold;">3</td>
        <td style="text-align: center; font-weight: bold;">3.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td>Tính chất của dãy tỉ số bằng nhau</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center;">2 câu</td>
        <td style="text-align: center;">1 câu</td>
        <td style="text-align: center;">0</td>
        <td style="text-align: center; font-weight: bold;">3</td>
        <td style="text-align: center; font-weight: bold;">4.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td>Vận dụng giải toán thực tế & tối ưu hóa</td>
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
        <td>Tỉ lệ thức</td>
        <td>Nhận biết tính chất ${renderMath("a \\cdot d = b \\cdot c")}</td>
        <td style="text-align: center;">Nhận biết</td>
        <td style="text-align: center;">Trắc nghiệm</td>
        <td style="text-align: center;">1.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td>Dãy tỉ số bằng nhau</td>
        <td>Tìm hai số ${renderMath("x, y")} biết ${renderMath("\\frac{x}{2} = \\frac{y}{5}")} và ${renderMath("x + y = 21")}</td>
        <td style="text-align: center;">Thông hiểu</td>
        <td style="text-align: center;">Tự luận ngắn</td>
        <td style="text-align: center;">2.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td>Toán thực tế</td>
        <td>Chia số cây trồng của ba lớp theo tỉ lệ 3:5:7</td>
        <td style="text-align: center;">Vận dụng</td>
        <td style="text-align: center;">Tự luận</td>
        <td style="text-align: center;">2.0đ</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>PHẦN 3. ĐỀ KIỂM TRA CHÍNH THỨC (MÃ ĐỀ 101)</h2>
  <div>
    <p><strong>Câu 1 (1.0 điểm):</strong> Cho tỉ lệ thức ${renderMath("\\frac{x}{4} = \\frac{9}{12}")}. Giá trị của ${renderMath("x")} là:</p>
    <p style="margin-left: 20px;">A. 2 &nbsp;&nbsp;&nbsp;&nbsp; B. 3 &nbsp;&nbsp;&nbsp;&nbsp; C. 4 &nbsp;&nbsp;&nbsp;&nbsp; D. 5</p>

    <p><strong>Câu 2 (2.0 điểm):</strong> Tìm hai số ${renderMath("x, y")} biết: ${renderMath("\\frac{x}{2} = \\frac{y}{5}")} và ${renderMath("x + y = 21")}.</p>
    <p style="margin-left: 20px;"><em>(Học sinh trình bày lời giải chi tiết vào giấy làm bài)</em></p>

    <p><strong>Câu 3 (2.0 điểm):</strong> Ba lớp 7A, 7B, 7C tham gia phong trào trồng cây xanh và trồng được tổng cộng 180 cây. Biết số cây trồng của ba lớp lần lượt tỉ lệ với 3; 4; 5. Tính số cây mỗi lớp đã trồng.</p>
  </div>

  <div class="page-break"></div>

  <h2>PHẦN 4. HƯỚNG DẪN CHẤM &amp; BAREM ĐIỂM CHI TIẾT</h2>
  <table>
    <thead>
      <tr>
        <th>Câu</th>
        <th>Đáp án / Các bước giải chi tiết</th>
        <th>Điểm</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center; font-weight: bold;">Câu 1</td>
        <td>Đáp án đúng: <strong>B. 3</strong> (${renderMath("x = \\frac{4 \\times 9}{12} = 3")})</td>
        <td style="text-align: center; font-weight: bold;">1.0đ</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">Câu 2</td>
        <td>
          • Áp dụng tính chất dãy tỉ số bằng nhau: ${renderMath("\\frac{x}{2} = \\frac{y}{5} = \\frac{x+y}{2+5} = \\frac{21}{7} = 3")}<br>
          • Tính được ${renderMath("x = 2 \\times 3 = 6")}<br>
          • Tính được ${renderMath("y = 5 \\times 3 = 15")}<br>
          • Kết luận nghiệm: ${renderMath("(x, y) = (6, 15)")}
        </td>
        <td style="text-align: center; font-weight: bold;">
          0.75đ<br>
          0.5đ<br>
          0.5đ<br>
          0.25đ<br>
          (Tổng: 2.0đ)
        </td>
      </tr>
    </tbody>
  </table>
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
        >
          <Award className="w-4 h-4" /> Xuất Trọn Gói CV 7991 (1-Click)
        </button>
      </div>

      {exportSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" /> {exportSuccess}
        </div>
      )}

      {/* QUICK EXPORT CHANNELS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Channel 1: Kế hoạch bài dạy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kế Hoạch Bài Dạy (Giáo Án)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Chuẩn Công văn 5512/BGDĐT gồm 4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Định dạng hỗ trợ:</span>
                <span className="font-bold text-indigo-600">DOCX, Word (.doc), PDF</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Hỗ trợ công thức:</span>
                <span className="font-bold text-emerald-600">Toán học KaTeX chuẩn</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Link
              href="/materials/lesson-plan"
              className="flex-1 py-2 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-colors"
            >
              Mở Soạn Giáo Án
            </Link>
          </div>
        </div>

        {/* Channel 2: Slide Bài Giảng */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
              <Presentation className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Slide Bài Giảng Trực Quan
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bộ trình chiếu 16:9 với 10 trang bài giảng, mini-game trắc nghiệm, hình ảnh minh họa và ghi chú sư phạm.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Định dạng hỗ trợ:</span>
                <span className="font-bold text-violet-600">HTML Trình chiếu, PDF, PPTX</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Chế độ:</span>
                <span className="font-bold text-indigo-600">Thuyết trình Toàn màn hình</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Link
              href="/materials/slides"
              className="flex-1 py-2 text-center bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl text-xs font-bold transition-colors"
            >
              Mở Studio Slide
            </Link>
          </div>
        </div>

        {/* Channel 3: Trọn Bộ Đề Kiểm Tra 7991 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hồ Sơ Đề Kiểm Tra (CV 7991)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bao gồm: Đề thi gốc, 4 mã đề hoán vị (101-104), Bảng đáp án, Ma trận 2 chiều, Bản đặc tả và Barem chấm tự luận.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Kiểm tra nhất quán:</span>
                <span className="font-bold text-emerald-600">Consistency Guard (10đ)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Định dạng:</span>
                <span className="font-bold text-blue-600">Trọn bộ Word (.doc) &amp; PDF</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Link
              href="/exams/wizard"
              className="flex-1 py-2 text-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors"
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
