"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Sparkles,
  Download,
  Play,
  Volume2,
  VolumeX,
  Mic,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  Layers,
  ChevronRight,
  BookOpen,
  Settings2,
  Share2,
  ShieldCheck,
  Award,
} from "lucide-react";
import { parseDocumentFile, ParsedDocumentResult } from "@/lib/export/documentParser";
import { GeneratedInteractiveLesson, SlideItem } from "@/lib/ai/types";
import { createSCORM12Zip, buildInteractiveHTMLPlayer } from "@/lib/scorm/scormPackager";
import { useVoice } from "@/lib/hooks/useVoice";

export default function SCORMStudioPage() {
  // Step State: 1 = Upload, 2 = AI Review, 3 = Preview & Export
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Upload State
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedDocumentResult | null>(null);
  const [documentText, setDocumentText] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>("Nhịp 2/4 và Bài hát Nụ Cười");
  const [subject, setSubject] = useState<string>("Âm nhạc");
  const [grade, setGrade] = useState<number>(7);
  const [slideCount, setSlideCount] = useState<number>(8);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 2: AI Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [interactiveLesson, setInteractiveLesson] = useState<GeneratedInteractiveLesson | null>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);

  // Step 3: Interactive Simulation & Export State
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);
  const [previewUserAnswer, setPreviewUserAnswer] = useState<{ [key: number]: string }>({});

  // Voice Hook
  const { speak, stopSpeaking, isSpeaking, startListening, isListening, micSupported } = useVoice();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag & Drop / File Select
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      await processSelectedFile(selected);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await processSelectedFile(droppedFile);
    }
  };

  const processSelectedFile = async (f: File) => {
    setFile(f);
    setIsParsing(true);
    setUploadError(null);

    try {
      const result = await parseDocumentFile(f);
      setParsedData(result);
      setDocumentText(result.text);

      // Auto detect title from filename
      const cleanName = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      if (cleanName.length > 5) {
        setLessonTitle(cleanName);
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Lỗi bóc tách tệp bài giảng. Vui lòng thử lại.");
    } finally {
      setIsParsing(false);
    }
  };

  // Sample Data Loader
  const loadSampleDocument = () => {
    const sampleText = `BÀI GIẢNG: NHỊP 2/4 VÀ BÀI HÁT NỤ CƯỜI (NHẠC NGA) - MÔN ÂM NHẠC LỚP 7
I. MỤC TIÊU BÀI HỌC:
- Biết được cấu tạo của nhịp 2/4: Số 2 ở trên chỉ 2 phách trong mỗi ô nhịp. Số 4 ở dưới chỉ giá trị mỗi phách bằng một nốt đen.
- Nắm được tính chất của nhịp: Phách 1 là phách MẠNH, phách 2 là phách NHẸ.
- Hát đúng giai điệu, lời ca bài hát Nụ cười, biết gõ đệm thanh phách nhịp nhàng và cảm nhận thông điệp lạc quan, yêu đời.

II. NỘI DUNG TRỌNG TÂM:
1. KHÁI NIỆM NHỊP 2/4:
Nhịp 2/4 là nhịp có hai phách trong một ô nhịp. Mỗi phách có giá trị tương ứng với một nốt đen (1 phách = 1 nốt đen). Trong nhịp 2/4, phách thứ nhất là phách mạnh, phách thứ hai là phách nhẹ. Ứng dụng phổ biến trong các bài hành khúc thiếu nhi và bài hát vui tươi.

2. BÀI HÁT "NỤ CƯỜI":
Bài hát "Nụ cười" là bài hát thiếu nhi nổi tiếng của nước Nga (nhạc: V. Shainsky, lời Việt: Phạm Tuyên). Bài hát được viết ở nhịp 2/4 với sắc thái hồn nhiên, trong sáng. Lời bài hát nhắc nhở chúng ta: Một nụ cười sưởi ấm những ngày đông giá lạnh và mang niềm vui đến cho mọi người.

3. LUYỆN TẬP GÕ ĐỆM & VẬN ĐỘNG:
- Thực hành gõ đệm theo phách (Phách 1 gõ mạnh, phách 2 gõ nhẹ).
- Kết hợp vận động cơ thể (Body Percussion): Vỗ tay ở phách mạnh, búng tay ở phách nhẹ.`;

    setDocumentText(sampleText);
    setLessonTitle("Nhịp 2/4 và Bài hát Nụ Cười (Nhạc Nga)");
    setSubject("Âm nhạc");
    setGrade(7);
    setParsedData({
      text: sampleText,
      wordCount: 220,
      slideCount: 8,
      fileName: "Bai_Giang_Am_Nhac_7_Nhip_2_4.docx",
      fileType: "DOCX",
    });
  };

  // Step 2: Trigger Gemini 3.8 Flash Generation
  const handleGenerateWithAI = async () => {
    if (!documentText.trim()) {
      setUploadError("Vui lòng tải lên tài liệu bài giảng hoặc dán nội dung văn bản trước.");
      return;
    }

    setIsGenerating(true);
    setUploadError(null);

    try {
      const res = await fetch("/api/materials/scorm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText,
          lessonTitle,
          subject,
          grade,
          slideCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Lỗi xử lý từ Gemini API");
      }

      const data = await res.json();
      if (data.lesson) {
        setInteractiveLesson(data.lesson);
        setCurrentStep(2);
        setSelectedSlideIndex(0);
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Lỗi khi gọi Gemini 3.8 Flash. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 3: Package & Download SCORM 1.2 ZIP
  const handleDownloadSCORM = async () => {
    if (!interactiveLesson) return;
    setIsExportingZip(true);

    try {
      const zipBlob = await createSCORM12Zip(interactiveLesson);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SCORM_1.2_${interactiveLesson.lessonTitle.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setExportSuccessMessage("Đã đóng gói và tải xuống thành công gói chuẩn SCORM 1.2 (.zip)! Sẵn sàng upload lên Moodle/K12Online/Canvas.");
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } catch (err) {
      console.error("SCORM packaging error:", err);
      alert("Lỗi đóng gói SCORM. Vui lòng thử lại.");
    } finally {
      setIsExportingZip(false);
    }
  };

  // Download Standalone HTML5
  const handleDownloadStandaloneHTML = () => {
    if (!interactiveLesson) return;
    const htmlContent = buildInteractiveHTMLPlayer(interactiveLesson);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BaiGiang_TuongTac_${interactiveLesson.lessonTitle.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Voice Narration trigger
  const handleNarrateSlide = (slide: SlideItem) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const script = slide.narrationScript || `${slide.title}. ${slide.mainContent}`;
      speak(script);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google Gemini 3.8 Flash • AI Voice • Chuẩn SCORM 1.2 / 2004</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Studio Bài Giảng Tương Tác & Đóng Gói SCORM
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
              Tải tài liệu bài giảng (PDF, PPTX, DOCX) ➔ Gemini 3.8 Flash tự động chia mốc kiến thức, tạo điểm dừng trắc nghiệm tương tác & lời thoại thuyết minh ➔ Đóng gói SCORM 1.2 nộp thẳng lên LMS của trường!
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            <Link
              href="/materials/slides"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center space-x-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>Slide Studio</span>
            </Link>
            <Link
              href="/export-center"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Trung tâm Xuất bản</span>
            </Link>
          </div>
        </div>

        {/* Multi-step Breadcrumb */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setCurrentStep(1)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
              currentStep === 1
                ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${currentStep === 1 ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
              1
            </div>
            <div>
              <div className="text-xs font-bold">Bước 1: Upload Tài Liệu</div>
              <div className="text-[11px] text-slate-400">PDF, DOCX, PPTX & bóc tách text</div>
            </div>
          </div>

          <div
            onClick={() => interactiveLesson && setCurrentStep(2)}
            className={`p-3.5 rounded-2xl border transition-all ${
              interactiveLesson ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
            } flex items-center space-x-3 ${
              currentStep === 2
                ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${currentStep === 2 ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
              2
            </div>
            <div>
              <div className="text-xs font-bold">Bước 2: AI Tạo Điểm Dừng</div>
              <div className="text-[11px] text-slate-400">Gemini 3.8 Flash phân tích & tạo Quiz</div>
            </div>
          </div>

          <div
            onClick={() => interactiveLesson && setCurrentStep(3)}
            className={`p-3.5 rounded-2xl border transition-all ${
              interactiveLesson ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
            } flex items-center space-x-3 ${
              currentStep === 3
                ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${currentStep === 3 ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
              3
            </div>
            <div>
              <div className="text-xs font-bold">Bước 3: Đóng Gói SCORM</div>
              <div className="text-[11px] text-slate-400">Thuyết minh Voice & Tải về ZIP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {exportSuccessMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      {/* STEP 1: UPLOAD & EXTRACT DOCUMENT */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Drag & Drop Area */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-indigo-500" />
                    <span>Tải Lên Bài Giảng Có Sẵn</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Hỗ trợ định dạng file Microsoft Word (.docx), PowerPoint (.pptx), PDF (.pdf), hoặc văn bản (.txt)
                  </p>
                </div>

                <button
                  onClick={loadSampleDocument}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all border border-indigo-200 dark:border-indigo-800/50"
                >
                  Nạp tài liệu mẫu thử nghiệm
                </button>
              </div>

              {/* Drag & Drop Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 hover:border-indigo-500 dark:hover:border-indigo-500 bg-indigo-50/30 dark:bg-slate-950/40 hover:bg-indigo-50/60 dark:hover:bg-slate-950/70 p-10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-4 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pptx,.pdf,.txt,.md"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Kéo & thả file bài giảng vào đây, hoặc <span className="text-indigo-600 dark:text-indigo-400 underline">bấm để chọn file</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    DOCX, PPTX (bóc tách từng slide), PDF hoặc TXT dung lượng tối đa 25MB
                  </p>
                </div>
              </div>

              {/* Parsing Indicator or File Info */}
              {isParsing && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl flex items-center space-x-3 text-xs text-indigo-600 dark:text-indigo-300">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>Đang bóc tách văn bản từ tệp {file?.name}...</span>
                </div>
              )}

              {parsedData && !isParsing && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                      {parsedData.fileType}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{parsedData.fileName}</div>
                      <div className="text-slate-400">
                        {parsedData.wordCount} từ {parsedData.slideCount ? `• ${parsedData.slideCount} slide` : ""} • Đã bóc tách văn bản thành công
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold rounded-lg border border-emerald-500/20">
                    Đã sẵn sàng
                  </span>
                </div>
              )}

              {uploadError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-2xl flex items-center space-x-3 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Extracted Text Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nội dung văn bản bóc tách (Có thể chỉnh sửa hoặc dán trực tiếp):
                  </label>
                  {documentText && (
                    <span className="text-[11px] text-slate-400">
                      {documentText.length} ký tự
                    </span>
                  )}
                </div>
                <textarea
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Nội dung bài giảng bóc tách từ file sẽ xuất hiện tại đây..."
                  rows={9}
                  className="w-full text-xs font-mono p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Prompt Configuration */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Settings2 className="w-5 h-5 text-indigo-500" />
                <span>Cấu Hình Bài Giảng GDPT 2018</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tên Bài Học / Chủ Đề
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Môn Học
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Âm nhạc">Âm nhạc</option>
                      <option value="Toán học">Toán học</option>
                      <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                      <option value="Ngữ văn">Ngữ văn</option>
                      <option value="Tiếng Anh">Tiếng Anh</option>
                      <option value="Lịch sử & Địa lí">Lịch sử & Địa lí</option>
                      <option value="Tin học">Tin học</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Khối Lớp
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value={6}>Lớp 6</option>
                      <option value={7}>Lớp 7</option>
                      <option value={8}>Lớp 8</option>
                      <option value={9}>Lớp 9</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Số Lượng Slide Dự Kiến: <span className="text-indigo-600 dark:text-indigo-400 font-black">{slideCount}</span>
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={15}
                    step={1}
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>5 slide (Ngắn gọn)</span>
                    <span>8-10 slide (Tiết học chuẩn)</span>
                    <span>15 slide (Chuyên đề sâu)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating || !documentText.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Gemini 3.8 Flash Đang Phân Tích & Tạo Điểm Dừng...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>BƯỚC 2: AI TẠO ĐIỂM DỪNG TƯƠNG TÁC →</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2.5">
                  Gemini 3.8 Flash sẽ tự động chia nhỏ mốc kiến thức và tạo câu hỏi tương tác trắc nghiệm kèm Voice.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW & EDIT CHECKPOINTS & SLIDES */}
      {currentStep === 2 && interactiveLesson && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div>
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold rounded-full text-xs">
                Đã Phân Tích Xong Bằng Gemini 3.8 Flash
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {interactiveLesson.lessonTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {interactiveLesson.slides.length} slide • {interactiveLesson.slides.filter(s => s.quizQuestion).length} điểm dừng trắc nghiệm tương tác
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all"
              >
                ← Tải Lại Tài Liệu Khác
              </button>

              <button
                onClick={() => {
                  setCurrentStep(3);
                  setPreviewSlideIdx(0);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
              >
                <span>BƯỚC 3: XEM TRƯỚC & ĐÓNG GÓI SCORM →</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Slide Navigation Thumbnails */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
                Tiến trình bài giảng & Điểm dừng
              </h3>

              <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                {interactiveLesson.slides.map((s, idx) => {
                  const hasQuiz = !!s.quizQuestion;
                  const isSelected = selectedSlideIndex === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedSlideIndex(idx)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          Slide #{idx + 1}
                        </span>
                        {hasQuiz && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-500/20 flex items-center space-x-1">
                            <span>🎯</span>
                            <span>Có Điểm Dừng Quiz</span>
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                        {s.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {s.mainContent}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slide Detail & Quiz Editor */}
            <div className="lg:col-span-8">
              {interactiveLesson.slides[selectedSlideIndex] && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-6">
                  {(() => {
                    const slide = interactiveLesson.slides[selectedSlideIndex];
                    return (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-black">
                              Slide {selectedSlideIndex + 1} / {interactiveLesson.slides.length}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              {interactiveLesson.subject} {interactiveLesson.grade}
                            </span>
                          </div>

                          {/* Voice Button */}
                          <button
                            onClick={() => handleNarrateSlide(slide)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-200 dark:border-indigo-800"
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" />
                                <span>Dừng Đọc</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-4 h-4" />
                                <span>Nghe Thuyết Minh AI</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                            {slide.title}
                          </h3>
                          {slide.subtitle && (
                            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                              {slide.subtitle}
                            </p>
                          )}
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                            {slide.mainContent}
                          </p>
                        </div>

                        {/* Bullets */}
                        {slide.bullets && slide.bullets.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Ý chính kiến thức:
                            </h4>
                            <ul className="space-y-2">
                              {slide.bullets.map((b, bIdx) => (
                                <li key={bIdx} className="flex items-start text-xs text-slate-700 dark:text-slate-200">
                                  <span className="text-indigo-500 mr-2 font-bold">✦</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Voice Narration Script Preview */}
                        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-xs space-y-1">
                          <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center space-x-1.5">
                            <span>🎙️ Lời thoại thuyết minh của Giáo viên (AI Voice đọc tự động):</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
                            "{slide.narrationScript || `${slide.title}. ${slide.mainContent}`}"
                          </p>
                        </div>

                        {/* Checkpoint Quiz Card */}
                        {slide.quizQuestion ? (
                          <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300/80 dark:border-amber-800/40 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center space-x-1.5 uppercase">
                                <span>🎯 Điểm dừng tương tác bắt buộc</span>
                              </span>
                              <span className="text-xs font-bold text-slate-400">
                                Đáp án đúng: <span className="text-emerald-600 dark:text-emerald-400 font-black">{slide.quizQuestion.answer}</span>
                              </span>
                            </div>

                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {slide.quizQuestion.question}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {slide.quizQuestion.options.map((opt, optIdx) => {
                                const label = String.fromCharCode(65 + optIdx);
                                const isAns = label === slide.quizQuestion?.answer;
                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-3 rounded-xl border text-xs font-medium ${
                                      isAns
                                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    {opt}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                              <strong>Giải thích sư phạm:</strong> {slide.quizQuestion.explanation}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                            Slide này là phần truyền tải kiến thức liên tục, không có điểm dừng trắc nghiệm.
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SIMULATOR & EXPORT SCORM 1.2 ZIP */}
      {currentStep === 3 && interactiveLesson && (
        <div className="space-y-8">
          {/* Action Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-full text-xs">
                Sẵn Sàng Đóng Gói Chuẩn SCORM 1.2
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Xuất Bản Bài Giảng E-Learning
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gói SCORM 1.2 đạt chuẩn ADL quốc tế, tương thích 100% với hệ thống LMS K12Online, Moodle, Canvas, vnEdu
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-3 rounded-2xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all"
              >
                ← Quay lại Chỉnh sửa
              </button>

              <button
                onClick={handleDownloadStandaloneHTML}
                className="px-4 py-3 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center space-x-2"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Tải File HTML5 Độc Lập</span>
              </button>

              <button
                onClick={handleDownloadSCORM}
                disabled={isExportingZip}
                className="px-6 py-3 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-xl shadow-emerald-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                {isExportingZip ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang nén SCORM ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>TẢI XUỐNG GÓI SCORM 1.2 (.ZIP)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Simulation Player (Preview as a student) */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl text-white space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">Trình phát bài giảng tương tác học sinh (SCORM Player)</span>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => handleNarrateSlide(interactiveLesson.slides[previewSlideIdx])}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5 font-bold hover:bg-indigo-500/30 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? "Đang phát Voice..." : "Phát Thuyết Minh"}</span>
                </button>
                <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-bold">
                  Trang {previewSlideIdx + 1} / {interactiveLesson.slides.length}
                </span>
              </div>
            </div>

            {/* Slide Body */}
            {(() => {
              const slide = interactiveLesson.slides[previewSlideIdx];
              const q = slide.quizQuestion;
              const answered = previewUserAnswer[previewSlideIdx];
              const isLocked = q && (!answered || answered !== q.answer);

              return (
                <div className="space-y-6 min-h-[380px] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
                        Slide {previewSlideIdx + 1}
                      </span>
                      <span className="text-xs text-slate-400">
                        {interactiveLesson.subject} {interactiveLesson.grade}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                      {slide.title}
                    </h3>
                    {slide.subtitle && (
                      <p className="text-sm text-indigo-300 font-medium">{slide.subtitle}</p>
                    )}
                    <p className="text-slate-200 text-base leading-relaxed">
                      {slide.mainContent}
                    </p>

                    {slide.bullets && (
                      <ul className="space-y-2 pt-2">
                        {slide.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start text-sm text-slate-300">
                            <span className="text-indigo-400 mr-2.5">✦</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Interactive Checkpoint Quiz */}
                  {q && (
                    <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-4">
                      <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase">
                        <span>🎯 Điểm dừng kiểm tra kiến thức</span>
                        <span className="text-slate-400 font-normal">(Em cần trả lời đúng để sang slide kế tiếp)</span>
                      </div>

                      <p className="text-base font-bold text-white">{q.question}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, optIdx) => {
                          const label = String.fromCharCode(65 + optIdx);
                          const isChosen = answered === label;
                          const isCorrect = label === q.answer;

                          let btnStyle = "bg-slate-900 border-slate-700 text-slate-200 hover:border-indigo-400";
                          if (answered) {
                            if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                            else if (isChosen) btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300";
                            else btnStyle = "bg-slate-900/40 border-slate-800 text-slate-500";
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setPreviewUserAnswer((prev) => ({ ...prev, [previewSlideIdx]: label }));
                              }}
                              className={`p-3.5 rounded-xl border text-sm text-left transition-all font-medium ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div
                          className={`p-3.5 rounded-xl text-xs ${
                            answered === q.answer
                              ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300"
                              : "bg-rose-950/40 border border-rose-500/30 text-rose-300"
                          }`}
                        >
                          {answered === q.answer ? (
                            <span>✅ Chính xác! {q.explanation}</span>
                          ) : (
                            <span>❌ Chưa đúng. Em hãy xem gợi ý và chọn lại nhé: {q.explanation}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Player Footer Controls */}
                  <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                    <button
                      disabled={previewSlideIdx === 0}
                      onClick={() => setPreviewSlideIdx((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all"
                    >
                      ← Trang trước
                    </button>

                    <div className="text-xs text-slate-400">
                      {isLocked ? (
                        <span className="text-amber-400 font-bold">🔒 Hoàn thành câu hỏi trắc nghiệm để mở khóa trang kế</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">🔓 Đã sẵn sàng chuyển trang</span>
                      )}
                    </div>

                    <button
                      disabled={isLocked || previewSlideIdx >= interactiveLesson.slides.length - 1}
                      onClick={() => setPreviewSlideIdx((prev) => Math.min(interactiveLesson.slides.length - 1, prev + 1))}
                      className="px-5 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40 shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      Trang tiếp →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
