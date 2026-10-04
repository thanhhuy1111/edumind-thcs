"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Users,
  GraduationCap,
  FileSpreadsheet,
  ArrowLeft,
  Sparkles,
  Search,
  Plus,
  ChevronRight,
  TrendingDown,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import { getScoreColor } from "@/lib/utils";

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;

  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "exams" | "analytics">("students");
  const [studentSearch, setStudentSearch] = useState("");

  const fetchClass = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/classes/${classId}`);
      if (!res.ok) throw new Error("Failed to load class");
      const data = await res.json();
      setClassData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) fetchClass();
  }, [classId]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy lớp học</h2>
        <Link href="/classes" className="mt-4 inline-block text-blue-600 text-sm font-semibold">
          Quay lại danh sách lớp
        </Link>
      </div>
    );
  }

  const filteredStudents = classData.students.filter(
    (s: any) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Danh sách lớp</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-700">Lớp {classData.name}</span>
      </div>

      {/* Class Banner Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            {classData.name}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-slate-900">Lớp {classData.name}</h1>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                Khối {classData.gradeLevel}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Phòng: {classData.roomNumber || "P.101"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {classData.subject} • Năm học {classData.schoolYear} • GVBM: Cô Nguyễn Thị Lan
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl shrink-0">
          <div className="text-center px-3">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Sĩ số</span>
            <span className="text-lg font-black text-slate-900">{classData.students.length} HS</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center px-3">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Điểm TB</span>
            <span className="text-lg font-black text-blue-600">{classData.classAverage}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center px-3">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Đề thi</span>
            <span className="text-lg font-black text-slate-900">{classData.exams.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "students"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Danh sách học sinh ({classData.students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("exams")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "exams"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Bài kiểm tra ({classData.exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "analytics"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Phân tích năng lực</span>
        </button>
      </div>

      {/* Tab 1: Students Table */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Tìm học sinh theo tên, mã..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <Link
              href={`/students?classId=${classData.id}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Thêm học sinh vào lớp</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Mã HS</th>
                  <th className="py-3.5 px-4">Họ và tên</th>
                  <th className="py-3.5 px-4">Giới tính</th>
                  <th className="py-3.5 px-4">Điểm TB</th>
                  <th className="py-3.5 px-4">Kỹ năng cần bổ trợ</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s: any) => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{s.studentCode}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <Link href={`/students/${s.id}`} className="hover:text-blue-600">
                        {s.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{s.gender}</td>
                    <td className="py-3.5 px-4">
                      {s.averageScore !== "—" ? (
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-xs border ${getScoreColor(
                            parseFloat(s.averageScore)
                          )}`}
                        >
                          {s.averageScore}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="line-clamp-1">{s.lowestSkill}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.status === "WARNING" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          Cần chú ý
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Bình thường
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/students/${s.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 text-xs font-semibold transition-all"
                      >
                        Hồ sơ
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Class Exams */}
      {activeTab === "exams" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Lịch sử bài kiểm tra của lớp</h3>
            <Link
              href={`/exams/builder?classId=${classData.id}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đề cho lớp này</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classData.exams.map((exam: any) => (
              <div
                key={exam.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{exam.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Thời lượng: {exam.durationMinutes} phút • {exam.questionCount} câu hỏi
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    {exam.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">
                    {exam.versions.length} mã đề (101, 102...) • {exam._count.attempts} lượt đã nộp
                  </span>
                  <Link
                    href={`/exams/${exam.id}`}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Xem chi tiết
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Analytics */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grade Distribution Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Phổ điểm bài kiểm tra gần nhất</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700">Giỏi (&ge; 8.0)</span>
                  <span className="text-slate-800">{classData.gradeDistribution.gioi} HS</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(classData.gradeDistribution.gioi / (classData.students.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-blue-700">Khá (6.5 - 7.9)</span>
                  <span className="text-slate-800">{classData.gradeDistribution.kha} HS</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(classData.gradeDistribution.kha / (classData.students.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700">Trung bình (5.0 - 6.4)</span>
                  <span className="text-slate-800">{classData.gradeDistribution.tb} HS</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${(classData.gradeDistribution.tb / (classData.students.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-700">Yếu (&lt; 5.0)</span>
                  <span className="text-slate-800">{classData.gradeDistribution.yeu} HS</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${(classData.gradeDistribution.yeu / (classData.students.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendation Spotlight for this class */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-blue-50 via-indigo-50/50 to-purple-50 border border-blue-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900">AI Nhận định chuyên môn</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Lớp <strong>{classData.name}</strong> có tỉ lệ học sinh đạt Khá - Giỏi chiếm hơn 65%. Tuy nhiên, hệ thống nhận thấy độ phân hóa rõ rệt ở kỹ năng <strong>&ldquo;Tỉ lệ thức & Dãy tỉ số bằng nhau&rdquo;</strong> với 5 học sinh đạt dưới 5.0 điểm.
            </p>
            <div className="p-3 bg-white/80 rounded-2xl border border-blue-200 text-xs space-y-1">
              <span className="font-bold text-slate-900">Hành động gợi ý cho giáo viên:</span>
              <p className="text-slate-600">
                1. Dành 10 phút đầu tiết học tới để sửa 2 câu tính chéo trong đề vừa qua.
              </p>
              <p className="text-slate-600">
                2. Giao phiếu ôn tập tự luyện cho nhóm 5 học sinh cần chú ý.
              </p>
            </div>
            <Link
              href="/exams/builder?topic=ti-le-thuc&grade=7"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-2xs"
            >
              <span>Tạo đề kiểm tra bù hổng kiến thức</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
