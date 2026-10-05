"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  User,
  Users,
  FileSpreadsheet,
  BookOpen,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MathContent } from "@/components/ui/MathContent";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  structuredData?: any;
  suggestedActions?: Array<{ label: string; action: string; params?: any }>;
}

export default function AIAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Xin chào cô Huyền! Em là **EduMind AI Assistant**, trợ lý giảng dạy và phân tích dữ liệu môn Âm nhạc của cô tại THCS Tân Phong - Vĩnh Long.

Em đã phân tích dữ liệu các lớp học (6A1, 7A1, 7A2, 8A1, 9A1), ngân hàng câu hỏi âm nhạc và mức độ thành thạo kỹ năng hát, gõ đệm phách, đọc nhạc của học sinh.

Cô có thể bấm vào các câu hỏi gợi ý bên dưới hoặc đặt câu hỏi tự do về phương pháp dạy học, tạo đề thi, soạn giáo án âm nhạc để em hỗ trợ ngay!`,
      suggestedActions: [
        { label: "Lớp 7A1 cần rèn luyện thêm kỹ năng nào?", action: "PROMPT", params: { text: "Lớp 7A1 đang yếu phần nào?" } },
        { label: "Gợi ý trò chơi khởi động tiết học hát", action: "PROMPT", params: { text: "Gợi ý trò chơi khởi động tiết học hát lớp 7" } },
        { label: "Tạo đề kiểm tra 15 phút Âm nhạc 7", action: "PROMPT", params: { text: "Tạo đề 15 phút âm nhạc lớp 7" } },
        { label: "Học sinh nào cần phụ đạo thêm nhịp phách?", action: "PROMPT", params: { text: "Học sinh nào có nguy cơ hổng kiến thức nhịp phách?" } },
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        structuredData: data.structuredData,
        suggestedActions: data.suggestedActions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Xin lỗi cô, hệ thống đang bận. Cô vui lòng thử lại sau giây lát!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: string, params?: any) => {
    if (action === "PROMPT" && params?.text) {
      handleSend(params.text);
    } else if (action === "CREATE_EXAM") {
      router.push("/exams/builder?topic=ti-le-thuc&grade=7");
    } else if (action === "EXPORT_WORKSHEET") {
      router.push("/materials");
    } else if (action === "FILTER_STUDENTS") {
      router.push("/students?warning=true");
    } else if (action === "OPEN_QUESTION_BANK") {
      router.push("/questions");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-slate-900">
                AI Command Center – Trợ lý giảng dạy
              </h1>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Trực tuyến
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tra cứu dữ liệu học tập thực tế &amp; ra lệnh tạo nội dung bài giảng tức thời
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>4 lớp (6A1, 7A1, 7A2, 8A1)</span>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <div className="w-9 h-9 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[85%] rounded-3xl p-5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-xs shadow-xs"
                  : "bg-slate-50 border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-xs"
              )}
            >
              <div className="leading-relaxed font-sans">
                <MathContent content={msg.content} />
              </div>

              {/* Structured Card: Student List */}
              {msg.structuredData?.type === "STUDENT_LIST" && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Học sinh cần củng cố kiến thức:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.structuredData.data.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
                      >
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500">{item.reason}</span>
                          <span className="font-black px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            {item.mastery}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structured Card: Comparison */}
              {msg.structuredData?.type === "COMPARISON" && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-500 font-semibold uppercase">Lớp 7A1</span>
                      <p className="text-xl font-black text-blue-600">7.4/10</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-500 font-semibold uppercase">Lớp 7A2</span>
                      <p className="text-xl font-black text-slate-700">6.2/10</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Chips */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap gap-2">
                  {msg.suggestedActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleAction(action.action, action.params)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-2xs transition-all active:scale-95"
                    >
                      <span>{action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-9 h-9 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-slate-500 text-xs italic py-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <span>EduMind AI đang phân tích dữ liệu lớp học...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-2xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi bất kỳ điều gì về lớp học, điểm số hoặc yêu cầu: 'Tạo bài tập 15 phút cho lớp 7A1'..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-40"
          >
            <span>Gửi</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-2">
          <span>AI dựa trên dữ liệu lớp học có cấu trúc • Không bịa số liệu</span>
          <span>Bấm ⌘J để mở nhanh từ mọi trang</span>
        </div>
      </div>
    </div>
  );
}
