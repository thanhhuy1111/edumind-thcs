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
import { CURRICULUM_PRESETS, SubjectCurriculumPreset } from "@/lib/ai/curriculumDatabase";
import {
  buildCV7991ExamWordContent,
  buildLessonPlan5512WordContent,
  buildSlideDeckWordContent,
  triggerWordDownload,
} from "@/lib/export/wordExportHelper";


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

  const getActivePreset = (): SubjectCurriculumPreset => {
    if (exportSubject.toLowerCase().includes("toán")) {
      return CURRICULUM_PRESETS["math-7-ratio"];
    }
    if (exportSubject.toLowerCase().includes("khoa học") || exportSubject.toLowerCase().includes("khtn")) {
      return CURRICULUM_PRESETS["khtn-7-metabolism"];
    }
    if (exportSubject.toLowerCase().includes("văn") || exportSubject.toLowerCase().includes("ngữ")) {
      return CURRICULUM_PRESETS["literature-8-tang-poetry"];
    }
    return CURRICULUM_PRESETS["math-7-ratio"];
  };

  const handleExportFullExamPackage = () => {
    const preset = getActivePreset();
    const html = buildCV7991ExamWordContent(preset.examPackage, {
      schoolName: "TRƯỜNG THCS TÂN PHONG",
      teacherName: "Phan Thị Ngọc Huyền",
      departmentName: `TỔ CHUYÊN MÔN ${exportSubject.toUpperCase()}`,
    });
    triggerWordDownload(html, `Ho_So_Kiem_Tra_7991_${exportSubject}_Lop${exportGrade}.doc`);
    setExportSuccess(`Đã xuất trọn gói hồ sơ kiểm tra Công văn 7991 môn ${exportSubject} lớp ${exportGrade}!`);
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const handleExport3in1Bundle = () => {
    const preset = getActivePreset();

    // 1. Kế hoạch bài dạy CV 5512
    const lpDoc = buildLessonPlan5512WordContent(preset.lessonPlan, {
      schoolName: "TRƯỜNG THCS TÂN PHONG",
      teacherName: "Phan Thị Ngọc Huyền",
    });
    triggerWordDownload(lpDoc, `1_Ke_Hoach_Bai_Day_CV5512_${exportSubject}_Lop${exportGrade}.doc`);

    // 2. Kịch bản Slide bài giảng
    setTimeout(() => {
      const slideDoc = buildSlideDeckWordContent(preset.slideDeck, {
        schoolName: "TRƯỜNG THCS TÂN PHONG",
        teacherName: "Phan Thị Ngọc Huyền",
      });
      triggerWordDownload(slideDoc, `2_Kich_Ban_Slide_Bai_Giang_${exportSubject}_Lop${exportGrade}.doc`);
    }, 400);

    // 3. Hồ sơ đề kiểm tra CV 7991
    setTimeout(() => {
      const examDoc = buildCV7991ExamWordContent(preset.examPackage, {
        schoolName: "TRƯỜNG THCS TÂN PHONG",
        teacherName: "Phan Thị Ngọc Huyền",
        departmentName: `TỔ CHUYÊN MÔN ${exportSubject.toUpperCase()}`,
      });
      triggerWordDownload(examDoc, `3_Bo_De_Kiem_Tra_CV7991_${exportSubject}_Lop${exportGrade}.doc`);
    }, 800);

    setExportSuccess(`Đang tải trọn bộ Siêu Gói 3-trong-1 (Kế hoạch bài dạy 5512 + Slide + Đề thi 7991) môn ${exportSubject}!`);
    setTimeout(() => setExportSuccess(null), 4000);
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

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExport3in1Bundle}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>🏆 Xuất Siêu Gói 3-Trong-1 (5512 + Slide + 7991)</span>
            </button>

            <button
              onClick={handleExportFullExamPackage}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Xuất Đề CV 7991 ({exportSubject} {exportGrade})</span>
            </button>
          </div>
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
              <option value="Toán học">Toán học (Bài: Tỉ lệ thức & Dãy tỉ số)</option>
              <option value="Khoa học tự nhiên">Khoa học tự nhiên (Bài: Trao đổi chất)</option>
              <option value="Ngữ văn">Ngữ văn (Bài: Thơ Đường luật)</option>
              <option value="Âm nhạc">Âm nhạc (Bài: Khai trường & Nụ cười)</option>
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
