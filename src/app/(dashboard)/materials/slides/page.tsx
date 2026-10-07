"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Presentation,
  Sparkles,
  ArrowLeft,
  Save,
  Printer,
  Download,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  FileText,
  FileQuestion,
  HelpCircle,
  Eye,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  MessageSquare,
  MoveUp,
  MoveDown,
  Layers,
  Award,
  AlertTriangle,
} from "lucide-react";
import { MathContent } from "@/components/ui/MathContent";

export const dynamic = "force-dynamic";

interface SlideQuiz {
  question: string;
  options: string[];
  answer: string;
}

interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  mainContent: string;
  bullets: string[];
  teacherNote: string;
  suggestedVisual: string;
  quizQuestion?: SlideQuiz;
}

interface OutlineItem {
  slideNumber: number;
  title: string;
  subtitle: string;
}

function SlidesStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLessonId = searchParams.get("lessonId") || "";

  // Configuration Form State
  const [subject, setSubject] = useState("Âm nhạc");
  const [grade, setGrade] = useState("7");
  const [lessonTitle, setLessonTitle] = useState("Chủ đề 2: Tình bạn - Học hát bài Nụ cười");
  const [style, setStyle] = useState("Học tập tương tác & Trực quan");
  const [slideCount, setSlideCount] = useState(10);

  // Workflow Stage: "OUTLINE" | "STUDIO"
  const [workflowStage, setWorkflowStage] = useState<"OUTLINE" | "STUDIO">("STUDIO");
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Loading & UI States
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "TEACHER_REVIEWED" | "APPROVED">("APPROVED");
  const [reported, setReported] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Presentation Mode
  const [isPresenting, setIsPresenting] = useState(false);
  const [showTeacherNotesInPresent, setShowTeacherNotesInPresent] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    handleGenerateInitialDeck();
  }, []);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresenting) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
        setSelectedQuizOption(null);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
        setSelectedQuizOption(null);
      } else if (e.key === "Escape") {
        setIsPresenting(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresenting, slides.length]);

  const handleGenerateOutline = async () => {
    setIsGeneratingOutline(true);
    try {
      const res = await fetch("/api/materials/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE_OUTLINE",
          params: { lessonTitle, subject, grade: parseInt(grade, 10) },
        }),
      });
      const data = await res.json();
      if (data.outline) {
        setOutline(data.outline);
        setWorkflowStage("OUTLINE");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo dàn ý slide");
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleGenerateInitialDeck = async (overrideParams?: any) => {
    setIsGeneratingDeck(true);
    const pSubject = overrideParams?.subject || subject;
    const pGrade = overrideParams?.grade || grade;
    const pTitle = overrideParams?.lessonTitle || lessonTitle;
    const pCount = overrideParams?.slideCount || slideCount;
    const pStyle = overrideParams?.style || style;

    try {
      const res = await fetch("/api/materials/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE_DECK",
          params: { lessonTitle: pTitle, subject: pSubject, grade: parseInt(pGrade, 10), slideCount: pCount, style: pStyle },
        }),
      });
      const data = await res.json();
      if (data.slides) {
        setSlides(data.slides);
        setActiveSlideIndex(0);
        setWorkflowStage("STUDIO");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  const handleSelectPresetSlide = (presetKey: "math" | "khtn" | "literature" | "music") => {
    let pParams;
    if (presetKey === "math") {
      pParams = {
        subject: "Toán học",
        grade: "7",
        lessonTitle: "Bài 6: Tỉ lệ thức và Dãy tỉ số bằng nhau",
        slideCount: 10,
        style: "Học tập tương tác & Trực quan",
      };
    } else if (presetKey === "khtn") {
      pParams = {
        subject: "Khoa học tự nhiên",
        grade: "7",
        lessonTitle: "Bài 22: Vai trò của trao đổi chất và chuyển hóa năng lượng ở sinh vật",
        slideCount: 10,
        style: "Học tập tương tác & Trực quan",
      };
    } else if (presetKey === "literature") {
      pParams = {
        subject: "Ngữ văn",
        grade: "8",
        lessonTitle: "Bài 2: Vẻ đẹp cổ điển - Thơ Thất ngôn bát cú Đường luật (Qua Đèo Ngang)",
        slideCount: 10,
        style: "Học tập tương tác & Trực quan",
      };
    } else {
      pParams = {
        subject: "Âm nhạc",
        grade: "7",
        lessonTitle: "Chủ đề 2: Tình bạn - Học hát bài Nụ cười",
        slideCount: 10,
        style: "Học tập tương tác & Trực quan",
      };
    }

    setSubject(pParams.subject);
    setGrade(pParams.grade);
    setLessonTitle(pParams.lessonTitle);
    handleGenerateInitialDeck(pParams);
  };

  const handleGenerateDeckFromOutline = async () => {
    setIsGeneratingDeck(true);
    try {
      const res = await fetch("/api/materials/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE_DECK",
          params: { lessonTitle, subject, grade: parseInt(grade, 10), slideCount: outline.length, style },
        }),
      });
      const data = await res.json();
      if (data.slides) {
        setSlides(data.slides);
        setActiveSlideIndex(0);
        setWorkflowStage("STUDIO");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi sinh toàn bộ slide bài giảng");
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  // Slide Modification Actions
  const handleRegenerateSlide = async (instruction: "shorten" | "expand" | "add_quiz") => {
    const current = slides[activeSlideIndex];
    if (!current) return;

    try {
      const res = await fetch("/api/materials/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REGENERATE_SLIDE",
          params: { slide: current, instruction },
        }),
      });
      const updated = await res.json();
      const newSlides = [...slides];
      newSlides[activeSlideIndex] = updated;
      setSlides(newSlides);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicateSlide = (index: number) => {
    const toDup = slides[index];
    if (!toDup) return;
    const duplicated: SlideItem = {
      ...toDup,
      id: "slide-" + Date.now(),
      title: `${toDup.title} (Bản sao)`,
      slideNumber: toDup.slideNumber + 1,
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, duplicated);
    // re-number
    newSlides.forEach((s, idx) => (s.slideNumber = idx + 1));
    setSlides(newSlides);
    setActiveSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      alert("Bài giảng cần có ít nhất 1 slide");
      return;
    }
    const newSlides = slides.filter((_, idx) => idx !== index);
    newSlides.forEach((s, idx) => (s.slideNumber = idx + 1));
    setSlides(newSlides);
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const handleMoveSlide = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[fromIndex];
    newSlides[fromIndex] = newSlides[toIndex];
    newSlides[toIndex] = temp;
    newSlides.forEach((s, idx) => (s.slideNumber = idx + 1));
    setSlides(newSlides);
    setActiveSlideIndex(toIndex);
  };

  const handleSaveDeck = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/materials/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE",
          params: {
            title: `Slide: ${lessonTitle}`,
            subject,
            grade: parseInt(grade, 10),
            lessonId: initialLessonId || undefined,
            slides,
            status,
            reported,
          },
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu slide");
    } finally {
      setIsSaving(false);
    }
  };

  // Export HTML Presentation Bundle
  const handleExportHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${lessonTitle} - Slide Bài Giảng THCS</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body, {delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}]});"></script>
  <style>
    @media print {
      .slide-page { page-break-after: always; height: 100vh; }
      .no-print { display: none; }
    }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 font-sans p-6">
  <div class="max-w-5xl mx-auto space-y-12">
    <div class="text-center py-6 no-print border-b border-slate-700">
      <h1 class="text-3xl font-bold text-indigo-400 mb-2">${lessonTitle}</h1>
      <p class="text-slate-400">Giáo trình số THCS - Bộ giáo dục & Đào tạo | Phong cách: ${style}</p>
      <button onclick="window.print()" class="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow font-medium">In Slide / Xuất PDF</button>
    </div>
    ${slides
      .map(
        (slide) => `
    <div class="slide-page bg-slate-800 border border-slate-700 rounded-2xl p-10 shadow-2xl flex flex-col justify-between min-h-[580px]">
      <div>
        <div class="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
          <span class="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-sm font-semibold rounded-full">Slide ${slide.slideNumber}/${slides.length}</span>
          <span class="text-xs text-slate-400 font-medium">${subject} ${grade}</span>
        </div>
        <h2 class="text-3xl font-extrabold text-white mb-4 tracking-tight">${slide.title}</h2>
        <p class="text-slate-300 text-lg leading-relaxed mb-6 font-medium">${slide.mainContent}</p>
        <ul class="space-y-3 mb-6">
          ${slide.bullets.map((b) => `<li class="flex items-start text-slate-200 text-base"><span class="text-indigo-400 mr-3">✦</span> <span>${b}</span></li>`).join("")}
        </ul>
      </div>
      <div class="pt-6 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-3">
          <span class="font-bold text-indigo-300 block mb-1">💡 Gợi ý trực quan:</span>
          <span class="text-slate-300">${slide.suggestedVisual}</span>
        </div>
        <div class="bg-amber-950/40 border border-amber-500/30 rounded-lg p-3">
          <span class="font-bold text-amber-300 block mb-1">👩‍🏫 Ghi chú sư phạm:</span>
          <span class="text-slate-300">${slide.teacherNote}</span>
        </div>
      </div>
    </div>
    `
      )
      .join("")}
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Slide_${lessonTitle.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentSlide = slides[activeSlideIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={initialLessonId ? `/lessons/${initialLessonId}` : "/materials/lesson-plan"}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Presentation className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Slide Bài Giảng</h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  status === "APPROVED"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : status === "TEACHER_REVIEWED"
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}
              >
                {status === "APPROVED" ? "Đã duyệt" : status === "TEACHER_REVIEWED" ? "Đã rà soát" : "Bản thảo AI"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Soạn slide 16:9 tự động chuẩn GDPT 2018 môn Âm nhạc & các bộ môn THCS, thuyết trình trực quan sống động
            </p>
          </div>
        </div>

        {/* Top Action Bar */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quality Control Selector */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="DRAFT">Trạng thái: Bản thảo</option>
            <option value="TEACHER_REVIEWED">Trạng thái: Đã rà soát</option>
            <option value="APPROVED">Trạng thái: Đã phê duyệt</option>
          </select>

          <button
            onClick={() => {
              setReported(true);
              setReportSuccess(true);
              setTimeout(() => setReportSuccess(false), 2500);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors font-medium"
            title="Báo cáo nội dung AI chưa chính xác để cải thiện"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {reportSuccess ? "Đã gửi phản hồi!" : "Báo cáo lỗi"}
          </button>

          <button
            onClick={() => setIsPresenting(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm text-xs font-semibold transition-all hover:shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Trình Chiếu
          </button>

          <button
            onClick={handleExportHTML}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất HTML / PPTX
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            In / PDF
          </button>

          <button
            onClick={handleSaveDeck}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm text-xs font-semibold transition-all disabled:opacity-50"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {savedSuccess ? "Đã lưu!" : isSaving ? "Đang lưu..." : "Lưu Slide"}
          </button>
        </div>
      </div>

      {/* 1-Click Slide Presets */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/70 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Bài giảng điện tử mẫu (1-Click Nạp Nhanh)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nhấp để nạp tức thì bộ slide 16:9 gồm 10 trang bài giảng chuẩn GDPT 2018 theo từng môn:
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            10 Trang • Trực Quan • KaTeX
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleSelectPresetSlide("math")}
            disabled={isGeneratingDeck}
            className={`p-3 rounded-xl border text-left transition-all bg-white dark:bg-slate-800 hover:border-blue-300 shadow-2xs ${
              subject === "Toán học" ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">📐 Toán học 7</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded font-medium">10 Slide</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium mt-1 truncate">Tỉ lệ thức &amp; Dãy tỉ số</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Quiz mini-game • Công thức KaTeX</p>
          </button>

          <button
            onClick={() => handleSelectPresetSlide("khtn")}
            disabled={isGeneratingDeck}
            className={`p-3 rounded-xl border text-left transition-all bg-white dark:bg-slate-800 hover:border-emerald-300 shadow-2xs ${
              subject === "Khoa học tự nhiên" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">🔬 KHTN 7</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-600 rounded font-medium">10 Slide</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium mt-1 truncate">Trao đổi chất &amp; Năng lượng</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Sơ đồ quang hợp &amp; Thí nghiệm</p>
          </button>

          <button
            onClick={() => handleSelectPresetSlide("literature")}
            disabled={isGeneratingDeck}
            className={`p-3 rounded-xl border text-left transition-all bg-white dark:bg-slate-800 hover:border-amber-300 shadow-2xs ${
              subject === "Ngữ văn" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">📖 Ngữ văn 8</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-600 rounded font-medium">10 Slide</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium mt-1 truncate">Thơ Đường luật (Đèo Ngang)</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Thi pháp cổ điển • Tranh minh họa</p>
          </button>

          <button
            onClick={() => handleSelectPresetSlide("music")}
            disabled={isGeneratingDeck}
            className={`p-3 rounded-xl border text-left transition-all bg-white dark:bg-slate-800 hover:border-indigo-300 shadow-2xs ${
              subject === "Âm nhạc" ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">🎵 Âm nhạc 7</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-600 rounded font-medium">10 Slide</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium mt-1 truncate">Hát bài Nụ cười &amp; Nhạc lí</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Luyện thanh • Gõ phách 2/4</p>
          </button>
        </div>
      </div>

      {/* Configuration & Stage Controller */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Môn học</label>
            <select
              value={subject}
              onChange={(e) => {
                const val = e.target.value;
                setSubject(val);
                if (val === "Âm nhạc") {
                  setLessonTitle("Chủ đề 2: Tình bạn - Học hát bài Nụ cười");
                }
              }}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="Âm nhạc">Âm nhạc</option>
              <option value="Toán học">Toán học</option>
              <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
              <option value="Ngữ văn">Ngữ văn</option>
              <option value="Lịch sử & Địa lí">Lịch sử & Địa lí</option>
              <option value="Tin học">Tin học</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Khối lớp</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
            >
              <option value="6">Lớp 6</option>
              <option value="7">Lớp 7</option>
              <option value="8">Lớp 8</option>
              <option value="9">Lớp 9</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tên bài học</label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 font-medium"
              placeholder="Nhập tên bài học..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phong cách giảng dạy</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
            >
              <option value="Học tập tương tác & Trực quan">Tương tác & Trực quan</option>
              <option value="Hiện đại & Tối giản thanh lịch">Tối giản thanh lịch</option>
              <option value="Chuyên sâu chứng minh & Công thức">Chuyên sâu công thức</option>
              <option value="Gợi mở phát triển tư duy">Gợi mở tư duy</option>
            </select>
          </div>
        </div>

        {/* 2-Step Workflow Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWorkflowStage("OUTLINE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                workflowStage === "OUTLINE"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Bước 1: Dàn Ý Slide ({outline.length > 0 ? outline.length : 10} mục)
            </button>
            <button
              onClick={() => setWorkflowStage("STUDIO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                workflowStage === "STUDIO"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Bước 2: Studio Thiết Kế Slide ({slides.length} slides)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateOutline}
              disabled={isGeneratingOutline}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl text-xs font-semibold transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingOutline ? "animate-spin" : ""}`} />
              {isGeneratingOutline ? "Đang tạo dàn ý..." : "AI Tạo Dàn Ý"}
            </button>

            <button
              onClick={workflowStage === "OUTLINE" ? handleGenerateDeckFromOutline : handleGenerateInitialDeck}
              disabled={isGeneratingDeck}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-md text-xs font-bold transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingDeck ? "animate-spin" : ""}`} />
              {isGeneratingDeck ? "AI Đang thiết kế toàn bộ bài giảng..." : "AI Tạo Toàn Bộ Slide"}
            </button>
          </div>
        </div>
      </div>

      {/* STAGE 1: OUTLINE EDITOR */}
      {workflowStage === "OUTLINE" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Dàn Ý Tiến Trình Slide (Cấu trúc 10 slides sư phạm)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Giáo viên có thể chỉnh sửa tiêu đề, đổi vị trí trước khi AI sinh nội dung chi tiết
              </p>
            </div>
            <button
              onClick={() => {
                const newOutline = [
                  ...outline,
                  {
                    slideNumber: outline.length + 1,
                    title: `Slide ${outline.length + 1} mới`,
                    subtitle: "Mô tả nội dung trọng tâm",
                  },
                ];
                setOutline(newOutline);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm Slide Dàn Ý
            </button>
          </div>

          <div className="space-y-3">
            {outline.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                  {item.slideNumber}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...outline];
                      updated[index].title = e.target.value;
                      setOutline(updated);
                    }}
                    className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={item.subtitle}
                    onChange={(e) => {
                      const updated = [...outline];
                      updated[index].subtitle = e.target.value;
                      setOutline(updated);
                    }}
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-600 dark:text-slate-300"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={index === 0}
                    onClick={() => {
                      const updated = [...outline];
                      const temp = updated[index];
                      updated[index] = updated[index - 1];
                      updated[index - 1] = temp;
                      updated.forEach((s, idx) => (s.slideNumber = idx + 1));
                      setOutline(updated);
                    }}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-30"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === outline.length - 1}
                    onClick={() => {
                      const updated = [...outline];
                      const temp = updated[index];
                      updated[index] = updated[index + 1];
                      updated[index + 1] = temp;
                      updated.forEach((s, idx) => (s.slideNumber = idx + 1));
                      setOutline(updated);
                    }}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-30"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const updated = outline.filter((_, idx) => idx !== index);
                      updated.forEach((s, idx) => (s.slideNumber = idx + 1));
                      setOutline(updated);
                    }}
                    className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleGenerateDeckFromOutline}
              disabled={isGeneratingDeck}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow font-semibold text-xs transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Chốt Dàn Ý &amp; Tạo Toàn Bộ {outline.length} Slides Chi Tiết
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: SLIDE STUDIO (MAIN WORKSPACE) */}
      {workflowStage === "STUDIO" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Thumbnail Strip & Navigation */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Danh Sách Slide ({slides.length})
              </span>
              <button
                onClick={() => {
                  const newSlide: SlideItem = {
                    id: "slide-" + Date.now(),
                    slideNumber: slides.length + 1,
                    title: `Slide mới ${slides.length + 1}`,
                    mainContent: "Nội dung slide mới được thêm vào giáo án.",
                    bullets: ["Nội dung chính 1", "Nội dung chính 2"],
                    teacherNote: "Ghi chú sư phạm dành cho giáo viên.",
                    suggestedVisual: "Sơ đồ minh họa tư duy",
                  };
                  setSlides([...slides, newSlide]);
                  setActiveSlideIndex(slides.length);
                }}
                className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors"
                title="Thêm slide mới"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {slides.map((s, idx) => (
                <div
                  key={s.id || idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    activeSlideIndex === idx
                      ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeSlideIndex === idx
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      #{s.slideNumber}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, "up");
                        }}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-20"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, "down");
                        }}
                        disabled={idx === slides.length - 1}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-20"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateSlide(idx);
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500"
                        title="Nhân đôi slide"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2 truncate">
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {s.mainContent}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Active Slide Canvas & Live Controls */}
          <div className="lg:col-span-9 space-y-4">
            {/* Quick Action Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 mr-1">Tác vụ AI Slide:</span>
                <button
                  onClick={() => handleRegenerateSlide("shorten")}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium"
                >
                  Rút gọn ý
                </button>
                <button
                  onClick={() => handleRegenerateSlide("expand")}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium"
                >
                  Mở rộng liên hệ
                </button>
                <button
                  onClick={() => handleRegenerateSlide("add_quiz")}
                  className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Thêm Câu Hỏi Tương Tác
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicateSlide(activeSlideIndex)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-1"
                  title="Nhân bản slide"
                >
                  <Copy className="w-3.5 h-3.5" /> Nhân đôi
                </button>
                <button
                  onClick={() => handleDeleteSlide(activeSlideIndex)}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-rose-600 text-xs font-medium flex items-center gap-1"
                  title="Xóa slide"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              </div>
            </div>

            {/* 16:9 Slide Canvas */}
            {currentSlide ? (
              <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-700/60 flex flex-col justify-between overflow-hidden">
                {/* Decorative Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Slide Meta */}
                <div className="relative z-10 flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-xs font-bold rounded-full">
                      Slide {currentSlide.slideNumber} / {slides.length}
                    </span>
                    <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                      {subject} {grade}
                    </span>
                  </div>
                  <span className="text-xs text-indigo-300/80 font-semibold">{lessonTitle}</span>
                </div>

                {/* Middle Content */}
                <div className="relative z-10 my-auto py-4 space-y-4">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                    <MathContent content={currentSlide.title} />
                  </h2>

                  <div className="text-slate-200 text-sm md:text-base leading-relaxed font-medium">
                    <MathContent content={currentSlide.mainContent} />
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {currentSlide.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start text-xs md:text-sm text-slate-100">
                        <span className="text-indigo-400 mr-2.5 text-base leading-none">✦</span>
                        <div className="flex-1">
                          <MathContent content={b} />
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Interactive Quiz Box on Slide if available */}
                  {currentSlide.quizQuestion && (
                    <div className="mt-4 p-4 rounded-xl bg-indigo-950/70 border border-indigo-500/40 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-2">
                        <FileQuestion className="w-4 h-4" />
                        Câu hỏi tương tác nhanh:
                      </div>
                      <p className="text-xs text-white font-semibold mb-3">
                        <MathContent content={currentSlide.quizQuestion.question} />
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {currentSlide.quizQuestion.options.map((opt, oIdx) => {
                          const optKey = ["A", "B", "C", "D"][oIdx];
                          const isSelected = selectedQuizOption === optKey;
                          const isCorrect = currentSlide.quizQuestion?.answer === optKey;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => setSelectedQuizOption(optKey)}
                              className={`p-2 rounded-lg text-left text-xs font-medium transition-all flex items-center justify-between ${
                                isSelected
                                  ? isCorrect
                                    ? "bg-emerald-600 text-white font-bold"
                                    : "bg-rose-600 text-white font-bold"
                                  : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700"
                              }`}
                            >
                              <span>
                                <strong className="mr-1">{optKey}.</strong>{" "}
                                <MathContent content={opt} />
                              </span>
                              {isSelected && (isCorrect ? "✓ Đúng" : "✗")}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Footer Details */}
                <div className="relative z-10 pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="italic truncate max-w-md">
                      Minh họa: {currentSlide.suggestedVisual}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={activeSlideIndex === 0}
                      onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                      className="p-1 hover:bg-slate-800 rounded disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-white">
                      {activeSlideIndex + 1} / {slides.length}
                    </span>
                    <button
                      disabled={activeSlideIndex === slides.length - 1}
                      onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                      className="p-1 hover:bg-slate-800 rounded disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400">
                Chưa có dữ liệu slide
              </div>
            )}

            {/* Slide Metadata & Pedagogical Notes Panel */}
            {currentSlide && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Ghi Chú Sư Phạm (Dành cho giáo viên khi đứng lớp)
                  </div>
                  <textarea
                    rows={3}
                    value={currentSlide.teacherNote}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[activeSlideIndex].teacherNote = e.target.value;
                      setSlides(newSlides);
                    }}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Nhập ghi chú giảng dạy, câu hỏi mở rộng hoặc lưu ý học sinh hay sai..."
                  />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-xs mb-2">
                    <ImageIcon className="w-4 h-4" />
                    Gợi Ý Trực Quan / Hình Ảnh / Thiết Bị Đi Kèm
                  </div>
                  <textarea
                    rows={3}
                    value={currentSlide.suggestedVisual}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[activeSlideIndex].suggestedVisual = e.target.value;
                      setSlides(newSlides);
                    }}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Mô tả hình ảnh đồ họa, biểu đồ hoặc video ngắn cần chiếu kèm..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN PRESENTATION MODE */}
      {isPresenting && currentSlide && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-8 md:p-12 animate-in fade-in duration-200">
          {/* Top Presenter Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full">
                Slide {currentSlide.slideNumber} / {slides.length}
              </span>
              <span className="text-sm font-bold text-slate-300">{lessonTitle}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTeacherNotesInPresent(!showTeacherNotesInPresent)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  showTeacherNotesInPresent
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {showTeacherNotesInPresent ? "Ẩn ghi chú sư phạm" : "Hiện ghi chú sư phạm"}
              </button>

              <button
                onClick={() => setIsPresenting(false)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                title="Thoát trình chiếu (ESC)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Presentation Slide Main Body */}
          <div className="my-auto max-w-5xl mx-auto w-full py-8 space-y-6">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              <MathContent content={currentSlide.title} />
            </h1>

            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-normal">
              <MathContent content={currentSlide.mainContent} />
            </p>

            <ul className="space-y-4 pt-4">
              {currentSlide.bullets.map((b, idx) => (
                <li key={idx} className="flex items-start text-lg md:text-xl text-slate-100">
                  <span className="text-indigo-400 mr-4 text-2xl leading-none">✦</span>
                  <div className="flex-1">
                    <MathContent content={b} />
                  </div>
                </li>
              ))}
            </ul>

            {currentSlide.quizQuestion && (
              <div className="mt-8 p-6 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 backdrop-blur-md">
                <div className="text-sm font-bold text-indigo-400 mb-2">Thử thách tương tác lớp học:</div>
                <div className="text-lg font-bold text-white mb-4">
                  <MathContent content={currentSlide.quizQuestion.question} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {currentSlide.quizQuestion.options.map((opt, oIdx) => {
                    const optKey = ["A", "B", "C", "D"][oIdx];
                    const isSelected = selectedQuizOption === optKey;
                    const isCorrect = currentSlide.quizQuestion?.answer === optKey;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => setSelectedQuizOption(optKey)}
                        className={`p-3 rounded-xl text-left text-base font-semibold transition-all ${
                          isSelected
                            ? isCorrect
                              ? "bg-emerald-600 text-white font-bold scale-[1.02]"
                              : "bg-rose-600 text-white font-bold"
                            : "bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700"
                        }`}
                      >
                        <span className="mr-2">{optKey}.</span>
                        <MathContent content={opt} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Teacher Note Drawer in Presentation */}
          {showTeacherNotesInPresent && (
            <div className="p-4 bg-amber-950/90 border border-amber-500/40 rounded-xl text-amber-200 text-sm max-w-4xl mx-auto w-full mb-4">
              <strong className="block mb-1 text-amber-300">💡 Ghi chú đứng lớp của thầy cô:</strong>
              {currentSlide.teacherNote}
            </div>
          )}

          {/* Bottom Presenter Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
            <div>Dùng phím [ ← ] và [ → ] hoặc [ Space ] để chuyển slide. [ Esc ] để thoát.</div>
            <div className="flex items-center gap-3">
              <button
                disabled={activeSlideIndex === 0}
                onClick={() => {
                  setActiveSlideIndex((prev) => Math.max(0, prev - 1));
                  setSelectedQuizOption(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold disabled:opacity-30"
              >
                Trang Trước
              </button>
              <span className="font-bold text-base text-white">
                {activeSlideIndex + 1} / {slides.length}
              </span>
              <button
                disabled={activeSlideIndex === slides.length - 1}
                onClick={() => {
                  setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
                  setSelectedQuizOption(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-30"
              >
                Trang Kế
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SlidesStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Đang tải phòng thiết kế Slide...
        </div>
      }
    >
      <SlidesStudioContent />
    </Suspense>
  );
}
