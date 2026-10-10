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
  Upload,
  FileUp,
  FileType,
  Image as ImageIcon,
  CheckCheck,
  AlertCircle,
  Share2,
  ExternalLink,
  FileCheck2,
} from "lucide-react";
import { MathContent } from "@/components/ui/MathContent";
import katex from "katex";
import { parseDocumentFile, ParsedDocumentResult } from "@/lib/export/documentParser";
import {
  buildLessonPlan5512WordContent,
  triggerWordDownload,
} from "@/lib/export/wordExportHelper";
import { TextbookAnalysisResult } from "@/lib/ai/types";

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

// 4 Pre-packaged Real Textbook Presets for 1-Click Testing
const PRESET_TEXTBOOKS = [
  {
    id: "math-7-ratio",
    bookSeries: "Kết Nối Tri Thức Với Cuộc Sống",
    subject: "Toán học",
    grade: "7",
    lessonTitle: "Bài 6: Tỉ lệ thức và Dãy tỉ số bằng nhau",
    durationMinutes: "45",
    pages: "Trang 6 – 10 (Tập 2)",
    icon: "📐",
    snippet: `BÀI 6: TỈ LỆ THỨC VÀ DÃY TỈ SỐ BẰNG NHAU (SGK Toán 7 - Kết Nối Tri Thức)
1. Tỉ lệ thức: Tỉ lệ thức là đẳng thức của hai tỉ số a/b = c/d (viết dạng a:b = c:d).
Các số a, d gọi là ngoại tỉ; b, c gọi là trung tỉ.
Tính chất 1: Nếu a/b = c/d thì a.d = b.c (tích ngoại tỉ bằng tích trung tỉ).
Tính chất 2: Nếu a.d = b.c (với a, b, c, d khác 0) thì ta có các tỉ lệ thức: a/b = c/d; a/c = b/d; d/b = c/a; d/c = b/a.
2. Dãy tỉ số bằng nhau:
Từ a/b = c/d = e/f ta suy ra: a/b = c/d = e/f = (a + c + e)/(b + d + f) = (a - c + e)/(b - d + f) (giả thiết các mẫu số khác 0).
3. Hoạt động luyện tập & Vận dụng:
- Ví dụ 1: Tìm x trong tỉ lệ thức x/8 = 9/12.
- Ví dụ 2: Tìm hai số x, y biết x/2 = y/5 và x + y = 21.
- Bài toán thực tiễn: Ba lớp 7A, 7B, 7C tham gia phong trào kế hoạch nhỏ gom giấy vụn tỉ lệ với số học sinh 36, 40, 44. Tổng số giấy là 360 kg. Tính số kg mỗi lớp gom được.`,
    learningOutcomes:
      "Nhận biết tỉ lệ thức và các tính chất cơ bản; vận dụng tính chất dãy tỉ số bằng nhau để giải bài toán chia đại lượng tỉ lệ trong đời sống thực tiễn.",
    method: "Dạy học phát hiện và giải quyết vấn đề, thảo luận nhóm, trực quan hóa bài toán thực tiễn",
  },
  {
    id: "khtn-7-metabolism",
    bookSeries: "Cánh Diều",
    subject: "Khoa học tự nhiên",
    grade: "7",
    lessonTitle: "Bài 22: Vai trò của trao đổi chất và chuyển hóa năng lượng ở sinh vật",
    durationMinutes: "45",
    pages: "Trang 102 – 106",
    icon: "🔬",
    snippet: `BÀI 22: VAI TRÒ CỦA TRAO ĐỔI CHẤT VÀ CHUYỂN HÓA NĂNG LƯỢNG Ở SINH VẬT (SGK KHTN 7 - Cánh Diều)
1. Khái niệm trao đổi chất và chuyển hóa năng lượng:
- Trao đổi chất là quá trình cơ thể sinh vật lấy các chất từ môi trường ngoài, biến đổi chúng thành các chất cần thiết cho cơ thể và thải các chất cặn bã ra môi trường ngoài.
- Chuyển hóa năng lượng là sự biến đổi năng lượng từ dạng này sang dạng khác (quang năng thành hóa năng trong quang hợp, hóa năng thành nhiệt năng và ATP trong hô hấp tế bào).
2. Vai trò của trao đổi chất và chuyển hóa năng lượng:
- Cung cấp nguyên liệu cấu tạo nên tế bào và cơ thể sinh vật.
- Cung cấp năng lượng duy trì mọi hoạt động sống (vận động, sinh sản, cảm ứng).
3. Câu hỏi và bài tập ứng dụng:
- Câu hỏi khởi động: Vì sao khi vận động mạnh (chạy bộ), chúng ta thở nhanh, tim đập nhanh và toát nhiều mồ hôi?
- Thảo luận nhóm: Phân tích sơ đồ mối quan hệ giữa quang hợp và hô hấp tế bào.
- Vận dụng thực tiễn: Giải thích vì sao cần bảo quản hạt giống ở nơi khô ráo, thoáng mát và nhiệt độ thấp.`,
    learningOutcomes:
      "Nêu được khái niệm trao đổi chất và chuyển hóa năng lượng; phân tích vai trò chuyển hóa năng lượng đối với sự sống và giải thích các ứng dụng thực tế trong bảo quản nông sản.",
    method: "Dạy học trực quan bằng sơ đồ hóa, phân tích thí nghiệm và liên hệ thực tế nông nghiệp",
  },
  {
    id: "lit-8-poetry",
    bookSeries: "Chân Trời Sáng Tạo",
    subject: "Ngữ văn",
    grade: "8",
    lessonTitle: "Bài 2: Vẻ đẹp cổ điển - Thơ Thất ngôn bát cú Đường luật (Qua Đèo Ngang)",
    durationMinutes: "45",
    pages: "Trang 38 – 42 (Tập 1)",
    icon: "📖",
    snippet: `BÀI 2: VẺ ĐẸP CỔ ĐIỂN - ĐỌC HIỂU VĂN BẢN QUA ĐÈO NGANG (SGK Ngữ văn 8 - Chân Trời Sáng Tạo)
Tác giả: Bà Huyện Thanh Quan (thế kỉ XIX).
Văn bản bài thơ:
Bước tới Đèo Ngang, bóng xế tà,
Cỏ cây chen đá, lá chen hoa.
Lom khom dưới núi, tiều vài chú,
Lác đác bên sông, chợ mấy nhà.
Nhớ nước đau lòng, con quốc quốc,
Thương nhà mỏi miệng, cái gia gia.
Dừng chân đứng lại, trời, non, nước,
Một mảnh tình riêng, ta với ta.
1. Thể thơ Thất ngôn bát cú Đường luật:
- Số câu: 8 câu, số chữ mỗi câu: 7 chữ.
- Niêm: Câu 1 niêm với câu 8, câu 2 niêm với câu 3, câu 4 niêm với câu 5, câu 6 niêm với câu 7.
- Luật vần: Hiệp vần ở cuối các câu 1, 2, 4, 6, 8 (tà, hoa, nhà, gia, ta).
- Phép đối: Đối ý và đối lời ở 2 câu thực (câu 3 - 4) và 2 câu luận (câu 5 - 6).
2. Câu hỏi đọc hiểu và phân tích:
- Câu 1: Xác định thời gian, không gian và tâm trạng của tác giả khi đặt chân tới Đèo Ngang.
- Câu 2: Phân tích hiệu quả nghệ thuật của biện pháp đảo ngữ trong hai câu thực (Lom khom... / Lác đác...).
- Câu 3: Nghệ thuật chơi chữ qua âm thanh tiếng chim 'quốc quốc', 'gia gia'.
- Vận dụng: Viết đoạn văn ngắn (7-9 câu) nêu cảm nhận về tâm trạng hoài cổ và tình yêu quê hương của thi nhân.`,
    learningOutcomes:
      "Nhận biết đặc trưng thể thơ Thất ngôn bát cú Đường luật (luật, niêm, vần, đối), phân tích được tâm trạng hoài cổ của tác giả và cảm thụ nét đẹp quê hương.",
    method: "Dạy học đọc hiểu văn bản nghệ thuật, đàm thoại gợi mở, thảo luận cặp đôi và viết đoạn văn cảm nhận",
  },
  {
    id: "music-7-smile",
    bookSeries: "Kết Nối Tri Thức Với Cuộc Sống",
    subject: "Âm nhạc",
    grade: "7",
    lessonTitle: "Chủ đề 2: Tình bạn - Bài 3: Học hát bài Nụ cười",
    durationMinutes: "45",
    pages: "Trang 16 – 19",
    icon: "🎵",
    snippet: `CHỦ ĐỀ 2: TÌNH BẠN - BÀI 3: HỌC HÁT BÀI NỤ CƯỜI (SGK Âm nhạc 7 - Kết Nối Tri Thức)
Nhạc: V. Shainsky (Nga) - Lời Việt: Phạm Tuyên.
Nhịp 2/4. Tính chất âm nhạc: Vui tươi, hồn nhiên, trong sáng.
1. Khám phá bài hát:
- Giới thiệu bài hát: Ca khúc nổi tiếng trong phim hoạt hình Liên Xô, truyền tải thông điệp về nụ cười kết nối bạn bè và niềm vui cuộc sống.
- Nghe hát mẫu và nhận diện cấu trúc bài hát gồm 2 đoạn đơn.
2. Dạy hát từng câu:
- Luyện thanh theo thang âm Đô trưởng (mẫu âm La - Ma).
- Đọc lời ca theo tiết tấu nhịp 2/4.
- Tập hát câu 1: 'Cho trời sáng lên cùng với bao nụ cười...'
- Ghép nối cả bài và sửa sai cao độ.
3. Thực hành gõ đệm thanh phách:
- Gõ đệm theo phách (phách 1 mạnh, phách 2 nhẹ).
- Gõ đệm theo tiết tấu lời ca.
4. Vận dụng - Sáng tạo:
- Hát kết hợp vận động cơ thể (body percussion): vỗ tay, giậm chân nhịp nhàng.
- Biểu diễn theo nhóm và nhận xét chéo.`,
    learningOutcomes:
      "Hát đúng giai điệu và lời ca bài hát Nụ cười, biết gõ đệm thanh phách nhịp nhàng theo phách 2/4, cảm nhận tình bạn trong sáng.",
    method: "Dạy học thực hành biểu diễn, luyện thanh, hòa âm nhóm và gõ đệm thanh phách",
  },
];

function LessonPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLessonId = searchParams.get("lessonId") || "";

  // Active Tab: "UPLOAD_SGK" | "MANUAL_FORM" | "PRESET_TEMPLATES"
  const [activeTab, setActiveTab] = useState<"UPLOAD_SGK" | "MANUAL_FORM" | "PRESET_TEMPLATES">("UPLOAD_SGK");

  // Textbook Upload State
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isAnalyzingSGK, setIsAnalyzingSGK] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedDocumentResult | null>(null);
  const [selectedBookSeries, setSelectedBookSeries] = useState("Kết Nối Tri Thức Với Cuộc Sống");
  const [analysisResult, setAnalysisResult] = useState<TextbookAnalysisResult | null>(null);
  const [extractedDocumentText, setExtractedDocumentText] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Form State (Can be auto-filled from SGK analysis or manually edited)
  const [subject, setSubject] = useState("Toán học");
  const [grade, setGrade] = useState("7");
  const [lessonTitle, setLessonTitle] = useState("Bài 6: Tỉ lệ thức và Dãy tỉ số bằng nhau");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [method, setMethod] = useState("Dạy học phát hiện và giải quyết vấn đề, thảo luận nhóm, trực quan hóa bài toán thực tiễn");
  const [learningOutcomes, setLearningOutcomes] = useState(
    "Nắm vững tính chất cơ bản của tỉ lệ thức và dãy tỉ số bằng nhau, vận dụng giải bài toán thực tế chia đại lượng tỉ lệ thuận."
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
    handleSelectPresetTextbook("math-7-ratio");
  }, []);

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
    setAnalysisResult(null);

    // Create image preview if image
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(null);
    }

    try {
      const result = await parseDocumentFile(f);
      setParsedData(result);
      setExtractedDocumentText(result.text);

      // Trigger AI Analysis of the textbook file
      await analyzeUploadedSGK(result, f.name);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Lỗi đọc tệp Sách Giáo Khoa. Vui lòng kiểm tra lại file.");
    } finally {
      setIsParsing(false);
    }
  };

  const applyAnalysisToForm = (analysis: TextbookAnalysisResult) => {
    if (analysis.subject) setSubject(analysis.subject);
    if (analysis.grade) setGrade(analysis.grade.toString());
    if (analysis.lessonTitle) setLessonTitle(analysis.lessonTitle);
    if (analysis.learningOutcomes) setLearningOutcomes(analysis.learningOutcomes);
    if (analysis.suggestedDuration) setDurationMinutes(analysis.suggestedDuration.toString());
    if (analysis.bookSeries) setSelectedBookSeries(analysis.bookSeries);
  };

  const performLocalHeuristicSGKAnalysis = (
    text: string,
    fileName: string,
    bookSeries: string
  ): TextbookAnalysisResult => {
    const combined = (text + " " + fileName).toLowerCase();

    // 1. Math
    if (
      combined.includes("toán") ||
      combined.includes("math") ||
      combined.includes("tỉ lệ") ||
      combined.includes("tỉ số") ||
      combined.includes("hình học") ||
      combined.includes("đại số") ||
      combined.includes("số thực")
    ) {
      let lessonTitle = "Bài 6: Tỉ lệ thức và Dãy tỉ số bằng nhau";
      const match = text.match(/(Bài\s+\d+[:\s][^\n\r.]+)/i);
      if (match) lessonTitle = match[1].trim();

      return {
        bookSeries: bookSeries || "Kết Nối Tri Thức Với Cuộc Sống",
        subject: "Toán học",
        grade: combined.includes("6") ? 6 : combined.includes("8") ? 8 : combined.includes("9") ? 9 : 7,
        chapterTitle: "Chương VI: Tỉ lệ thức và Đại lượng tỉ lệ",
        lessonTitle,
        learningOutcomes: "Nhận biết khái niệm, phát biểu và vận dụng các tính chất cơ bản; giải quyết bài toán thực tế bám sát SGK theo chuẩn GDPT 2018.",
        keyConcepts: [
          "Khái niệm và định nghĩa trọng tâm bài học theo chuẩn SGK",
          "Tính chất toán học cơ bản và phương pháp biến đổi đại số",
          "Quy trình giải bài toán có lời văn và liên hệ thực tiễn",
        ],
        exercisesSummary: [
          "Hoạt động Khởi động: Tình huống mở đầu gợi mở tư duy",
          "Hoạt động Khám phá: Hình thành kiến thức và quy tắc mới",
          "Hoạt động Luyện tập: Giải hệ thống bài tập củng cố kĩ năng",
          "Hoạt động Vận dụng: Bài toán thực tế gắn liền đời sống",
        ],
        suggestedDuration: 45,
        extractedSnippet: text.slice(0, 400) || `Tài liệu SGK Toán: ${fileName}`,
      };
    }

    // 2. Science
    if (
      combined.includes("khtn") ||
      combined.includes("khoa học") ||
      combined.includes("sinh học") ||
      combined.includes("vật lí") ||
      combined.includes("hóa học") ||
      combined.includes("quang hợp") ||
      combined.includes("trao đổi chất") ||
      combined.includes("tế bào")
    ) {
      let lessonTitle = "Bài 22: Vai trò trao đổi chất và chuyển hóa năng lượng ở sinh vật";
      const match = text.match(/(Bài\s+\d+[:\s][^\n\r.]+)/i);
      if (match) lessonTitle = match[1].trim();

      return {
        bookSeries: bookSeries || "Cánh Diều",
        subject: "Khoa học tự nhiên",
        grade: combined.includes("6") ? 6 : combined.includes("8") ? 8 : combined.includes("9") ? 9 : 7,
        chapterTitle: "Chủ đề: Sinh học & Khoa học sự sống",
        lessonTitle,
        learningOutcomes: "Nêu được khái niệm khoa học trọng tâm; phân tích cơ chế và ứng dụng kiến thức vào thực tiễn đời sống sinh hoạt.",
        keyConcepts: [
          "Khái niệm khoa học cốt lõi theo chương trình GDPT 2018",
          "Sơ đồ quy trình và mối liên hệ giữa các hiện tượng tự nhiên",
          "Ứng dụng công nghệ và bảo vệ môi trường sống",
        ],
        exercisesSummary: [
          "Khởi động: Quan sát hình ảnh hiện tượng tự nhiên",
          "Khám phá: Đọc thông tin SGK và hoàn thành phiếu học tập",
          "Luyện tập: Trả lời câu hỏi củng cố và bài tập tình huống",
          "Vận dụng: Giải thích hiện tượng thực tiễn trong đời sống",
        ],
        suggestedDuration: 45,
        extractedSnippet: text.slice(0, 400) || `Tài liệu SGK KHTN: ${fileName}`,
      };
    }

    // 3. Literature
    if (
      combined.includes("văn") ||
      combined.includes("ngữ văn") ||
      combined.includes("thơ") ||
      combined.includes("đèo ngang") ||
      combined.includes("đọc hiểu")
    ) {
      let lessonTitle = "Văn bản: Qua Đèo Ngang (Bà Huyện Thanh Quan)";
      const match = text.match(/(Bài\s+\d+[:\s][^\n\r.]+|Văn bản[:\s][^\n\r.]+)/i);
      if (match) lessonTitle = match[1].trim();

      return {
        bookSeries: bookSeries || "Chân Trời Sáng Tạo",
        subject: "Ngữ văn",
        grade: combined.includes("6") ? 6 : combined.includes("7") ? 7 : combined.includes("9") ? 9 : 8,
        chapterTitle: "Chủ đề: Đọc hiểu văn bản & Thực hành tiếng Việt",
        lessonTitle,
        learningOutcomes: "Nhận biết đặc trưng thể loại; cảm nhận giá trị nội dung và nghệ thuật của tác phẩm; bồi dưỡng tình yêu quê hương đất nước.",
        keyConcepts: [
          "Đặc trưng thể loại văn học và biện pháp tu từ nghệ thuật",
          "Hình tượng nghệ thuật và cảm xúc chủ đạo của tác giả",
          "Kĩ năng viết đoạn văn cảm thụ và liên hệ thực tế",
        ],
        exercisesSummary: [
          "Khởi động: Chia sẻ cảm xúc hoặc xem video dẫn nhập",
          "Khám phá: Đọc văn bản, tìm hiểu từ ngữ và bố cục tác phẩm",
          "Luyện tập: Phân tích chi tiết và biện pháp nghệ thuật",
          "Vận dụng: Viết đoạn văn ngắn bày tỏ suy nghĩ cá nhân",
        ],
        suggestedDuration: 45,
        extractedSnippet: text.slice(0, 400) || `Tài liệu SGK Ngữ văn: ${fileName}`,
      };
    }

    // 4. Music
    if (combined.includes("nhạc") || combined.includes("hát") || combined.includes("nụ cười")) {
      return {
        bookSeries: bookSeries || "Kết Nối Tri Thức Với Cuộc Sống",
        subject: "Âm nhạc",
        grade: 7,
        chapterTitle: "Chủ đề 2: Tình bạn",
        lessonTitle: "Chủ đề 2: Tình bạn - Bài 3: Học hát bài Nụ cười",
        learningOutcomes: "Hát đúng cao độ, trường độ bài hát; biết hát kết hợp gõ đệm thanh phách nhịp nhàng theo nhịp 2/4; cảm nhận tình bạn trong sáng.",
        keyConcepts: [
          "Bài hát Nụ cười (Nhạc Nga, Lời Việt: Phạm Tuyên)",
          "Tính chất âm nhạc: Vui tươi, hồn nhiên, trong sáng",
          "Gõ đệm thanh phách theo nhịp 2/4 và vận động cơ thể",
        ],
        exercisesSummary: [
          "Khởi động: Luyện thanh theo mẫu âm La - Ma theo gam Đô trưởng",
          "Khám phá: Nghe hát mẫu và học hát từng câu nối tiếp",
          "Luyện tập: Hát kết hợp gõ đệm thanh phách theo tiết tấu",
          "Vận dụng: Biểu diễn bài hát theo nhóm kết hợp phụ họa",
        ],
        suggestedDuration: 45,
        extractedSnippet: text.slice(0, 400) || `Tài liệu SGK Âm nhạc: ${fileName}`,
      };
    }

    // 5. Default General THCS Lesson
    const match = text.match(/(Bài\s+\d+[:\s][^\n\r.]+)/i);
    const extractedTitle = match ? match[1].trim() : `Bài học từ tài liệu ${fileName.replace(/\.[^/.]+$/, "")}`;

    return {
      bookSeries: bookSeries || "Kết Nối Tri Thức Với Cuộc Sống",
      subject: "Toán học",
      grade: 7,
      chapterTitle: "Chương trình Giáo dục Phổ thông 2018",
      lessonTitle: extractedTitle,
      learningOutcomes: "Nắm vững kiến thức cốt lõi của bài học; phát triển năng lực tự chủ và giải quyết vấn đề theo chuẩn GDPT 2018.",
      keyConcepts: [
        "Kiến thức trọng tâm bám sát nội dung Sách Giáo Khoa",
        "Kĩ năng thực hành và phương pháp giải quyết nhiệm vụ học tập",
        "Vận dụng kiến thức vào bài tập và tình huống thực tiễn",
      ],
      exercisesSummary: [
        "Khởi động: Tình huống dẫn nhập gợi mở",
        "Khám phá: Hình thành kiến thức mới",
        "Luyện tập: Bài tập củng cố kĩ năng",
        "Vận dụng: Mở rộng và thực tiễn",
      ],
      suggestedDuration: 45,
      extractedSnippet: text.slice(0, 400) || fileName,
    };
  };

  const analyzeUploadedSGK = async (docResult: ParsedDocumentResult, fileName: string) => {
    setIsAnalyzingSGK(true);
    setUploadError(null);
    try {
      const res = await fetch("/api/materials/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ANALYZE_SGK",
          params: {
            documentText: docResult.text ? docResult.text.slice(0, 15000) : "",
            fileName: fileName,
            imageBase64: docResult.imageBase64,
            imageMimeType: docResult.imageMimeType,
            bookSeries: selectedBookSeries,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.analysis) {
          const analysis: TextbookAnalysisResult = data.analysis;
          setAnalysisResult(analysis);
          applyAnalysisToForm(analysis);
          return;
        }
      }
      throw new Error("API analysis returned empty or error");
    } catch (err: any) {
      console.warn("Server AI analysis fallback, applying client curriculum heuristics:", err);
      // Seamless local heuristic fallback so teacher is NEVER blocked:
      const fallbackAnalysis = performLocalHeuristicSGKAnalysis(docResult.text || "", fileName, selectedBookSeries);
      setAnalysisResult(fallbackAnalysis);
      applyAnalysisToForm(fallbackAnalysis);
    } finally {
      setIsAnalyzingSGK(false);
    }
  };

  // 1-Click Select Textbook Preset
  const handleSelectPresetTextbook = async (presetId: string) => {
    const preset = PRESET_TEXTBOOKS.find((p) => p.id === presetId);
    if (!preset) return;

    setSubject(preset.subject);
    setGrade(preset.grade);
    setLessonTitle(preset.lessonTitle);
    setDurationMinutes(preset.durationMinutes);
    setLearningOutcomes(preset.learningOutcomes);
    setMethod(preset.method);
    setSelectedBookSeries(preset.bookSeries);
    setExtractedDocumentText(preset.snippet);
    setImagePreviewUrl(null);
    setFile(null);

    setParsedData({
      text: preset.snippet,
      wordCount: preset.snippet.split(/\s+/).length,
      fileName: `SGK_${preset.subject}_Lop${preset.grade}.pdf`,
      fileType: "PDF",
    });

    setAnalysisResult({
      bookSeries: preset.bookSeries,
      subject: preset.subject,
      grade: parseInt(preset.grade, 10),
      chapterTitle: preset.lessonTitle.split("-")[0] || "Chương GDPT 2018",
      lessonTitle: preset.lessonTitle,
      learningOutcomes: preset.learningOutcomes,
      keyConcepts: [
        "Kiến thức trọng tâm bám sát SGK bài học",
        "Hệ thống công thức, thuật ngữ và ví dụ mẫu chuẩn hóa",
        "Định hướng phát triển năng lực tư duy và phẩm chất",
      ],
      exercisesSummary: [
        "Hoạt động khởi động tình huống thực tế",
        "Khám phá hình thành kiến thức",
        "Hệ thống bài tập luyện tập trong SGK",
        "Vận dụng và liên hệ mở rộng đời sống",
      ],
      suggestedDuration: parseInt(preset.durationMinutes, 10),
      extractedSnippet: preset.snippet.slice(0, 400),
    });

    // Generate lesson plan directly with preset params
    await handleGeneratePlan({
      subject: preset.subject,
      grade: preset.grade,
      lessonTitle: preset.lessonTitle,
      durationMinutes: preset.durationMinutes,
      learningOutcomes: preset.learningOutcomes,
      method: preset.method,
      bookSeries: preset.bookSeries,
      textbookContent: preset.snippet,
    });
  };

  const handleGeneratePlan = async (overrideParams?: any) => {
    setIsGenerating(true);
    const pSubject = overrideParams?.subject || subject;
    const pGrade = overrideParams?.grade || grade;
    const pTitle = overrideParams?.lessonTitle || lessonTitle;
    const pDuration = overrideParams?.durationMinutes || durationMinutes;
    const pOutcomes = overrideParams?.learningOutcomes || learningOutcomes;
    const pMethod = overrideParams?.method || method;
    const pBookSeries = overrideParams?.bookSeries || selectedBookSeries;
    const pTextbookContent = overrideParams?.textbookContent || extractedDocumentText;

    try {
      const res = await fetch("/api/materials/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE",
          params: {
            subject: pSubject,
            grade: parseInt(pGrade, 10),
            lessonTitle: pTitle,
            durationMinutes: parseInt(pDuration, 10),
            learningOutcomes: pOutcomes,
            method: pMethod,
            bookSeries: pBookSeries,
            textbookContent: pTextbookContent,
            textbookImageBase64: parsedData?.imageBase64,
            textbookImageMimeType: parsedData?.imageMimeType,
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
      name: `Hoạt động ${plan.activities.length + 1}: Mở rộng liên môn & Dự án thực tiễn`,
      objective: "Học sinh ứng dụng kiến thức bài học trong SGK vào giải quyết vấn đề thực tế hoặc hoàn thành dự án học tập.",
      content: "Nhiệm vụ: Tìm hiểu các tình huống thực tiễn có áp dụng kiến thức bài học trong đời sống địa phương.",
      product: "Báo cáo sản phẩm hoặc bảng phân tích của nhóm học sinh.",
      execution: "Bước 1: Giáo viên giao nhiệm vụ dự án.\nBước 2: Học sinh thảo luận theo nhóm 4 em.\nBước 3: Đại diện nhóm báo cáo sản phẩm.\nBước 4: Giáo viên chuẩn hóa và đánh giá theo thang rubric.",
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
              bookSeries: selectedBookSeries,
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

  const handleExportWordOfficial = () => {
    if (!plan) return;
    const wordHtml = buildLessonPlan5512WordContent(plan, {
      schoolName: "TRƯỜNG THCS TÂN PHONG - VĨNH LONG",
      teacherName: "Phan Thị Ngọc Huyền",
    });
    triggerWordDownload(
      wordHtml,
      `Ke_Hoach_Bai_Day_5512_${plan.subject}_Lop${plan.grade}_${plan.title.replace(/[^a-zA-Z0-9]/g, "_")}.doc`
    );
  };

  const handleCopyMarkdown = () => {
    if (!plan) return;
    const text = `# ${plan.title}
Môn: ${plan.subject} - Lớp ${plan.grade} - Thời lượng: ${plan.duration}

## I. MỤC TIÊU BÀI DẠY
1. Về kiến thức:
${plan.objectives.knowledge.map((k) => `- ${k}`).join("\n")}

2. Về năng lực:
${plan.objectives.competencies.map((c) => `- ${c}`).join("\n")}

3. Về phẩm chất:
${plan.objectives.qualities.map((q) => `- ${q}`).join("\n")}

## II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
- Giáo viên: ${plan.equipment.teacher.join("; ")}
- Học sinh: ${plan.equipment.student.join("; ")}
- Học liệu số: ${plan.equipment.digital.join("; ")}

## III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN CV 5512)
${plan.activities
  .map(
    (act) => `### ${act.name}
a) Mục tiêu: ${act.objective}
b) Nội dung: ${act.content}
c) Sản phẩm: ${act.product}
d) Tổ chức thực hiện:
${act.execution}
`
  )
  .join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/materials"
              className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 -ml-1 rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              Chuẩn Công văn 5512/BGDĐT-GDTrH &bull; GDPT 2018
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Soạn Kế Hoạch Bài Dạy &amp; Trợ Lý Bóc Tách SGK Thông Minh
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hỗ trợ kéo thả file Sách Giáo Khoa (.pdf, .docx, ảnh chụp trang sách), AI tự động nhận diện bài học và xuất bản giáo án chuẩn thể thức 4 hoạt động.
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            disabled={!plan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? "Đã chép" : "Sao chép"}</span>
          </button>

          <button
            onClick={handleExportWordOfficial}
            disabled={!plan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-bold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Xuất Word (.doc chuẩn)</span>
          </button>

          <button
            onClick={() => window.print()}
            disabled={!plan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In PDF</span>
          </button>

          <button
            onClick={handleSavePlan}
            disabled={isSaving || !plan}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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

      {/* Input Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("UPLOAD_SGK")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "UPLOAD_SGK"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Tải Lên Sách Giáo Khoa (SGK) AI</span>
          <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Khuyên dùng
          </span>
        </button>

        <button
          onClick={() => setActiveTab("MANUAL_FORM")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "MANUAL_FORM"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Nhập Biểu Mẫu Sư Phạm (CV 5512)</span>
        </button>

        <button
          onClick={() => setActiveTab("PRESET_TEMPLATES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "PRESET_TEMPLATES"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1-Click Giáo Án Mẫu GDPT 2018</span>
        </button>
      </div>

      {/* Main Grid: Input / Upload Column + Preview / Editor Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* TAB 1: UPLOAD SGK PANEL */}
          {activeTab === "UPLOAD_SGK" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <FileUp className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Bóc Tách Sách Giáo Khoa</h3>
                    <p className="text-[11px] text-slate-400">PDF, Word, PPTX hoặc ảnh chụp trang sách</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Gemini 3.8 Flash Vision
                </span>
              </div>

              {/* Book Series Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn bộ sách giáo khoa:
                </label>
                <select
                  value={selectedBookSeries}
                  onChange={(e) => setSelectedBookSeries(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Kết Nối Tri Thức Với Cuộc Sống">Bộ sách: Kết Nối Tri Thức Với Cuộc Sống (NXB GDVN)</option>
                  <option value="Cánh Diều">Bộ sách: Cánh Diều (NXB ĐH Sư Phạm)</option>
                  <option value="Chân Trời Sáng Tạo">Bộ sách: Chân Trời Sáng Tạo (NXB GDVN)</option>
                  <option value="Tự động nhận diện từ tài liệu">Tự động nhận diện từ tài liệu upload</option>
                </select>
              </div>

              {/* Drag & Drop File Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-6 text-center bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer group"
              >
                <input
                  type="file"
                  id="sgk-file-input"
                  accept=".pdf,.docx,.doc,.pptx,.txt,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-white shadow-xs border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                    {imagePreviewUrl ? (
                      <ImageIcon className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Kéo thả file SGK hoặc <span className="text-blue-600 underline">bấm để chọn file</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Hỗ trợ tệp <strong>.PDF, .DOCX, .PPTX, .TXT</strong> hoặc <strong>ảnh chụp trang sách (.JPG, .PNG)</strong>
                  </p>
                </div>
              </div>

              {/* Uploaded File Info Card */}
              {file && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="p-2 rounded-xl bg-white border border-slate-200 text-blue-600 shrink-0 font-bold text-[10px]">
                      {parsedData?.fileType || "FILE"}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB &bull; {parsedData?.wordCount || 0} từ trích xuất
                      </div>
                    </div>
                  </div>
                  {isParsing || isAnalyzingSGK ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
              )}

              {/* Image Preview Thumbnail if Image */}
              {imagePreviewUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
                  <img
                    src={imagePreviewUrl}
                    alt="Trang sách giáo khoa đã tải lên"
                    className="max-h-48 object-contain"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                    Ảnh chụp trang SGK
                  </span>
                </div>
              )}

              {/* 1-Click Textbook Sample Presets */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Hoặc nạp nhanh trang SGK mẫu thực tế để thử nghiệm ngay:
                </span>
                <div className="grid grid-cols-2 gap-2 text-left">
                  {PRESET_TEXTBOOKS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPresetTextbook(preset.id)}
                      disabled={isGenerating || isAnalyzingSGK}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 text-left transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 truncate">
                        <span>{preset.icon}</span>
                        <span className="truncate">{preset.subject} {preset.grade}</span>
                      </div>
                      <div className="text-[10px] text-blue-600 font-semibold truncate mt-0.5">
                        {preset.lessonTitle}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                        {preset.bookSeries} &bull; {preset.pages}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Analysis Result Card */}
              {analysisResult && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-purple-50/50 border border-indigo-200 space-y-3 animate-in fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Kết Quả Nhận Diện Sách Giáo Khoa</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800">
                      {analysisResult.bookSeries}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-700">
                    <div>
                      <strong className="text-slate-900">Bài học: </strong>
                      <span>{analysisResult.lessonTitle}</span>
                    </div>
                    <div>
                      <strong className="text-slate-900">Môn &amp; Lớp: </strong>
                      <span>{analysisResult.subject} - Lớp {analysisResult.grade} ({analysisResult.suggestedDuration} phút)</span>
                    </div>
                    <div>
                      <strong className="text-slate-900">Yêu cầu cần đạt (YCCĐ): </strong>
                      <p className="mt-0.5 text-slate-600 leading-relaxed italic bg-white/70 p-2 rounded-lg border border-indigo-100">
                        {analysisResult.learningOutcomes}
                      </p>
                    </div>
                  </div>

                  {/* Key concepts */}
                  {analysisResult.keyConcepts && analysisResult.keyConcepts.length > 0 && (
                    <div>
                      <strong className="text-slate-900 block mb-1">Kiến thức trọng tâm bóc tách được:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1 text-[11px]">
                        {analysisResult.keyConcepts.map((concept, idx) => (
                          <li key={idx}>{concept}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => handleGeneratePlan()}
                    disabled={isGenerating}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang thiết kế Kế hoạch bài dạy 5512...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Khởi Tạo Kế Hoạch Bài Dạy Chuẩn 5512 Từ SGK Này</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANUAL FORM PANEL */}
          {activeTab === "MANUAL_FORM" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Thông tin bài dạy sư phạm</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">CV 5512</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Âm nhạc">Âm nhạc</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
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

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái phê duyệt</label>
                  <div className="grid grid-cols-3 gap-1.5 font-semibold text-[11px]">
                    <button
                      type="button"
                      onClick={() => setStatus("DRAFT")}
                      className={`py-1.5 rounded-lg border text-center cursor-pointer ${
                        status === "DRAFT" ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      Bản nháp
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("TEACHER_REVIEWED")}
                      className={`py-1.5 rounded-lg border text-center cursor-pointer ${
                        status === "TEACHER_REVIEWED" ? "bg-blue-100 border-blue-300 text-blue-900" : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      Đã xem
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("APPROVED")}
                      className={`py-1.5 rounded-lg border text-center cursor-pointer ${
                        status === "APPROVED" ? "bg-emerald-100 border-emerald-300 text-emerald-900" : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      Phê duyệt
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleGeneratePlan()}
                  disabled={isGenerating}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI đang soạn giáo án...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>AI Soạn Giáo Án Này</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PRESET TEMPLATES PANEL */}
          {activeTab === "PRESET_TEMPLATES" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Giáo án mẫu chuẩn GDPT 2018</span>
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Chuẩn 4 Hoạt động
                </span>
              </div>

              <div className="space-y-3">
                {PRESET_TEXTBOOKS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPresetTextbook(preset.id)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{preset.icon}</span>
                        <span>{preset.subject} - Khối {preset.grade}</span>
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {preset.durationMinutes} phút
                      </span>
                    </div>
                    <div className="font-bold text-xs text-blue-700 group-hover:underline">
                      {preset.lessonTitle}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {preset.learningOutcomes}
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>{preset.bookSeries}</span>
                      <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform inline-block">
                        Áp dụng ngay &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Lesson Plan Paper */}
        <div className="lg:col-span-7 space-y-6">
          {plan ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs space-y-6 font-sans">
              {/* Formal Administrative Header (Nghị định 30/2020/NĐ-CP & CV 5512) */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs">
                <div className="flex flex-col sm:flex-row justify-between gap-4 pb-3 border-b border-slate-200 text-center sm:text-left">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <div className="text-slate-500 font-medium">SỞ GD&ĐT TỈNH VĨNH LONG</div>
                    <div className="font-black text-slate-900 uppercase">TRƯỜNG THCS TÂN PHONG</div>
                    <div className="text-slate-600 italic">Tổ Chuyên Môn THCS &bull; GV: Phan Thị Ngọc Huyền</div>
                  </div>
                  <div className="space-y-0.5 text-center sm:text-right">
                    <div className="font-bold text-slate-900 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                    <div className="text-slate-700 font-semibold">Độc lập - Tự do - Hạnh phúc</div>
                    <div className="text-slate-400 italic text-[11px]">Năm học 2026 – 2027</div>
                  </div>
                </div>

                <div className="pt-3 text-center space-y-1">
                  <span className="text-[10px] font-black tracking-widest uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 inline-block">
                    Kế Hoạch Bài Dạy Chuẩn Công Văn 5512/BGDĐT-GDTrH
                  </span>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    {plan.title}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Môn: <strong className="text-slate-900">{plan.subject}</strong> &bull; Lớp:{" "}
                    <strong className="text-slate-900">{plan.grade}</strong> &bull; Thời lượng:{" "}
                    <strong className="text-slate-900">{plan.duration}</strong>
                    {selectedBookSeries && (
                      <span> &bull; Bộ sách: <strong className="text-blue-700">{selectedBookSeries}</strong></span>
                    )}
                  </p>
                </div>
              </div>

              {/* Section I: Objectives */}
              <div className="space-y-3 p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    I
                  </span>
                  <span>Mục Tiêu Bài Dạy</span>
                </h3>

                <div className="space-y-2.5 text-xs text-slate-700 pl-2">
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
              <div className="space-y-3 p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                    II
                  </span>
                  <span>Thiết Bị Dạy Học &amp; Học Liệu</span>
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
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm hoạt động</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {plan.activities.map((act) => (
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
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold cursor-pointer"
                          >
                            Viết ngắn gọn
                          </button>
                          <button
                            onClick={() => handleRegenerateActivity(act, "expand")}
                            title="Mở rộng chi tiết các bước"
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold cursor-pointer"
                          >
                            Viết chi tiết
                          </button>
                          <button
                            onClick={() => handleRegenerateActivity(act, "refresh")}
                            title="AI sinh lại hoạt động này"
                            className="p-1 rounded-md text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            title="Xóa hoạt động này"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 cursor-pointer"
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
                          <span className="font-bold text-slate-900 block mb-0.5">d) Tổ chức thực hiện (4 Bước Chuẩn Sư Phạm):</span>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-700 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                            {act.execution}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Jump / Next Steps Pipeline */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 font-medium">
                  Kế hoạch bài dạy đã sẵn sàng. Chuyển tiếp nhanh:
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/materials/slides?title=${encodeURIComponent(plan.title)}&subject=${encodeURIComponent(plan.subject)}&grade=${plan.grade}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold border border-purple-200 transition-colors"
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Tạo Slide Bài Giảng</span>
                  </Link>
                  <Link
                    href={`/materials/scorm-studio?title=${encodeURIComponent(plan.title)}&subject=${encodeURIComponent(plan.subject)}&grade=${plan.grade}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold border border-amber-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Đóng Gói SCORM 1.2</span>
                  </Link>
                  <Link
                    href={`/exams/wizard?title=${encodeURIComponent(`Kiểm tra định kỳ môn ${plan.subject} ${plan.grade}`)}&subject=${encodeURIComponent(plan.subject)}&grade=${plan.grade}&topic=${encodeURIComponent(plan.title)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold border border-blue-200 transition-colors"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Tạo Đề Thi (CV 7991)</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              <span>Chưa có dữ liệu kế hoạch bài dạy. Bấm &ldquo;Khởi Tạo Kế Hoạch Bài Dạy&rdquo; hoặc tải lên SGK để bắt đầu.</span>
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
