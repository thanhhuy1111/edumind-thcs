"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Plus,
  Search,
  Sparkles,
  Calendar,
  Clock,
  ChevronRight,
  Printer,
  Trash2,
  CheckCircle2,
  FileText,
  Layers,
} from "lucide-react";

interface ExamItem {
  id: string;
  title: string;
  subject: string;
  gradeLevel: number;
  durationMinutes: number;
  totalScore: number;
  questionCount: number;
  status: string;
  examType: string;
  createdAt: string;
  class?: { name: string; gradeLevel: number } | null;
  versions: Array<{ id: string; versionCode: string }>;
  _count: { questions: number; attempts: number };
}

export default function ExamsListPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchExams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (gradeFilter !== "ALL") params.append("gradeLevel", gradeFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/exams?${params.toString()}`);
      const data = await res.json();
      setExams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [gradeFilter, statusFilter]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Cô có chắc muốn xóa đề thi này?")) return;
    try {
      const res = await fetch(`/api/exams/${id}`, { method: "DELETE" });
      if (res.ok) {
        setExams((prev) => prev.filter((ex) => ex.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Đề kiểm tra & Khảo sát THCS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Danh sách đề kiểm tra
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý đề 15 phút, 1 tiết, học kỳ kèm 4 mã đề (101, 102, 103, 104) chuẩn Bộ GD&ĐT.
          </p>
        </div>

        <Link
          href="/exams/builder"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đề ma trận mới</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">Tất cả các khối</option>
            <option value="6">Khối 6</option>
            <option value="7">Khối 7</option>
            <option value="8">Khối 8</option>
            <option value="9">Khối 9</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="READY">Sẵn sàng (Ready)</option>
            <option value="COMPLETED">Đã kiểm tra</option>
            <option value="DRAFT">Bản nháp</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên đề thi..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 bg-white rounded-3xl border border-slate-200 p-6 animate-pulse" />
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">Chưa có đề kiểm tra nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bấm nút &quot;Tạo đề ma trận mới&quot; để thiết lập đề kiểm tra theo chuẩn ma trận GDPT 2018.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.map((exam) => (
            <Link
              key={exam.id}
              href={`/exams/${exam.id}`}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-blue-300 transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {exam.class?.name ? `Lớp ${exam.class.name}` : `Khối ${exam.gradeLevel}`}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{exam.subject}</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {exam.title}
                    </h3>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      exam.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : exam.status === "READY"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {exam.status === "COMPLETED" ? "Đã kiểm tra" : "Sẵn sàng"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {exam.durationMinutes} phút
                  </span>
                  <span>•</span>
                  <span>{exam._count.questions} câu hỏi</span>
                  <span>•</span>
                  <span>Thang điểm: {exam.totalScore}đ</span>
                  <span>•</span>
                  <span className="font-bold text-indigo-700">
                    {exam.versions.length} mã đề (101-104)
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {exam._count.attempts > 0
                    ? `Đã chấm ${exam._count.attempts} bài`
                    : "Chưa có bài nộp"}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Xem đề & In ấn
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
