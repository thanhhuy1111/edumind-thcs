"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Search,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Filter,
  X,
  Upload,
} from "lucide-react";
import { getScoreColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface StudentItem {
  id: string;
  studentCode: string;
  name: string;
  gender: string;
  birthday: string | null;
  parentPhone: string | null;
  status: string;
  classId: string;
  className: string;
  gradeLevel: number;
  averageScore: string;
  weakSkillsCount: number;
  lowestSkillName: string;
  lowestSkillScore: number | null;
}

function StudentsContent() {
  const searchParams = useSearchParams();
  const warningParam = searchParams.get("warning");
  const classIdParam = searchParams.get("classId");

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(classIdParam || "ALL");
  const [warningFilter, setWarningFilter] = useState<boolean>(warningParam === "true");
  const [search, setSearch] = useState("");

  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [singleForm, setSingleForm] = useState({
    classId: "",
    studentCode: "",
    name: "",
    gender: "Nam",
    birthday: "2013-01-01",
    parentPhone: "",
  });

  const [importText, setImportText] = useState("");
  const [importClassId, setImportClassId] = useState("");

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data);
      if (data.length > 0 && !singleForm.classId) {
        setSingleForm((prev) => ({ ...prev, classId: data[0].id }));
        setImportClassId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedClass !== "ALL") params.append("classId", selectedClass);
      if (warningFilter) params.append("warning", "true");
      if (search) params.append("search", search);

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedClass, warningFilter, search]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleForm),
      });
      if (res.ok) {
        setIsSingleModalOpen(false);
        setSingleForm({
          classId: classes[0]?.id || "",
          studentCode: "",
          name: "",
          gender: "Nam",
          birthday: "2013-01-01",
          parentPhone: "",
        });
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importClassId || !importText.trim()) return;

    // Parse CSV or tab-separated text: studentCode, name, gender
    const lines = importText.split("\n").filter((l) => l.trim().length > 0);
    const bulkStudents = lines.map((line) => {
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      return {
        studentCode: parts[0] || `HS${Math.floor(1000 + Math.random() * 9000)}`,
        name: parts[1] || parts[0],
        gender: parts[2] || "Nam",
        parentPhone: parts[3] || undefined,
      };
    });

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: importClassId,
          bulkStudents,
        }),
      });
      if (res.ok) {
        setIsImportModalOpen(false);
        setImportText("");
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Hồ sơ học sinh THCS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Danh sách học sinh
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý hồ sơ, theo dõi điểm số và phân tích kỹ năng từng học sinh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs shadow-2xs transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import danh sách</span>
          </button>
          <button
            onClick={() => setIsSingleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Class Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Lớp:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Tất cả các lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name} ({c.studentCount} HS)
                </option>
              ))}
            </select>
          </div>

          {/* Warning Toggle */}
          <button
            onClick={() => setWarningFilter(!warningFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              warningFilter
                ? "bg-rose-100 text-rose-800 border border-rose-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Học sinh cần chú ý (&lt; 60%)</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã HS..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Đang tải danh sách học sinh...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-bold text-slate-700 text-sm">Không tìm thấy học sinh nào</p>
            <p className="text-xs text-slate-400">Thử thay đổi bộ lọc hoặc thêm học sinh mới.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Mã HS</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-4">Giới tính</th>
                <th className="py-3.5 px-4">Điểm TB</th>
                <th className="py-3.5 px-4">Kỹ năng yếu nhất</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{s.studentCode}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <Link href={`/students/${s.id}`} className="hover:text-blue-600">
                      {s.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                      {s.className}
                    </span>
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
                  <td className="py-3.5 px-4">
                    {s.lowestSkillScore !== null ? (
                      <span className="text-slate-700">
                        {s.lowestSkillName} ({s.lowestSkillScore}%)
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {s.status === "WARNING" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Cần chú ý
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Bình thường
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/students/${s.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 text-xs font-bold transition-all"
                    >
                      <span>Xem hồ sơ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Single Student */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Thêm học sinh mới</h3>
              <button onClick={() => setIsSingleModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lớp học</label>
                <select
                  required
                  value={singleForm.classId}
                  onChange={(e) => setSingleForm({ ...singleForm, classId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã học sinh</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: HS7A125"
                    value={singleForm.studentCode}
                    onChange={(e) => setSingleForm({ ...singleForm, studentCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={singleForm.gender}
                    onChange={(e) => setSingleForm({ ...singleForm, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn An"
                  value={singleForm.name}
                  onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại phụ huynh</label>
                <input
                  type="text"
                  placeholder="VD: 0912 345 678"
                  value={singleForm.parentPhone}
                  onChange={(e) => setSingleForm({ ...singleForm, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bulk Import */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Import danh sách học sinh</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn lớp học</label>
                <select
                  required
                  value={importClassId}
                  onChange={(e) => setImportClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dán danh sách học sinh (Mỗi dòng 1 học sinh theo định dạng: Mã HS, Họ tên, Giới tính)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={`HS7A121, Trần Quốc Tuấn, Nam&#10;HS7A122, Lê Thị Mai, Nữ&#10;HS7A123, Phạm Văn Bách, Nam`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Hỗ trợ copy trực tiếp từ bảng tính Excel hoặc file CSV.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                >
                  Nhập học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách học sinh...</div>}>
      <StudentsContent />
    </Suspense>
  );
}
