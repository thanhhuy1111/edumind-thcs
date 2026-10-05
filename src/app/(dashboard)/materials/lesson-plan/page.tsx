"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Sparkles,
  ArrowLeft,
  Save,
  Printer,
  Download,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Presentation,
  CheckCircle2,
  BookOpen,
  Layers,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";
import { MathContent } from "@/components/ui/MathContent";
import katex from "katex";

export const dynamic = "force-dynamic";

interface ActivityItem {
  id: string;
  order: number;
  name: string;
  objective: string;
  content: string;
  product: string;
  execution: string;
}

interface LessonPlanData {
  title: string;
  subject: string;
  grade: number;
  duration: string;
  objectives: {
    knowledge: string[];
    competencies: string[];
    qualities: string[];
  };
  equipment: {
    teacher: string[];
    student: string[];
    digital: string[];
  };
  activities: ActivityItem[];
}

function LessonPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLessonId = searchParams.get("lessonId") || "";

  // Form State
  const [subject, setSubject] = useState("Âm nhạc");
  const [grade, setGrade] = useState("7");
  const [lessonTitle, setLessonTitle] = useState("Chủ đề 2: Tình bạn - Bài 3: Học hát bài Nụ cười");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [method, setMethod] = useState("Dạy học thực hành biểu diễn, luyện thanh, hòa âm nhóm và gõ đệm thanh phách");
  const [learningOutcomes, setLearningOutcomes] = useState(
    "Hát đúng giai điệu và lời ca bài hát Nụ cười, biết gõ đệm thanh phách nhịp nhàng theo phách 2/4, cảm nhận tình bạn trong sáng."
  );

  // Generation & Interactive State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [plan, setPlan] = useState<LessonPlanData | null>(null);
  const [activeEditingActivity, setActiveEditingActivity] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "TEACHER_REVIEWED" | "APPROVED">("APPROVED");

  // Load initial demo plan on mount
  useEffect(() => {
    handleGeneratePlan();
  }, []);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/materials/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE",
          params: {
            subject,
            grade: parseInt(grade, 10),
            lessonTitle,
            durationMinutes: parseInt(durationMinutes, 10),
            learningOutcomes,
            method,
          },
        }),
      });
      const data = await res.json();
      if (data && data.activities) {
        setPlan(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateActivity = async (activity: ActivityItem, instruction: "shorten" | "expand" | "refresh") => {
    try {
      const res = await fetch("/api/materials/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REGENERATE_ACTIVITY",
          params: {
            activity,
            instruction,
          },
        }),
      });
      const updated = await res.json();
      if (plan && updated) {
        setPlan({
          ...plan,
          activities: plan.activities.map((a) => (a.id === updated.id ? updated : a)),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddActivity = () => {
    if (!plan) return;
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      order: plan.activities.length + 1,
      name: `Hoạt động ${plan.activities.length + 1}: Mở rộng liên môn & Dự án`,
      objective: "Học sinh ứng dụng kiến thức vào dự án thực hành hoặc nghiên cứu thực địa.",
      content: "Nhiệm vụ tìm hiểu các công trình kiến trúc có tỉ lệ thức trong thực tế.",
      product: "Bài thuyết trình hoặc poster ảnh của nhóm học sinh.",
      execution: "Bước 1: Giao dự án về nhà.\nBước 2: Học sinh thu thập tư liệu.\nBước 3: Báo cáo trong tiết thực hành.",
    };
    setPlan({
      ...plan,
      activities: [...plan.activities, newAct],
    });
  };

  const handleDeleteActivity = (id: string) => {
    if (!plan) return;
    setPlan({
      ...plan,
      activities: plan.activities.filter((a) => a.id !== id),
    });
  };

  const handleSavePlan = async () => {
    if (!plan) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/materials/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE",
          params: {
            title: plan.title,
            lessonId: initialLessonId || null,
            content: JSON.stringify(plan),
            metaJson: {
              subject: plan.subject,
              grade: plan.grade,
              duration: plan.duration,
              objectives: plan.objectives,
              equipment: plan.equipment,
            },
            activitiesJson: plan.activities,
            status,
          },
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatMathForWord = (text: string) => {
    if (!text) return "";
    return text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math, { throwOnError: false, displayMode: false });
      } catch {
        return math;
      }
    });
  };

  const handleExportWord = () => {
    if (!plan) return;
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${plan.title}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .header-table td { vertical-align: top; }
          h2 { text-align: center; text-transform: uppercase; font-size: 15pt; }
          h3 { font-size: 13pt; font-weight: bold; margin-top: 15px; }
          .act-title { font-weight: bold; color: #1e3a8a; }
          table.bordered { width: 100%; border-collapse: collapse; margin-top: 10px; }
          table.bordered td, table.bordered th { border: 1px solid #000; padding: 6px; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 50%; text-align: center;">
              <strong>TRƯỜNG THCS TÂN PHONG - VĨNH LONG</strong><br/>
              TỔ NGHỆ THUẬT (ÂM NHẠC - MĨ THUẬT)<br/>
              GVBM: Phan Thị Ngọc Huyền
            </td>
            <td style="width: 50%; text-align: center;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
              Độc lập - Tự do - Hạnh phúc
            </td>
          </tr>
        </table>

        <h2>${plan.title}</h2>
        <p style="text-align: center; font-style: italic;">
          Môn học: ${plan.subject} &bull; Khối: ${plan.grade} &bull; Thời lượng: ${plan.duration}
        </p>
        <hr/>

        <h3>I. MỤC TIÊU</h3>
        <p><strong>1. Về kiến thức:</strong></p>
        <ul>${plan.objectives.knowledge.map((k) => `<li>${formatMathForWord(k)}</li>`).join("")}</ul>

        <p><strong>2. Về năng lực:</strong></p>
        <ul>${plan.objectives.competencies.map((c) => `<li>${c}</li>`).join("")}</ul>

        <p><strong>3. Về phẩm chất:</strong></p>
        <ul>${plan.objectives.qualities.map((q) => `<li>${q}</li>`).join("")}</ul>

        <h3>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
        <p><strong>1. Giáo viên:</strong> ${plan.equipment.teacher.join("; ")}.</p>
        <p><strong>2. Học sinh:</strong> ${plan.equipment.student.join("; ")}.</p>
        <p><strong>3. Học liệu số:</strong> ${plan.equipment.digital.join("; ")}.</p>

        <h3>III. TIẾN TRÌNH DẠY HỌC (TỔ CHỨC CÁC HOẠT ĐỘNG)</h3>
        ${plan.activities
          .map(
            (act) => `
          <div style="margin-bottom: 20px;">
            <p class="act-title">${act.name}</p>
            <p><strong>a) Mục tiêu:</strong> ${act.objective}</p>
            <p><strong>b) Nội dung:</strong> ${formatMathForWord(act.content)}</p>
            <p><strong>c) Sản phẩm:</strong> ${formatMathForWord(act.product)}</p>
            <p><strong>d) Tổ chức thực hiện:</strong><br/>${act.execution.replace(/\n/g, "<br/>")}</p>
          </div>
        `
          )
          .join("")}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ke_Hoach_Bai_Day_${plan.title.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/materials"
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 -ml-1 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
              Chuẩn Công văn 5512 & 7991/BGDĐT
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>AI Soạn Kế Hoạch Bài Dạy (Giáo Án)</span>
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </h1>
          <p className="text-xs text-slate-500">
            Tạo kế hoạch bài dạy chuẩn 4 hoạt động, chỉnh sửa từng phần độc lập và xuất Microsoft Word / PDF phục vụ thanh tra sư phạm.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => router.push(`/materials/slides?lessonTitle=${encodeURIComponent(lessonTitle)}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold shadow-2xs transition-all active:scale-95"
          >
            <Presentation className="w-4 h-4 text-indigo-600" />
            <span>Tạo Slide từ Kế hoạch này</span>
          </button>

          <button
            onClick={handleExportWord}
            disabled={!plan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Xuất Word (.doc)</span>
          </button>

          <button
            onClick={() => window.print()}
            disabled={!plan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In PDF</span>
          </button>

          <button
            onClick={handleSavePlan}
            disabled={isSaving || !plan}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Đang lưu..." : "Lưu Giáo Án"}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã lưu Kế hoạch bài dạy thành công vào Thư viện học liệu của bạn!</span>
        </div>
      )}

      {/* Main Grid: Config Column + Preview/Editor Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Generator Parameters */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Thông tin bài dạy</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">CV 5512</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Môn học</label>
              <select
                value={subject}
                onChange={(e) => {
                  const val = e.target.value;
                  setSubject(val);
                  if (val === "Âm nhạc") {
                    setLessonTitle("Chủ đề 2: Tình bạn - Bài 3: Học hát bài Nụ cười");
                    setLearningOutcomes("Hát đúng giai điệu và lời ca bài hát Nụ cười, biết gõ đệm thanh phách nhịp nhàng theo phách 2/4, cảm nhận tình bạn trong sáng.");
                    setDurationMinutes("45");
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
              >
                <option value="Âm nhạc">Âm nhạc</option>
                <option value="Toán học">Toán học</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                <option value="Ngữ văn">Ngữ văn</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                >
                  <option value="6">Khối 6</option>
                  <option value="7">Khối 7</option>
                  <option value="8">Khối 8</option>
                  <option value="9">Khối 9</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời lượng</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                >
                  <option value="45">1 tiết (45 phút)</option>
                  <option value="90">2 tiết (90 phút)</option>
                  <option value="135">3 tiết (135 phút)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên bài học</label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="VD: Bài 6: Tỉ lệ thức và dãy tỉ số bằng nhau"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phương pháp dạy học</label>
              <input
                type="text"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                placeholder="VD: Nêu vấn đề, hoạt động nhóm"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Yêu cầu cần đạt trọng tâm (YCCĐ)</label>
              <textarea
                rows={3}
                value={learningOutcomes}
                onChange={(e) => setLearningOutcomes(e.target.value)}
                placeholder="Nhập yêu cầu cần đạt hoặc chuẩn đầu ra..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Quality Control State */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Trạng thái duyệt</label>
              <div className="grid grid-cols-3 gap-1.5 font-semibold text-[11px]">
                <button
                  type="button"
                  onClick={() => setStatus("DRAFT")}
                  className={`py-1.5 rounded-lg border text-center ${
                    status === "DRAFT" ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-slate-50 text-slate-600"
                  }`}
                >
                  Bản nháp
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("TEACHER_REVIEWED")}
                  className={`py-1.5 rounded-lg border text-center ${
                    status === "TEACHER_REVIEWED" ? "bg-blue-100 border-blue-300 text-blue-900" : "bg-slate-50 text-slate-600"
                  }`}
                >
                  Đã xem
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("APPROVED")}
                  className={`py-1.5 rounded-lg border text-center ${
                    status === "APPROVED" ? "bg-emerald-100 border-emerald-300 text-emerald-900" : "bg-slate-50 text-slate-600"
                  }`}
                >
                  Phê duyệt
                </button>
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-98 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang soạn giáo án...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI Soạn Lại Giáo Án Này</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Lesson Plan Paper */}
        <div className="lg:col-span-8 space-y-6">
          {plan ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs space-y-6 font-sans">
              {/* Header Box */}
              <div className="pb-4 border-b border-slate-200 space-y-1 text-center">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Kế Hoạch Bài Dạy Chuẩn Công Văn 5512 & 7991
                </div>
                <h2 className="text-xl font-black text-slate-900">{plan.title}</h2>
                <p className="text-xs text-slate-500">
                  Môn: <strong>{plan.subject}</strong> &bull; Khối: <strong>{plan.grade}</strong> &bull; Thời lượng:{" "}
                  <strong>{plan.duration}</strong>
                </p>
              </div>

              {/* Section I: Objectives */}
              <div className="space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    I
                  </span>
                  <span>Mục Tiêu Bài Dạy</span>
                </h3>

                <div className="space-y-2 text-xs text-slate-700 pl-2">
                  <div>
                    <span className="font-bold text-slate-900">1. Về kiến thức:</span>
                    <ul className="list-disc list-inside space-y-1 mt-1 pl-2">
                      {plan.objectives.knowledge.map((k, idx) => (
                        <li key={idx}>
                          <MathContent content={k} inline />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-slate-900">2. Về năng lực:</span>
                    <ul className="list-disc list-inside space-y-1 mt-1 pl-2">
                      {plan.objectives.competencies.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-slate-900">3. Về phẩm chất:</span>
                    <ul className="list-disc list-inside space-y-1 mt-1 pl-2">
                      {plan.objectives.qualities.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section II: Equipment */}
              <div className="space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                    II
                  </span>
                  <span>Thiết Bị Dạy Học & Học Liệu</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Giáo viên:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {plan.equipment.teacher.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Học sinh:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {plan.equipment.student.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Học liệu số:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {plan.equipment.digital.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section III: 4 Activities */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                      III
                    </span>
                    <span>Tiến Trình Dạy Học (4 Hoạt Động Cốt Lõi)</span>
                  </h3>

                  <button
                    onClick={handleAddActivity}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm hoạt động</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {plan.activities.map((act, idx) => {
                    const isEditing = activeEditingActivity === act.id;

                    return (
                      <div
                        key={act.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 transition-shadow hover:shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <span className="font-black text-xs text-blue-900">{act.name}</span>

                          {/* Quick Regenerate & Fine-tune Actions */}
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <button
                              onClick={() => handleRegenerateActivity(act, "shorten")}
                              title="Tóm tắt ngắn gọn hoạt động này"
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold"
                            >
                              Viết ngắn gọn
                            </button>
                            <button
                              onClick={() => handleRegenerateActivity(act, "expand")}
                              title="Mở rộng chi tiết các bước"
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold"
                            >
                              Viết chi tiết
                            </button>
                            <button
                              onClick={() => handleRegenerateActivity(act, "refresh")}
                              title="AI sinh lại hoạt động này"
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(act.id)}
                              title="Xóa hoạt động này"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Content Elements */}
                        <div className="space-y-2 text-xs leading-relaxed">
                          <div>
                            <span className="font-bold text-slate-900">a) Mục tiêu: </span>
                            <span className="text-slate-700">{act.objective}</span>
                          </div>

                          <div>
                            <span className="font-bold text-slate-900">b) Nội dung: </span>
                            <div className="text-slate-700 mt-0.5">
                              <MathContent content={act.content} />
                            </div>
                          </div>

                          <div>
                            <span className="font-bold text-slate-900">c) Sản phẩm: </span>
                            <div className="text-slate-700 mt-0.5">
                              <MathContent content={act.product} />
                            </div>
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block mb-0.5">d) Tổ chức thực hiện:</span>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-700 whitespace-pre-wrap leading-relaxed font-mono text-[11px]">
                              {act.execution}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              <span>Chưa có dữ liệu kế hoạch bài dạy. Bấm &ldquo;AI Soạn Lại Giáo Án&rdquo; để khởi tạo.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LessonPlanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Đang tải Kế hoạch bài dạy...</div>}>
      <LessonPlanContent />
    </Suspense>
  );
}
