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
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('edumind_dark_mode') === 'true' ||
                    (!('edumind_dark_mode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
