"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  CheckSquare,
  BarChart3,
  Bot,
  Sparkles,
  ChevronDown,
  LogOut,
  FolderOpen,
  School,
  Presentation,
  Download,
  Settings,
  Layers,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
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

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: { text: string; variant: "default" | "primary" | "warning" | "success" };
  highlight?: boolean;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    prep: true,
    exam: true,
    class: true,
    tools: true,
  });

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname === path) return true;
    if (path !== "/" && pathname.startsWith(path + "/")) return true;
    return false;
  };

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const navGroups: NavGroup[] = [
    {
      id: "prep",
      label: "Chuẩn bị bài dạy",
      items: [
        {
          href: "/materials/lesson-plan",
          icon: <FileText className="w-4 h-4" />,
          label: "Kế hoạch bài dạy",
          badge: { text: "CV 5512", variant: "default" },
        },
        {
          href: "/materials/slides",
          icon: <Presentation className="w-4 h-4" />,
          label: "Slide bài giảng AI",
        },
        {
          href: "/materials/scorm-studio",
          icon: <Sparkles className="w-4 h-4" />,
          label: "SCORM & Voice Studio",
          badge: { text: "Mới", variant: "warning" },
        },
        {
          href: "/lessons",
          icon: <Layers className="w-4 h-4" />,
          label: "Không gian bài học",
        },
        {
          href: "/materials",
          icon: <FolderOpen className="w-4 h-4" />,
          label: "Kho tài liệu",
        },
      ],
    },
    {
      id: "exam",
      label: "Khảo thí & Đánh giá",
      items: [
        {
          href: "/exams/wizard",
          icon: <Sparkles className="w-4 h-4" />,
          label: "Tạo đề CV 7991",
          badge: { text: "AI", variant: "primary" },
          highlight: true,
        },
        {
          href: "/exams",
          icon: <FileSpreadsheet className="w-4 h-4" />,
          label: "Đề kiểm tra & Mã đề",
        },
        {
          href: "/questions",
          icon: <FileQuestion className="w-4 h-4" />,
          label: "Ngân hàng câu hỏi",
        },
        {
          href: "/questions/generate",
          icon: <Sparkles className="w-4 h-4" />,
          label: "AI Tạo câu hỏi",
        },
      ],
    },
    {
      id: "class",
      label: "Lớp học & Năng lực",
      items: [
        {
          href: "/grading",
          icon: <CheckSquare className="w-4 h-4" />,
          label: "Chấm bài thi",
          badge: { text: "Tự động", variant: "success" },
        },
        {
          href: "/analytics",
          icon: <BarChart3 className="w-4 h-4" />,
          label: "Phân tích năng lực",
        },
        {
          href: "/classes",
          icon: <Users className="w-4 h-4" />,
          label: "Danh sách lớp",
        },
        {
          href: "/students",
          icon: <GraduationCap className="w-4 h-4" />,
          label: "Hồ sơ học sinh",
        },
      ],
    },
    {
      id: "tools",
      label: "Trợ lý & Tiện ích",
      items: [
        {
          href: "/assistant",
          icon: <Bot className="w-4 h-4" />,
          label: "AI Assistant",
          highlight: true,
        },
        {
          href: "/export-center",
          icon: <Download className="w-4 h-4" />,
          label: "Xuất học liệu",
        },
        {
          href: "/settings",
          icon: <Settings className="w-4 h-4" />,
          label: "Cài đặt & API",
        },
      ],
    },
  ];

  // Check if any item in a group needs special active matching
  const isSpecialActive = (href: string) => {
    // For parent paths, check that we're not on a child route
    if (href === "/materials") {
      return (
        isActive("/materials") &&
        !isActive("/materials/lesson-plan") &&
        !isActive("/materials/slides") &&
        !isActive("/materials/scorm-studio")
      );
    }
    if (href === "/exams") {
      return isActive("/exams") && !isActive("/exams/wizard") && !isActive("/exams/builder");
    }
    if (href === "/questions") {
      return isActive("/questions") && !pathname.includes("/generate");
    }
    return isActive(href);
  };

  const badgeColors = {
    default: "bg-slate-100 text-slate-500 border-slate-200/60",
    primary: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
    warning: "bg-amber-50 text-amber-700 border-amber-200/60",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  };

  const renderSidebarContent = () => (
    <>
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight dark:text-slate-100">
                  EduMind
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
                  THCS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate dark:text-slate-500">
                Trợ lý Giáo viên GDPT
              </p>
            </div>
          )}
        </Link>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300"
          title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {/* Dashboard — always visible */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all text-sm",
            isActive("/")
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          )}
          title="Tổng quan"
        >
          <LayoutDashboard
            className={cn(
              "w-4 h-4 shrink-0",
              isActive("/") ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
            )}
          />
          {!collapsed && <span>Tổng quan</span>}
        </Link>

        {/* Nav Groups */}
        {navGroups.map((group) => (
          <div key={group.id} className="pt-3 first:pt-1">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between w-full px-3 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors cursor-pointer dark:text-slate-500 dark:hover:text-slate-300"
              >
                <span>{group.label}</span>
                <ChevronDown
                  className={cn(
                    "w-3 h-3 transition-transform duration-200",
                    !openGroups[group.id] && "-rotate-90"
                  )}
                />
              </button>
            )}

            {(collapsed || openGroups[group.id]) && (
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isSpecialActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all",
                        active
                          ? item.highlight
                            ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-600"
                            : "bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/10 dark:text-indigo-300"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            "shrink-0",
                            active
                              ? item.highlight
                                ? "text-white"
                                : "text-indigo-600 dark:text-indigo-400"
                              : item.highlight
                                ? "text-indigo-600"
                                : "text-slate-400"
                          )}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0",
                            active && item.highlight
                              ? "bg-white/20 text-white border-white/20"
                              : badgeColors[item.badge.variant]
                          )}
                        >
                          {item.badge.text}
                        </span>
                      )}
                      {/* Online dot for AI Assistant */}
                      {item.href === "/assistant" && !collapsed && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Teacher Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/40 shrink-0 dark:border-slate-800 dark:bg-slate-900/50">
        <div
          className={cn(
            "flex items-center justify-between rounded-xl bg-white border border-slate-200/80 shadow-xs dark:bg-slate-800 dark:border-slate-700/60",
            collapsed ? "p-2 justify-center" : "p-2.5"
          )}
        >
          <div className={cn("flex items-center gap-2.5 overflow-hidden", collapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700 shrink-0 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-300">
              {user?.name
                ? user.name
                    .split(" ")
                    .slice(-2)
                    .map((n) => n[0])
                    .join("")
                : "NH"}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate dark:text-slate-100">
                  {user?.name || "Cô Phan Thị Ngọc Huyền"}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate font-medium dark:text-slate-400">
                  <School className="w-3 h-3 text-slate-400 shrink-0 dark:text-slate-500" />
                  <span className="truncate">
                    {user?.school || "THCS Tân Phong"}
                  </span>
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <Link
              href="/login"
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 dark:hover:bg-rose-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-30 p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 transition-colors"
        aria-label="Mở menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col h-screen select-none shrink-0 z-40 transition-all duration-300",
          // Desktop
          collapsed ? "w-[72px]" : "w-[272px]",
          // Mobile: fixed overlay
          "max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:h-screen max-lg:w-[272px] max-lg:shadow-2xl",
          mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
        )}
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
}
