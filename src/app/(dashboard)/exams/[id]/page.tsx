"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FileSpreadsheet,
  ArrowLeft,
  Printer,
  Download,
  Share2,
  Sparkles,
  CheckCircle2,
  Layers,
  Clock,
  BookOpen,
  FileText,
  RotateCcw,
  CheckSquare,
} from "lucide-react";
import { getDifficultyBadge } from "@/lib/utils";
import katex from "katex";
import { MathContent } from "@/components/ui/MathContent";

export default function ExamDetailPage() {
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersionCode, setSelectedVersionCode] = useState<string>("101");
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/exams/${examId}`);
      if (!res.ok) throw new Error("Failed to load exam");
      const data = await res.json();
      setExam(data);
      if (data.versions?.length > 0) {
        setSelectedVersionCode(data.versions[0].versionCode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examId) fetchExam();
  }, [examId]);

  const handlePrint = () => {
    window.print();
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
    if (!exam) return;
    const currentVersion = exam.versions.find((v: any) => v.versionCode === selectedVersionCode) || exam.versions[0];
    const answerKey = currentVersion?.answerKey ? JSON.parse(currentVersion.answerKey) : {};

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${exam.title}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .header-table td { vertical-align: top; text-align: center; }
          .title { text-align: center; font-weight: bold; font-size: 16pt; margin: 15px 0; }
          .question-item { margin-bottom: 15px; }
          .question-title { font-weight: bold; }
          .answer-grid { margin-left: 20px; margin-top: 5px; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 50%;">
              <strong>${exam.schoolName || "TRƯỜNG THCS CHU VĂN AN"}</strong><br/>
              TỔ TỰ NHIÊN - TOÁN HỌC
            </td>
            <td style="width: 50%;">
              <strong>ĐỀ KIỂM TRA ĐỊNH KỲ</strong><br/>
              NĂM HỌC 2026 - 2027<br/>
              <strong>MÃ ĐỀ: ${selectedVersionCode}</strong>
            </td>
          </tr>
        </table>
        
        <div class="title">${exam.title.toUpperCase()}</div>
        <p style="text-align: center; font-style: italic;">
          Môn: ${exam.subject} - Khối ${exam.gradeLevel} &bull; Thời gian làm bài: ${exam.durationMinutes} phút (không kể thời gian giao đề)
        </p>
        
        <p>Họ và tên học sinh: ............................................................................ Lớp: .........................</p>
        <hr/>
        
        <h3>I. PHẦN CÂU HỎI TRẮC NGHIỆM</h3>
        ${exam.questions
          .map(
            (eq: any, idx: number) => `
          <div class="question-item">
            <p class="question-title">Câu ${idx + 1}: ${formatMathForWord(eq.question.content)}</p>
            <div class="answer-grid">
              ${eq.question.answers
                .map((a: any) => `<p><strong>${a.label}.</strong> ${formatMathForWord(a.content)}</p>`)
                .join("")}
            </div>
          </div>
        `
          )
          .join("")}
        
        <br style="page-break-after:always;"/>
        <h3>II. ĐÁP ÁN VÀ THANG ĐIỂM (DÀNH CHO GIÁO VIÊN - MÃ ĐỀ ${selectedVersionCode})</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; text-align: center;">
          <tr style="background: #f0f0f0;">
            ${exam.questions.map((_: any, idx: number) => `<th>Câu ${idx + 1}</th>`).join("")}
          </tr>
          <tr>
            ${exam.questions.map((_: any, idx: number) => `<td><strong>${answerKey[idx + 1] || "A"}</strong></td>`).join("")}
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", htmlContent], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exam.title.replace(/\s+/g, "_")}_MaDe_${selectedVersionCode}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerateVersions = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/exams/${examId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionCount: 4 }),
      });
      if (res.ok) {
        fetchExam();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy đề thi</h2>
        <Link href="/exams" className="mt-4 inline-block text-blue-600 text-sm font-semibold">
          Quay lại danh sách đề thi
        </Link>
      </div>
    );
  }

  const currentVersion =
    exam.versions.find((v: any) => v.versionCode === selectedVersionCode) ||
    exam.versions[0];

  const answerKey = currentVersion?.answerKey ? JSON.parse(currentVersion.answerKey) : {};

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Controls Bar (no-print) */}
      <div className="no-print space-y-4">
        {/* Back and Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/exams"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Danh sách đề thi</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-700">{exam.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/grading?examId=${exam.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Chấm bài đề này</span>
            </Link>
            <button
              onClick={handleExportWord}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Xuất Word (.doc)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In đề / Xuất PDF</span>
            </button>
          </div>
        </div>

        {/* Multi-Version Selector Card */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chọn mã đề thi:
            </span>
            <div className="flex items-center gap-1.5">
              {exam.versions.map((ver: any) => (
                <button
                  key={ver.id}
                  onClick={() => setSelectedVersionCode(ver.versionCode)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                    selectedVersionCode === ver.versionCode
                      ? "bg-indigo-600 text-white shadow-xs scale-105"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Mã {ver.versionCode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={showAnswerKey}
                onChange={(e) => setShowAnswerKey(e.target.checked)}
                className="rounded text-blue-600 w-4 h-4"
              />
              <span>Hiển thị trang đáp án</span>
            </label>

            <button
              onClick={handleRegenerateVersions}
              disabled={isRegenerating}
              className="flex items-center gap-1 text-blue-600 hover:underline font-semibold"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
              <span>Đảo lại mã đề</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Exam Paper (Vietnam Standard THCS Layout) */}
      <div className="bg-white p-10 md:p-14 rounded-3xl border border-slate-300 shadow-lg text-slate-900 font-serif leading-relaxed print:p-0 print:border-none print:shadow-none">
        {/* Ministry Standard Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center text-xs">
            <div>
              <p className="font-bold uppercase tracking-wider">
                {exam.schoolName || "TRƯỜNG THCS CHU VĂN AN"}
              </p>
              <p className="font-semibold text-slate-600">TỔ TỰ NHIÊN - BỘ MÔN TOÁN</p>
              <p className="italic text-[11px] text-slate-500">Đề kiểm tra chính thức</p>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider">
                KIỂM TRA {exam.durationMinutes} PHÚT
              </p>
              <p className="font-semibold text-slate-700">NĂM HỌC 2026 - 2027</p>
              <p className="font-bold text-sm text-indigo-900 font-mono">
                MÃ ĐỀ: {selectedVersionCode}
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-lg font-bold uppercase tracking-wide">
              {exam.title}
            </h2>
            <p className="text-xs italic text-slate-600 mt-0.5">
              Môn: {exam.subject} - Khối {exam.gradeLevel} &bull; Thời gian làm bài: {exam.durationMinutes} phút (Không kể thời gian phát đề)
            </p>
          </div>

          {/* Student Info Box */}
          <div className="mt-5 grid grid-cols-12 gap-3 text-xs border border-slate-400 p-3 rounded-lg bg-slate-50/50 print:bg-transparent">
            <div className="col-span-8 space-y-1">
              <p>Họ và tên học sinh: ............................................................................</p>
              <p>Lớp: {exam.class?.name || "7A1"} &bull; Số báo danh / Mã HS: .....................................</p>
            </div>
            <div className="col-span-4 border-l border-slate-300 pl-3 flex flex-col justify-between text-center">
              <span className="font-bold uppercase text-[11px]">Điểm số</span>
              <div className="h-8 border border-dashed border-slate-300 rounded flex items-center justify-center font-bold text-sm text-slate-400">
                / {exam.totalScore}đ
              </div>
            </div>
          </div>
        </div>

        {/* Questions Body */}
        <div className="space-y-6">
          <div className="font-bold text-sm uppercase tracking-wide text-slate-800 pb-1 border-b border-slate-200">
            Nội dung câu hỏi trắc nghiệm khách quan
          </div>

          {exam.questions.map((eq: any, idx: number) => {
            return (
              <div key={eq.id} className="space-y-2 text-sm">
                <div className="font-bold flex items-start gap-1">
                  <span>Câu {idx + 1}:</span>
                  <div className="font-semibold text-slate-900 flex-1">
                    <MathContent content={eq.question.content} inline />
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal ml-auto shrink-0">
                    ({eq.scorePoints || 1.0}đ)
                  </span>
                </div>

                {/* 4 Answers Grid */}
                {eq.question.answers && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pl-4 text-xs font-sans">
                    {eq.question.answers.map((a: any) => (
                      <div key={a.id} className="flex items-start gap-1.5">
                        <span className="font-bold shrink-0">{a.label}.</span>
                        <div className="flex-1">
                          <MathContent content={a.content} inline />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="text-center text-xs italic text-slate-400 pt-6">
            --- HẾT ---
            <br />
            (Cán bộ coi thi không giải thích gì thêm)
          </div>
        </div>

        {/* Answer Key Page (Print-Break) */}
        {showAnswerKey && (
          <div className="page-break mt-12 pt-8 border-t-2 border-dashed border-slate-400 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base uppercase text-slate-900">
                HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN CHUẨN
              </h3>
              <p className="text-xs text-slate-600">
                Áp dụng cho Đề kiểm tra: {exam.title} &bull; <strong>Mã đề: {selectedVersionCode}</strong>
              </p>
            </div>

            {/* Answer Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-slate-400 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    {exam.questions.map((_: any, idx: number) => (
                      <th key={idx} className="border border-slate-400 p-2 font-bold">
                        Câu {idx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {exam.questions.map((_: any, idx: number) => (
                      <td key={idx} className="border border-slate-400 p-2 font-extrabold text-blue-700 text-sm">
                        {answerKey[idx + 1] || "A"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Detailed Explanations for Teacher */}
            <div className="pt-4 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase">
                Lời giải chi tiết từng câu:
              </h4>
              <div className="space-y-2">
                {exam.questions.map((eq: any, idx: number) => (
                  <div key={eq.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900">
                      Câu {idx + 1} (Đáp án {answerKey[idx + 1] || "A"}):
                    </p>
                    <div className="text-slate-600 mt-1 leading-relaxed">
                      <MathContent content={eq.question.explanation || "Áp dụng định nghĩa và công thức cơ bản."} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
