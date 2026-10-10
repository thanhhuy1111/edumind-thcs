"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileQuestion,
  Plus,
  Sparkles,
  Search,
  Filter,
  Star,
  Copy,
  Trash2,
  Eye,
  CheckCircle2,
  ChevronDown,
  X,
  Check,
  BookmarkPlus,
  BookOpen,
} from "lucide-react";
import { getDifficultyBadge, getQuestionTypeBadge } from "@/lib/utils";
import { MathContent } from "@/components/ui/MathContent";

interface QuestionItem {
  id: string;
  gradeLevel: number;
  questionType: string;
  difficulty: string;
  content: string;
  answer: string | null;
  explanation: string | null;
  source: string | null;
  tags: string | null;
  numberOfUses: number;
  isFavorite: boolean;
  subject: { name: string; code: string };
  chapter?: { title: string } | null;
  lesson?: { title: string } | null;
  skill?: { name: string; code: string } | null;
  answers: Array<{ id: string; label: string; content: string; isCorrect: boolean }>;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("MUSIC");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  // Preview / Solution modal state
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (gradeFilter !== "ALL") params.append("gradeLevel", gradeFilter);
      if (difficultyFilter !== "ALL") params.append("difficulty", difficultyFilter);
      if (typeFilter !== "ALL") params.append("questionType", typeFilter);
      if (favoriteOnly) params.append("isFavorite", "true");
      if (search) params.append("search", search);

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data: QuestionItem[] = await res.json();
      if (Array.isArray(data)) {
        if (subjectFilter !== "ALL") {
          setQuestions(
            data.filter(
              (q) =>
                q.subject?.code === subjectFilter ||
                q.subject?.name?.toLowerCase().includes(subjectFilter.toLowerCase()) ||
                (subjectFilter === "MUSIC" &&
                  (q.tags?.toLowerCase().includes("nhac") ||
                    q.tags?.toLowerCase().includes("music") ||
                    q.content?.toLowerCase().includes("âm nhạc") ||
                    q.content?.toLowerCase().includes("hát") ||
                    q.content?.toLowerCase().includes("nhịp") ||
                    q.content?.toLowerCase().includes("khóa sol")))
            )
          );
        } else {
          setQuestions(data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [subjectFilter, gradeFilter, difficultyFilter, typeFilter, favoriteOnly, search]);

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_FAVORITE" }),
      });
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, isFavorite: !q.isFavorite } : q))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DUPLICATE" }),
      });
      if (res.ok) {
        fetchQuestions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Cô có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?")) return;
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>Ngân hàng câu hỏi chuẩn GDPT 2018</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Ngân hàng câu hỏi THCS
          </h1>
          <p className="text-sm text-slate-500">
            Tổng hợp câu hỏi trắc nghiệm & tự luận phân loại theo 4 mức độ nhận thức.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/questions/generate"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Tạo câu hỏi</span>
          </Link>
          <Link
            href="/exams/builder"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs transition-colors"
          >
            <BookmarkPlus className="w-4 h-4 text-blue-600" />
            <span>Tạo đề từ ngân hàng</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Grade */}
            {/* Subject */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none"
            >
              <option value="MUSIC">Môn Âm nhạc (Mặc định)</option>
              <option value="ALL">Tất cả môn học</option>
              <option value="MATH">Môn Toán học</option>
            </select>

            {/* Grade */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none"
            >
              <option value="ALL">Tất cả khối</option>
              <option value="6">Khối 6</option>
              <option value="7">Khối 7</option>
              <option value="8">Khối 8</option>
              <option value="9">Khối 9</option>
            </select>

            {/* Difficulty */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none"
            >
              <option value="ALL">Tất cả độ khó</option>
              <option value="NHAN_BIET">Nhận biết</option>
              <option value="THONG_HIEU">Thông hiểu</option>
              <option value="VAN_DUNG">Vận dụng</option>
              <option value="VAN_DUNG_CAO">Vận dụng cao</option>
            </select>

            {/* Question Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none"
            >
              <option value="ALL">Tất cả dạng câu</option>
              <option value="SINGLE_CHOICE">Trắc nghiệm 1 ĐA</option>
              <option value="TRUE_FALSE">Đúng / Sai</option>
              <option value="FILL_BLANK">Điền chỗ trống</option>
              <option value="SHORT_ANSWER">Trả lời ngắn</option>
              <option value="ESSAY">Tự luận</option>
            </select>

            {/* Favorite toggle */}
            <button
              onClick={() => setFavoriteOnly(!favoriteOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors ${
                favoriteOnly
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${favoriteOnly ? "fill-amber-500 text-amber-500" : ""}`} />
              <span>Yêu thích ({questions.filter((q) => q.isFavorite).length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo nội dung, từ khóa..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-white rounded-3xl border border-slate-200 p-6 animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">Không tìm thấy câu hỏi phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thử thay đổi bộ lọc hoặc sử dụng công cụ AI Tạo câu hỏi để sinh thêm câu hỏi mới.
          </p>
          <Link
            href="/questions/generate"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sinh câu hỏi bằng AI ngay</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const diffBadge = getDifficultyBadge(q.difficulty);
            const typeBadge = getQuestionTypeBadge(q.questionType);

            return (
              <div
                key={q.id}
                onClick={() => setPreviewQuestion(q)}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group space-y-4"
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {q.subject?.name || "Âm nhạc"} {q.gradeLevel}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${diffBadge.color}`}>
                      {diffBadge.label}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg border ${typeBadge.color}`}>
                      {typeBadge.label}
                    </span>
                    {q.skill && (
                      <span className="text-xs text-slate-500 font-medium">
                        • {q.skill.name}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleToggleFavorite(q.id, e)}
                      title={q.isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${q.isFavorite ? "fill-amber-500 text-amber-500" : ""}`} />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(q.id, e)}
                      title="Nhân bản câu hỏi"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(q.id, e)}
                      title="Xóa câu hỏi"
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="text-sm font-semibold text-slate-900 leading-relaxed font-sans">
                  <MathContent content={q.content} />
                </div>

                {/* Answers Options Grid */}
                {q.answers && q.answers.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.answers.map((ans) => (
                      <div
                        key={ans.id}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          ans.isCorrect
                            ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold"
                            : "bg-slate-50 border-slate-200/80 text-slate-700"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            ans.isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {ans.label}
                        </span>
                        <div className="flex-1">
                          <MathContent content={ans.content} inline />
                        </div>
                        {ans.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-auto" />}
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Source */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                  <span>Nguồn: {q.source || "SGK Kết Nối Tri Thức"}</span>
                  <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem lời giải chi tiết</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Preview Question & Step-by-Step Solution */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                  {previewQuestion.subject?.name || "Âm nhạc"} Khối {previewQuestion.gradeLevel}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {getDifficultyBadge(previewQuestion.difficulty).label}
                </span>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-base font-bold text-slate-900">
                <MathContent content={previewQuestion.content} />
              </div>

              {/* Answers */}
              <div className="space-y-1.5">
                {previewQuestion.answers.map((ans) => (
                  <div
                    key={ans.id}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                      ans.isCorrect
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        ans.isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {ans.label}
                    </span>
                    <div className="flex-1">
                      <MathContent content={ans.content} inline />
                    </div>
                    {ans.isCorrect && (
                      <span className="ml-auto text-emerald-600 text-[11px] font-bold shrink-0">
                        Đáp án đúng
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Step-by-step Solution */}
              {previewQuestion.explanation && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Hướng dẫn giải chi tiết:</span>
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <MathContent content={previewQuestion.explanation} />
                  </div>
                </div>
              )}

              {previewQuestion.skill && (
                <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <strong>Kỹ năng kiểm tra:</strong> {previewQuestion.skill.name} (Mã: {previewQuestion.skill.code})
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
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
