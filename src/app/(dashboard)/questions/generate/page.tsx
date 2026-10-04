"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Save,
  CheckCircle2,
  Trash2,
  Edit3,
  BookmarkPlus,
  BookOpen,
  Layers,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { getDifficultyBadge, getQuestionTypeBadge } from "@/lib/utils";
import { MathContent } from "@/components/ui/MathContent";

interface GeneratedQuestionItem {
  content: string;
  type: string;
  difficulty: string;
  answers: Array<{ label: string; content: string; isCorrect: boolean }>;
  correct_answer: string;
  explanation: string;
  skill: string;
  source?: string;
  tags?: string[];
}

export default function AIQuestionGeneratorPage() {
  const router = useRouter();

  // Generator Config State
  const [subject, setSubject] = useState("MATH");
  const [grade, setGrade] = useState("7");
  const [difficulty, setDifficulty] = useState("THONG_HIEU");
  const [questionType, setQuestionType] = useState("SINGLE_CHOICE");
  const [count, setCount] = useState("5");
  const [promptNote, setPromptNote] = useState(
    "Tạo các câu trắc nghiệm về tỉ lệ thức và dãy tỉ số bằng nhau, gắn liền với bài toán chia tiền hoặc toán thực tế học sinh THCS."
  );

  // Generation & Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionItem[]>([]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject === "MATH" ? "Toán học" : "Tiếng Anh",
          grade: parseInt(grade, 10),
          difficulty,
          questionType,
          count: parseInt(count, 10),
          promptNote,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate questions");
      const data = await res.json();
      setGeneratedQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (generatedQuestions.length === 0 || isSaving) return;
    setIsSaving(true);

    try {
      for (const q of generatedQuestions) {
        await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gradeLevel: parseInt(grade, 10),
            questionType: q.type,
            difficulty: q.difficulty,
            content: q.content,
            answers: q.answers,
            answer: q.correct_answer,
            explanation: q.explanation,
            source: q.source || "EduMind AI Studio",
            tags: q.tags?.join(",") || "ai-generated,toan-thcs",
          }),
        });
      }
      setSavedSuccess(true);
      setTimeout(() => {
        router.push("/questions");
      }, 1500);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link
          href="/questions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ngân hàng câu hỏi</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-700">AI Question Generator Studio</span>
      </div>

      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-violet-800 text-white shadow-xl shadow-indigo-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Curriculum Engine chuẩn GDPT 2018</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            AI Soạn câu hỏi & Lời giải tự động
          </h1>
          <p className="text-sm text-indigo-100 leading-relaxed">
            Nhập yêu cầu bằng tiếng Việt tự nhiên. AI sẽ phân tích chương trình THCS, xây dựng nội dung câu hỏi, tạo 4 phương án nhiễu thông minh và kèm lời giải chi tiết từng bước.
          </p>
        </div>

        <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 relative z-10 shadow-lg">
          <Sparkles className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: "12s" }} />
        </div>
      </div>

      {/* Two Column Layout: Generator Configuration (Left) + Result Studio (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-base text-slate-900">Cấu hình câu hỏi</h2>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              {/* Subject & Grade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Môn học</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                  >
                    <option value="MATH">Toán học</option>
                    <option value="ENGLISH">Tiếng Anh</option>
                    <option value="SCIENCE">Khoa học tự nhiên</option>
                    <option value="LITERATURE">Ngữ văn</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khối lớp</label>
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
              </div>

              {/* Difficulty & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mức độ nhận thức</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                  >
                    <option value="NHAN_BIET">Nhận biết</option>
                    <option value="THONG_HIEU">Thông hiểu</option>
                    <option value="VAN_DUNG">Vận dụng</option>
                    <option value="VAN_DUNG_CAO">Vận dụng cao</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dạng câu hỏi</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                  >
                    <option value="SINGLE_CHOICE">Trắc nghiệm 1 ĐA</option>
                    <option value="TRUE_FALSE">Đúng / Sai</option>
                    <option value="FILL_BLANK">Điền khuyết</option>
                    <option value="SHORT_ANSWER">Trả lời ngắn</option>
                  </select>
                </div>
              </div>

              {/* Count */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số lượng câu cần sinh</label>
                <div className="flex items-center gap-2">
                  {["3", "5", "10"].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setCount(num)}
                      className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                        count === num
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {num} câu
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Note */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Yêu cầu trọng tâm (Prompt)
                </label>
                <textarea
                  rows={4}
                  value={promptNote}
                  onChange={(e) => setPromptNote(e.target.value)}
                  placeholder="Ví dụ: Tạo 5 câu trắc nghiệm về tỉ lệ thức lớp 7, ưu tiên bài toán thực tế..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI đang phân tích & sinh câu hỏi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Bắt đầu sinh câu hỏi</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Review Studio (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-base text-slate-900">
                  Kết quả sinh câu hỏi ({generatedQuestions.length} câu)
                </h2>
                <p className="text-xs text-slate-500">
                  Kiểm duyệt nội dung, chỉnh sửa phương án và lưu vào ngân hàng câu hỏi.
                </p>
              </div>

              {generatedQuestions.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                    <span>Sinh lại tất cả</span>
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Đang lưu..." : "Lưu vào Ngân hàng"}</span>
                  </button>
                </div>
              )}
            </div>

            {savedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã lưu thành công tất cả câu hỏi vào Ngân hàng câu hỏi! Đang chuyển hướng...</span>
              </div>
            )}

            {isGenerating ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-bounce">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="font-bold text-sm text-slate-800">
                  EduMind AI đang xây dựng {count} câu hỏi theo ma trận GDPT 2018...
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tự động tính toán các phương án gây nhiễu và biên soạn lời giải từng bước.
                </p>
              </div>
            ) : generatedQuestions.length === 0 ? (
              <div className="py-20 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-slate-700">Chưa có câu hỏi nào được sinh</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Chọn các thông số ở cột bên trái và bấm &quot;Bắt đầu sinh câu hỏi&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedQuestions.map((q, idx) => {
                  const diffBadge = getDifficultyBadge(q.difficulty);
                  const typeBadge = getQuestionTypeBadge(q.type);

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 relative group"
                    >
                      {/* Meta header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            Câu {idx + 1}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${diffBadge.color}`}>
                            {diffBadge.label}
                          </span>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${typeBadge.color}`}>
                            {typeBadge.label}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            • {q.skill}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveQuestion(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Bỏ câu này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="text-xs font-bold text-slate-900 leading-relaxed font-sans">
                        <MathContent content={q.content} />
                      </div>

                      {/* Options */}
                      {q.answers && q.answers.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.answers.map((ans, aIdx) => (
                            <div
                              key={aIdx}
                              className={`p-2 rounded-xl border flex items-center gap-2 ${
                                ans.isCorrect
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                                  : "bg-white border-slate-200 text-slate-700"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                  ans.isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {ans.label}
                              </span>
                              <div className="flex-1">
                                <MathContent content={ans.content} inline />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-3 rounded-xl bg-white border border-blue-100 text-xs text-slate-600 space-y-1">
                          <span className="font-bold text-blue-900 block">Lời giải chi tiết:</span>
                          <div className="leading-relaxed">
                            <MathContent content={q.explanation} />
                          </div>
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
    </div>
  );
}
