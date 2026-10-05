"use client";

import React, { useState } from "react";
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
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Hồ sơ giáo viên &amp; Thiết lập hệ thống
        </h1>
        <p className="text-sm text-slate-500">
          Quản lý thông tin cá nhân, cấu hình kết nối AI và giấy phép bản quyền EduMind THCS.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã lưu thành công các thay đổi!</span>
        </div>
      )}

      {/* Subscription Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white shadow-xl shadow-blue-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-300">
            <Crown className="w-3.5 h-3.5" />
            <span>Gói Teacher Pro – Giáo viên THCS</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Giấy phép đang hoạt động</h2>
          <p className="text-xs text-blue-100 max-w-lg">
            Truy cập toàn quyền: Ngân hàng câu hỏi chuẩn GDPT 2018, Tạo đề ma trận, Sinh 4 mã đề (101-104), Chấm bài tự động và Trợ lý AI không giới hạn.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-white/20 text-white font-bold text-xs uppercase border border-white/20 tracking-wider self-start sm:self-auto">
          Thời hạn: 2026–2027
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Thông tin giáo viên</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email trường</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Trường đang công tác</label>
              <input
                type="text"
                value={profile.school}
                onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Môn phụ trách</label>
              <input
                type="text"
                value={profile.subjects}
                onChange={(e) => setProfile({ ...profile, subjects: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Khối phụ trách</label>
              <input
                type="text"
                value={profile.grades}
                onChange={(e) => setProfile({ ...profile, grades: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* AI Engine Configuration */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Cấu hình mô hình AI</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mô hình AI mặc định</label>
              <select
                value={aiEngine}
                onChange={(e) => setAiEngine(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
              >
                <option value="SMART_LOCAL">
                  EduMind Smart Local AI (Tích hợp sẵn &bull; Không cần API Key &bull; Chuẩn GDPT 2018)
                </option>
                <option value="GEMINI">Google Gemini 2.0 Flash / Pro (Cần Gemini API Key)</option>
                <option value="OPENAI">OpenAI GPT-4o / Mini (Cần OpenAI API Key)</option>
              </select>
            </div>

            {aiEngine !== "SMART_LOCAL" && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">API Key tùy chỉnh</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Lưu tất cả thay đổi</span>
          </button>
        </div>
      </form>
    </div>
  );
}
