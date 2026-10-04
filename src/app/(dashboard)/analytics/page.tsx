"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import { getScoreColor } from "@/lib/utils";

interface SkillSummary {
  skillId: string;
  name: string;
  averageMastery: number;
  studentCount: number;
  below60Count: number;
}

interface StrugglingStudent {
  id: string;
  name: string;
  studentCode: string;
  className: string;
  averageScore: string;
  weakSkillName: string;
  weakSkillScore: number;
}

export default function AnalyticsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [skillSummaries, setSkillSummaries] = useState<SkillSummary[]>([]);
  const [strugglingStudents, setStrugglingStudents] = useState<StrugglingStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url =
      selectedClass === "ALL" ? "/api/analytics" : `/api/analytics?classId=${selectedClass}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setSkillSummaries(data.skillMasterySummary || []);
        setStrugglingStudents(data.strugglingStudents || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedClass]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Đánh giá năng lực theo chuẩn GDPT 2018</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Phân tích năng lực học sinh
          </h1>
          <p className="text-sm text-slate-500">
            Theo dõi mức độ làm chủ từng kỹ năng (Mastery Score) và phát hiện sớm học sinh có nguy cơ hổng kiến thức.
          </p>
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-500">Lớp:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
          >
            <option value="ALL">Toàn bộ các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name} (Khối {c.gradeLevel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Recommendation Alert */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50/80 border border-blue-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                AI Diagnostic Report
              </span>
              <span className="text-xs text-slate-400">• Dựa trên 42 bài kiểm tra gần nhất</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Kỹ năng &ldquo;Tìm giá trị ẩn x, y trong tỉ lệ thức&rdquo; có tỷ lệ hổng kiến thức cao nhất
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Có <strong>12 học sinh</strong> đạt dưới 60% ở kỹ năng này. Sai sót phổ biến nhất là không đảo vế khi nhân chéo và quên kiểm tra mẫu số khác 0.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/exams/builder?topic=ti-le-thuc&grade=7"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <span>Tạo bài luyện tập bù hổng</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Skill Mastery Bars (Left) + Struggling Students (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Skill Mastery (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Mức độ thành thạo theo Kỹ năng (Mastery Level)
                </h3>
                <p className="text-xs text-slate-500">
                  Mục tiêu chuẩn đầu ra theo thang điểm 100%.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">
                GDPT 2018
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Đang tổng hợp dữ liệu...</div>
            ) : skillSummaries.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">Chưa có dữ liệu bài kiểm tra.</div>
            ) : (
              <div className="space-y-5">
                {skillSummaries.map((s) => {
                  const score = s.averageMastery;
                  const barColor =
                    score >= 75
                      ? "bg-emerald-500"
                      : score >= 60
                      ? "bg-blue-500"
                      : score >= 50
                      ? "bg-amber-500"
                      : "bg-rose-500";

                  return (
                    <div key={s.skillId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{s.name}</span>
                        <div className="flex items-center gap-2">
                          {s.below60Count > 0 && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              {s.below60Count} HS &lt; 60%
                            </span>
                          )}
                          <span className="font-mono font-bold text-slate-700">{score}%</span>
                        </div>
                      </div>

                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Students Needing Attention (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">Học sinh cần chú ý đặc biệt</h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                {strugglingStudents.length} HS
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Các học sinh có điểm trung bình hoặc kỹ năng trọng tâm dưới 60%, cần phiếu bài tập phụ đạo.
            </p>

            <div className="space-y-2.5">
              {strugglingStudents.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/80 hover:bg-rose-50 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/students/${s.id}`}
                        className="font-bold text-xs text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {s.name}
                      </Link>
                      <span className="font-mono text-[10px] text-slate-400">{s.studentCode}</span>
                      <span className="text-[10px] font-bold bg-white text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                        {s.className}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700">
                      Yếu: {s.weakSkillName} ({s.weakSkillScore}%)
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-xs text-rose-700 block">
                      {s.averageScore}đ
                    </span>
                    <Link
                      href={`/students/${s.id}`}
                      className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5 mt-0.5"
                    >
                      <span>Hồ sơ</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/materials"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Xem Phiếu bài tập bổ trợ đã tạo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
