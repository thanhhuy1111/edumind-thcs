"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileSpreadsheet,
  ArrowLeft,
  Sparkles,
  Layers,
  Clock,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  Check,
  X,
  FileQuestion,
} from "lucide-react";
import { getDifficultyBadge, getQuestionTypeBadge } from "@/lib/utils";
import { MathContent } from "@/components/ui/MathContent";

export const dynamic = "force-dynamic";

interface BankQuestion {
  id: string;
  gradeLevel: number;
  questionType: string;
  difficulty: string;
  content: string;
  answers: Array<{ label: string; content: string; isCorrect: boolean }>;
  explanation: string | null;
  skill?: { name: string } | null;
}

function ExamBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const classIdParam = searchParams.get("classId");
  const gradeParam = searchParams.get("grade") || "7";

  // Form State
  const [title, setTitle] = useState(
    topicParam
      ? `Kiểm tra 15 phút - Củng cố ${topicParam === "ti-le-thuc" ? "Tỉ lệ thức & Dãy tỉ số" : topicParam}`
      : "Kiểm tra 1 tiết Toán 7 - Chương 2: Số thực và Tỉ lệ thức"
  );
  const [gradeLevel, setGradeLevel] = useState(gradeParam);
  const [classId, setClassId] = useState(classIdParam || "");
  const [durationMinutes, setDurationMinutes] = useState(topicParam ? "15" : "45");
  const [totalScore, setTotalScore] = useState("10");
  const [questionCount, setQuestionCount] = useState(topicParam ? "5" : "10");

  // Matrix percentages
  const [matrix, setMatrix] = useState({
    nhanBiet: 30,
    thongHieu: 40,
    vanDung: 20,
    vanDungCao: 10,
  });

  // Classes & Bank Questions
  const [classes, setClasses] = useState<any[]>([]);
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<BankQuestion[]>([]);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // Loading & Saving states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load Classes
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        setClasses(data);
        if (data.length > 0 && !classId) {
          const matched = classIdParam ? data.find((c: any) => c.id === classIdParam) : data[0];
          setClassId(matched ? matched.id : data[0].id);
        }
      });

    // Load available Bank questions
    fetch(`/api/questions?gradeLevel=${gradeLevel}`)
      .then((res) => res.json())
      .then((data) => {
        setBankQuestions(data);
        // Pre-select questions to start with
        const initialCount = topicParam ? 5 : 5;
        setSelectedQuestions(data.slice(0, initialCount));
      });
  }, [gradeLevel]);

  // AI Auto-Fill matrix
  const handleAIFillMatrix = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Toán học",
          grade: parseInt(gradeLevel, 10),
          difficulty: "THONG_HIEU",
          count: parseInt(questionCount, 10),
          promptNote: title,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        // Save these to DB as temporary bank questions and add them
        const newlyCreated: BankQuestion[] = [];
        for (const q of data.questions) {
          const saveRes = await fetch("/api/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gradeLevel: parseInt(gradeLevel, 10),
              questionType: q.type,
              difficulty: q.difficulty,
              content: q.content,
              answers: q.answers,
              answer: q.correct_answer,
              explanation: q.explanation,
              source: "AI Auto Matrix Generator",
              tags: "ai-matrix",
            }),
          });
          const savedQ = await saveRes.json();
          newlyCreated.push(savedQ);
        }
        setSelectedQuestions(newlyCreated);
      }
    } catch (err) {
      console.error("AI Generation error:", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Reorder
  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === selectedQuestions.length - 1) return;

    const updated = [...selectedQuestions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSelectedQuestions(updated);
  };

  // Remove question
  const removeQuestion = (index: number) => {
    setSelectedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit and create exam
  const handleCreateExam = async () => {
    if (selectedQuestions.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          classId: classId || undefined,
          subject: "Toán học",
          gradeLevel: parseInt(gradeLevel, 10),
          durationMinutes: parseInt(durationMinutes, 10),
          totalScore: parseFloat(totalScore),
          questionCount: selectedQuestions.length,
          matrixConfig: matrix,
          questionIds: selectedQuestions.map((q) => q.id),
        }),
      });

      if (!res.ok) throw new Error("Failed to create exam");
      const createdExam = await res.json();
      router.push(`/exams/${createdExam.id}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const pointsPerQuestion = (parseFloat(totalScore) / (selectedQuestions.length || 1)).toFixed(2);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/exams"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Đề kiểm tra</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-700">Trình tạo đề ma trận</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
            Thiết lập đề kiểm tra theo chuẩn ma trận
          </h1>
          <p className="text-sm text-slate-500">
            Tự động phân bổ câu hỏi theo 4 mức độ nhận thức và tự sinh 4 mã đề (101, 102, 103, 104).
          </p>
        </div>

        <button
          onClick={handleCreateExam}
          disabled={selectedQuestions.length === 0 || isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{isSubmitting ? "Đang tạo & sinh mã đề..." : "Hoàn tất & Xuất 4 mã đề"}</span>
        </button>
      </div>

      {/* Two Column Layout: Parameters & Matrix Config (Left) + Questions List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Config & Matrix (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* General Config */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Thông tin chung bài thi
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên đề kiểm tra</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Áp dụng lớp</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                >
                  <option value="">Chung toàn khối</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Khối lớp</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                >
                  <option value="6">Khối 6</option>
                  <option value="7">Khối 7</option>
                  <option value="8">Khối 8</option>
                  <option value="9">Khối 9</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thời gian (phút)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tổng thang điểm</label>
                <input
                  type="number"
                  value={totalScore}
                  onChange={(e) => setTotalScore(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Matrix Ratio Config */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Ma trận mức độ nhận thức</h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                GDPT 2018
              </span>
            </div>

            {/* Visual ratio bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
                <div style={{ width: `${matrix.nhanBiet}%` }} className="bg-blue-500 h-full" title="Nhận biết" />
                <div style={{ width: `${matrix.thongHieu}%` }} className="bg-emerald-500 h-full" title="Thông hiểu" />
                <div style={{ width: `${matrix.vanDung}%` }} className="bg-amber-500 h-full" title="Vận dụng" />
                <div style={{ width: `${matrix.vanDungCao}%` }} className="bg-rose-500 h-full" title="Vận dụng cao" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                  <span>Nhận biết: {matrix.nhanBiet}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>Thông hiểu: {matrix.thongHieu}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  <span>Vận dụng: {matrix.vanDung}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                  <span>Vận dụng cao: {matrix.vanDungCao}%</span>
                </div>
              </div>
            </div>

            {/* Action buttons to build questions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleAIFillMatrix}
                disabled={isGeneratingAI}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingAI ? "animate-spin" : ""}`} />
                <span>{isGeneratingAI ? "AI đang sinh đề theo ma trận..." : "AI Tự sinh câu hỏi theo ma trận"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBankModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Chọn câu từ Ngân hàng câu hỏi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Selected Questions & Ordering (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Danh sách câu hỏi trong đề ({selectedQuestions.length} câu)
                </h3>
                <p className="text-xs text-slate-500">
                  Điểm mỗi câu: <strong>{pointsPerQuestion} điểm</strong>. Có thể đổi thứ tự bằng mũi tên lên/xuống.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-100">
                  Tự động sinh 4 mã: 101, 102, 103, 104
                </span>
              </div>
            </div>

            {selectedQuestions.length === 0 ? (
              <div className="py-16 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Chưa có câu hỏi nào trong đề</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Hãy bấm &quot;AI Tự sinh câu hỏi theo ma trận&quot; hoặc &quot;Chọn từ Ngân hàng câu hỏi&quot; ở cột bên trái.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedQuestions.map((q, idx) => {
                  const diffBadge = getDifficultyBadge(q.difficulty);

                  return (
                    <div
                      key={q.id || idx}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-colors space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                            Câu {idx + 1}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${diffBadge.color}`}>
                            {diffBadge.label}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {pointsPerQuestion} điểm
                          </span>
                        </div>

                        {/* Reorder and Delete controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveQuestion(idx, "up")}
                            disabled={idx === 0}
                            title="Chuyển lên"
                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveQuestion(idx, "down")}
                            disabled={idx === selectedQuestions.length - 1}
                            title="Chuyển xuống"
                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(idx)}
                            title="Xóa khỏi đề"
                            className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs font-bold text-slate-800 leading-relaxed font-sans">
                        <MathContent content={q.content} />
                      </div>

                      {q.answers && q.answers.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                          {q.answers.map((a, aIdx) => (
                            <div
                              key={aIdx}
                              className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 ${
                                a.isCorrect
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                                  : "bg-white border-slate-200 text-slate-600"
                              }`}
                            >
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Choose from Question Bank */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Chọn câu hỏi từ Ngân hàng</h3>
              <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {bankQuestions.map((bq) => {
                const isSelected = selectedQuestions.some((sq) => sq.id === bq.id);

                return (
                  <div
                    key={bq.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedQuestions((prev) => prev.filter((q) => q.id !== bq.id));
                      } else {
                        setSelectedQuestions((prev) => [...prev, bq]);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-300 text-blue-950"
                        : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{getDifficultyBadge(bq.difficulty).label}</span>
                        {bq.skill && <span className="text-slate-500">• {bq.skill.name}</span>}
                      </div>
                      <div className="font-semibold text-slate-900 leading-relaxed">
                        <MathContent content={bq.content} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Đã chọn <strong>{selectedQuestions.length} câu</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Xác nhận chọn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamBuilderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Đang tải cấu hình đề thi...</div>}>
      <ExamBuilderContent />
    </Suspense>
  );
}
