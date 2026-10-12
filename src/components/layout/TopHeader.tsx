"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getActiveGeminiKey } from "@/lib/aiClient";
import {
  Search,
  Bell,
  Sparkles,
  Plus,
  FileSpreadsheet,
  FileText,
  UserPlus,
  Presentation,
  Award,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components/ui/CommandPalette";

interface TopHeaderProps {
  onOpenAIDrawer?: () => void;
}

export function TopHeader({ onOpenAIDrawer }: TopHeaderProps) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const quickActionRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasGeminiKey(!!getActiveGeminiKey());
    // Check dark mode preference
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);

    // Global Cmd/Ctrl + K shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickActionRef.current && !quickActionRef.current.contains(e.target as Node)) {
        setQuickActionOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("edumind_dark_mode", newDark ? "true" : "false");
  };

  const quickActions = [
    { href: "/exams/wizard", icon: <Award className="w-4 h-4 text-indigo-600" />, label: "Tạo đề kiểm tra CV 7991" },
    { href: "/materials/lesson-plan", icon: <FileText className="w-4 h-4 text-indigo-600" />, label: "Soạn kế hoạch bài dạy" },
    { href: "/materials/slides", icon: <Presentation className="w-4 h-4 text-indigo-600" />, label: "Tạo slide bài giảng AI" },
    { href: "/materials/scorm-studio", icon: <Sparkles className="w-4 h-4 text-amber-500" />, label: "SCORM & Voice Studio" },
    { href: "/questions/generate", icon: <Sparkles className="w-4 h-4 text-indigo-600" />, label: "AI Tạo câu hỏi" },
    { href: "/students", icon: <UserPlus className="w-4 h-4 text-emerald-600" />, label: "Thêm học sinh mới", divider: true },
  ];

  return (
    <header className="h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md pl-10 lg:pl-0">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="relative w-full text-left group cursor-pointer"
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          <div className="w-full pl-9 pr-12 py-2 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-600 rounded-xl text-sm text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all font-medium select-none truncate">
            Tìm kiếm bài học, câu hỏi, đề thi...
          </div>
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* AI Status */}
        <Link
          href="/settings"
          title={
            hasGeminiKey
              ? "Gemini 2.5 Flash đang hoạt động"
              : "Đang sử dụng AI Cục bộ GDPT 2018"
          }
          className={cn(
            "hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all",
            hasGeminiKey
              ? "bg-emerald-50/80 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
              : "bg-amber-50/80 text-amber-700 border-amber-200 hover:bg-amber-100/70 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              hasGeminiKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            )}
          />
          <span>{hasGeminiKey ? "Gemini 2.5 Flash" : "Local AI GDPT"}</span>
        </Link>

        {/* AI Drawer Trigger */}
        <button
          onClick={onOpenAIDrawer}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all group cursor-pointer active:scale-[0.97]"
        >
          <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Trợ lý AI</span>
          <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-full hidden sm:inline">
            ⌘J
          </span>
        </button>

        {/* Quick Action */}
        <div className="relative" ref={quickActionRef}>
          <button
            onClick={() => {
              setQuickActionOpen(!quickActionOpen);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Tạo mới</span>
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 z-50 animate-scale-in">
              <div className="text-[10px] font-bold text-slate-400 px-3 py-2 uppercase tracking-wider dark:text-slate-500">
                Tạo nhanh
              </div>
              {quickActions.map((action, i) => (
                <React.Fragment key={action.href}>
                  {action.divider && (
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  )}
                  <Link
                    href={action.href}
                    onClick={() => setQuickActionOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg transition-colors"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </Link>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? "Chế độ sáng" : "Chế độ tối"}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setQuickActionOpen(false);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 z-50 animate-scale-in">
              <div className="flex items-center justify-between px-1 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Thông báo
                </span>
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer">
                  Đã đọc hết
                </button>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-sm">
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    12 bài kiểm tra chưa chấm
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 mt-0.5 text-xs">
                    Lớp 7A2 vừa nộp bài kiểm tra 15 phút.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 text-sm">
                  <p className="font-bold text-blue-900 dark:text-blue-200">
                    AI Insight mới cho Lớp 7A1
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-0.5 text-xs">
                    5 học sinh cần rèn thêm kỹ năng nhịp phách.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenAIDrawer={onOpenAIDrawer}
      />
    </header>
  );
}
