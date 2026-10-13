import React from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  ChevronRight,
  BookOpen,
  FileText,
  AlertTriangle,
  Presentation,
  FileCheck2,
  Layers,
  Award,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  // Fetch real statistics from database
  const classesCount = await prisma.class.count();
  const studentsCount = await prisma.student.count();
  const examsCount = await prisma.exam.count();
  const warningStudentsCount = await prisma.student.count({
    where: { status: "WARNING" },
  });

  const pendingGradingCount = await prisma.examAttempt.count({
    where: { status: "SUBMITTED" },
  });

  // Find real weakest skill for the AI Classroom Insight card
  const weakestSkillRecord = await prisma.studentSkill.findFirst({
    where: { masteryScore: { lt: 60 } },
    include: { skill: true, student: { include: { class: true } } },
    orderBy: { masteryScore: "asc" },
  });

  const recentExams = await prisma.exam.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { class: true, versions: true },
  });

  const teacher = await prisma.user.findFirst();
  const teacherGreeting = teacher?.name
    ? `cô ${teacher.name.split(" ").slice(-1)[0]}`
    : "cô Huyền";
  const teacherSchool = teacher?.school || "THCS Tân Phong - Vĩnh Long";
  const teacherSubject = teacher?.subjects || "Âm nhạc";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-md border border-indigo-700/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>EduMind THCS • Chuẩn Công văn 7991 &amp; 5512/BGDĐT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Chào buổi sáng, {teacherGreeting} 👋
            </h1>
            <p className="text-indigo-100/90 text-sm leading-relaxed">
              Hôm nay cô có <strong>4 tiết dạy môn {teacherSubject}</strong> tại {teacherSchool}. Hệ thống đã chuẩn bị sẵn Kế hoạch bài dạy (CV 5512), Slide bài giảng 16:9 và Ngân hàng đề kiểm tra đánh giá năng lực GDPT 2018.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/exams/wizard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
            >
              <Award className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Tạo đề CV 7991</span>
            </Link>
            <Link
              href="/materials/lesson-plan"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Soạn giáo án</span>
            </Link>
            <Link
              href="/materials/slides"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
            >
              <Presentation className="w-4 h-4 text-indigo-200 shrink-0" />
              <span>Slide bài giảng</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Link
          href="/classes"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Lớp phụ trách
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {classesCount || 5}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">lớp THCS</span>
          </div>
          <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Xem danh sách lớp</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>

        {/* KPI 2 */}
        <Link
          href="/students"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng số học sinh
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {studentsCount || 71}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">học sinh</span>
          </div>
          <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Hồ sơ &amp; tiến độ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>

        {/* KPI 3 */}
        <Link
          href="/grading"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bài chưa chấm
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {pendingGradingCount || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">bài cần chấm</span>
          </div>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Chấm tự động ngay</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>

        {/* KPI 4 */}
        <Link
          href="/students?warning=true"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cần chú ý
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {warningStudentsCount || 0}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">học sinh cần hỗ trợ</span>
          </div>
          <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Xem danh sách</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>
      </section>

      {/* 3. AI Insight Spotlight Card */}
      <section className="rounded-2xl p-6 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/50 px-2.5 py-0.5 rounded-full">
                  AI Classroom Insight
                </span>
                <span className="text-xs text-slate-400">• Dữ liệu lớp học thực tế</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {weakestSkillRecord
                  ? `Lớp ${weakestSkillRecord.student.class.name} có học sinh cần củng cố kỹ năng "${weakestSkillRecord.skill.name}"`
                  : "Mặt bằng học tập ổn định, chuẩn bị tốt cho các bài kiểm tra định kỳ"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {weakestSkillRecord
                  ? `Dữ liệu ghi nhận học sinh ${weakestSkillRecord.student.name} (Lớp ${weakestSkillRecord.student.class.name}) đạt ${weakestSkillRecord.masteryScore}% ở kỹ năng này. AI gợi ý cho các em làm bài tập bổ trợ hoặc hoạt động đôi bạn cùng tiến.`
                  : `Học sinh nắm vững các yêu cầu cần đạt của bộ môn. AI gợi ý chia nhóm đôi bạn cùng tiến kết hợp các bài tập phân hóa để nâng cao chất lượng.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto">
            <Link
              href="/exams/wizard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-xs active:scale-95 transition-all"
            >
              <span>Tạo đề ôn tập 7991</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/materials"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
            >
              Xuất phiếu bài tập
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Pedagogical Workflow (CV 7991 & 5512) */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-lg">
                <Award className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Không Gian Sư Phạm Chuẩn Công Văn 7991 &amp; 5512/BGDĐT
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quy trình khép kín: Soạn giáo án → Tạo slide → Sinh câu hỏi → Tạo ma trận 2 chiều → Xuất trọn bộ Word &amp; PDF
            </p>
          </div>

          <Link
            href="/export-center"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Mở Trung Tâm Xuất Học Liệu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/exams/wizard"
            className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Exam Wizard 7991
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tạo đề kiểm tra ma trận 2 chiều, bản đặc tả và barem điểm chuẩn GDPT 2018.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              Khởi tạo ngay <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/materials/lesson-plan"
            className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Kế Hoạch Bài Dạy (5512)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                4 hoạt động sư phạm chuẩn quy định, chỉnh sửa trực quan và xuất Word / PDF.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              Soạn giáo án <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/materials/slides"
            className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Presentation className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Slide Bài Giảng AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Dàn ý 10 slides, phòng chiếu toàn màn hình, tương tác nốt nhạc và học liệu số.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              Thiết kế slide <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/lessons"
            className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Không Gian Bài Học
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Thư mục bài học GDPT 2018 (Khối 6, 7, 8, 9) đồng bộ trọn bộ tài liệu học tập.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              Khám phá bài học <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* 5. Schedule & Recent Exams */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Lịch dạy hôm nay</h3>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
                Thứ Hai, Học kỳ I (2026–2027)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex flex-col items-center justify-center text-xs shrink-0 shadow-xs">
                  <span>T1</span>
                  <span className="text-[10px] font-normal opacity-80">07:30</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Lớp 7A1</span>
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 font-semibold px-2 py-0.5 rounded-md">
                      P.Nghệ thuật 1
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-300 mt-1">
                    Chủ đề 2: Tình bạn - Học hát bài Nụ cười (Tiết 1)
                  </h4>
                  <div className="flex items-center gap-2 mt-2.5">
                    <Link
                      href="/materials/slides"
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Mở Slide chiếu
                    </Link>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <Link
                      href="/materials/lesson-plan"
                      className="text-xs text-slate-500 dark:text-slate-400 hover:underline"
                    >
                      Xem giáo án
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold flex flex-col items-center justify-center text-xs shrink-0 shadow-xs">
                  <span>T2</span>
                  <span className="text-[10px] font-normal opacity-80">08:20</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Lớp 7A2</span>
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 font-semibold px-2 py-0.5 rounded-md">
                      P.Nghệ thuật 1
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-300 mt-1">
                    Chủ đề 2: Tình bạn - Nhạc cụ gõ thanh phách (Tiết 2)
                  </h4>
                  <div className="flex items-center gap-2 mt-2.5">
                    <Link
                      href="/materials/slides"
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Mở Slide chiếu
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Exams */}
        <div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Đề kiểm tra gần đây</h3>
              <Link href="/exams" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {recentExams.map((ex) => (
                <Link
                  key={ex.id}
                  href={`/exams/${ex.id}`}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all block group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate max-w-[180px]">
                      {ex.title}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {ex.durationMinutes}p
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center justify-between">
                    <span>{ex.questionCount} câu • Thang {ex.totalScore}đ</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      Mở →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
