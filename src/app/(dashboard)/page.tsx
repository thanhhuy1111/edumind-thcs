import React from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  FileSpreadsheet,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  BookOpen,
  FileQuestion,
  TrendingDown,
  Plus,
  Presentation,
  FileCheck2,
  Download,
  Layers,
  Award,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  // Fetch real statistics from database
  const classesCount = await prisma.class.count();
  const studentsCount = await prisma.student.count();
  const questionsCount = await prisma.question.count();
  const examsCount = await prisma.exam.count();
  const materialsCount = await prisma.teacherMaterial.count();
  const warningStudentsCount = await prisma.student.count({
    where: { status: "WARNING" },
  });

  const recentExams = await prisma.exam.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { class: true, versions: true },
  });

  const recentClasses = await prisma.class.findMany({
    take: 4,
    orderBy: { name: "asc" },
    include: { _count: { select: { students: true } } },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>EduMind AI THCS • Tích hợp Công văn 7991 &amp; 5512/BGDĐT</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Chào buổi sáng, cô Lan 👋
          </h1>
          <p className="text-blue-100 text-sm max-w-xl">
            Hôm nay cô có <strong>4 tiết dạy Toán</strong> tại THCS Chu Văn An. Hệ thống đã chuẩn bị sẵn Kế hoạch bài dạy, Slide bài giảng và Exam Wizard 7991.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Link
            href="/exams/wizard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-800 text-xs font-bold shadow-md hover:bg-blue-50 transition-all active:scale-95"
          >
            <Award className="w-4 h-4 text-blue-600" />
            <span>Tạo đề CV 7991</span>
          </Link>
          <Link
            href="/materials/lesson-plan"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:bg-blue-600/80 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Soạn giáo án</span>
          </Link>
          <Link
            href="/materials/slides"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:bg-indigo-600/80 transition-all active:scale-95"
          >
            <Presentation className="w-4 h-4 text-violet-200" />
            <span>Slide bài giảng</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <Link
          href="/classes"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lớp phụ trách
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {classesCount || 4}
            </span>
            <span className="text-xs text-slate-500 font-medium">lớp THCS</span>
          </div>
          <p className="mt-2 text-xs text-blue-600 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Xem danh sách lớp</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>

        {/* KPI 2 */}
        <Link
          href="/students"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng số học sinh
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {studentsCount || 71}
            </span>
            <span className="text-xs text-slate-500 font-medium">học sinh</span>
          </div>
          <p className="mt-2 text-xs text-indigo-600 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Hồ sơ &amp; tiến độ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>

        {/* KPI 3 */}
        <Link
          href="/grading"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bài chưa chấm
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700 tracking-tight">12</span>
            <span className="text-xs text-slate-500 font-medium">bài cần chấm</span>
          </div>
          <p className="mt-2 text-xs text-amber-700 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Chấm tự động ngay</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>

        {/* KPI 4 */}
        <Link
          href="/students?warning=true"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cần chú ý
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700 tracking-tight">
              {warningStudentsCount || 8}
            </span>
            <span className="text-xs text-rose-600 font-medium">điểm dưới 60%</span>
          </div>
          <p className="mt-2 text-xs text-rose-600 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Xem học sinh yếu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>
      </div>

      {/* NEW FEATURE HIGHLIGHT: HỌC LIỆU & CÔNG VĂN 7991 */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Award className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Không Gian Sư Phạm Chuẩn Công Văn 7991 &amp; 5512/BGDĐT
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy trình khép kín: Chọn bài học → Soạn giáo án → Tạo slide → Sinh câu hỏi → Tạo đề kiểm tra ma trận 2 chiều → Xuất trọn bộ Word &amp; PDF
            </p>
          </div>

          <Link
            href="/export-center"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Mở Trung Tâm Xuất Học Liệu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/exams/wizard"
            className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 hover:bg-blue-50 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2.5 shadow group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                Exam Wizard 7991
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                7 bước tạo đề kiểm tra, ma trận 2 chiều tự động đồng bộ, bản đặc tả và barem điểm từng bước.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-bold text-blue-600 flex items-center gap-1">
              Khởi tạo ngay <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/materials/lesson-plan"
            className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 hover:bg-indigo-50 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2.5 shadow group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                Kế Hoạch Bài Dạy (5512)
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                4 hoạt động sư phạm chuẩn quy định, chỉnh sửa độc lập từng phần và xuất bản Word / PDF.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-bold text-indigo-600 flex items-center gap-1">
              Soạn giáo án <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/materials/slides"
            className="p-4 rounded-2xl bg-violet-50/60 border border-violet-200/80 hover:bg-violet-50 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-2.5 shadow group-hover:scale-105 transition-transform">
                <Presentation className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-violet-700">
                Slide Bài Giảng AI
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Dàn ý 10 slides, phòng chiếu toàn màn hình, mini-game tương tác và công thức Toán KaTeX.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-bold text-violet-600 flex items-center gap-1">
              Thiết kế slide <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/lessons"
            className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 hover:bg-teal-50 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-2.5 shadow group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                Không Gian Bài Học
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Thư mục bài học GDPT 2018 (Toán 6, 7, 8, 9) kết nối 5 sản phẩm học liệu thống nhất.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-bold text-teal-600 flex items-center gap-1">
              Khám phá bài học <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* AI Insight Spotlight Card */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50/80 border border-blue-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20 ai-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  AI Classroom Insight
                </span>
                <span className="text-xs text-slate-500">• Vừa cập nhật 10 phút trước</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Lớp 7A1 đang có 12 học sinh đạt dưới 60% ở chủ đề &ldquo;Tỉ lệ thức&rdquo;
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Học sinh gặp khó khăn nhiều nhất ở thao tác nhân tích chéo và áp dụng tính chất dãy tỉ số bằng nhau. AI gợi ý tạo bài luyện tập ngắn 15 phút để ôn tập đầu giờ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/exams/wizard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-xs active:scale-95 transition-all"
            >
              <span>Tạo đề ôn tập 7991</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/materials"
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 active:scale-95 transition-all"
            >
              Xuất phiếu bài tập
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Today's Schedule + Recent Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Schedule (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Lịch dạy hôm nay</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Thứ Hai, 04/10/2026
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex flex-col items-center justify-center text-xs shrink-0">
                  <span>T1</span>
                  <span className="text-[9px] font-normal opacity-80">07:30</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-blue-900">Lớp 7A1</span>
                    <span className="text-[10px] bg-blue-200/60 text-blue-800 font-semibold px-1.5 py-0.2 rounded">
                      Phòng 204
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 mt-0.5">
                    Bài 6: Tỉ lệ thức và dãy tỉ số bằng nhau (Tiết 1)
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Link
                      href="/materials/slides"
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      Mở Slide chiếu
                    </Link>
                    <span className="text-slate-300">•</span>
                    <Link
                      href="/materials/lesson-plan"
                      className="text-[11px] text-slate-500 hover:underline"
                    >
                      Xem giáo án
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-700 text-white font-bold flex flex-col items-center justify-center text-xs shrink-0">
                  <span>T2</span>
                  <span className="text-[9px] font-normal opacity-80">08:20</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Lớp 7A2</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.2 rounded">
                      Phòng 205
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 mt-0.5">
                    Bài 6: Tỉ lệ thức và dãy tỉ số bằng nhau (Tiết 1)
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Link
                      href="/materials/slides"
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      Mở Slide chiếu
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Exams & Shortcuts (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Đề kiểm tra gần đây</h3>
              <Link href="/exams" className="text-xs text-blue-600 font-semibold hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {recentExams.map((ex) => (
                <Link
                  key={ex.id}
                  href={`/exams/${ex.id}`}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 transition-all block group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate max-w-[200px]">
                      {ex.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {ex.durationMinutes}p
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{ex.questionCount} câu • Thang {ex.totalScore}đ</span>
                    <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                      Mở →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
