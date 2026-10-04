"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, User, School, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    school: "Trường THCS Chu Văn An",
    subjects: "Toán học",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <span className="font-extrabold text-2xl tracking-tight">EduMind</span>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              THCS
            </span>
          </div>
          <p className="text-xs text-blue-200/80">Khởi tạo không gian làm việc số cho giáo viên</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Đăng ký tài khoản</h2>
            <p className="text-xs text-slate-300">Dành riêng cho giáo viên THCS tại Việt Nam.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Họ và tên giáo viên</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="VD: Cô Trần Thị Mai"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/20 rounded-xl text-white outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-200 mb-1">Email trường hoặc cá nhân</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@school.edu.vn"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/20 rounded-xl text-white outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-200 mb-1">Trường đang công tác</label>
              <div className="relative">
                <School className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/20 rounded-xl text-white outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-200 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/20 rounded-xl text-white outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>{loading ? "Đang tạo..." : "Đăng ký tài khoản"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-300">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-bold text-blue-300 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
