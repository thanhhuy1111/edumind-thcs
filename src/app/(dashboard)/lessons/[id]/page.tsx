"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  ArrowLeft,
  FileText,
  Presentation,
  FileSpreadsheet,
  FileCheck2,
  HelpCircle,
  Download,
  Printer,
  Plus,
  Clock,
  Layers,
  CheckCircle2,
  ExternalLink,
  Award,
  ChevronRight,
} from "lucide-react";
import { MathContent } from "@/components/ui/MathContent";

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  status: string;
  updatedAt: string;
}

interface ExamItem {
  id: string;
  title: string;
  questionCount: number;
  totalScore: number;
  examType: string;
  status: string;
  updatedAt: string;
}

interface QuestionItem {
  id: string;
  content: string;
  questionType: string;
  difficulty: string;
  answers: { label: string; content: string; isCorrect: boolean }[];
}

interface LessonDetail {
  id: string;
  title: string;
  orderNumber: number;
  durationPeriods?: number;
  description?: string | null;
  learningOutcomes: string | null;
  chapter: {
    title: string;
    gradeLevel: number;
    subject: {
      name: string;
      code: string;
    };
  };
  skills: { id: string; name: string }[];
  materials: MaterialItem[];
  exams: ExamItem[];
  questions: QuestionItem[];
}

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PLANS" | "SLIDES" | "EXAMS" | "QUESTIONS">("PLANS");

  useEffect(() => {
    fetchLessonDetail();
  }, [id]);

  const fetchLessonDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${id}`);
      const data = await res.json();
      if (data && !data.error) {
        setLesson(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Đang tải không gian học liệu bài học...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        Không tìm thấy bài học này.
        <div className="mt-4">
          <Link href="/lessons" className="text-indigo-600 font-bold hover:underline">
            Quay lại danh mục bài học
          </Link>
        </div>
      </div>
    );
  }

  const lessonPlans = lesson.materials.filter((m) => m.type === "LESSON_PLAN");
  const slideDecks = lesson.materials.filter((m) => m.type === "SLIDE_DECK");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Breadcrumb & Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link
              href="/lessons"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors mt-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {lesson.chapter.subject.name} - Lớp {lesson.chapter.gradeLevel}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">{lesson.chapter.title}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Thời lượng: {lesson.description || (lesson.durationPeriods ? `${lesson.durationPeriods} tiết` : "3 tiết")}
                </span>
              </div>

              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                <MathContent content={lesson.title} />
              </h1>

              {lesson.learningOutcomes && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">
                    🎯 Yêu cầu cần đạt chuẩn GDPT 2018:
                  </strong>
                  <MathContent content={lesson.learningOutcomes} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/export-center"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Trung Tâm Xuất Bản
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK AI ACTIONS PANEL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            AI Quick Actions (Quy trình sáng tạo học liệu xuyên suốt)
          </h2>
          <span className="text-xs text-slate-400">1-Click từ bài học tới các công cụ AI chuyên sâu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Action 1: Tạo giáo án */}
          <Link
            href={`/materials/lesson-plan?lessonId=${lesson.id}`}
            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800/60 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                Tạo Kế Hoạch Bài Dạy
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Chuẩn CV 5512 / 7991 với 4 hoạt động sư phạm</p>
            </div>
            <div className="mt-4 pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[11px] font-bold text-indigo-600">
              <span>Bắt đầu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Action 2: Tạo slide */}
          <Link
            href={`/materials/slides?lessonId=${lesson.id}`}
            className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/40 dark:to-violet-900/20 border border-violet-200 dark:border-violet-800/60 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-3 shadow group-hover:scale-105 transition-transform">
                <Presentation className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600">
                Tạo Slide Bài Giảng
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Dàn ý 10 slides, tương tác trực quan &amp; KaTeX</p>
            </div>
            <div className="mt-4 pt-2 border-t border-violet-200/60 flex items-center justify-between text-[11px] font-bold text-violet-600">
              <span>Bắt đầu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Action 3: Tạo worksheet */}
          <Link
            href={`/materials/lesson-plan?lessonId=${lesson.id}&type=WORKSHEET`}
            className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/40 dark:to-teal-900/20 border border-teal-200 dark:border-teal-800/60 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-3 shadow group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600">
                Tạo Phiếu Học Tập
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Worksheet hoạt động nhóm và tự học trên lớp</p>
            </div>
            <div className="mt-4 pt-2 border-t border-teal-200/60 flex items-center justify-between text-[11px] font-bold text-teal-600">
              <span>Bắt đầu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Action 4: Tạo câu hỏi */}
          <Link
            href={`/questions/generate?lessonId=${lesson.id}`}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800/60 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 shadow group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600">
                Tạo Câu Hỏi Ngân Hàng
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">4 mức độ Bloom, giải chi tiết &amp; lưu kho câu hỏi</p>
            </div>
            <div className="mt-4 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-amber-600">
              <span>Bắt đầu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Action 5: Tạo đề kiểm tra 7991 */}
          <Link
            href={`/exams/wizard?lessonId=${lesson.id}`}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800/60 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                Tạo Đề Kiểm Tra 7991
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Exam Wizard 7 bước, ma trận 2 chiều &amp; đặc tả</p>
            </div>
            <div className="mt-4 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] font-bold text-blue-600">
              <span>Bắt đầu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* CONNECTED PRODUCTS SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Học Liệu Đã Liên Kết Với Bài Học Này
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab("PLANS")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "PLANS"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Giáo Án ({lessonPlans.length})
            </button>
            <button
              onClick={() => setActiveTab("SLIDES")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "SLIDES"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Slide ({slideDecks.length})
            </button>
            <button
              onClick={() => setActiveTab("EXAMS")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "EXAMS"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Đề Thi ({lesson.exams.length})
            </button>
            <button
              onClick={() => setActiveTab("QUESTIONS")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "QUESTIONS"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Câu Hỏi ({lesson.questions.length})
            </button>
          </div>
        </div>

        {/* TAB 1: LESSON PLANS */}
        {activeTab === "PLANS" && (
          <div>
            {lessonPlans.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Chưa có Kế hoạch bài dạy nào được lưu cho bài học này.
                <div className="mt-3">
                  <Link
                    href={`/materials/lesson-plan?lessonId=${lesson.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Soạn Giáo Án Bằng AI Ngay
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {lessonPlans.map((lp) => (
                  <div
                    key={lp.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{lp.title}</h4>
                      <span className="text-[11px] text-slate-500">Cập nhật: {new Date(lp.updatedAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <Link
                      href={`/materials/lesson-plan?lessonId=${lesson.id}`}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 text-indigo-600 rounded-lg text-xs font-semibold"
                    >
                      Mở Biên Tập
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SLIDES */}
        {activeTab === "SLIDES" && (
          <div>
            {slideDecks.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Chưa có Slide bài giảng nào cho bài học này.
                <div className="mt-3">
                  <Link
                    href={`/materials/slides?lessonId=${lesson.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tạo Slide Bằng AI Ngay
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {slideDecks.map((sd) => (
                  <div
                    key={sd.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sd.title}</h4>
                      <span className="text-[11px] text-slate-500">Cập nhật: {new Date(sd.updatedAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <Link
                      href={`/materials/slides?lessonId=${lesson.id}`}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 text-violet-600 rounded-lg text-xs font-semibold"
                    >
                      Mở Studio Slide
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXAMS */}
        {activeTab === "EXAMS" && (
          <div>
            {lesson.exams.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Chưa có Đề kiểm tra định kỳ nào liên kết với bài học này.
                <div className="mt-3">
                  <Link
                    href={`/exams/wizard?lessonId=${lesson.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tạo Đề Kiểm Tra 7991 Ngay
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {lesson.exams.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ex.title}</h4>
                      <span className="text-[11px] text-slate-500">
                        {ex.questionCount} câu • Thang {ex.totalScore}đ • Cập nhật: {new Date(ex.updatedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <Link
                      href={`/exams/${ex.id}`}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 text-blue-600 rounded-lg text-xs font-semibold"
                    >
                      Xem Chi Tiết Đề
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUESTIONS */}
        {activeTab === "QUESTIONS" && (
          <div>
            {lesson.questions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Chưa có câu hỏi nào được gán cho bài học này trong Ngân hàng câu hỏi.
                <div className="mt-3">
                  <Link
                    href={`/questions/generate?lessonId=${lesson.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> AI Tạo Câu Hỏi Ngân Hàng
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {lesson.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-600">Câu {idx + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-semibold">
                        {q.difficulty}
                      </span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200">
                      <MathContent content={q.content} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
