"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  Layers,
  FileText,
  Presentation,
  FileCheck2,
  HelpCircle,
  ArrowRight,
  Search,
  Filter,
  Plus,
  Clock,
  Award,
  RefreshCw,
} from "lucide-react";
import { MathContent } from "@/components/ui/MathContent";

interface LessonItem {
  id: string;
  title: string;
  orderNumber: number;
  durationPeriods?: number;
  description?: string | null;
  learningOutcomes?: string | null;
  chapter: {
    id: string;
    title: string;
    gradeLevel: number;
    subject: {
      name: string;
      code: string;
    };
  };
  skills?: { id: string; name: string }[];
  _count: {
    materials: number;
    exams: number;
    questions: number;
  };
}

export default function LessonsDirectoryPage() {
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState("7");
  const [subjectFilter, setSubjectFilter] = useState("MATH");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLessons();
  }, [gradeFilter, subjectFilter]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons?grade=${gradeFilter}&subject=${subjectFilter}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLessons(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Hệ Thống Bài Học GDPT 2018 &amp; Không Gian Học Liệu
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Chính thức
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Không gian làm việc đồng bộ: Mỗi bài học liên kết trực tiếp Kế hoạch bài dạy (CV 5512), Slide bài giảng, Ngân hàng câu hỏi và Đề kiểm tra (CV 7991)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/materials/lesson-plan"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Soạn Giáo Án Mới
          </Link>
          <Link
            href="/exams/wizard"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <FileCheck2 className="w-3.5 h-3.5" /> Tạo Đề 7991
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Grade Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {["6", "7", "8", "9"].map((gr) => (
              <button
                key={gr}
                onClick={() => setGradeFilter(gr)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gradeFilter === gr
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Lớp {gr}
              </button>
            ))}
          </div>

          {/* Subject Dropdown */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="MATH">Môn Toán học</option>
            <option value="SCIENCE">Khoa học tự nhiên</option>
            <option value="LITERATURE">Ngữ văn</option>
            <option value="ENGLISH">Tiếng Anh</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên bài học, chương, chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Lessons List Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Đang tải danh mục bài học và học liệu liên kết...
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/80 space-y-3">
          <p className="text-sm font-medium">Không tìm thấy bài học nào phù hợp với bộ lọc hiện tại.</p>
          <button
            onClick={() => {
              setGradeFilter("7");
              setSubjectFilter("MATH");
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Đặt lại bộ lọc (Toán 7)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-indigo-300"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    {lesson.chapter.title}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    <Clock className="w-3 h-3 text-slate-400" /> {lesson.description || (lesson.durationPeriods ? `${lesson.durationPeriods} tiết` : "3 tiết")}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                  <MathContent content={lesson.title} />
                </h3>

                {lesson.learningOutcomes && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    <MathContent content={lesson.learningOutcomes} />
                  </p>
                )}

                {/* Connected Product Badges */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-center">
                    <span className="block text-slate-400 text-[10px]">Giáo án &amp; Slide</span>
                    <strong className="text-indigo-600 font-bold">
                      {lesson._count.materials > 0 ? `${lesson._count.materials} bản` : "Chưa tạo"}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-center">
                    <span className="block text-slate-400 text-[10px]">Đề kiểm tra</span>
                    <strong className="text-blue-600 font-bold">
                      {lesson._count.exams > 0 ? `${lesson._count.exams} đề` : "Chưa tạo"}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-center">
                    <span className="block text-slate-400 text-[10px]">Câu hỏi</span>
                    <strong className="text-emerald-600 font-bold">
                      {lesson._count.questions > 0 ? `${lesson._count.questions} câu` : "0 câu"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Enter Unified Workspace Button */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <Link
                  href={`/lessons/${lesson.id}`}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 group-hover:bg-indigo-600 group-hover:text-white"
                >
                  Mở Không Gian Học Liệu <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
