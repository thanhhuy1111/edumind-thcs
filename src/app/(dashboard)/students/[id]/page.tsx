"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  GraduationCap,
  ArrowLeft,
  Sparkles,
  Award,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  FileSpreadsheet,
  ChevronRight,
  BookOpen,
  Copy,
  Check,
} from "lucide-react";
import { getScoreColor } from "@/lib/utils";
import { MathContent } from "@/components/ui/MathContent";

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/students/${studentId}`);
        if (!res.ok) throw new Error("Failed to load student");
        const data = await res.json();
        setStudent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (studentId) loadData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin học sinh</h2>
        <Link href="/students" className="mt-4 inline-block text-blue-600 text-sm font-semibold">
          Quay lại danh sách học sinh
        </Link>
      </div>
    );
  }

  const scores = student.examAttempts.map((a: any) => a.score);
  const averageScore =
    scores.length > 0
      ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)
      : "—";

  const handleCopyRemark = () => {
    if (!student.aiAnalysis?.teacherRemark) return;
    navigator.clipboard.writeText(student.aiAnalysis.teacherRemark);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link
          href={`/classes/${student.classId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Lớp {student.class.name}</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-700">{student.name}</span>
      </div>

      {/* Student Profile Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            {student.name
              .split(" ")
              .slice(-2)
              .map((w: string) => w[0])
              .join("")}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-slate-900">{student.name}</h1>
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                {student.studentCode}
              </span>
              {student.status === "WARNING" ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Cần chú ý
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đang học tốt
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Lớp {student.class.name} (Khối {student.class.gradeLevel})
              </span>
              <span>Giới tính: {student.gender}</span>
              {student.birthday && <span>Ngày sinh: {student.birthday}</span>}
              {student.parentPhone && (
                <span className="flex items-center gap-1 text-slate-600">
                  <Phone className="w-3 h-3 text-slate-400" />
                  PH: {student.parentPhone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Average Score Block */}
        <div className="flex items-center gap-6 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl shrink-0">
          <div className="text-center px-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block">Điểm trung bình</span>
            <span className="text-2xl font-black text-blue-600">{averageScore}/10</span>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center px-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block">Bài kiểm tra</span>
            <span className="text-2xl font-black text-slate-800">{student.examAttempts.length}</span>
          </div>
        </div>
      </div>

      {/* AI Personalized Remark Card */}
      {student.aiAnalysis && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50/80 border border-blue-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  AI Nhận xét & Đánh giá năng lực cá nhân
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dựa trên kết quả bài kiểm tra và tỷ lệ hoàn thành từng kỹ năng
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyRemark}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-50 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Đã chép" : "Sao chép nhận xét"}</span>
            </button>
          </div>

          <div className="p-4 bg-white/90 rounded-2xl border border-blue-100/80 text-xs text-slate-700 leading-relaxed font-sans">
            <MathContent content={student.aiAnalysis.teacherRemark} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white/60 rounded-xl border border-emerald-200/60">
              <span className="font-bold text-emerald-800 block mb-1">✓ Chủ đề vững:</span>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {student.aiAnalysis.strongSkills.map((s: string, idx: number) => (
                  <li key={idx}>
                    <MathContent content={s} inline />
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-white/60 rounded-xl border border-rose-200/60">
              <span className="font-bold text-rose-800 block mb-1">⚠ Cần rèn luyện thêm:</span>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {student.aiAnalysis.weakSkills.map((s: string, idx: number) => (
                  <li key={idx}>
                    <MathContent content={s} inline />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Section: Skill Mastery Radar/Bar + Exam Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Skill Mastery Bars */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Mức độ thành thạo kỹ năng</h3>
            <span className="text-xs font-semibold text-slate-400">Thang điểm 100%</span>
          </div>

          <div className="space-y-4">
            {student.studentSkills.map((sk: any) => {
              const score = sk.masteryScore;
              const barColor =
                score >= 80
                  ? "bg-emerald-500"
                  : score >= 65
                  ? "bg-blue-500"
                  : score >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500";

              return (
                <div key={sk.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 font-bold">{sk.skill.name}</span>
                    <span className="font-mono text-slate-600">{score}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Số lần làm: {sk.attemptCount} bài</span>
                    <span>Làm đúng: {sk.correctCount} lần</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Exam History */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Lịch sử bài kiểm tra</h3>
            <span className="text-xs text-slate-400">{student.examAttempts.length} bài đã nộp</span>
          </div>

          <div className="space-y-3">
            {student.examAttempts.map((attempt: any) => (
              <div
                key={attempt.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{attempt.exam.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {attempt.version && (
                      <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        Mã đề {attempt.version.versionCode}
                      </span>
                    )}
                    <span>•</span>
                    <span>Thời gian: {attempt.exam.durationMinutes} phút</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-xl font-black text-sm border ${getScoreColor(
                      attempt.score,
                      attempt.maxScore
                    )}`}
                  >
                    {attempt.score}/{attempt.maxScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
