"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  School,
  Mail,
  Phone,
  Sparkles,
  Shield,
  Save,
  CheckCircle2,
  Crown,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  AlertTriangle,
  Zap,
} from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Phan Thị Ngọc Huyền",
    email: "annahuyen889@gmail.com",
    phone: "0987313889",
    school: "Trường THCS Tân Phong - Vĩnh Long",
    subjects: "Âm nhạc",
    grades: "Khối 6, 7, 8, 9",
  });

  const [aiEngine, setAiEngine] = useState("SMART_LOCAL");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Key testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    model?: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    // Load local stored key if available
    const localKey = typeof window !== "undefined" ? localStorage.getItem("edumind_gemini_key") : null;
    if (localKey) {
      setApiKey(localKey);
      setAiEngine("GEMINI");
    }

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.profile) {
          setProfile({
            name: data.profile.name || "Phan Thị Ngọc Huyền",
            email: data.profile.email || "annahuyen889@gmail.com",
            phone: data.profile.phone || "0987313889",
            school: data.profile.school || "Trường THCS Tân Phong - Vĩnh Long",
            subjects: data.profile.subjects || "Âm nhạc",
            grades: data.profile.grades || "Khối 6, 7, 8, 9",
          });
        }
        if (data && data.aiEngine && !localKey) {
          setAiEngine(data.aiEngine);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        error: "Vui lòng nhập API Key để kiểm tra kết nối.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/settings/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || "Lỗi kiểm tra kết nối.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Save locally for client fetch calls
      if (typeof window !== "undefined") {
        if (apiKey.trim()) {
          localStorage.setItem("edumind_gemini_key", apiKey.trim());
        } else {
          localStorage.removeItem("edumind_gemini_key");
        }
      }

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          aiEngine,
          apiKey: apiKey.trim(),
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Hồ sơ giáo viên &amp; Thiết lập hệ thống
        </h1>
        <p className="text-sm text-slate-500">
          Quản lý thông tin cá nhân, cấu hình kết nối Google Gemini AI và giấy phép bản quyền EduMind THCS.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã lưu thành công các thay đổi và cấu hình AI!</span>
        </div>
      )}

      {/* Subscription Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white shadow-xl shadow-indigo-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-300 border border-white/10">
            <Crown className="w-3.5 h-3.5" />
            <span>Gói Teacher Pro – Giáo viên THCS Toàn diện</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Giấy phép đang hoạt động</h2>
          <p className="text-xs text-indigo-100/90 max-w-lg leading-relaxed">
            Hỗ trợ đầy đủ: Chuẩn Công văn 7991 (Ma trận 4 dạng thức), Công văn 5512 (Kế hoạch bài dạy 4 hoạt động), Slide bài giảng 16:9, SCORM E-learning và Chấm bài tự động.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-white font-bold text-xs uppercase border border-white/20 tracking-wider self-start sm:self-auto">
          Năm học: 2026–2027
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Thông tin giáo viên</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email trường</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Trường đang công tác</label>
              <input
                type="text"
                value={profile.school}
                onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Môn phụ trách chính</label>
              <input
                type="text"
                value={profile.subjects}
                onChange={(e) => setProfile({ ...profile, subjects: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Khối phụ trách</label>
              <input
                type="text"
                value={profile.grades}
                onChange={(e) => setProfile({ ...profile, grades: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* AI Engine Configuration */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Cấu hình mô hình AI</h3>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <span>Lấy Gemini API Key miễn phí</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lựa chọn chế độ AI</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAiEngine("GEMINI")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    aiEngine === "GEMINI"
                      ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Google Gemini AI
                    </span>
                    {aiEngine === "GEMINI" && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Mô hình <strong>gemini-2.5-flash</strong> và <strong>2.5-pro</strong>. Nhận diện hình ảnh SGK đa phương thức, sinh câu hỏi & ma trận đề sáng tạo không giới hạn.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAiEngine("SMART_LOCAL")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    aiEngine === "SMART_LOCAL"
                      ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      Smart Local AI (Dự phòng)
                    </span>
                    {aiEngine === "SMART_LOCAL" && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Động cơ sư phạm GDPT 2018 tích hợp sẵn. Hoạt động ngoại tuyến 100%, không phụ thuộc API key và không bao giờ bị gián đoạn mạng.
                  </p>
                </button>
              </div>
            </div>

            {aiEngine === "GEMINI" && (
              <div className="space-y-3 pt-2">
                <label className="block font-semibold text-slate-700">
                  Google Gemini API Key <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showKey ? "text" : "password"}
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setTestResult(null);
                      }}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-xs text-slate-900 focus:bg-white focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !apiKey.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold transition-all text-xs cursor-pointer shrink-0"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang kiểm tra...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Kiểm tra kết nối</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Feedback Result */}
                {testResult && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 animate-in fade-in ${
                      testResult.success
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border border-rose-200 text-rose-800"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <div className="font-bold">
                        {testResult.success
                          ? `Kết nối thành công tới ${testResult.model || "Gemini"}!`
                          : "Kết nối thất bại"}
                      </div>
                      <p className="text-[11px] font-normal">
                        {testResult.success
                          ? `Độ trễ phản hồi: ${testResult.latencyMs}ms. Toàn bộ tính năng AI (Soạn giáo án, Tạo đề CV 7991, Sinh slide, Chatbot) sẽ sử dụng mô hình này.`
                          : testResult.error}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Lưu tất cả thay đổi</span>
          </button>
        </div>
      </form>
    </div>
  );
}
