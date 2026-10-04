"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckSquare,
  ArrowLeft,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { getScoreColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

function GradingContent() {
  const searchParams = useSearchParams();
  const examIdParam = searchParams.get("examId");

  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(examIdParam || "");
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

  // Student grading rows: { [studentId]: { versionId, answers: { 1: 'A', 2: 'B' }, manualScore: '' } }
  const [gradingRows, setGradingRows] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fetch Exams list
  useEffect(() => {
    fetch("/api/exams")
      .then((res) => res.json())
      .then((data) => {
        setExams(data);
        if (data.length > 0 && !selectedExamId) {
          const matched = examIdParam ? data.find((e: any) => e.id === examIdParam) : data[0];
          setSelectedExamId(matched ? matched.id : data[0].id);
        }
      });
  }, []);

  // Fetch selected Exam details and Class students
  useEffect(() => {
    if (!selectedExamId) return;
    setLoading(true);
    setSavedSuccess(false);

    fetch(`/api/exams/${selectedExamId}`)
      .then((res) => res.json())
      .then((examData) => {
        setSelectedExam(examData);

        // Fetch students of the class associated with this exam
        const targetClassId = examData.classId;
        const studentUrl = targetClassId ? `/api/students?classId=${targetClassId}` : "/api/students";

        fetch(studentUrl)
          .then((res) => res.json())
          .then((studList) => {
            setStudents(studList);

            // Populate existing attempts into grading rows
            const initialRows: Record<string, any> = {};
            studList.forEach((s: any) => {
              const existingAttempt = examData.attempts?.find((a: any) => a.studentId === s.id);
              const defaultVersion = examData.versions?.[0]?.id || "";

              initialRows[s.id] = {
                studentId: s.id,
                versionId: existingAttempt?.versionId || defaultVersion,
                answers: existingAttempt?.studentAnswers ? JSON.parse(existingAttempt.studentAnswers) : {},
                manualScore: existingAttempt ? existingAttempt.score.toString() : "",
              };
            });

            setGradingRows(initialRows);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedExamId]);

  const handleAnswerSelect = (studentId: string, qNum: number, choice: string) => {
    setGradingRows((prev) => {
      const currentRow = prev[studentId] || { studentId, answers: {} };
      const currentAnswers = { ...(currentRow.answers || {}) };

      if (currentAnswers[qNum] === choice) {
        delete currentAnswers[qNum];
      } else {
        currentAnswers[qNum] = choice;
      }

      return {
        ...prev,
        [studentId]: {
          ...currentRow,
          answers: currentAnswers,
        },
      };
    });
  };

  const handleVersionChange = (studentId: string, versionId: string) => {
    setGradingRows((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, answers: {} }),
        versionId,
      },
    }));
  };

  const handleManualScoreChange = (studentId: string, val: string) => {
    setGradingRows((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, answers: {} }),
        manualScore: val,
      },
    }));
  };

  const handleSaveGrading = async () => {
    if (!selectedExamId || isSaving) return;
    setIsSaving(true);

    try {
      const submissions = Object.values(gradingRows);
      const res = await fetch("/api/grading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExamId,
          submissions,
        }),
      });

      if (!res.ok) throw new Error("Failed to save grading");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Chấm bài trắc nghiệm tự động</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Chấm bài & Nhập điểm
          </h1>
          <p className="text-sm text-slate-500">
            Hệ thống tự động đối chiếu đáp án với mã đề (101-104) và cập nhật mức độ thành thạo kỹ năng của học sinh.
          </p>
        </div>

        <button
          onClick={handleSaveGrading}
          disabled={isSaving || students.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Đang lưu & tính điểm..." : "Lưu kết quả & Cập nhật"}</span>
        </button>
      </div>

      {/* Exam Selector Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Chọn bài kiểm tra:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.class?.name || `Khối ${ex.gradeLevel}`} - {ex.durationMinutes}p)
              </option>
            ))}
          </select>
        </div>

        {selectedExam && (
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>{selectedExam.questions?.length || 0} câu hỏi</span>
            <span>•</span>
            <span>Thang điểm: {selectedExam.totalScore}đ</span>
            <span>•</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              {students.length} học sinh
            </span>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã lưu bảng điểm thành công và cập nhật chỉ số năng lực kỹ năng cho từng học sinh!</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Đang tải bảng chấm điểm...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-bold text-slate-700 text-sm">Chưa có học sinh nào</p>
            <p className="text-xs text-slate-400">Chọn đề thi khác hoặc thêm học sinh vào lớp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4 w-24">Mã HS</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Họ và tên</th>
                  <th className="py-3.5 px-3 w-32">Mã đề thi</th>
                  {/* Dynamic Question columns (up to 5 or 10) */}
                  {selectedExam?.questions?.map((_: any, idx: number) => (
                    <th key={idx} className="py-3.5 px-2 text-center min-w-[70px]">
                      Câu {idx + 1}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-center w-28">Điểm tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const row = gradingRows[s.id] || { answers: {} };
                  const currentVer =
                    selectedExam?.versions?.find((v: any) => v.id === row.versionId) ||
                    selectedExam?.versions?.[0];

                  const keyObj = currentVer?.answerKey ? JSON.parse(currentVer.answerKey) : {};

                  // Calculate score live
                  const totalQ = selectedExam?.questions?.length || 1;
                  const ptsPerQ = selectedExam?.totalScore / totalQ;
                  let autoScore = 0;
                  Object.keys(keyObj).forEach((qNum) => {
                    if (row.answers?.[qNum] === keyObj[qNum]) {
                      autoScore += ptsPerQ;
                    }
                  });
                  autoScore = Math.round(autoScore * 10) / 10;
                  const displayScore = row.manualScore !== "" ? row.manualScore : autoScore;

                  return (
                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{s.studentCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>

                      {/* Version Select */}
                      <td className="py-3 px-3">
                        <select
                          value={row.versionId}
                          onChange={(e) => handleVersionChange(s.id, e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 outline-none"
                        >
                          {selectedExam?.versions?.map((v: any) => (
                            <option key={v.id} value={v.id}>
                              Mã {v.versionCode}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Question Answer Inputs */}
                      {selectedExam?.questions?.map((_: any, idx: number) => {
                        const qNum = idx + 1;
                        const studentChoice = row.answers?.[qNum];
                        const correctChoice = keyObj[qNum];

                        return (
                          <td key={idx} className="py-3 px-1 text-center">
                            <div className="inline-flex items-center gap-1 bg-slate-100/70 p-1 rounded-lg border border-slate-200/80">
                              {["A", "B", "C", "D"].map((opt) => {
                                const isSelected = studentChoice === opt;
                                const isCorrectMatch = isSelected && opt === correctChoice;

                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleAnswerSelect(s.id, qNum, opt)}
                                    className={`w-5 h-5 rounded text-[10px] font-bold transition-all ${
                                      isSelected
                                        ? isCorrectMatch
                                          ? "bg-emerald-600 text-white shadow-2xs"
                                          : "bg-rose-600 text-white shadow-2xs"
                                        : "hover:bg-slate-200 text-slate-600"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        );
                      })}

                      {/* Final Score Input */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          step="0.1"
                          max={selectedExam?.totalScore || 10}
                          min={0}
                          value={displayScore}
                          onChange={(e) => handleManualScoreChange(s.id, e.target.value)}
                          className={`w-16 text-center py-1 rounded-lg border font-black text-xs outline-none ${getScoreColor(
                            parseFloat(displayScore.toString()) || 0,
                            selectedExam?.totalScore || 10
                          )}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GradingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Đang tải trang chấm bài...</div>}>
      <GradingContent />
    </Suspense>
  );
}
