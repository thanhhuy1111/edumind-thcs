"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { FloatingAIAssistant } from "@/components/ai/FloatingAIAssistant";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + J opens AI Assistant
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsAIDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50/60 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        user={{
          name: "Cô Phan Thị Ngọc Huyền",
          email: "annahuyen889@gmail.com",
          school: "THCS Tân Phong - Vĩnh Long",
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopHeader onOpenAIDrawer={() => setIsAIDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Floating AI Assistant Drawer */}
      <FloatingAIAssistant
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
      />
    </div>
  );
}
