"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileCheck2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  Table,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  Layers,
  ShieldCheck,
  BookOpen,
  Award,
  RefreshCw,
  Eye,
  Sliders,
  FileSpreadsheet,
} from "lucide-react";
import { MathContent } from "@/components/ui/MathContent";
import { getGeminiAuthHeaders } from "@/lib/aiClient";
import katex from "katex";

export const dynamic = "force-dynamic";

interface QuestionAnswer {
  label: string;
  content: string;
  isCorrect: boolean;
}

interface QuestionItem {
  id: string;
  orderNumber: number;
  type: "SINGLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
  difficulty: "NHAN_BIET" | "THONG_HIEU" | "VAN_DUNG" | "VAN_DUNG_CAO";
  topic: string;
  learningOutcome: string;
  content: string;
  scorePoints: number;
  answers: QuestionAnswer[];
  explanation: string;
  rubric?: { step: string; points: number }[];
  subItems?: { label: string; text: string; isCorrect: boolean }[];
}

interface MatrixRow {
  topic: string;
  nhanBiet: number;
  thongHieu: number;
  vanDung: number;
  vanDungCao: number;
  totalQuestions: number;
  totalScore: number;
}

interface SpecRow {
  chapter: string;
  topic: string;
  outcome: string;
  level: string;
  questionType: string;
  questionCount: number;
  score: number;
}

const WIZARD_STEPS = [
  { id: 1, name: "Thông tin đề" },
  { id: 2, name: "Nội dung & Chủ đề" },
  { id: 3, name: "Yêu cầu cần đạt" },
  { id: 4, name: "Khung ma trận 7991" },
  { id: 5, name: "AI Khởi tạo đề" },
  { id: 6, name: "Kiểm tra & Duyệt ma trận" },
  { id: 7, name: "Xuất trọn bộ học liệu" },
];

function ExamWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLessonId = searchParams.get("lessonId") || "";

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Info
  const [title, setTitle] = useState("Kiểm tra định kỳ Giữa Học kỳ I - Môn Âm nhạc 7");
  const [subject, setSubject] = useState("Âm nhạc");
  const [grade, setGrade] = useState("7");
  const [semester, setSemester] = useState("1");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [examType, setExamType] = useState("GIUA_KY");
  const [totalScore, setTotalScore] = useState(10.0);

  // Step 2: Content Selection
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "Học hát (Khai trường, Nụ cười)",
    "Nhạc lí và Đọc nhạc (Nhịp 2/4, Gam Đô trưởng)",
    "Thưởng thức âm nhạc & Nhạc cụ (Dân ca Nam Bộ - Lý cây bông)",
  ]);
  const [newTopicInput, setNewTopicInput] = useState("");
  const [curriculumLessons, setCurriculumLessons] = useState<Array<{ title: string; chapterTitle?: string; learningOutcomes?: string }>>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  // Step 3: Learning Outcomes (YCCĐ)
  const [outcomes, setOutcomes] = useState<string[]>([
    "Hát đúng cao độ, trường độ, biểu cảm và phát âm rõ lời ca.",
    "Hiểu khái niệm nhịp 2/4, đọc đúng cao độ các bậc âm gam Đô trưởng.",
    "Sử dụng được thanh phách gõ đệm theo phách và nhịp của bài hát.",
    "Cảm thụ và nhận biết được làn điệu dân ca Nam Bộ và nhạc cụ dân tộc.",
  ]);
  const [newOutcomeInput, setNewOutcomeInput] = useState("");

  // Step 4: Matrix Ratios (% Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)
  const [ratioNhanBiet, setRatioNhanBiet] = useState(40);
  const [ratioThongHieu, setRatioThongHieu] = useState(30);
  const [ratioVanDung, setRatioVanDung] = useState(20);
  const [ratioVanDungCao, setRatioVanDungCao] = useState(10);

  // Step 5 & 6: Generated Exam Package Data
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [matrix, setMatrix] = useState<MatrixRow[]>([]);
  const [matrix7991, setMatrix7991] = useState<any[]>([]);
  const [activePreset, setActivePreset] = useState<string>("music");
  const [specification, setSpecification] = useState<SpecRow[]>([]);
  const [scoringGuide, setScoringGuide] = useState<any[]>([]);

  // Quality Control & Review
  const [status, setStatus] = useState<"DRAFT" | "TEACHER_REVIEWED" | "APPROVED">("APPROVED");
  const [reported, setReported] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reviewTab, setReviewTab] = useState<"QUESTIONS" | "MATRIX" | "SPEC" | "GUIDE">("QUESTIONS");
  const [selectedVersion, setSelectedVersion] = useState("GOC");

  // Consistency Guard Warnings
  const [consistencyWarnings, setConsistencyWarnings] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [createdExamId, setCreatedExamId] = useState<string | null>(null);

  // Automatically recalculate 2D Matrix from Question items whenever questions change!
  useEffect(() => {
    if (questions.length === 0) return;

    // Recalculate matrix by topic
    const topicMap: Record<string, { nb: number; th: number; vd: number; vdc: number; score: number }> = {};

    let totalCalculatedScore = 0;
    const warnings: string[] = [];

    questions.forEach((q, idx) => {
      const top = q.topic || "Kiến thức chung";
      if (!topicMap[top]) {
        topicMap[top] = { nb: 0, th: 0, vd: 0, vdc: 0, score: 0 };
      }

      const pts = q.scorePoints || (q.type === "ESSAY" ? 3.0 : q.type === "TRUE_FALSE" ? 1.5 : 1.0);
      totalCalculatedScore += pts;

      if (q.difficulty === "NHAN_BIET") topicMap[top].nb++;
      else if (q.difficulty === "THONG_HIEU") topicMap[top].th++;
      else if (q.difficulty === "VAN_DUNG") topicMap[top].vd++;
      else if (q.difficulty === "VAN_DUNG_CAO") topicMap[top].vdc++;

      topicMap[top].score += pts;

      // Validate Answers
      if (q.type === "SINGLE_CHOICE") {
        if (!q.answers || q.answers.length === 0) {
          warnings.push(`Câu ${idx + 1} chưa có phương án trả lời.`);
        } else if (!q.answers.some((a) => a.isCorrect)) {
          warnings.push(`Câu ${idx + 1} chưa được gắn đáp án đúng.`);
        }
      }
    });

    totalCalculatedScore = Math.round(totalCalculatedScore * 10) / 10;
    if (Math.abs(totalCalculatedScore - totalScore) > 0.05) {
      warnings.push(
        `Tổng điểm các câu hỏi hiện tại (${totalCalculatedScore}đ) chưa khớp với Thang điểm chuẩn (${totalScore}đ). Vui lòng điều chỉnh lại điểm câu hỏi.`
      );
    }

    setConsistencyWarnings(warnings);

    // Format new matrix rows
    const newMatrixRows: MatrixRow[] = Object.keys(topicMap).map((top) => {
      const entry = topicMap[top];
      const count = entry.nb + entry.th + entry.vd + entry.vdc;
      return {
        topic: top,
        nhanBiet: entry.nb,
        thongHieu: entry.th,
        vanDung: entry.vd,
        vanDungCao: entry.vdc,
        totalQuestions: count,
        totalScore: Math.round(entry.score * 10) / 10,
      };
    });

    setMatrix(newMatrixRows);
  }, [questions, totalScore]);

  // Initial load: generate default package or load preset from query params
  useEffect(() => {
    const sParam = searchParams.get("subject");
    const gParam = searchParams.get("grade");
    const tParam = searchParams.get("title");
    const topParam = searchParams.get("topic");

    if (sParam) {
      if (sParam.toLowerCase().includes("toán")) {
        handleLoadPreset("math");
        return;
      } else if (sParam.toLowerCase().includes("khoa học") || sParam.toLowerCase().includes("khtn")) {
        handleLoadPreset("khtn");
        return;
      } else if (sParam.toLowerCase().includes("văn") || sParam.toLowerCase().includes("ngữ")) {
        handleLoadPreset("literature");
        return;
      }
    }
    if (gParam) setGrade(gParam);
    if (tParam) setTitle(tParam);
    if (topParam) setSelectedTopics([topParam]);

    handleRunAIGeneration();
  }, []);

  // Tải danh mục bài học phân phối chương trình GDPT 2018 theo môn & khối
  useEffect(() => {
    let isMounted = true;
    const fetchCurriculum = async () => {
      setLoadingCurriculum(true);
      try {
        let code = "MUSIC";
        const sLower = subject.toLowerCase();
        if (sLower.includes("toán")) code = "MATH";
        else if (sLower.includes("khoa học") || sLower.includes("khtn")) code = "SCIENCE";
        else if (sLower.includes("văn") || sLower.includes("ngữ")) code = "LITERATURE";

        const res = await fetch(`/api/lessons?subject=${code}&grade=${grade}`);
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setCurriculumLessons(
            data.map((item: any) => ({
              title: item.title,
              chapterTitle: item.chapter?.title || item.chapterTitle,
              learningOutcomes: item.learningOutcomes,
            }))
          );
        }
      } catch (err) {
        console.error("Lỗi tải chương trình bài học:", err);
      } finally {
        if (isMounted) setLoadingCurriculum(false);
      }
    };
    fetchCurriculum();
    return () => {
      isMounted = false;
    };
  }, [subject, grade]);

  const handleRunAIGeneration = async () => {
    setIsGenerating(true);
    setGenerateProgress(15);

    try {
      const stepInterval = setInterval(() => {
        setGenerateProgress((prev) => (prev < 90 ? prev + 25 : prev));
      }, 300);

      const res = await fetch("/api/exams/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getGeminiAuthHeaders() },
        body: JSON.stringify({
          action: "GENERATE_PACKAGE",
          params: {
            title,
            subject,
            grade: parseInt(grade, 10),
            semester: parseInt(semester, 10),
            durationMinutes,
            totalScore,
            examType,
            topics: selectedTopics,
            learningOutcomes: outcomes,
            matrixRatio: {
              nhanBiet: ratioNhanBiet,
              thongHieu: ratioThongHieu,
              vanDung: ratioVanDung,
              vanDungCao: ratioVanDungCao,
            },
          },
        }),
      });

      clearInterval(stepInterval);
      setGenerateProgress(100);

      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setMatrix(data.matrix || []);
        if (data.matrix7991) setMatrix7991(data.matrix7991);
        setSpecification(data.specification || []);
        setScoringGuide(data.scoringGuide || []);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi AI khởi tạo đề kiểm tra 7991");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadPreset = async (presetKey: "music6" | "music7" | "music8" | "music9" | "math" | "khtn" | "literature" | "music") => {
    setActivePreset(presetKey);
    let pTitle = "";
    let pSubject = "Âm nhạc";
    let pGrade = "7";
    let pSemester = "1";
    let pDuration = 45;
    let pTopics: string[] = [];
    let pOutcomes: string[] = [];

    if (presetKey === "music6") {
      pTitle = "Kiểm tra định kỳ Giữa Học kỳ I - Môn Âm nhạc 6";
      pSubject = "Âm nhạc";
      pGrade = "6";
      pSemester = "1";
      pDuration = 45;
      pTopics = [
        "Hát: Mùa khai trường (Phan Trần Bảng)",
        "Nhạc lí: 4 thuộc tính cơ bản của âm thanh & Khuông nhạc khóa Sol",
        "Thưởng thức âm nhạc & Nhạc cụ: Đàn Bầu Việt Nam",
      ];
      pOutcomes = [
        "Hát đúng cao độ, trường độ, phong thái rộn ràng vui tươi ngày tựu trường.",
        "Nhận biết 4 thuộc tính của âm thanh và vị trí nốt Sol trên khuông nhạc.",
        "Biết gõ đệm thanh phách nhịp 2/4 và nhận biết cây Đàn Bầu Việt Nam.",
      ];
    } else if (presetKey === "music8") {
      pTitle = "Kiểm tra định kỳ Giữa Học kỳ I - Môn Âm nhạc 8";
      pSubject = "Âm nhạc";
      pGrade = "8";
      pSemester = "1";
      pDuration = 45;
      pTopics = [
        "Hát: Mùa thu ngày khai trường (Vũ Trọng Tường)",
        "Nhạc lí & Đọc nhạc: Gam thứ, Giọng La thứ (Am) & Đọc nhạc số 1",
        "Thưởng thức âm nhạc: Dân ca Quan họ Bắc Ninh & Kèn Melodica",
      ];
      pOutcomes = [
        "Hát đúng tính chất rộn ràng, tự hào của bài hát Mùa thu ngày khai trường.",
        "Hiểu cấu tạo gam thứ, nhận biết âm chủ và giọng La thứ tự nhiên.",
        "Biết đọc nhạc và thực hành hòa tấu kèn Melodica / gõ phách.",
      ];
    } else if (presetKey === "music9") {
      pTitle = "Kiểm tra định kỳ Giữa Học kỳ I - Môn Âm nhạc 9";
      pSubject = "Âm nhạc";
      pGrade = "9";
      pSemester = "1";
      pDuration = 45;
      pTopics = [
        "Hát: Hát hợp xướng thiếu nhi đa bè",
        "Nhạc lí: Giọng Son trưởng (G) & Giọng Mi thứ (Em)",
        "Thưởng thức âm nhạc: Danh nhân âm nhạc (Mozart, Beethoven) & Ca khúc cách mạng",
      ];
      pOutcomes = [
        "Biết hát bè đơn giản (bè hòa âm hoặc bè đuổi Canon) với sắc thái hòa quyện.",
        "Xác định hóa biểu 1 dấu thăng giọng Son trưởng và giọng Mi thứ song song.",
        "Trình bày được nét đặc sắc trong cuộc đời, tác phẩm của danh nhân Mozart, Beethoven.",
      ];
    } else if (presetKey === "math") {
      pTitle = "Kiểm tra định kỳ Giữa Học kỳ II - Môn Toán học 7";
      pSubject = "Toán học";
      pGrade = "7";
      pSemester = "2";
      pDuration = 60;
      pTopics = ["Tỉ lệ thức và tính chất cơ bản", "Dãy tỉ số bằng nhau", "Toán đố thực tế chia tỉ lệ thuận"];
      pOutcomes = ["Nhận biết tỉ lệ thức và các tính chất cơ bản ad = bc", "Áp dụng dãy tỉ số bằng nhau tìm các số", "Giải toán thực tế về năng suất lao động"];
    } else if (presetKey === "khtn") {
      pTitle = "Kiểm tra định kỳ Giữa Học kỳ II - Môn Khoa học tự nhiên 7";
      pSubject = "Khoa học tự nhiên";
      pGrade = "7";
      pSemester = "2";
      pDuration = 45;
      pTopics = ["Trao đổi chất và chuyển hóa năng lượng", "Quang hợp ở thực vật", "Hô hấp tế bào"];
      pOutcomes = ["Nêu khái niệm và phương trình quang hợp", "Phân tích các yếu tố ảnh hưởng đến hô hấp tế bào", "Vận dụng kiến thức bảo quản nông sản"];
    } else if (presetKey === "literature") {
      pTitle = "Kiểm tra định kỳ Giữa Học kỳ I - Môn Ngữ văn 8";
      pSubject = "Ngữ văn";
      pGrade = "8";
      pSemester = "1";
      pDuration = 90;
      pTopics = ["Thơ Thất ngôn bát cú Đường luật (Qua Đèo Ngang)", "Thực hành tiếng Việt: Từ tượng hình, từ tượng thanh", "Đoạn văn cảm thụ & Nghị luận xã hội"];
      pOutcomes = ["Nhận biết đặc điểm thể thơ Thất ngôn bát cú (niêm, luật, vần, đối)", "Phân tích tâm trạng bà Huyện Thanh Quan", "Viết đoạn văn ngắn về tình yêu quê hương đất nước"];
    } else {
      // music7 or music default
      pTitle = "Kiểm tra định kỳ Giữa Học kỳ I - Môn Âm nhạc 7";
      pSubject = "Âm nhạc";
      pGrade = "7";
      pSemester = "1";
      pDuration = 45;
      pTopics = ["Học hát (Khai trường, Nụ cười)", "Nhạc lí và Đọc nhạc (Dấu hóa, Nhịp 2/4, Nhịp 4/4)", "Thưởng thức âm nhạc & Nhạc cụ: Đờn ca tài tử Nam Bộ & Song loan"];
      pOutcomes = ["Hát đúng cao độ, trường độ, biểu cảm và rõ lời ca.", "Hiểu tác dụng dấu hóa (#, b, ♮), đọc đúng cao độ các bậc âm gam Đô trưởng.", "Sử dụng được thanh phách, song loan gõ đệm theo phách và nhịp của bài hát."];
    }

    setTitle(pTitle);
    setSubject(pSubject);
    setGrade(pGrade);
    setSemester(pSemester);
    setDurationMinutes(pDuration);
    setSelectedTopics(pTopics);
    setOutcomes(pOutcomes);

    setIsGenerating(true);
    setGenerateProgress(30);

    try {
      const res = await fetch("/api/exams/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getGeminiAuthHeaders() },
        body: JSON.stringify({
          action: "GENERATE_PACKAGE",
          params: {
            title: pTitle,
            subject: pSubject,
            grade: parseInt(pGrade, 10),
            semester: parseInt(pSemester, 10),
            durationMinutes: pDuration,
            totalScore: 10.0,
            examType: "GIUA_KY",
            topics: pTopics,
            learningOutcomes: pOutcomes,
          },
        }),
      });

      setGenerateProgress(100);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setMatrix(data.matrix || []);
        if (data.matrix7991) setMatrix7991(data.matrix7991);
        setSpecification(data.specification || []);
        setScoringGuide(data.scoringGuide || []);
        setCurrentStep(6);
        setReviewTab("QUESTIONS");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải bộ đề mẫu 7991");
    } finally {
      setIsGenerating(false);
    }
  };

  // Question editing handlers
  const handleUpdateQuestionScore = (index: number, newScore: number) => {
    const updated = [...questions];
    updated[index].scorePoints = newScore;
    setQuestions(updated);
  };

  const handleUpdateQuestionDifficulty = (index: number, newDiff: any) => {
    const updated = [...questions];
    updated[index].difficulty = newDiff;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, idx) => idx !== index);
    updated.forEach((q, idx) => (q.orderNumber = idx + 1));
    setQuestions(updated);
  };

  const handleSaveExamToDatabase = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/exams/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getGeminiAuthHeaders() },
        body: JSON.stringify({
          action: "SAVE_EXAM_PACKAGE",
          params: {
            title,
            subject,
            gradeLevel: parseInt(grade, 10),
            durationMinutes,
            totalScore,
            examType,
            lessonId: initialLessonId || undefined,
            questions,
            matrix,
            specification,
            scoringGuide,
            status,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.examId) {
        setCreatedExamId(data.examId);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(data.error || "Không thể lưu đề");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi lưu đề kiểm tra");
    } finally {
      setIsSaving(false);
    }
  };

  // Export Full Package to Microsoft Word (.doc) with KaTeX
  const handleExportWordFullPackage = () => {
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
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; color: #000; margin: 2cm; }
    h1 { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 4px; }
    h2 { font-size: 14pt; font-weight: bold; margin-top: 20px; border-bottom: 1.5pt solid #000; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 12px; }
    th, td { border: 1pt solid #000; padding: 6px 8px; font-size: 11pt; text-align: left; }
    th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
    .header-box { width: 100%; margin-bottom: 24px; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <!-- HEADER -->
  <table class="header-box" style="border: none;">
    <tr style="border: none;">
      <td style="border: none; width: 45%; text-align: center;">
        SỞ GD&ĐT TỈNH VĨNH LONG<br>
        <strong>TRƯỜNG THCS TÂN PHONG</strong>
      </td>
      <td style="border: none; width: 55%; text-align: center;">
        <strong>ĐỀ KIỂM TRA ĐỊNH KỲ - GDPT 2018</strong><br>
        NĂM HỌC 2026 - 2027<br>
        <em>Môn: ${subject} - Lớp ${grade}</em>
        <br><span style="font-size: 11px;">GVBM: Phan Thị Ngọc Huyền</span>
      </td>
    </tr>
  </table>

  <h1>${title}</h1>
  <p style="text-align: center; margin-bottom: 24px;">
    <em>Thời gian làm bài: ${durationMinutes} phút (Không kể thời gian phát đề) - Thang điểm: ${totalScore} điểm</em>
  </p>

  <!-- PHẦN I: MA TRẬN ĐỀ KIỂM TRA THEO CÔNG VĂN 7991 -->
  <h2>PHẦN I. MA TRẬN ĐỀ KIỂM TRA (ĐỊNH HƯỚNG CÔNG VĂN 7991/BGDĐT-GDTrH)</h2>
  <table>
    <thead>
      <tr>
        <th rowspan="2">TT</th>
        <th rowspan="2">Chủ đề / Đơn vị kiến thức</th>
        <th colspan="4">Mức độ nhận thức (Số câu)</th>
        <th rowspan="2">Tổng số câu</th>
        <th rowspan="2">Tổng điểm</th>
      </tr>
      <tr>
        <th>Nhận biết</th>
        <th>Thông hiểu</th>
        <th>Vận dụng</th>
        <th>Vận dụng cao</th>
      </tr>
    </thead>
    <tbody>
      ${matrix
        .map(
          (m, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>${m.topic}</td>
        <td style="text-align: center;">${m.nhanBiet}</td>
        <td style="text-align: center;">${m.thongHieu}</td>
        <td style="text-align: center;">${m.vanDung}</td>
        <td style="text-align: center;">${m.vanDungCao}</td>
        <td style="text-align: center; font-weight: bold;">${m.totalQuestions}</td>
        <td style="text-align: center; font-weight: bold;">${m.totalScore}đ</td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <!-- PHẦN II: BẢN ĐẶC TẢ ĐỀ KIỂM TRA -->
  <h2>PHẦN II. BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA THEO CÔNG VĂN 7991</h2>
  <table>
    <thead>
      <tr>
        <th>TT</th>
        <th>Chủ đề</th>
        <th>Yêu cầu cần đạt</th>
        <th>Mức độ</th>
        <th>Dạng câu hỏi</th>
        <th>Số câu</th>
        <th>Điểm</th>
      </tr>
    </thead>
    <tbody>
      ${specification
        .map(
          (s, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>${s.topic}</td>
        <td>${renderMath(s.outcome)}</td>
        <td style="text-align: center;">${s.level}</td>
        <td style="text-align: center;">${s.questionType}</td>
        <td style="text-align: center;">${s.questionCount}</td>
        <td style="text-align: center;">${s.score}đ</td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- PHẦN III: NỘI DUNG ĐỀ KIỂM TRA (MÃ ĐỀ 101) -->
  <h2>PHẦN III. ĐỀ KIỂM TRA CHÍNH THỨC (MÃ ĐỀ GỐC - 101)</h2>

  <!-- KHUNG THÔNG TIN HỌC SINH -->
  <table style="width: 100%; border: 1.5pt solid #000; margin-bottom: 16px; margin-top: 12px;">
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
      <p><strong>Câu ${idx + 1} (${q.scorePoints} điểm) [${q.difficulty}]:</strong> ${renderMath(q.content)}</p>
      ${
        q.type === "SINGLE_CHOICE"
          ? `
      <div style="margin-left: 20px;">
        ${(q.answers || [])
          .map((a, aIdx) => `<div><strong>${String.fromCharCode(65 + aIdx)}.</strong> ${renderMath(a.content)}</div>`)
          .join("")}
      </div>
      `
          : q.type === "TRUE_FALSE" && q.subItems
          ? `
      <div style="margin-left: 20px;">
        ${q.subItems
          .map((sub) => `<div>${sub.label}) ${renderMath(sub.text)}: <em>[ Đúng / Sai ]</em></div>`)
          .join("")}
      </div>
      `
          : q.type === "SHORT_ANSWER"
          ? `<p style="margin-left: 20px; color: #555;"><em>Học sinh ghi kết quả: ..........................................................................</em></p>`
          : `<p style="margin-left: 20px; color: #555;"><em>(Học sinh trình bày lời giải chi tiết vào giấy làm bài)</em></p>`
      }
    </div>
    `
      )
      .join("")}
  </div>

  <div class="page-break"></div>

  <!-- PHẦN IV: ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM BAREM CHI TIẾT -->
  <h2>PHẦN IV. ĐÁP ÁN &amp; HƯỚNG DẪN CHẤM (BAREM ĐIỂM CHI TIẾT TỪNG BƯỚC)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">Câu</th>
        <th style="width: 25%;">Đáp án đúng</th>
        <th style="width: 50%;">Nội dung / Các bước giải chi tiết</th>
        <th style="width: 15%;">Điểm</th>
      </tr>
    </thead>
    <tbody>
      ${questions
        .map((q, idx) => {
          const correctAns = (q.answers || []).find((a) => a.isCorrect)?.label || "Tự luận";
          return `
      <tr>
        <td style="text-align: center; font-weight: bold;">Câu ${idx + 1}</td>
        <td style="text-align: center; font-weight: bold; color: #0066cc;">${correctAns}</td>
        <td>
          <p>${renderMath(q.explanation)}</p>
          ${
            q.rubric && q.rubric.length > 0
              ? `
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            ${q.rubric
              .map((r) => `<li><strong>${r.points}đ:</strong> ${renderMath(r.step)}</li>`)
              .join("")}
          </ul>
          `
              : ""
          }
        </td>
        <td style="text-align: center; font-weight: bold;">${q.scorePoints}đ</td>
      </tr>
      `;
        })
        .join("")}
    </tbody>
  </table>

  <!-- KHUNG KÝ DUYỆT CHUYÊN MÔN -->
  <table style="width: 100%; border: none; margin-top: 35px;">
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
        Phan Thị Ngọc Huyền
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const blob = new Blob([docContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bo_De_Kiem_Tra_7991_${title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/exams"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Exam Wizard – Định Hướng Công Văn 7991/BGDĐT-GDTrH
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-full border border-indigo-200">
                Chuẩn GDPT 2018
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quy trình 7 bước tạo đề kiểm tra, ma trận 2 chiều tự động đồng bộ, bản đặc tả và barem điểm từng bước
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
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
            onClick={handleExportWordFullPackage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Xuất Word (.doc)
          </button>

          <button
            onClick={handleSaveExamToDatabase}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-xs font-semibold transition-all disabled:opacity-50"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {savedSuccess ? "Đã lưu vào CSDL!" : isSaving ? "Đang lưu..." : "Lưu Đề Kiểm Tra"}
          </button>
        </div>
      </div>

      {/* 1-Click Presets Bar for Judges & Teachers */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/70 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Bộ đề mẫu thực tế chuẩn Công văn 7991 (1-Click Presets)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nhấp để tải tức thì hồ sơ đề thi hoàn chỉnh 4 phần, ma trận 2 chiều và barem chi tiết từng môn:
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            Dành cho Giám khảo &amp; Giáo viên trải nghiệm
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleLoadPreset("music6")}
            disabled={isGenerating}
            className={`p-3 rounded-xl border text-left transition-all relative group flex flex-col justify-between ${
              activePreset === "music6"
                ? "bg-white dark:bg-slate-800 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                : "bg-white/80 dark:bg-slate-800/80 hover:bg-white border-slate-200 dark:border-slate-700 hover:border-indigo-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">🎵 Âm nhạc 6</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-600 rounded font-medium">45 phút</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 line-clamp-1">
                Mùa khai trường &amp; Đàn Bầu
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">7 câu • Đủ 4 dạng thức CV 7991</p>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-indigo-600 font-semibold">
              <span>Nạp ngay đề &amp; ma trận</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => handleLoadPreset("music7")}
            disabled={isGenerating}
            className={`p-3 rounded-xl border text-left transition-all relative group flex flex-col justify-between ${
              activePreset === "music7" || activePreset === "music"
                ? "bg-white dark:bg-slate-800 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                : "bg-white/80 dark:bg-slate-800/80 hover:bg-white border-slate-200 dark:border-slate-700 hover:border-indigo-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">🎵 Âm nhạc 7</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-600 rounded font-medium">45 phút</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 line-clamp-1">
                Hát Nụ cười, Dấu hóa &amp; Nhạc lí
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">7 câu • Rubric thực hành hát</p>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-indigo-600 font-semibold">
              <span>Nạp ngay đề &amp; ma trận</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => handleLoadPreset("music8")}
            disabled={isGenerating}
            className={`p-3 rounded-xl border text-left transition-all relative group flex flex-col justify-between ${
              activePreset === "music8"
                ? "bg-white dark:bg-slate-800 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                : "bg-white/80 dark:bg-slate-800/80 hover:bg-white border-slate-200 dark:border-slate-700 hover:border-indigo-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">🎵 Âm nhạc 8</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-600 rounded font-medium">45 phút</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 line-clamp-1">
                Khai trường &amp; Giọng La thứ
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">7 câu • Kèn Melodica &amp; Quan họ</p>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-indigo-600 font-semibold">
              <span>Nạp ngay đề &amp; ma trận</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => handleLoadPreset("music9")}
            disabled={isGenerating}
            className={`p-3 rounded-xl border text-left transition-all relative group flex flex-col justify-between ${
              activePreset === "music9"
                ? "bg-white dark:bg-slate-800 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                : "bg-white/80 dark:bg-slate-800/80 hover:bg-white border-slate-200 dark:border-slate-700 hover:border-indigo-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">🎵 Âm nhạc 9</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-600 rounded font-medium">45 phút</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 line-clamp-1">
                Hợp xướng &amp; Giọng Son trưởng
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">7 câu • Hòa âm đa bè Mozart</p>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-indigo-600 font-semibold">
              <span>Nạp ngay đề &amp; ma trận</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* 7-Step Horizontal Wizard Stepper */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {WIZARD_STEPS.map((st) => {
            const isActive = currentStep === st.id;
            const isCompleted = currentStep > st.id;
            return (
              <button
                key={st.id}
                onClick={() => setCurrentStep(st.id)}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isActive
                    ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-sm ring-1 ring-blue-500/20"
                    : isCompleted
                    ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>Bước {st.id}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  ) : null}
                </div>
                <span className="text-xs font-semibold mt-1 truncate">{st.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: GENERAL INFO */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Bước 1 – Thông Tin Đề Kiểm Tra</h2>
            <p className="text-xs text-slate-500">Khai báo cấu hình thông tin định danh cho đề kiểm tra định kỳ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên bài kiểm tra
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Môn học</label>
              <select
                value={subject}
                onChange={(e) => {
                  const val = e.target.value;
                  setSubject(val);
                  if (val === "Âm nhạc") {
                    setSelectedTopics([
                      "Học hát (Khai trường, Nụ cười)",
                      "Nhạc lí và Đọc nhạc (Nhịp 2/4, Gam Đô trưởng)",
                      "Thưởng thức âm nhạc & Nhạc cụ (Dân ca Nam Bộ - Lý cây bông)",
                    ]);
                    setOutcomes([
                      "Hát đúng cao độ, trường độ, biểu cảm và rõ lời ca.",
                      "Hiểu khái niệm nhịp 2/4, đọc đúng cao độ các bậc âm gam Đô trưởng.",
                      "Sử dụng được thanh phách gõ đệm theo phách và nhịp của bài hát.",
                      "Cảm thụ và nhận biết được làn điệu dân ca Nam Bộ và nhạc cụ dân tộc.",
                    ]);
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Học kỳ</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
              >
                <option value="1">Học kỳ I</option>
                <option value="2">Học kỳ II</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Thời lượng làm bài
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
              >
                <option value={15}>15 phút (Kiểm tra thường xuyên)</option>
                <option value={45}>45 phút (1 tiết)</option>
                <option value={60}>60 phút</option>
                <option value={90}>90 phút (Học kỳ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hình thức đánh giá
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
              >
                <option value="THUONG_XUYEN">Đánh giá thường xuyên</option>
                <option value="GIUA_KY">Đánh giá giữa kỳ</option>
                <option value="CUOI_KY">Đánh giá cuối kỳ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Thang điểm chuẩn
              </label>
              <input
                type="number"
                step="0.5"
                value={totalScore}
                onChange={(e) => setTotalScore(parseFloat(e.target.value) || 10.0)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Tiếp tục: Chọn nội dung <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CONTENT & CURRICULUM SELECTION */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Bước 2 – Phạm Vi Nội Dung &amp; Chủ Đề
            </h2>
            <p className="text-xs text-slate-500">
              Chọn một hoặc nhiều bài học / chuyên đề từ chương trình GDPT 2018
            </p>
          </div>

          {/* Gợi ý bài học từ chương trình GDPT 2018 */}
          {curriculumLessons.length > 0 && (
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Gợi ý bài học từ Chương trình GDPT 2018 ({subject} Lớp {grade})
                </span>
                <span className="text-[11px] text-indigo-600 font-medium">Nhấp để chọn / bỏ chọn</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {curriculumLessons.map((item, idx) => {
                  const isSelected = selectedTopics.includes(item.title);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTopics(selectedTopics.filter((t) => t !== item.title));
                        } else {
                          setSelectedTopics([...selectedTopics, item.title]);
                          if (item.learningOutcomes && !outcomes.includes(item.learningOutcomes)) {
                            setOutcomes([...outcomes, item.learningOutcomes]);
                          }
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-white"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-indigo-400"}`} />
                      <span className="truncate max-w-xs">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTopicInput.trim()) {
                    setSelectedTopics([...selectedTopics, newTopicInput.trim()]);
                    setNewTopicInput("");
                  }
                }}
                placeholder="Thêm bài học / chuyên đề kiểm tra..."
                className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={() => {
                  if (newTopicInput.trim()) {
                    setSelectedTopics([...selectedTopics, newTopicInput.trim()]);
                    setNewTopicInput("");
                  }
                }}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {selectedTopics.map((top, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{top}</span>
                  </div>
                  <button
                    onClick={() => setSelectedTopics(selectedTopics.filter((_, i) => i !== idx))}
                    className="p-1 hover:bg-rose-100 text-rose-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Quay lại
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Tiếp tục: Yêu cầu cần đạt <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LEARNING OUTCOMES (YCCĐ) */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Bước 3 – Yêu Cầu Cần Đạt (Learning Outcomes)
            </h2>
            <p className="text-xs text-slate-500">
              Kiểm tra và tùy chỉnh các YCCĐ tương ứng với ma trận và bản đặc tả Công văn 7991
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newOutcomeInput}
                onChange={(e) => setNewOutcomeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newOutcomeInput.trim()) {
                    setOutcomes([...outcomes, newOutcomeInput.trim()]);
                    setNewOutcomeInput("");
                  }
                }}
                placeholder="Thêm yêu cầu cần đạt mới..."
                className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={() => {
                  if (newOutcomeInput.trim()) {
                    setOutcomes([...outcomes, newOutcomeInput.trim()]);
                    setNewOutcomeInput("");
                  }
                }}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {outcomes.map((out, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <input
                      type="text"
                      value={out}
                      onChange={(e) => {
                        const updated = [...outcomes];
                        updated[idx] = e.target.value;
                        setOutcomes(updated);
                      }}
                      className="w-full text-xs bg-transparent border-0 p-0 text-slate-800 dark:text-slate-200 font-medium focus:ring-0"
                    />
                  </div>
                  <button
                    onClick={() => setOutcomes(outcomes.filter((_, i) => i !== idx))}
                    className="p-1 hover:bg-rose-100 text-rose-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Quay lại
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Tiếp tục: Cấu hình ma trận <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: MATRIX RATIO CONFIGURATION */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Bước 4 – Cấu Hình Tỉ Lệ Ma Trận Đề Kiểm Tra (CV 7991)
            </h2>
            <p className="text-xs text-slate-500">
              Thiết lập tỉ lệ % các mức độ nhận thức (Tổng cộng: 100%) và cơ cấu 4 dạng câu hỏi
            </p>
          </div>

          {/* Ratio sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Nhận biết</span>
                <span className="text-blue-600 font-extrabold">{ratioNhanBiet}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={ratioNhanBiet}
                onChange={(e) => setRatioNhanBiet(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">Tái hiện kiến thức, định nghĩa, nhận dạng</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Thông hiểu</span>
                <span className="text-emerald-600 font-extrabold">{ratioThongHieu}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={ratioThongHieu}
                onChange={(e) => setRatioThongHieu(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">Giải thích, suy luận trực tiếp, phân biệt</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Vận dụng</span>
                <span className="text-amber-600 font-extrabold">{ratioVanDung}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={ratioVanDung}
                onChange={(e) => setRatioVanDung(parseInt(e.target.value, 10))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">Vận dụng giải bài tập tình huống thực tế</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Vận dụng cao</span>
                <span className="text-rose-600 font-extrabold">{ratioVanDungCao}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={ratioVanDungCao}
                onChange={(e) => setRatioVanDungCao(parseInt(e.target.value, 10))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">Bài toán thực tiễn phức hợp, phân loại điểm 10</span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
              ratioNhanBiet + ratioThongHieu + ratioVanDung + ratioVanDungCao === 100
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300"
            }`}
          >
            <span>
              Tổng tỉ lệ ma trận:{" "}
              <strong>{ratioNhanBiet + ratioThongHieu + ratioVanDung + ratioVanDungCao}%</strong>
            </span>
            <span>
              {ratioNhanBiet + ratioThongHieu + ratioVanDung + ratioVanDungCao === 100
                ? "✓ Tỉ lệ chuẩn 100%"
                : "⚠️ Tổng các mức độ nên bằng 100%"}
            </span>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Quay lại
            </button>
            <button
              onClick={() => {
                setCurrentStep(5);
                handleRunAIGeneration();
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Bắt đầu AI Sinh Đề &amp; Ma Trận <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: AI GENERATION IN PROGRESS */}
      {currentStep === 5 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center animate-pulse shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Đang Thiết Lập Bộ Đề Kiểm Tra Chuẩn 7991
            </h2>
            <p className="text-xs text-slate-500">
              Đang phân tích YCCĐ, dựng ma trận 2 chiều, biên soạn câu hỏi và thiết lập barem chấm điểm...
            </p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${generateProgress}%` }}
            />
          </div>

          <div className="text-xs text-slate-400 font-medium">{generateProgress}% hoàn thành</div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => setCurrentStep(6)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              Xem Kết Quả Đề Kiểm Tra &amp; Ma Trận (Bước 6)
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: REVIEW QUESTIONS, 2D MATRIX, SPECIFICATION & CONSISTENCY GUARD */}
      {currentStep === 6 && (
        <div className="space-y-6">
          {/* Consistency Guard Warnings Banner */}
          {consistencyWarnings.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                Hệ thống Cảnh báo Tính nhất quán (Consistency Guard):
              </div>
              <ul className="list-disc list-inside text-amber-700 dark:text-amber-400 space-y-1 pl-2">
                {consistencyWarnings.map((warn, wIdx) => (
                  <li key={wIdx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Review Tabs Navigation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReviewTab("QUESTIONS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  reviewTab === "QUESTIONS"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                1. Đề thi &amp; 4 Mã đề ({questions.length} câu)
              </button>
              <button
                onClick={() => setReviewTab("MATRIX")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  reviewTab === "MATRIX"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                2. Ma trận đề 2 chiều (Tự động đồng bộ)
              </button>
              <button
                onClick={() => setReviewTab("SPEC")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  reviewTab === "SPEC"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                3. Bản đặc tả chi tiết
              </button>
              <button
                onClick={() => setReviewTab("GUIDE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  reviewTab === "GUIDE"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                4. Đáp án &amp; Barem chấm từng bước
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(7)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Chuyển sang Bước 7: Xuất tài liệu <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TAB 1: QUESTIONS REVIEW */}
          {reviewTab === "QUESTIONS" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Nội dung Đề thi chính thức &amp; Trộn mã đề
                  </h3>
                  <div className="flex items-center gap-1">
                    {["GOC", "101", "102", "103", "104"].map((ver) => (
                      <button
                        key={ver}
                        onClick={() => setSelectedVersion(ver)}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                          selectedVersion === ver
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {ver === "GOC" ? "Đề gốc" : `Mã ${ver}`}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="text-xs font-bold text-blue-600">
                  Tổng điểm: {questions.reduce((sum, q) => sum + (q.scorePoints || 1), 0)} / {totalScore} điểm
                </span>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-blue-600">Câu {idx + 1}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                          {q.type === "SINGLE_CHOICE"
                            ? "Trắc nghiệm 1 ĐA"
                            : q.type === "TRUE_FALSE"
                            ? "Đúng / Sai"
                            : q.type === "SHORT_ANSWER"
                            ? "Trả lời ngắn"
                            : "Tự luận"}
                        </span>
                        <select
                          value={q.difficulty}
                          onChange={(e) => handleUpdateQuestionDifficulty(idx, e.target.value)}
                          className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1 font-semibold"
                        >
                          <option value="NHAN_BIET">Nhận biết</option>
                          <option value="THONG_HIEU">Thông hiểu</option>
                          <option value="VAN_DUNG">Vận dụng</option>
                          <option value="VAN_DUNG_CAO">Vận dụng cao</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-slate-400">Điểm:</span>
                          <input
                            type="number"
                            step="0.25"
                            value={q.scorePoints}
                            onChange={(e) => handleUpdateQuestionScore(idx, parseFloat(e.target.value) || 0)}
                            className="w-16 text-xs text-center font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(idx)}
                          className="p-1 hover:bg-rose-100 text-rose-500 rounded"
                          title="Xóa câu hỏi này khỏi đề thi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                      <MathContent content={q.content} />
                    </div>

                    {/* Answers Section */}
                    {q.type === "SINGLE_CHOICE" && q.answers && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.answers.map((ans, aIdx) => (
                          <div
                            key={aIdx}
                            className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                              ans.isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200 font-bold"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span>
                              <strong className="mr-1.5">{String.fromCharCode(65 + aIdx)}.</strong>
                              <MathContent content={ans.content} />
                            </span>
                            {ans.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === "TRUE_FALSE" && q.subItems && (
                      <div className="space-y-1.5 pt-1">
                        {q.subItems.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                          >
                            <span>
                              <strong>{sub.label})</strong> <MathContent content={sub.text} />
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                sub.isCorrect
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {sub.isCorrect ? "Đúng" : "Sai"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rubric for Essay */}
                    {q.type === "ESSAY" && q.rubric && (
                      <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-xs space-y-1.5">
                        <strong className="text-blue-700 dark:text-blue-300 block">
                          Barem chấm từng bước (Scoring Rubric):
                        </strong>
                        {q.rubric.map((r, rIdx) => (
                          <div key={rIdx} className="flex items-start justify-between text-slate-700 dark:text-slate-300">
                            <span className="flex-1">
                              • <MathContent content={r.step} />
                            </span>
                            <span className="font-bold text-blue-600 ml-2">{r.points} điểm</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 2D MATRIX REVIEW */}
          {reviewTab === "MATRIX" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Khung Ma Trận Đề Kiểm Tra Định Kỳ 2 Chiều</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase">
                      Công văn 7991/BGDĐT-GDTrH
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tích hợp 4 dạng thức câu hỏi $\times$ 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-bold border border-emerald-200">
                  Tự động đồng bộ từ câu hỏi
                </span>
              </div>

              {/* Bảng Ma Trận 4 Dạng Thức Chi Tiết nếu có matrix7991 */}
              {matrix7991 && matrix7991.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-700">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-center">
                        <th rowSpan={3} className="p-2 border border-slate-200 dark:border-slate-700 w-8">TT</th>
                        <th rowSpan={3} className="p-2 border border-slate-200 dark:border-slate-700 text-left min-w-[180px]">
                          Chủ đề / Đơn vị kiến thức
                        </th>
                        <th colSpan={11} className="p-2 border border-slate-200 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-950/20">
                          Mức độ đánh giá (Số câu theo từng dạng thức)
                        </th>
                        <th colSpan={2} rowSpan={2} className="p-2 border border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-950/20">
                          Tổng hợp
                        </th>
                        <th rowSpan={3} className="p-2 border border-slate-200 dark:border-slate-700 w-16">
                          Tỉ lệ %
                        </th>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold text-center text-[11px]">
                        <th colSpan={3} className="p-1.5 border border-slate-200 dark:border-slate-700">
                          I. TN Nhiều lựa chọn
                        </th>
                        <th colSpan={3} className="p-1.5 border border-slate-200 dark:border-slate-700 bg-amber-50/30">
                          II. TN Đúng - Sai
                        </th>
                        <th colSpan={3} className="p-1.5 border border-slate-200 dark:border-slate-700">
                          III. TN Trả lời ngắn
                        </th>
                        <th colSpan={2} className="p-1.5 border border-slate-200 dark:border-slate-700 bg-purple-50/30">
                          IV. Tự luận
                        </th>
                      </tr>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium text-center">
                        <th className="p-1 border border-slate-200 dark:border-slate-700">Biết</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700">Hiểu</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700">VD</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700 bg-amber-50/40">Biết</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700 bg-amber-50/40">Hiểu</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700 bg-amber-50/40">VD</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700">Biết</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700">Hiểu</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700">VD</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700 bg-purple-50/40">VD</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700 bg-purple-50/40">VDC</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700 font-bold">Số câu</th>
                        <th className="p-1 border border-slate-200 dark:border-slate-700 font-bold">Điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrix7991.map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 text-center">
                          <td className="p-2 border border-slate-200 dark:border-slate-700 font-bold">{idx + 1}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 text-left font-medium">
                            {r.topic}
                          </td>
                          <td className="p-1 border border-slate-200 dark:border-slate-700">{r.multipleChoice?.nhanBiet || "-"}</td>
                          <td className="p-1 border border-slate-200 dark:border-slate-700">{r.multipleChoice?.thongHieu || "-"}</td>
                          <td className="p-1 border border-slate-200 dark:border-slate-700">{r.multipleChoice?.vanDung || "-"}</td>
                          <td className="p-1 border border-slate-200 dark:border-slate-700 bg-amber-50/20">{r.trueFalse?.nhanBiet || "-"}</td>
                          <td className="p-1 border border-slate-200 dark:border-slate-700 bg-amber-50/20">{r.trueFalse?.thongHieu || "-"}</td>
                          <td className="p-1 border border-slate-200 dark:border-slate-700 bg-amber-50/20">{r.trueFalse?.vanDung || "-"}</td>
                          <td className="p-1 border border-slate-200 dark:border-slate-700">{r.shortAnswer?.nhanBiet || "-"}</td>
                          <td className="p-1 border border-slate-200 dark:border-slate-700">{r.shortAnswer?.thongHieu || "-"}</td>
                          <td className="p-1 border border-slate-200 dark:border-slate-700">{r.shortAnswer?.vanDung || "-"}</td>
                          <td className="p-1 border border-slate-200 dark:border-slate-700 bg-purple-50/20">{r.essay?.vanDung || "-"}</td>
                          <td className="p-1 border border-slate-200 dark:border-slate-700 bg-purple-50/20">{r.essay?.vanDungCao || "-"}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 font-bold text-blue-600">
                            {r.totalQuestions}
                          </td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600">
                            {r.totalScore}đ
                          </td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 font-semibold text-slate-600">
                            {r.percentage ? `${r.percentage}%` : `${Math.round((r.totalScore / totalScore) * 100)}%`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {/* Bảng Ma Trận Tóm Tắt Mức Độ Nhận Thức */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-700">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 w-10 text-center">TT</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700">Chủ đề / Đơn vị kiến thức</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">Nhận biết</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">Thông hiểu</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">Vận dụng</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">Vận dụng cao</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">Tổng câu</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">Tổng điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 font-medium">{row.topic}</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">
                          {row.nhanBiet} câu
                        </td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">
                          {row.thongHieu} câu
                        </td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">
                          {row.vanDung} câu
                        </td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">
                          {row.vanDungCao} câu
                        </td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center font-bold text-blue-600">
                          {row.totalQuestions}
                        </td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center font-bold text-emerald-600">
                          {row.totalScore}đ
                        </td>
                      </tr>
                    ))}
                    {/* Summary row */}
                    <tr className="bg-slate-50 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white">
                      <td colSpan={2} className="p-2.5 border border-slate-200 dark:border-slate-700 text-right">
                        TỔNG CỘNG ({totalScore} điểm)
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">
                        {matrix.reduce((s, r) => s + r.nhanBiet, 0)} câu
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">
                        {matrix.reduce((s, r) => s + r.thongHieu, 0)} câu
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">
                        {matrix.reduce((s, r) => s + r.vanDung, 0)} câu
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">
                        {matrix.reduce((s, r) => s + r.vanDungCao, 0)} câu
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center text-blue-600">
                        {matrix.reduce((s, r) => s + r.totalQuestions, 0)} câu
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center text-emerald-600">
                        {Math.round(matrix.reduce((s, r) => s + r.totalScore, 0) * 10) / 10}đ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Thông tin chuẩn hóa Công văn 7991 */}
              <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 text-xs space-y-2">
                <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Quy định chấm điểm dạng thức câu hỏi trắc nghiệm Đúng - Sai theo Công văn 7991/BGDĐT-GDTrH:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-slate-300 pt-1">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
                    <span className="block text-[11px] text-slate-500">Đúng 1 ý</span>
                    <strong className="text-blue-600">0,10 điểm</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
                    <span className="block text-[11px] text-slate-500">Đúng 2 ý</span>
                    <strong className="text-blue-600">0,25 điểm</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
                    <span className="block text-[11px] text-slate-500">Đúng 3 ý</span>
                    <strong className="text-blue-600">0,50 điểm</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
                    <span className="block text-[11px] text-slate-500">Đúng cả 4 ý</span>
                    <strong className="text-emerald-600 font-extrabold">1,00 điểm</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPECIFICATION REVIEW */}
          {reviewTab === "SPEC" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Bản Đặc Tả Đề Kiểm Tra (Specification Table)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Khung đặc tả chi tiết mức độ đánh giá và yêu cầu cần đạt theo chuẩn GDPT 2018
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3 border border-slate-200 dark:border-slate-700">TT</th>
                      <th className="p-3 border border-slate-200 dark:border-slate-700">Chủ đề</th>
                      <th className="p-3 border border-slate-200 dark:border-slate-700">Yêu cầu cần đạt</th>
                      <th className="p-3 border border-slate-200 dark:border-slate-700 text-center">Mức độ</th>
                      <th className="p-3 border border-slate-200 dark:border-slate-700 text-center">Dạng câu hỏi</th>
                      <th className="p-3 border border-slate-200 dark:border-slate-700 text-center">Số câu</th>
                      <th className="p-3 border border-slate-200 dark:border-slate-700 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specification.map((spec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 border border-slate-200 dark:border-slate-700 text-center font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-700 font-medium">{spec.topic}</td>
                        <td className="p-3 border border-slate-200 dark:border-slate-700">
                          <MathContent content={spec.outcome} />
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-700 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                            {spec.level}
                          </span>
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-700 text-center">
                          {spec.questionType}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-700 text-center font-bold">
                          {spec.questionCount}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-slate-700 text-center font-bold text-blue-600">
                          {spec.score}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SCORING GUIDE & RUBRICS */}
          {reviewTab === "GUIDE" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Đáp Án &amp; Barem Hướng Dẫn Chấm Từng Bước
                </h3>
                <p className="text-xs text-slate-500">
                  Bảng đáp án trắc nghiệm và thang điểm chi tiết cho các bước giải tự luận
                </p>
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const correctAns = (q.answers || []).find((a) => a.isCorrect)?.label || "Tự luận";
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-blue-600">Câu {idx + 1}</span>
                        <span className="font-bold text-emerald-600">Đáp án: {correctAns}</span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        <MathContent content={q.explanation} />
                      </div>
                      {q.rubric && q.rubric.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                          {q.rubric.map((r, rIdx) => (
                            <div key={rIdx} className="flex items-center justify-between text-slate-600">
                              <span>• {r.step}</span>
                              <span className="font-bold text-blue-600">{r.points}đ</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 7: EXPORT FULL PACKAGE */}
      {currentStep === 7 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Đề Kiểm Tra Chuẩn 7991 Sẵn Sàng Xuất Bản!
            </h2>
            <p className="text-xs text-slate-500">
              Trọn bộ hồ sơ gồm: Đề thi gốc, 4 mã đề hoán vị (101-104), Bảng đáp án, Ma trận 2 chiều, Bản đặc tả và Barem chấm tự luận
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                📄 Xuất file Microsoft Word (.doc)
              </span>
              <p className="text-[11px] text-slate-500">
                Chứa đầy đủ đề thi, ma trận, bản đặc tả và barem điểm có định dạng công thức toán KaTeX chuẩn
              </p>
              <button
                onClick={handleExportWordFullPackage}
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" /> Tải Trọn Bộ Word (.doc)
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                🖨️ In ấn &amp; Xuất bản PDF
              </span>
              <p className="text-[11px] text-slate-500">
                In trực tiếp từ trình duyệt hoặc lưu file PDF sẵn sàng photo phát cho học sinh
              </p>
              <button
                onClick={() => window.print()}
                className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> In / Lưu PDF
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              onClick={() => setCurrentStep(6)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Quay lại rà soát (Bước 6)
            </button>
            <Link
              href="/export-center"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              Đến Trung Tâm Xuất Học Liệu →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Đang khởi động Exam Wizard 7991...
        </div>
      }
    >
      <ExamWizardContent />
    </Suspense>
  );
}
