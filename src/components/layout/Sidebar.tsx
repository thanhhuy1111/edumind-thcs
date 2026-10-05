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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-slate-900 tracking-tight">EduMind</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                THCS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Trợ lý Giáo viên AI</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 text-xs">
        {/* Section 1: Dashboard & Assistant */}
        <div className="space-y-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all",
              isActive("/")
                ? "bg-blue-50 text-blue-700 shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <LayoutDashboard className={cn("w-4 h-4", isActive("/") ? "text-blue-600" : "text-slate-400")} />
            <span>Tổng quan (Dashboard)</span>
          </Link>

          <Link
            href="/assistant"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all group",
              isActive("/assistant")
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                : "bg-indigo-50/50 text-indigo-700 hover:bg-indigo-50 border border-indigo-100"
            )}
          >
            <Bot className={cn("w-4 h-4", isActive("/assistant") ? "text-white" : "text-indigo-600")} />
            <span>AI Assistant Giáo Viên</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </Link>
        </div>

        {/* Section 2: Dạy học & Học liệu */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Dạy học &amp; Học liệu
          </div>
          <div className="space-y-0.5">
            <Link
              href="/lessons"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/lessons")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Không gian bài học</span>
            </Link>

            <Link
              href="/materials/lesson-plan"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/materials/lesson-plan")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Kế hoạch bài dạy</span>
              </div>
              <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">CV 5512</span>
            </Link>

            <Link
              href="/materials/slides"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/materials/slides")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Presentation className="w-4 h-4 text-slate-400" />
                <span>Slide bài giảng AI</span>
              </div>
              <span className="text-[9px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.2 rounded">Mới</span>
            </Link>

            <Link
              href="/materials"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/materials") && !isActive("/materials/lesson-plan") && !isActive("/materials/slides")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <FolderOpen className="w-4 h-4 text-slate-400" />
              <span>Phiếu học tập (Worksheet)</span>
            </Link>
          </div>
        </div>

        {/* Section 3: Kiểm tra & Đánh giá (CV 7991) */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Kiểm tra &amp; Đánh giá
          </div>
          <div className="space-y-0.5">
            <Link
              href="/exams/wizard"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/exams/wizard")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-slate-900">Tạo đề CV 7991</span>
              </div>
              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">Wizard 7B</span>
            </Link>

            <Link
              href="/exams"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/exams") && !isActive("/exams/builder") && !isActive("/exams/wizard")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              <span>Đề kiểm tra &amp; Mã đề</span>
            </Link>

            <Link
              href="/questions"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/questions") && !pathname.includes("/generate")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <FileQuestion className="w-4 h-4 text-slate-400" />
              <span>Ngân hàng câu hỏi</span>
            </Link>

            <Link
              href="/questions/generate"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/questions/generate")
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>AI Tạo câu hỏi</span>
            </Link>

            <Link
              href="/grading"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/grading")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-slate-400" />
                <span>Chấm bài thi</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded-full">
                12 bài
              </span>
            </Link>

            <Link
              href="/analytics"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/analytics")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span>Phân tích năng lực</span>
            </Link>
          </div>
        </div>

        {/* Section 4: Quản lý lớp học */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Lớp học &amp; Học sinh
          </div>
          <div className="space-y-0.5">
            <Link
              href="/classes"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/classes")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Danh sách lớp học</span>
            </Link>

            <Link
              href="/students"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/students")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span>Hồ sơ học sinh</span>
            </Link>
          </div>
        </div>

        {/* Section 5: Xuất bản & Thiết lập */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Xuất bản &amp; Cài đặt
          </div>
          <div className="space-y-0.5">
            <Link
              href="/export-center"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/export-center")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Trung tâm xuất học liệu</span>
            </Link>

            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors",
                isActive("/settings")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Cài đặt hệ thống</span>
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
