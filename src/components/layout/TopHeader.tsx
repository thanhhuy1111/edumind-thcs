"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Sparkles,
  Plus,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileQuestion,
  FileText,
  UserPlus,
  BookOpen,
  Presentation,
  Award,
} from "lucide-react";

interface TopHeaderProps {
  onOpenAIDrawer?: () => void;
}

export function TopHeader({ onOpenAIDrawer }: TopHeaderProps) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm bài học, câu hỏi, đề thi hoặc học sinh..."
            className="w-full pl-10 pr-12 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Academic Context Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Năm học 2026–2027</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-900 font-semibold">Toán THCS (K6-K9)</span>
        </div>

        {/* AI Quick Assistant Trigger Button */}
        <button
          onClick={onOpenAIDrawer}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all group"
        >
          <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          <span>Hỏi Trợ lý AI</span>
          <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.2 rounded-full">⌘J</span>
        </button>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Tạo nhanh</span>
          </button>

          {quickActionOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setQuickActionOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                  Khởi tạo tác vụ mới
                </div>
                <Link
                  href="/exams/wizard"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                >
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Tạo đề kiểm tra CV 7991</span>
                </Link>
                <Link
                  href="/materials/lesson-plan"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors"
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Soạn kế hoạch bài dạy (5512)</span>
                </Link>
                <Link
                  href="/materials/slides"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors"
                >
                  <Presentation className="w-4 h-4 text-violet-600" />
                  <span>Tạo slide bài giảng AI</span>
                </Link>
                <Link
                  href="/questions/generate"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI Tạo câu hỏi</span>
                </Link>
                <Link
                  href="/students"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Thêm học sinh mới</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
          </button>

          {notificationOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-900">Thông báo sư phạm</span>
                  <span className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer">
                    Đã đọc hết
                  </span>
                </div>
                <div className="py-2 space-y-2">
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs">
                    <p className="font-bold text-amber-900">12 bài kiểm tra chưa chấm</p>
                    <p className="text-amber-700 mt-0.5 text-[11px]">
                      Lớp 7A2 vừa nộp bài kiểm tra 15 phút Đại số.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs">
                    <p className="font-bold text-blue-900">AI Insight mới cho Lớp 7A1</p>
                    <p className="text-blue-700 mt-0.5 text-[11px]">
                      Phát hiện 5 học sinh có điểm dưới 60% ở kỹ năng Tỉ lệ thức.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
