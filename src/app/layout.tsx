import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduMind THCS – Trợ lý Giảng dạy AI cho Giáo viên THCS",
  description:
    "Nền tảng trợ lý AI toàn diện cho giáo viên THCS tại Việt Nam: Quản lý lớp, ngân hàng câu hỏi, tạo đề ma trận, xuất in 4 mã đề, chấm bài và phân tích năng lực học sinh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
