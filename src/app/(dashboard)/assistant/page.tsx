"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  BarChart3,
  Mic,
  Volume2,
  VolumeX,
  RefreshCw,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MathContent } from "@/components/ui/MathContent";
import { useVoice } from "@/lib/hooks/useVoice";
import { getGeminiAuthHeaders, getActiveGeminiKey } from "@/lib/aiClient";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  structuredData?: any;
  suggestedActions?: Array<{ label: string; action: string; params?: any }>;
  isStreaming?: boolean;
}

const QUICK_PROMPTS = [
  { icon: "📊", label: "Học sinh cần chú ý", text: "Học sinh nào trong các lớp đang có điểm thấp hoặc cần chú ý đặc biệt?" },
  { icon: "📝", label: "Tạo đề 15 phút", text: "Tạo đề kiểm tra 15 phút cho môn Âm nhạc lớp 7, 5 câu trắc nghiệm theo chuẩn CV7991" },
  { icon: "💡", label: "Gợi ý khởi động", text: "Gợi ý 3 trò chơi khởi động thú vị cho tiết học hát lớp 7" },
  { icon: "📈", label: "Phân tích lớp", text: "Phân tích tổng quan kết quả học tập của tất cả các lớp, so sánh kỹ năng" },
];

export default function AIAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Xin chào! Tôi là **EduMind AI Assistant** – trợ lý giảng dạy thông minh, được kết nối trực tiếp với dữ liệu lớp học của cô.\n\nTôi có thể phân tích điểm số, kỹ năng từng học sinh, gợi ý phương pháp dạy học, tạo đề kiểm tra theo chuẩn CV7991, và nhiều hơn nữa!\n\nHỏi tôi bất cứ điều gì về lớp học nhé cô 😊`,
      suggestedActions: [
        { label: "Học sinh nào đang yếu?", action: "PROMPT", params: { text: "Học sinh nào trong các lớp đang yếu kỹ năng nào nhất?" } },
        { label: "So sánh kết quả các lớp", action: "PROMPT", params: { text: "So sánh kết quả học tập giữa các lớp hiện tại" } },
        { label: "Tạo đề kiểm tra Âm nhạc 7", action: "PROMPT", params: { text: "Tạo đề kiểm tra giữa kỳ Âm nhạc lớp 7, 45 phút theo chuẩn CV7991" } },
        { label: "Gợi ý phương pháp dạy học", action: "PROMPT", params: { text: "Gợi ý phương pháp dạy học tích cực cho bài hát lớp 7 theo GDPT 2018" } },
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isStreamingMode, setIsStreamingMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { speak, stopSpeaking, isSpeaking, startListening, stopListening, isListening } = useVoice();

  const hasGeminiKey = !!getActiveGeminiKey();

  const handleToggleSpeak = (msg: ChatMessage) => {
    if (isSpeaking && speakingMsgId === msg.id) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msg.id);
      speak(msg.content);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        setInput((prev) => (prev ? prev + " " + transcript : transcript));
      });
    }
  };

  useEffect(() => {
    if (!isSpeaking) setSpeakingMsgId(null);
  }, [isSpeaking]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const stopCurrentStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  /**
   * Streaming send: calls /api/ai/chat/stream SSE endpoint and updates message token by token
   */
  const sendStreaming = async (query: string) => {
    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: "assistant", content: "", isStreaming: true },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    const history = messages
      .filter((m) => m.content && !m.isStreaming)
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getGeminiAuthHeaders() },
        body: JSON.stringify({ message: query, history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Stream failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                )
              );
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: fullContent, isStreaming: true }
                      : m
                  )
                );
              }
            } catch {
              // skip parse errors
            }
          }
        }
      }

      // Finalize
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: fullContent || "Xin lỗi cô, không có phản hồi từ AI.",
                isStreaming: false,
              }
            : m
        )
      );
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: m.content + "\n\n*(Đã dừng)*", isStreaming: false }
              : m
          )
        );
        return;
      }
      // Fallback to non-streaming
      console.warn("Streaming failed, falling back:", err);
      await sendNonStreaming(query, assistantMsgId);
    }
  };

  /**
   * Non-streaming fallback: calls /api/ai/chat and waits for full response
   */
  const sendNonStreaming = async (query: string, existingMsgId?: string) => {
    const history = messages
      .filter((m) => m.content && !m.isStreaming)
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getGeminiAuthHeaders() },
        body: JSON.stringify({ message: query, history }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: existingMsgId || (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        structuredData: data.structuredData,
        suggestedActions: data.suggestedActions,
        isStreaming: false,
      };

      if (existingMsgId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === existingMsgId ? aiMsg : m))
        );
      } else {
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      const errMsg: ChatMessage = {
        id: existingMsgId || (Date.now() + 1).toString(),
        role: "assistant",
        content: "Xin lỗi cô, hệ thống đang bận. Cô vui lòng thử lại sau giây lát!",
        isStreaming: false,
      };
      if (existingMsgId) {
        setMessages((prev) => prev.map((m) => (m.id === existingMsgId ? errMsg : m)));
      } else {
        setMessages((prev) => [...prev, errMsg]);
      }
    }
  };

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
      if (isStreamingMode && hasGeminiKey) {
        await sendStreaming(query);
      } else {
        await sendNonStreaming(query);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  };

  const handleAction = (action: string, params?: any) => {
    if (action === "PROMPT" && params?.text) {
      handleSend(params.text);
    } else if (action === "CREATE_EXAM") {
      router.push("/exams/builder");
    } else if (action === "EXPORT_WORKSHEET") {
      router.push("/materials");
    } else if (action === "FILTER_STUDENTS") {
      router.push("/students?warning=true");
    } else if (action === "OPEN_QUESTION_BANK") {
      router.push("/questions");
    } else if (action === "VIEW_STUDENT") {
      if (params?.studentId) router.push(`/students/${params.studentId}`);
    }
  };

  const handleStopStream = () => {
    stopCurrentStream();
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-slate-900">AI Command Center</h1>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full animate-pulse">
                Trực tuyến
              </span>
              {isStreamingMode && hasGeminiKey && (
                <span className="text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  Streaming
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Phân tích dữ liệu lớp học thực tế &amp; tạo nội dung bài giảng tức thời
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {/* Toggle streaming mode */}
          <button
            type="button"
            onClick={() => setIsStreamingMode((v) => !v)}
            title={isStreamingMode ? "Tắt streaming (trả lời toàn bộ)" : "Bật streaming (trả lời từng chữ)"}
            className={cn(
              "text-[10px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all",
              isStreamingMode
                ? "bg-violet-50 text-violet-700 border-violet-200/60"
                : "bg-white text-slate-500 border-slate-200"
            )}
          >
            <Zap className="w-3 h-3 inline mr-1" />
            {isStreamingMode ? "Stream ON" : "Stream OFF"}
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-xs">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dữ liệu lớp học thực tế</span>
          </div>
        </div>
      </div>

      {/* Quick Prompt Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p.text)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 text-xs font-semibold shadow-xs transition-all whitespace-nowrap disabled:opacity-50 shrink-0"
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 shadow-xs">
                {msg.isStreaming ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
            )}

            <div
              className={cn(
                "max-w-[85%] rounded-3xl p-5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm shadow-xs"
                  : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-sm shadow-xs"
              )}
            >
              <div className="leading-relaxed font-sans">
                <MathContent content={msg.content} />
                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-4 bg-indigo-500 animate-pulse ml-0.5 rounded-sm align-middle" />
                )}
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
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs shadow-xs"
                      >
                        <span className="font-semibold text-slate-900">{item.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500">{item.reason}</span>
                          <span className="font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
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
                    {msg.structuredData.data?.map((item: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-slate-200/80 text-center">
                        <span className="text-[11px] text-slate-500 font-semibold uppercase">{item.label}</span>
                        <p className="text-xl font-bold text-indigo-600">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Chips */}
              {!msg.isStreaming && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap gap-2">
                  {msg.suggestedActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleAction(action.action, action.params)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 text-xs font-semibold shadow-xs transition-all active:scale-95"
                    >
                      <span>{action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                    </button>
                  ))}
                </div>
              )}

              {/* Assistant Footer: Voice Reader */}
              {msg.role === "assistant" && !msg.isStreaming && (
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-400">
                  <span className="font-medium">EduMind AI • GDPT 2018 • Dữ liệu lớp học thực tế</span>
                  <button
                    type="button"
                    onClick={() => handleToggleSpeak(msg)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-all font-semibold cursor-pointer"
                  >
                    {isSpeaking && speakingMsgId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span>Dừng đọc</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Đọc to</span>
                      </>
                    )}
                  </button>
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

        {loading && !messages.some((m) => m.isStreaming) && (
          <div className="flex gap-3 items-center text-slate-500 text-xs italic py-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <span>EduMind AI đang phân tích dữ liệu lớp học...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi bất kỳ điều gì về lớp học, điểm số hoặc yêu cầu AI tạo nội dung..."
            className="flex-1 px-4 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          {/* Voice Input Microphone */}
          <button
            type="button"
            onClick={handleMicClick}
            title={isListening ? "Đang ghi âm... Bấm để dừng" : "Nhập bằng giọng nói tiếng Việt"}
            className={cn(
              "px-3 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold",
              isListening
                ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            )}
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">{isListening ? "Đang nghe..." : "Giọng nói"}</span>
          </button>

          {/* Stop stream button when streaming */}
          {loading && isStreamingMode && (
            <button
              type="button"
              onClick={handleStopStream}
              className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span>Dừng</span>
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <span>Gửi</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-2">
          <span>
            {hasGeminiKey
              ? "✅ Gemini AI đang hoạt động • Dữ liệu lớp học thực tế"
              : "⚠️ Chưa cấu hình API Key • Vào Cài đặt để thêm Gemini key"}
          </span>
          <span>Bấm ⌘J để mở nhanh</span>
        </div>
      </div>
    </div>
  );
}
