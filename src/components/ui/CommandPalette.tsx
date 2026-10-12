"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Award,
  FileText,
  Presentation,
  Sparkles,
  Users,
  GraduationCap,
  Clock,
  Settings,
  Bot,
  Sun,
  Moon,
  FolderOpen,
  ArrowRight,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  X,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Trang chính" | "Học liệu GDPT" | "Tác vụ nhanh" | "Dữ liệu tìm kiếm";
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAIDrawer?: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenAIDrawer }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicResults, setDynamicResults] = useState<CommandItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default navigation items
  const staticItems: CommandItem[] = [
    {
      id: "nav-wizard",
      title: "Tạo đề kiểm tra chuẩn CV 7991",
      subtitle: "Ma trận 2 chiều, bản đặc tả và barem điểm",
      category: "Học liệu GDPT",
      icon: <Award className="w-4 h-4 text-indigo-500" />,
      action: () => router.push("/exams/wizard"),
      badge: "AI 7991",
    },
    {
      id: "nav-lesson-plan",
      title: "Soạn kế hoạch bài dạy (CV 5512)",
      subtitle: "4 hoạt động sư phạm chuẩn quy định BGDĐT",
      category: "Học liệu GDPT",
      icon: <FileText className="w-4 h-4 text-indigo-500" />,
      action: () => router.push("/materials/lesson-plan"),
      badge: "CV 5512",
    },
    {
      id: "nav-slides",
      title: "Thiết kế Slide bài giảng AI",
      subtitle: "Trình chiếu 16:9, nhạc lý và học liệu số",
      category: "Học liệu GDPT",
      icon: <Presentation className="w-4 h-4 text-indigo-500" />,
      action: () => router.push("/materials/slides"),
    },
    {
      id: "nav-scorm",
      title: "SCORM & Voice Studio",
      subtitle: "Đóng gói bài giảng e-Learning chuẩn LMS",
      category: "Học liệu GDPT",
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      action: () => router.push("/materials/scorm-studio"),
      badge: "Mới",
    },
    {
      id: "nav-questions",
      title: "Ngân hàng câu hỏi & Đề thi",
      subtitle: "Kho câu hỏi GDPT 2018 theo chủ đề bài học",
      category: "Trang chính",
      icon: <FileSpreadsheet className="w-4 h-4 text-slate-500" />,
      action: () => router.push("/questions"),
    },
    {
      id: "nav-generate-questions",
      title: "Sinh câu hỏi AI tự động",
      subtitle: "Tạo câu hỏi trắc nghiệm, đúng sai và tự luận",
      category: "Trang chính",
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      action: () => router.push("/questions/generate"),
    },
    {
      id: "nav-classes",
      title: "Quản lý Lớp học",
      subtitle: "Danh sách khối 6, 7, 8, 9 và sổ bộ môn",
      category: "Trang chính",
      icon: <Users className="w-4 h-4 text-slate-500" />,
      action: () => router.push("/classes"),
    },
    {
      id: "nav-students",
      title: "Hồ sơ Học sinh",
      subtitle: "Theo dõi năng lực âm nhạc và chuyên cần",
      category: "Trang chính",
      icon: <GraduationCap className="w-4 h-4 text-slate-500" />,
      action: () => router.push("/students"),
    },
    {
      id: "nav-grading",
      title: "Chấm bài thi & Đánh giá",
      subtitle: "Chấm tự động, nhập điểm và phản hồi năng lực",
      category: "Trang chính",
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      action: () => router.push("/grading"),
    },
    {
      id: "nav-export",
      title: "Trung tâm Xuất tài liệu",
      subtitle: "Xuất trọn bộ đề thi, ma trận Word và PDF",
      category: "Trang chính",
      icon: <FolderOpen className="w-4 h-4 text-slate-500" />,
      action: () => router.push("/export-center"),
    },
    {
      id: "action-ai",
      title: "Mở Trợ lý Giáo viên AI",
      subtitle: "Hỏi đáp sư phạm, gợi ý phương pháp dạy (⌘J)",
      category: "Tác vụ nhanh",
      icon: <Bot className="w-4 h-4 text-indigo-500" />,
      action: () => {
        if (onOpenAIDrawer) onOpenAIDrawer();
      },
      badge: "⌘J",
    },
    {
      id: "action-theme",
      title: "Chuyển giao diện Sáng / Tối",
      subtitle: "Bật hoặc tắt chế độ ban đêm",
      category: "Tác vụ nhanh",
      icon: <Moon className="w-4 h-4 text-slate-500" />,
      action: () => {
        const isDark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("edumind_dark_mode", isDark ? "true" : "false");
      },
    },
    {
      id: "action-warning",
      title: "Xem học sinh cần chú ý rèn luyện",
      subtitle: "Danh sách các em cần rèn nhịp phách, nhạc lý",
      category: "Tác vụ nhanh",
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
      action: () => router.push("/students?warning=true"),
    },
    {
      id: "nav-settings",
      title: "Cài đặt & Khóa AI Gemini",
      subtitle: "Cấu hình API Key và thông tin giáo viên",
      category: "Trang chính",
      icon: <Settings className="w-4 h-4 text-slate-500" />,
      action: () => router.push("/settings"),
    },
  ];

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
      setDynamicResults([]);
    }
  }, [isOpen]);

  // Debounced search for remote data (exams, students, questions)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setDynamicResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const [examsRes, studentsRes] = await Promise.all([
          fetch(`/api/exams?search=${encodeURIComponent(trimmed)}`).then((r) =>
            r.ok ? r.json() : []
          ),
          fetch(`/api/students?search=${encodeURIComponent(trimmed)}`).then((r) =>
            r.ok ? r.json() : []
          ),
        ]);

        const results: CommandItem[] = [];

        if (Array.isArray(examsRes)) {
          examsRes.slice(0, 3).forEach((e: any) => {
            results.push({
              id: `exam-${e.id}`,
              title: e.title,
              subtitle: `Đề thi • ${e.questionCount || 0} câu • Lớp ${e.class?.name || "THCS"}`,
              category: "Dữ liệu tìm kiếm",
              icon: <FileSpreadsheet className="w-4 h-4 text-indigo-500" />,
              action: () => router.push(`/exams/${e.id}`),
              badge: "Đề thi",
            });
          });
        }

        if (Array.isArray(studentsRes)) {
          studentsRes.slice(0, 3).forEach((s: any) => {
            results.push({
              id: `student-${s.id}`,
              title: s.name,
              subtitle: `Học sinh • Mã: ${s.studentCode} • Lớp ${s.class?.name || ""}`,
              category: "Dữ liệu tìm kiếm",
              icon: <GraduationCap className="w-4 h-4 text-emerald-500" />,
              action: () => router.push(`/students/${s.id}`),
              badge: "Học sinh",
            });
          });
        }

        setDynamicResults(results);
      } catch (err) {
        console.error("Command palette search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, router]);

  // Filter items
  const filteredStatic = staticItems.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  });

  const allItems = [...dynamicResults, ...filteredStatic];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (allItems[selectedIndex]) {
          allItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tìm kiếm chức năng, đề thi, học sinh, giáo án..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[10px] font-mono text-slate-400">
            ESC để đóng
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {isSearching && (
            <div className="px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              <span>Đang tìm kiếm dữ liệu...</span>
            </div>
          )}

          {allItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Không tìm thấy kết quả nào cho &ldquo;{query}&rdquo;
            </div>
          ) : (
            allItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-indigo-100 dark:bg-indigo-900/60"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      )}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-medium text-slate-400 shrink-0 ml-3 flex items-center gap-1">
                    <span className="hidden sm:inline">{item.category}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">↑</kbd>
              <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 ml-1">↓</kbd> để di chuyển
            </span>
            <span>
              <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">↵</kbd> để chọn
            </span>
          </div>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            EduMind Search
          </span>
        </div>
      </div>
    </div>
  );
}
