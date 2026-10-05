"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Plus,
  Sparkles,
  Download,
  Copy,
  Printer,
  Check,
  X,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";

import { MathContent } from "@/components/ui/MathContent";

export const dynamic = "force-dynamic";

interface MaterialItem {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  class?: { name: string; gradeLevel: number } | null;
}

function MaterialsContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(typeParam || "ALL");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);

  // AI Generator Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"LESSON_PLAN" | "WORKSHEET">("LESSON_PLAN");
  const [lessonName, setLessonName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("7");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const url = activeTab === "ALL" ? "/api/materials" : `/api/materials?type=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      setMaterials(data);
      if (data.length > 0 && !selectedMaterial) {
        setSelectedMaterial(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [activeTab]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonName.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: modalType,
          lessonName,
          gradeLevel: parseInt(gradeLevel, 10),
          isAIGenerated: true,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setIsModalOpen(false);
        setLessonName("");
        fetchMaterials();
        setSelectedMaterial(created);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!selectedMaterial) return;
    navigator.clipboard.writeText(selectedMaterial.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Thư viện giáo án &amp; Phiếu học tập</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Soạn bài &amp; Tài liệu dạy học
          </h1>
          <p className="text-sm text-slate-500">
            AI tự động thiết kế giáo án chuẩn 4 hoạt động và phiếu bài tập cá nhân hóa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setModalType("WORKSHEET");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 font-semibold text-xs shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>AI Tạo Worksheet</span>
          </button>
          <button
            onClick={() => {
              setModalType("LESSON_PLAN");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>AI Soạn giáo án</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 text-xs font-semibold">
        {[
          { id: "ALL", label: "Tất cả tài liệu" },
          { id: "LESSON_PLAN", label: "Giáo án (Kế hoạch bài dạy)" },
          { id: "WORKSHEET", label: "Phiếu học tập (Worksheet)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two Column Layout: List (4 cols) + Preview (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Materials List */}
        <div className="lg:col-span-4 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Đang tải tài liệu...</div>
          ) : materials.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
              <p className="font-bold text-slate-700 text-sm">Chưa có tài liệu nào</p>
              <p className="text-xs text-slate-400">Bấm nút trên để AI tạo giáo án hoặc worksheet.</p>
            </div>
          ) : (
            materials.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMaterial(m)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-2 ${
                  selectedMaterial?.id === m.id
                    ? "bg-indigo-50/60 border-indigo-300 shadow-xs"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      m.type === "LESSON_PLAN"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200/60"
                        : "bg-slate-100 text-slate-700 border-slate-200/60"
                    }`}
                  >
                    {m.type === "LESSON_PLAN" ? "Giáo án" : "Worksheet"}
                  </span>
                  {m.class && (
                    <span className="text-[11px] font-semibold text-slate-500">
                      Lớp {m.class.name}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                  {m.title}
                </h4>

                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {m.content.replace(/[#*`]/g, "").slice(0, 100)}...
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right: Preview Panel */}
        <div className="lg:col-span-8">
          {selectedMaterial ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
              {/* Header and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
                    {selectedMaterial.type === "LESSON_PLAN" ? "Giáo án THCS" : "Phiếu bài tập"}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">{selectedMaterial.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Đã sao chép" : "Sao chép Markdown"}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In tài liệu</span>
                  </button>
                </div>
              </div>

              {/* Render Content */}
              <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-sans">
                <MathContent content={selectedMaterial.content} />
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              Chọn tài liệu ở cột bên trái để xem trước.
            </div>
          )}
        </div>
      </div>

      {/* AI Generate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {modalType === "LESSON_PLAN" ? "AI Soạn kế hoạch bài dạy" : "AI Tạo phiếu bài tập"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Khối lớp</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
                >
                  <option value="6">Khối 6</option>
                  <option value="7">Khối 7</option>
                  <option value="8">Khối 8</option>
                  <option value="9">Khối 9</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên bài học hoặc chuyên đề trọng tâm
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Chủ đề 2: Tình bạn - Bài 3: Học hát bài Nụ cười"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>{isGenerating ? "AI đang soạn bài..." : "Bắt đầu soạn"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Đang tải tài liệu...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
