"use client";

import React, { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  School,
  Target,
  Lightbulb,
  Trophy,
  Lock,
  Unlock,
  Edit3,
  Save,
  Check,
  Copy,
  Star,
} from "lucide-react";
import { parseDocumentFile, ParsedDocumentResult } from "@/lib/export/documentParser";
import { GeneratedInteractiveLesson, SlideItem } from "@/lib/ai/types";
import { createSCORM12Zip, buildInteractiveHTMLPlayer } from "@/lib/scorm/scormPackager";
import { useVoice } from "@/lib/hooks/useVoice";
import { MathContent } from "@/components/ui/MathContent";
import { getGeminiAuthHeaders } from "@/lib/aiClient";

interface SubjectPreset {
  id: string;
  name: string;
  subject: string;
  grade: number;
  title: string;
  slides: number;
  text: string;
}

const PRESET_LESSONS: SubjectPreset[] = [
  {
    id: "music-7",
    name: "Âm nhạc 7",
    subject: "Âm nhạc",
    grade: 7,
    title: "Nhịp 2/4 và Bài hát Nụ Cười (Nhạc Nga)",
    slides: 8,
    text: `BÀI GIẢNG: NHỊP 2/4 VÀ BÀI HÁT NỤ CƯỜI (NHẠC NGA) - MÔN ÂM NHẠC LỚP 7
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
- Kết hợp vận động cơ thể (Body Percussion): Vỗ tay ở phách mạnh, búng tay ở phách nhẹ.`,
  },
  {
    id: "math-7",
    name: "Toán học 7",
    subject: "Toán học",
    grade: 7,
    title: "Tỉ lệ thức và Tính chất Dãy tỉ số bằng nhau",
    slides: 8,
    text: `BÀI GIẢNG: TỈ LỆ THỨC VÀ DÃY TỈ SỐ BẰNG NHAU - TOÁN 7 (GDPT 2018)
I. MỤC TIÊU:
- Nắm vững định nghĩa tỉ lệ thức: Tỉ lệ thức là đẳng thức của hai tỉ số $\\frac{a}{b} = \\frac{c}{d}$ (với $b, d \\neq 0$).
- Vận dụng tính chất cơ bản: Nếu $\\frac{a}{b} = \\frac{c}{d}$ thì $a \\cdot d = b \\cdot c$.
- Vận dụng tính chất dãy tỉ số bằng nhau: $\\frac{a}{b} = \\frac{c}{d} = \\frac{a+c}{b+d} = \\frac{a-c}{b-d}$.
II. NỘI DUNG TRỌNG TÂM:
1. ĐỊNH NGHĨA VÀ TÍNH CHẤT:
Đẳng thức $\\frac{a}{b} = \\frac{c}{d}$ còn được viết là $a:b = c:d$. Các số $a, d$ gọi là ngoại tỉ; $b, c$ gọi là trung tỉ. Tích ngoại tỉ bằng tích trung tỉ: $a \\cdot d = b \\cdot c$.
2. VÍ DỤ MINH HỌA:
Tìm $x$ biết: $\\frac{x}{6} = \\frac{5}{2}$. Ta có: $x \\cdot 2 = 6 \\cdot 5 \\Rightarrow 2x = 30 \\Rightarrow x = 15$.
3. ỨNG DỤNG THỰC TẾ:
Chia số tiền thưởng hoặc tính tỉ lệ pha chế dung dịch theo tỉ lệ phần trăm quy định.`,
  },
  {
    id: "science-8",
    name: "KHTN 8",
    subject: "Khoa học tự nhiên",
    grade: 8,
    title: "Phản ứng hóa học và Định luật bảo toàn khối lượng",
    slides: 8,
    text: `BÀI GIẢNG: ĐỊNH LUẬT BẢO TOÀN KHỐI LƯỢNG - KHTN 8 (GDPT 2018)
I. MỤC TIÊU:
- Phát biểu được định luật bảo toàn khối lượng: Trong một phản ứng hóa học, tổng khối lượng của các chất sản phẩm bằng tổng khối lượng của các chất tham gia phản ứng.
- Giải thích được nguyên nhân theo bản chất nguyên tử: Trong phản ứng hóa học chỉ có liên kết giữa các nguyên tử thay đổi, còn số nguyên tử của mỗi nguyên tố giữ nguyên.
- Viết công thức khối lượng và tính khối lượng của một chất khi biết khối lượng các chất còn lại.
II. NỘI DUNG TRỌNG TÂM:
1. ĐỊNH NGHĨA VÀ NỘI DUNG ĐỊNH LUẬT:
Giả sử có phản ứng: $A + B \\rightarrow C + D$.
Công thức khối lượng: $m_A + m_B = m_C + m_D$.
2. BÀI TẬP VẬN DỤNG:
Đốt cháy hoàn toàn $2,4$ gam kim loại Magnesium ($Mg$) trong khí Oxygen ($O_2$) thu được $4,0$ gam Magnesium oxide ($MgO$). Khối lượng khí Oxygen đã phản ứng là: $m_{O_2} = 4,0 - 2,4 = 1,6$ gam.`,
  },
  {
    id: "literature-6",
    name: "Ngữ văn 6",
    subject: "Ngữ văn",
    grade: 6,
    title: "Kể lại một trải nghiệm đáng nhớ của bản thân",
    slides: 8,
    text: `BÀI GIẢNG: VIẾT BÀI VĂN KỂ LẠI MỘT TRẢI NGHIỆM ĐÁNG NHỚ - NGỮ VĂN 6
I. YÊU CẦU CẦN ĐẠT:
- Hiểu được mục đích kể lại một trải nghiệm: chia sẻ câu chuyện bản thân đã trải qua để lại ấn tượng sâu sắc hoặc bài học quý giá.
- Biết sử dụng ngôi kể thứ nhất ("tôi", "em") để tăng tính chân thực và truyền cảm.
- Bố cục 3 phần rõ ràng: Mở bài (giới thiệu trải nghiệm), Thân bài (kể diễn biến theo trình tự hợp lí), Kết bài (nêu cảm xúc và bài học rút ra).
II. CÁC BƯỚC THỰC HIỆN:
1. LỰA CHỌN TRẢI NGHIỆM:
Có thể là một chuyến đi dã ngoại, một lần mắc lỗi và được thầy cô tha thứ, hoặc một kỉ niệm ấm áp bên gia đình.
2. TỔ CHỨC DIỄN BIẾN CÂU CHUYỆN:
Bao gồm hoàn cảnh mở đầu, sự việc phát triển, đỉnh điểm cao trào và kết thúc sự việc.`,
  },
];

