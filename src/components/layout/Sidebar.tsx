"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  CheckSquare,
  BarChart3,
  Bot,
  Sparkles,
  ChevronDown,
  ChevronRight,
  LogOut,
  FolderOpen,
  School,
  Presentation,
  Download,
  Settings,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    school?: string | null;
    avatar?: string | null;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname === path) return true;
    if (path !== "/" && pathname.startsWith(path + "/")) return true;
    return false;
  };

  return (
    <aside className="w-68 bg-white border-r border-slate-200/80 flex flex-col h-screen select-none shrink-0 sticky top-0 z-30 transition-all duration-200">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-slate-900 tracking-tight">EduMind</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                THCS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Trợ lý Giáo viên GDPT</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 text-xs">
        {/* Dashboard Link */}
        <div className="space-y-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all",
              isActive("/")
                ? "bg-indigo-50 text-indigo-700 shadow-xs"
                : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
            )}
          >
            <LayoutDashboard className={cn("w-4 h-4", isActive("/") ? "text-indigo-600" : "text-slate-400")} />
            <span>Tổng quan (Dashboard)</span>
          </Link>
        </div>

        {/* Trụ cột 1: Chuẩn bị bài dạy */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            1. Chuẩn bị bài dạy
          </div>
          <div className="space-y-0.5">
            <Link
              href="/materials/lesson-plan"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/materials/lesson-plan")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <FileText className={cn("w-4 h-4", isActive("/materials/lesson-plan") ? "text-indigo-600" : "text-slate-400")} />
                <span>Kế hoạch bài dạy</span>
              </div>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60 px-2 py-0.5 rounded-md">CV 5512</span>
            </Link>

            <Link
              href="/materials/slides"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/materials/slides")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Presentation className={cn("w-4 h-4", isActive("/materials/slides") ? "text-indigo-600" : "text-slate-400")} />
                <span>Slide bài giảng AI</span>
              </div>
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded-md">16:9</span>
            </Link>

            <Link
              href="/materials/scorm-studio"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/materials/scorm-studio")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={cn("w-4 h-4", isActive("/materials/scorm-studio") ? "text-indigo-600" : "text-amber-500")} />
                <span>SCORM & Voice Studio</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md">Audio</span>
            </Link>

            <Link
              href="/lessons"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/lessons")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <Layers className={cn("w-4 h-4", isActive("/lessons") ? "text-indigo-600" : "text-slate-400")} />
              <span>Không gian bài học</span>
            </Link>

            <Link
              href="/materials"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/materials") && !isActive("/materials/lesson-plan") && !isActive("/materials/slides") && !isActive("/materials/scorm-studio")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <FolderOpen className={cn("w-4 h-4", isActive("/materials") && !isActive("/materials/lesson-plan") && !isActive("/materials/slides") && !isActive("/materials/scorm-studio") ? "text-indigo-600" : "text-slate-400")} />
              <span>Phiếu học tập & Kho tài liệu</span>
            </Link>
          </div>
        </div>

        {/* Trụ cột 2: Khảo thí & Đánh giá (CV 7991) */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            2. Khảo thí &amp; Đánh giá
          </div>
          <div className="space-y-0.5">
            <Link
              href="/exams/wizard"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/exams/wizard")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={cn("w-4 h-4", isActive("/exams/wizard") ? "text-indigo-600" : "text-amber-500")} />
                <span className="font-semibold text-slate-900">Tạo đề CV 7991</span>
              </div>
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md">Ma trận 7B</span>
            </Link>

            <Link
              href="/exams"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/exams") && !isActive("/exams/builder") && !isActive("/exams/wizard")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <FileSpreadsheet className={cn("w-4 h-4", isActive("/exams") && !isActive("/exams/builder") && !isActive("/exams/wizard") ? "text-indigo-600" : "text-slate-400")} />
              <span>Đề kiểm tra &amp; 4 Mã đề</span>
            </Link>

            <Link
              href="/questions"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/questions") && !pathname.includes("/generate")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <FileQuestion className={cn("w-4 h-4", isActive("/questions") && !pathname.includes("/generate") ? "text-indigo-600" : "text-slate-400")} />
              <span>Ngân hàng câu hỏi</span>
            </Link>

            <Link
              href="/questions/generate"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/questions/generate")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <Sparkles className={cn("w-4 h-4", isActive("/questions/generate") ? "text-indigo-600" : "text-indigo-500")} />
              <span>AI Tạo câu hỏi</span>
            </Link>
          </div>
        </div>

        {/* Trụ cột 3: Chấm điểm & Năng lực */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            3. Lớp học &amp; Năng lực
          </div>
          <div className="space-y-0.5">
            <Link
              href="/grading"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/grading")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className={cn("w-4 h-4", isActive("/grading") ? "text-indigo-600" : "text-slate-400")} />
                <span>Chấm bài thi</span>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                Tự động
              </span>
            </Link>

            <Link
              href="/analytics"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/analytics")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <BarChart3 className={cn("w-4 h-4", isActive("/analytics") ? "text-indigo-600" : "text-slate-400")} />
              <span>Phân tích năng lực</span>
            </Link>

            <Link
              href="/classes"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/classes")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <Users className={cn("w-4 h-4", isActive("/classes") ? "text-indigo-600" : "text-slate-400")} />
              <span>Danh sách lớp học</span>
            </Link>

            <Link
              href="/students"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/students")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <GraduationCap className={cn("w-4 h-4", isActive("/students") ? "text-indigo-600" : "text-slate-400")} />
              <span>Hồ sơ học sinh</span>
            </Link>
          </div>
        </div>

        {/* Trụ cột 4: Trợ lý Sư phạm & Cài đặt */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            4. Trợ lý &amp; Cài đặt
          </div>
          <div className="space-y-0.5">
            <Link
              href="/assistant"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/assistant")
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Bot className={cn("w-4 h-4", isActive("/assistant") ? "text-white" : "text-indigo-600")} />
                <span>AI Assistant Giáo viên</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </Link>

            <Link
              href="/export-center"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/export-center")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <Download className={cn("w-4 h-4", isActive("/export-center") ? "text-indigo-600" : "text-slate-400")} />
              <span>Trung tâm xuất học liệu</span>
            </Link>

            <Link
              href="/settings"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/settings")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Settings className={cn("w-4 h-4", isActive("/settings") ? "text-indigo-600" : "text-slate-400")} />
                <span>Cài đặt & Gemini AI</span>
              </div>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                API
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Teacher Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700 shrink-0">
              {user?.name ? user.name.split(" ").slice(-2).map(n => n[0]).join("") : "NH"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.name || "Cô Phan Thị Ngọc Huyền"}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate font-medium">
                <School className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{user?.school || "THCS Tân Phong - Vĩnh Long"}</span>
              </div>
            </div>
          </div>
          <Link
            href="/login"
            title="Đăng xuất"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
