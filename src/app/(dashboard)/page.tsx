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

  const teacher = await prisma.user.findFirst();
  const teacherGreeting = teacher?.name ? `cô ${teacher.name.split(" ").slice(-1)[0]}` : "cô Huyền";
  const teacherSchool = teacher?.school || "THCS Tân Phong - Vĩnh Long";
  const teacherSubject = teacher?.subjects || "Âm nhạc";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>EduMind THCS • Chuẩn Công văn 7991 &amp; 5512/BGDĐT</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Chào buổi sáng, {teacherGreeting} 👋
          </h1>
          <p className="text-indigo-100/90 text-xs md:text-sm max-w-xl leading-relaxed">
            Hôm nay cô có <strong>4 tiết dạy môn {teacherSubject}</strong> tại {teacherSchool}. Hệ thống đã chuẩn bị sẵn Kế hoạch bài dạy (CV 5512), Slide bài giảng 16:9 và Ngân hàng đề kiểm tra đánh giá năng lực GDPT 2018.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <Link
            href="/exams/wizard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Tạo đề CV 7991</span>
          </Link>
          <Link
            href="/materials/lesson-plan"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Soạn giáo án</span>
          </Link>
          <Link
            href="/materials/slides"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-all active:scale-95"
          >
            <Presentation className="w-4 h-4 text-indigo-200" />
            <span>Slide bài giảng</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <Link
          href="/classes"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lớp phụ trách
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {classesCount || 5}
            </span>
            <span className="text-xs text-slate-500 font-medium">lớp THCS</span>
          </div>
          <p className="mt-2 text-xs text-indigo-600 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Xem danh sách lớp</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>

        {/* KPI 2 */}
        <Link
          href="/students"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng số học sinh
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
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
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bài chưa chấm
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">12</span>
            <span className="text-xs text-slate-500 font-medium">bài cần chấm</span>
          </div>
          <p className="mt-2 text-xs text-amber-600 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Chấm tự động ngay</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>

        {/* KPI 4 */}
        <Link
          href="/students?warning=true"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cần chú ý
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {warningStudentsCount || 8}
            </span>
            <span className="text-xs text-rose-600 font-medium">cần rèn nhịp phách</span>
          </div>
          <p className="mt-2 text-xs text-rose-600 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Xem danh sách</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>
      </div>

      {/* NEW FEATURE HIGHLIGHT: HỌC LIỆU & CÔNG VĂN 7991 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
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
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Mở Trung Tâm Xuất Học Liệu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/exams/wizard"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Exam Wizard 7991
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Tạo đề kiểm tra ma trận 2 chiều tự động đồng bộ, bản đặc tả và barem điểm từng bước.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-bold text-indigo-600 flex items-center gap-1">
              Khởi tạo ngay <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/materials/lesson-plan"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Kế Hoạch Bài Dạy (5512)
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                4 hoạt động sư phạm chuẩn quy định, chỉnh sửa độc lập từng phần và xuất bản Word / PDF.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-bold text-indigo-600 flex items-center gap-1">
              Soạn giáo án <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/materials/slides"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Presentation className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Slide Bài Giảng AI
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Dàn ý 10 slides, phòng chiếu toàn màn hình, mini-game tương tác, nốt nhạc và học liệu số.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-bold text-indigo-600 flex items-center gap-1">
              Thiết kế slide <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/lessons"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Không Gian Bài Học
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Thư mục bài học GDPT 2018 (Âm nhạc Khối 6, 7, 8, 9) kết nối 5 sản phẩm học liệu thống nhất.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-bold text-indigo-600 flex items-center gap-1">
              Khám phá bài học <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* AI Insight Spotlight Card */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-indigo-50/60 border border-indigo-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                  AI Classroom Insight
                </span>
                <span className="text-xs text-slate-400">• Vừa cập nhật 10 phút trước</span>
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-900">
                Lớp 7A1 đang có một số em cần rèn thêm kỹ năng &ldquo;Giữ nhịp phách 4/4 và Đọc nhạc&rdquo;
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Học sinh nắm vững lời ca bài Nụ cười nhưng còn chệch phách ở đoạn điệp khúc. AI gợi ý chia nhóm đôi bạn cùng tiến kết hợp gõ đệm thanh phách 5 phút đầu giờ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/exams/wizard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-xs active:scale-95 transition-all"
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
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Lịch dạy hôm nay</h3>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
                Thứ Hai, Học kỳ I (2026–2027)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex flex-col items-center justify-center text-xs shrink-0 shadow-xs">
                  <span>T1</span>
                  <span className="text-[9px] font-normal opacity-80">07:30</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Lớp 7A1</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold px-2 py-0.5 rounded-md">
                      P.Nghệ thuật 1
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 mt-1">
                    Chủ đề 2: Tình bạn - Học hát bài Nụ cười (Tiết 1)
                  </h4>
                  <div className="flex items-center gap-2 mt-2.5">
                    <Link
                      href="/materials/slides"
                      className="text-[11px] text-indigo-600 hover:underline font-semibold"
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

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold flex flex-col items-center justify-center text-xs shrink-0 shadow-xs">
                  <span>T2</span>
                  <span className="text-[9px] font-normal opacity-80">08:20</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Lớp 7A2</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold px-2 py-0.5 rounded-md">
                      P.Nghệ thuật 1
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 mt-1">
                    Chủ đề 2: Tình bạn - Nhạc cụ gõ thanh phách (Tiết 2)
                  </h4>
                  <div className="flex items-center gap-2 mt-2.5">
                    <Link
                      href="/materials/slides"
                      className="text-[11px] text-indigo-600 hover:underline font-semibold"
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
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Đề kiểm tra gần đây</h3>
              <Link href="/exams" className="text-xs text-indigo-600 font-semibold hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {recentExams.map((ex) => (
                <Link
                  key={ex.id}
                  href={`/exams/${ex.id}`}
                  className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 transition-all block group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate max-w-[200px]">
                      {ex.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {ex.durationMinutes}p
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                    <span>{ex.questionCount} câu • Thang {ex.totalScore}đ</span>
                    <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">
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