function SCORMStudioContent() {
  const searchParams = useSearchParams();
  const paramTitle = searchParams.get("title");
  const paramSubject = searchParams.get("subject");
  const paramGrade = searchParams.get("grade");

  // Step State: 1 = Upload, 2 = AI Review, 3 = Preview & Export
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Upload State
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedDocumentResult | null>(null);
  const [documentText, setDocumentText] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>(paramTitle || "Nhịp 2/4 và Bài hát Nụ Cười");
  const [subject, setSubject] = useState<string>(paramSubject || "Âm nhạc");
  const [grade, setGrade] = useState<number>(paramGrade ? parseInt(paramGrade, 10) : 7);
  const [slideCount, setSlideCount] = useState<number>(8);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>("music-7");

  // Step 2: AI Generation State & Teacher Inline Editing
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [interactiveLesson, setInteractiveLesson] = useState<GeneratedInteractiveLesson | null>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [isEditingSlide, setIsEditingSlide] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editSubtitle, setEditSubtitle] = useState<string>("");
  const [editMainContent, setEditMainContent] = useState<string>("");
  const [editNarration, setEditNarration] = useState<string>("");
  const [editQuizQuestion, setEditQuizQuestion] = useState<string>("");
  const [editQuizOptions, setEditQuizOptions] = useState<string[]>([]);
  const [editQuizAnswer, setEditQuizAnswer] = useState<string>("A");
  const [editQuizExplanation, setEditQuizExplanation] = useState<string>("");

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

  // Preset Selection Loader
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_LESSONS.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePreset(presetId);
    setDocumentText(preset.text);
    setLessonTitle(preset.title);
    setSubject(preset.subject);
    setGrade(preset.grade);
    setSlideCount(preset.slides);
    setParsedData({
      text: preset.text,
      wordCount: preset.text.split(/\s+/).length,
      slideCount: preset.slides,
      fileName: `GiaoAn_${preset.id}.docx`,
      fileType: "DOCX",
    });
  };

  // Start Inline Editing for selected slide
  const startEditingSlide = (slide: SlideItem) => {
    setEditTitle(slide.title);
    setEditSubtitle(slide.subtitle || "");
    setEditMainContent(slide.mainContent);
    setEditNarration(slide.narrationScript || "");
    if (slide.quizQuestion) {
      setEditQuizQuestion(slide.quizQuestion.question);
      setEditQuizOptions([...slide.quizQuestion.options]);
      setEditQuizAnswer(slide.quizQuestion.answer);
      setEditQuizExplanation(slide.quizQuestion.explanation || "");
    } else {
      setEditQuizQuestion("");
      setEditQuizOptions(["", "", "", ""]);
      setEditQuizAnswer("A");
      setEditQuizExplanation("");
    }
    setIsEditingSlide(true);
  };

  // Save Inline Edits
  const saveSlideEdits = () => {
    if (!interactiveLesson) return;
    const updatedSlides = [...interactiveLesson.slides];
    const current = updatedSlides[selectedSlideIndex];
    if (!current) return;

    current.title = editTitle;
    current.subtitle = editSubtitle;
    current.mainContent = editMainContent;
    current.narrationScript = editNarration;

    if (editQuizQuestion.trim()) {
      current.quizQuestion = {
        question: editQuizQuestion,
        options: editQuizOptions.filter((o) => o.trim().length > 0),
        answer: editQuizAnswer,
        explanation: editQuizExplanation,
      };
    }

    setInteractiveLesson({
      ...interactiveLesson,
      slides: updatedSlides,
    });
    setIsEditingSlide(false);
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
        headers: { "Content-Type": "application/json", ...getGeminiAuthHeaders() },
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
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 border border-blue-400/30 p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-600/10 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-amber-200 text-xs font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Google Gemini 3.8 Flash • AI Voice Học Đường • Chuẩn SCORM 1.2 / GDPT 2018</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white shadow-xs">
                <School className="w-5 h-5 text-amber-200" />
              </div>
              <span>Studio Bài Giảng Tương Tác & Đóng Gói SCORM</span>
            </h1>
            <p className="text-blue-50 text-sm md:text-base max-w-3xl leading-relaxed">
              Tải bài giảng (PDF, PPTX, DOCX) ➔ AI tự động chia mốc kiến thức, tạo điểm dừng trắc nghiệm tương tác & giọng đọc bài giảng ➔ Đóng gói SCORM 1.2 nộp LMS K12Online, Moodle, Canvas, vnEdu!
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            <Link
              href="/materials/slides"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-xs transition-all flex items-center space-x-1.5 active:scale-[0.98]"
            >
              <Layers className="w-4 h-4" />
              <span>Slide Studio</span>
            </Link>
            <Link
              href="/export-center"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/25 transition-all flex items-center space-x-1.5 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Trung tâm Xuất bản</span>
            </Link>
          </div>
        </div>

        {/* Multi-step Breadcrumb */}
        <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setCurrentStep(1)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 active:scale-[0.98] ${
              currentStep === 1
                ? "bg-white text-blue-900 border-white shadow-lg shadow-blue-900/20 font-bold"
                : "bg-white/10 border-white/20 text-white/80 hover:bg-white/15"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${currentStep === 1 ? "bg-blue-600 text-white" : "bg-white/20 text-white"}`}>
              1
            </div>
            <div>
              <div className="text-xs font-bold">Bước 1: Upload Tài Liệu</div>
              <div className={`text-[11px] ${currentStep === 1 ? "text-blue-700 font-semibold" : "text-white/70"}`}>PDF, DOCX, PPTX & bóc tách text</div>
            </div>
          </div>

          <div
            onClick={() => interactiveLesson && setCurrentStep(2)}
            className={`p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
              interactiveLesson ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
            } flex items-center space-x-3 ${
              currentStep === 2
                ? "bg-white text-blue-900 border-white shadow-lg shadow-blue-900/20 font-bold"
                : "bg-white/10 border-white/20 text-white/80 hover:bg-white/15"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${currentStep === 2 ? "bg-blue-600 text-white" : "bg-white/20 text-white"}`}>
              2
            </div>
            <div>
              <div className="text-xs font-bold">Bước 2: AI Tạo Điểm Dừng</div>
              <div className={`text-[11px] ${currentStep === 2 ? "text-blue-700 font-semibold" : "text-white/70"}`}>Gemini 3.8 Flash & biên soạn sư phạm</div>
            </div>
          </div>

          <div
            onClick={() => interactiveLesson && setCurrentStep(3)}
            className={`p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
              interactiveLesson ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
            } flex items-center space-x-3 ${
              currentStep === 3
                ? "bg-white text-blue-900 border-white shadow-lg shadow-blue-900/20 font-bold"
                : "bg-white/10 border-white/20 text-white/80 hover:bg-white/15"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${currentStep === 3 ? "bg-blue-600 text-white" : "bg-white/20 text-white"}`}>
              3
            </div>
            <div>
              <div className="text-xs font-bold">Bước 3: Đóng Gói SCORM</div>
              <div className={`text-[11px] ${currentStep === 3 ? "text-blue-700 font-semibold" : "text-white/70"}`}>Mô phỏng bảng học sinh & tải ZIP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {exportSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{exportSuccessMessage}</span>
        </div>
      )}

      {/* STEP 1: UPLOAD & EXTRACT DOCUMENT */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Drag & Drop Area + 1-Click Presets */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200/90 p-6 md:p-8 rounded-3xl shadow-xs space-y-6">
              {/* Presets Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-sky-50/80 border border-blue-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Nạp Nhanh Bài Mẫu Chuẩn GDPT 2018 (1-Click Thử Ngay)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    4 Môn Học
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {PRESET_LESSONS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                        activePreset === p.id && documentText === p.text
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 shadow-2xs"
                      }`}
                    >
                      <span className="line-clamp-1">{p.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span>Tải Lên Bài Giảng Có Sẵn</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hỗ trợ file Word (.docx), PowerPoint (.pptx), PDF (.pdf), hoặc văn bản (.txt)
                  </p>
                </div>
              </div>

              {/* Drag & Drop Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/20 hover:bg-blue-50/60 p-10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-4 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pptx,.pdf,.txt,.md"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Upload className="w-8 h-8" />
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-800">
                    Kéo & thả file bài giảng vào đây, hoặc <span className="text-blue-600 underline">bấm để chọn file từ máy</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
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
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Gemini 3.8 Flash Đang Phân Tích & Tạo Điểm Dừng...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform text-amber-300" />
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
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-500/20 flex items-center space-x-1">
                            <Target className="w-3 h-3 text-amber-600 shrink-0" />
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
                <div className="bg-white border border-slate-200/90 p-6 md:p-8 rounded-3xl shadow-xs space-y-6">
                  {(() => {
                    const slide = interactiveLesson.slides[selectedSlideIndex];

                    if (isEditingSlide) {
                      return (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center space-x-2">
                              <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-black">
                                Đang Chỉnh Sửa Slide #{selectedSlideIndex + 1}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                Chế độ biên tập sư phạm của giáo viên
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => setIsEditingSlide(false)}
                                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                              >
                                Hủy Bỏ
                              </button>
                              <button
                                type="button"
                                onClick={saveSlideEdits}
                                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer active:scale-[0.98]"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Lưu Thay Đổi</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4 text-xs">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Tiêu Đề Slide:</label>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Phụ Đề / Mục Tiêu Ngắn:</label>
                              <input
                                type="text"
                                value={editSubtitle}
                                onChange={(e) => setEditSubtitle(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">
                                Nội Dung Trọng Tâm (Hỗ trợ công thức Toán/KHTN $...$):
                              </label>
                              <textarea
                                rows={4}
                                value={editMainContent}
                                onChange={(e) => setEditMainContent(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 leading-relaxed font-sans focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-blue-700 mb-1 flex items-center space-x-1.5">
                                <Mic className="w-3.5 h-3.5 text-blue-600" />
                                <span>Lời Thoại Cô Giáo Thuyết Minh (AI Voice đọc tự động):</span>
                              </label>
                              <textarea
                                rows={3}
                                value={editNarration}
                                onChange={(e) => setEditNarration(e.target.value)}
                                className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50/30 text-blue-900 leading-relaxed italic focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>

                            {/* Quiz Editing */}
                            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="font-extrabold text-amber-900 flex items-center space-x-1.5 uppercase tracking-wide">
                                  <Target className="w-4 h-4 text-amber-700" />
                                  <span>Câu Hỏi Trắc Nghiệm Điểm Dừng:</span>
                                </label>
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-slate-600">Đáp Án Đúng:</span>
                                  <select
                                    value={editQuizAnswer}
                                    onChange={(e) => setEditQuizAnswer(e.target.value)}
                                    className="p-1 rounded-lg border border-amber-300 bg-white font-black text-blue-700"
                                  >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                  </select>
                                </div>
                              </div>

                              <input
                                type="text"
                                value={editQuizQuestion}
                                placeholder="Nhập câu hỏi tương tác cho học sinh..."
                                onChange={(e) => setEditQuizQuestion(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                                {editQuizOptions.map((opt, optIdx) => {
                                  const label = String.fromCharCode(65 + optIdx);
                                  return (
                                    <div key={optIdx} className="flex items-center space-x-2">
                                      <span className="font-black text-amber-800 w-4">{label}:</span>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const next = [...editQuizOptions];
                                          next[optIdx] = e.target.value;
                                          setEditQuizOptions(next);
                                        }}
                                        className="flex-1 p-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                      />
                                    </div>
                                  );
                                })}
                              </div>

                              <div>
                                <label className="block font-bold text-slate-600 mb-1">
                                  Giải thích sư phạm khi học sinh chọn:
                                </label>
                                <input
                                  type="text"
                                  value={editQuizExplanation}
                                  placeholder="Giải thích vì sao đáp án này đúng..."
                                  onChange={(e) => setEditQuizExplanation(e.target.value)}
                                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-black">
                              Slide {selectedSlideIndex + 1} / {interactiveLesson.slides.length}
                            </span>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {interactiveLesson.subject} {interactiveLesson.grade}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => startEditingSlide(slide)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Sửa Nội Dung</span>
                            </button>

                            {/* Voice Button */}
                            <button
                              type="button"
                              onClick={() => handleNarrateSlide(slide)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all border border-blue-200 cursor-pointer active:scale-[0.98]"
                            >
                              {isSpeaking ? (
                                <>
                                  <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" />
                                  <span>Dừng Đọc</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-4 h-4 text-blue-600" />
                                  <span>Nghe Thuyết Minh</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            <MathContent content={slide.title} />
                          </h3>
                          {slide.subtitle && (
                            <p className="text-sm font-semibold text-blue-700">
                              <MathContent content={slide.subtitle} inline />
                            </p>
                          )}
                          <div className="text-sm text-slate-700 leading-relaxed pt-1">
                            <MathContent content={slide.mainContent} />
                          </div>
                        </div>

                        {/* Bullets */}
                        {slide.bullets && slide.bullets.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Ý chính kiến thức:
                            </h4>
                            <ul className="space-y-2">
                              {slide.bullets.map((b, bIdx) => (
                                <li key={bIdx} className="flex items-start text-xs md:text-sm text-slate-700 leading-relaxed">
                                  <span className="text-blue-600 mr-2 font-black text-base leading-none">✦</span>
                                  <div>
                                    <MathContent content={b} inline />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Voice Narration Script Preview */}
                        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 text-xs space-y-1">
                          <div className="font-bold text-blue-800 flex items-center space-x-1.5">
                            <Mic className="w-4 h-4 text-blue-600" />
                            <span>Lời thoại thuyết minh của Giáo viên (AI Voice đọc tự động):</span>
                          </div>
                          <p className="text-slate-600 italic leading-relaxed pl-5">
                            "{slide.narrationScript || `${slide.title}. ${slide.mainContent}`}"
                          </p>
                        </div>

                        {/* Checkpoint Quiz Card */}
                        {slide.quizQuestion ? (
                          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 border border-amber-300 space-y-4 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-amber-800 flex items-center space-x-1.5 uppercase tracking-wide">
                                <Target className="w-4 h-4 text-amber-600" />
                                <span>Điểm dừng kiểm tra tương tác bắt buộc</span>
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                Đáp án đúng: <span className="text-emerald-700 font-black">{slide.quizQuestion.answer}</span>
                              </span>
                            </div>

                            <div className="text-sm font-bold text-slate-900 leading-snug">
                              <MathContent content={slide.quizQuestion.question} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {slide.quizQuestion.options.map((opt, optIdx) => {
                                const label = String.fromCharCode(65 + optIdx);
                                const isAns = label === slide.quizQuestion?.answer;
                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-3 rounded-xl border text-xs font-semibold ${
                                      isAns
                                        ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-900 shadow-2xs"
                                        : "bg-white border-slate-200 text-slate-700"
                                    }`}
                                  >
                                    <span className="font-black mr-1 text-slate-500">{label}.</span>
                                    <MathContent content={opt} inline />
                                  </div>
                                );
                              })}
                            </div>

                            <div className="text-xs text-slate-600 pt-1 flex items-start space-x-1.5">
                              <span className="font-bold text-slate-700">Giải thích sư phạm:</span>
                              <div className="flex-1">
                                <MathContent content={slide.quizQuestion.explanation || ""} inline />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
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
          <div className="bg-white border border-slate-200/90 p-6 md:p-8 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-700 font-bold rounded-full text-xs border border-emerald-200">
                Sẵn Sàng Đóng Gói Chuẩn SCORM 1.2 ADL
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1.5">
                Xuất Bản Bài Giảng E-Learning Tương Tác
              </h2>
              <p className="text-xs md:text-sm text-slate-500 max-w-2xl mt-0.5">
                Gói SCORM 1.2 đạt chuẩn quốc tế, tương thích 100% với LMS K12Online (Viettel), Moodle, vnEdu, Canvas. Tự động chấm điểm và báo cáo tiến độ học tập.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-3 rounded-2xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all border border-slate-200 cursor-pointer active:scale-[0.98]"
              >
                ← Quay lại Chỉnh sửa
              </button>

              <button
                onClick={handleDownloadStandaloneHTML}
                className="px-5 py-3 rounded-2xl text-xs font-bold bg-white hover:bg-blue-50/80 text-blue-700 border-2 border-blue-200 transition-all flex items-center space-x-2 shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Tải File HTML5 Độc Lập</span>
              </button>

              <button
                onClick={handleDownloadSCORM}
                disabled={isExportingZip}
                className="px-6 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white shadow-xl shadow-emerald-600/25 flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
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

          {/* LMS Platform Compatibility & Teacher Deployment Guide */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Khả Năng Tương Thích Các Hệ Thống LMS Việt Nam
                  </h3>
                  <p className="text-xs text-slate-500">
                    File đóng gói đạt chuẩn SCORM 1.2 ADL — Tự động lưu tiến trình học & điểm số trắc nghiệm
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 self-start md:self-auto flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                100% Tương Thích LMS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>K12Online (Viettel)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Vào Khóa học ➔ Thêm chuyên đề ➔ Chọn loại Bài giảng SCORM ➔ Tải file .zip vừa xuất.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                  <span>Moodle THCS</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Bật chế độ chỉnh sửa ➔ Thêm hoạt động/tài nguyên ➔ Gói SCORM ➔ Kéo thả file .zip.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>vnEdu LMS (VNPT)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Quản lý học liệu ➔ Thêm mới bài giảng SCORM HTML5 ➔ Chọn file và kích hoạt khóa học.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>Canvas / Google Site</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Import SCORM package hoặc nhúng file HTML5 độc lập trực tiếp vào bài giảng điện tử.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Player (Preview as a student) */}
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 text-slate-900 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold text-slate-700 ml-2 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bảng mô phỏng bài giảng tương tác học sinh (SCORM 1.2 Player)</span>
                </span>
              </div>

              <div className="flex items-center space-x-2.5 text-xs">
                <button
                  onClick={() => handleNarrateSlide(interactiveLesson.slides[previewSlideIdx])}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center space-x-1.5 font-bold hover:bg-blue-100 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                >
                  <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isSpeaking ? "Đang phát Voice..." : "Phát Thuyết Minh Cô Giáo"}</span>
                </button>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-700">
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
                      <span className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                        Slide {previewSlideIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {interactiveLesson.subject} {interactiveLesson.grade}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                      <MathContent content={slide.title} />
                    </h3>
                    {slide.subtitle && (
                      <p className="text-base text-blue-700 font-semibold">
                        <MathContent content={slide.subtitle} inline />
                      </p>
                    )}
                    <div className="text-slate-700 text-base leading-relaxed">
                      <MathContent content={slide.mainContent} />
                    </div>

                    {slide.bullets && slide.bullets.length > 0 && (
                      <ul className="space-y-2 pt-2">
                        {slide.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start text-sm md:text-base text-slate-700 leading-relaxed">
                            <span className="text-blue-600 mr-2.5 font-bold">✦</span>
                            <div>
                              <MathContent content={b} inline />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Interactive Checkpoint Quiz */}
                  {q && (
                    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-50/90 via-white to-orange-50/50 border-2 border-amber-300/80 space-y-4 shadow-xs">
                      <div className="flex items-center space-x-2 text-amber-800 text-xs font-black uppercase tracking-wider">
                        <Target className="w-4 h-4 text-amber-600" />
                        <span>Điểm dừng kiểm tra tương tác</span>
                        <span className="text-amber-700/80 font-normal lowercase">(Em cần trả lời đúng để mở khóa slide kế tiếp)</span>
                      </div>

                      <div className="text-base md:text-xl font-bold text-slate-900 leading-snug">
                        <MathContent content={q.question} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const label = String.fromCharCode(65 + optIdx);
                          const isChosen = answered === label;
                          const isCorrect = label === q.answer;

                          let btnStyle = "bg-white border-2 border-slate-200 text-slate-800 hover:border-blue-500 hover:bg-blue-50/50 shadow-2xs";
                          if (answered) {
                            if (isCorrect) btnStyle = "bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold shadow-xs";
                            else if (isChosen) btnStyle = "bg-rose-50 border-2 border-rose-400 text-rose-900 font-semibold";
                            else btnStyle = "bg-slate-50 border border-slate-200 text-slate-400 opacity-60";
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setPreviewUserAnswer((prev) => ({ ...prev, [previewSlideIdx]: label }));
                              }}
                              className={`p-3.5 md:p-4 rounded-2xl border text-sm text-left transition-all font-semibold cursor-pointer active:scale-[0.98] ${btnStyle}`}
                            >
                              <span className="font-bold mr-1.5 text-slate-500">{label}.</span>
                              <MathContent content={opt} inline />
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div
                          className={`p-4 rounded-2xl text-xs md:text-sm font-medium ${
                            answered === q.answer
                              ? "bg-emerald-50 border-2 border-emerald-300 text-emerald-900"
                              : "bg-rose-50 border-2 border-rose-300 text-rose-900"
                          }`}
                        >
                          {answered === q.answer ? (
                            <div className="flex items-start space-x-2">
                              <Trophy className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Hoan hô em đã trả lời rất chính xác!</span>{" "}
                                <MathContent content={q.explanation || ""} inline />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start space-x-2">
                              <Lightbulb className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Chưa chính xác. Em hãy xem gợi ý của cô và chọn lại nhé:</span>{" "}
                                <MathContent content={q.explanation || ""} inline />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Player Footer Controls */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                    <button
                      disabled={previewSlideIdx === 0}
                      onClick={() => setPreviewSlideIdx((prev) => Math.max(0, prev - 1))}
                      className="px-5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs md:text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      ← Trang trước
                    </button>

                    <div className="text-xs font-semibold">
                      {isLocked ? (
                        <span className="text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 font-bold flex items-center space-x-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Hoàn thành câu trắc nghiệm để mở khóa trang kế</span>
                        </span>
                      ) : (
                        <span className="text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 font-bold flex items-center space-x-1.5">
                          <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã sẵn sàng chuyển sang trang tiếp theo</span>
                        </span>
                      )}
                    </div>

                    <button
                      disabled={isLocked || previewSlideIdx >= interactiveLesson.slides.length - 1}
                      onClick={() => setPreviewSlideIdx((prev) => Math.min(interactiveLesson.slides.length - 1, prev + 1))}
                      className="px-6 py-2.5 rounded-2xl bg-blue-600 text-xs md:text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-40 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-[0.98]"
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

export default function SCORMStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Đang tải SCORM Studio...</div>}>
      <SCORMStudioContent />
    </Suspense>
  );
}
