"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("lan.nguyen@thcs-cva.edu.vn");
  const [password, setPassword] = useState("demo123456");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand */}
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
          <p className="text-xs text-blue-200/80">Trợ lý Giảng dạy &amp; Phân tích Năng lực AI</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Đăng nhập tài khoản</h2>
            <p className="text-xs text-slate-300">
              Chào mừng cô quay trở lại phòng làm việc số EduMind.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Email giáo viên</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/20 rounded-xl text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-200">Mật khẩu</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-blue-300 hover:text-blue-200 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/20 rounded-xl text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-400/20 rounded-xl text-[11px] text-blue-200 space-y-0.5">
              <span className="font-bold block text-blue-100">Tài khoản demo sẵn sàng:</span>
              <p>Email: lan.nguyen@thcs-cva.edu.vn &bull; Mật khẩu: demo123456</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? "Đang xác thực..." : "Đăng nhập vào hệ thống"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-300">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-bold text-blue-300 hover:underline">
              Đăng ký dùng thử miễn phí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
