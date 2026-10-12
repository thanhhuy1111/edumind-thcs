"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MathContent } from "@/components/ui/MathContent";
import { getGeminiAuthHeaders } from "@/lib/aiClient";

interface FloatingAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  structuredData?: any;
  suggestedActions?: Array<{ label: string; action: string; params?: any }>;
}

export function FloatingAIAssistant({ isOpen, onClose }: FloatingAIAssistantProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const initialAssistantMessage: MessageItem = {
    id: "initial",
    role: "assistant",
    content: `Xin chào cô Huyền! Em là **EduMind AI Assistant**, trợ lý giảng dạy môn Âm nhạc của cô tại THCS Tân Phong - Vĩnh Long. Em đã đồng bộ toàn bộ dữ liệu các lớp (6A1, 7A1, 7A2, 8A1, 9A1) và ngân hàng câu hỏi âm nhạc GDPT 2018. Cô cần em hỗ trợ gì hôm nay?`,
    suggestedActions: [
      { label: "Lớp 7A1 cần rèn kỹ năng nào?", action: "ASK_PROMPT", params: { text: "Lớp 7A1 đang yếu phần nào?" } },
      { label: "Tạo đề 15 phút Âm nhạc lớp 7", action: "ASK_PROMPT", params: { text: "Tạo đề 15 phút âm nhạc lớp 7" } },
      { label: "Gợi ý trò chơi khởi động tiết học", action: "ASK_PROMPT", params: { text: "Gợi ý trò chơi khởi động tiết học hát lớp 7" } },
    ],
  };

  const [messages, setMessages] = useState<MessageItem[]>([initialAssistantMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([initialAssistantMessage]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: MessageItem = {
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
        headers: { "Content-Type": "application/json", ...getGeminiAuthHeaders() },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();

      const aiMsg: MessageItem = {
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
          content: "Xin lỗi cô, hệ thống đang bận xử lý dữ liệu. Cô vui lòng thử lại sau giây lát!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string, params?: any) => {
    if (action === "ASK_PROMPT" && params?.text) {
      handleSendMessage(params.text);
    } else if (action === "CREATE_EXAM") {
      onClose();
      router.push("/exams/wizard");
    } else if (action === "EXPORT_WORKSHEET") {
      onClose();
      router.push("/materials");
    } else if (action === "FILTER_STUDENTS") {
      onClose();
      router.push("/students?warning=true");
    } else if (action === "OPEN_QUESTION_BANK") {
      onClose();
      router.push("/questions");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">EduMind AI Assistant</span>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Trợ lý truy vấn dữ liệu lớp &amp; soạn bài GDPT 2018</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              title="Làm mới cuộc trò chuyện"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Đóng cửa sổ"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3 group", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={cn(
                  "relative max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-xs shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 rounded-bl-xs shadow-xs"
                )}
              >
                {/* Copy button */}
                <button
                  onClick={() => handleCopyMessage(msg.id, msg.content)}
                  title="Sao chép nội dung"
                  className={cn(
                    "absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                    msg.role === "user"
                      ? "text-indigo-200 hover:text-white hover:bg-indigo-700"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <div className="leading-relaxed pr-5">
                  <MathContent content={msg.content} />
                </div>

                {/* Structured Data: Student List */}
                {msg.structuredData?.type === "STUDENT_LIST" && (
                  <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Danh sách học sinh cần củng cố:</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {msg.structuredData.data.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-400">{item.reason}</span>
                            <span className="px-1.5 py-0.5 rounded font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                              {item.mastery}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Data: Exam Proposal */}
                {msg.structuredData?.type === "EXAM_PROPOSAL" && (
                  <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        <span>{msg.structuredData.data.title}</span>
                        <span>{msg.structuredData.data.duration} phút</span>
                      </div>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">
                        Gồm {msg.structuredData.data.questionCount} câu trắc nghiệm bám sát nội dung học sinh đang yếu.
                      </p>
                    </div>
                  </div>
                )}

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700 flex flex-wrap gap-2">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(action.action, action.params)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
                      >
                        <span>{action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-slate-500 dark:text-slate-400 text-xs italic py-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <span>EduMind đang tra cứu dữ liệu và phân tích sư phạm...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Hỏi về học sinh, đề kiểm tra 7991 hoặc yêu cầu gợi ý phương pháp..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 rounded-xl bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all shadow-xs cursor-pointer mb-0.5 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Dữ liệu thực tế chuẩn GDPT 2018</span>
            <span>Enter gửi • Shift+Enter xuống dòng</span>
          </div>
        </div>
      </div>
    </div>
  );
}
