import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | Date | null) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString?: string | Date | null) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getDifficultyBadge(difficulty: string) {
  switch (difficulty) {
    case "NHAN_BIET":
      return { label: "Nhận biết", color: "bg-blue-50 text-blue-700 border-blue-200" };
    case "THONG_HIEU":
      return { label: "Thông hiểu", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "VAN_DUNG":
      return { label: "Vận dụng", color: "bg-amber-50 text-amber-700 border-amber-200" };
    case "VAN_DUNG_CAO":
      return { label: "Vận dụng cao", color: "bg-rose-50 text-rose-700 border-rose-200" };
    default:
      return { label: difficulty, color: "bg-slate-50 text-slate-700 border-slate-200" };
  }
}

export function getQuestionTypeBadge(type: string) {
  switch (type) {
    case "SINGLE_CHOICE":
      return { label: "Trắc nghiệm 1 ĐA", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    case "MULTIPLE_CHOICE":
      return { label: "Nhiều đáp án", color: "bg-purple-50 text-purple-700 border-purple-200" };
    case "TRUE_FALSE":
      return { label: "Đúng / Sai", color: "bg-cyan-50 text-cyan-700 border-cyan-200" };
    case "FILL_BLANK":
      return { label: "Điền chỗ trống", color: "bg-teal-50 text-teal-700 border-teal-200" };
    case "SHORT_ANSWER":
      return { label: "Trả lời ngắn", color: "bg-orange-50 text-orange-700 border-orange-200" };
    case "ESSAY":
      return { label: "Tự luận", color: "bg-violet-50 text-violet-700 border-violet-200" };
    default:
      return { label: type, color: "bg-slate-50 text-slate-700 border-slate-200" };
  }
}

export function getScoreColor(score: number, maxScore: number = 10) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (percentage >= 65) return "text-blue-600 bg-blue-50 border-blue-200";
  if (percentage >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-rose-600 bg-rose-50 border-rose-200";
}
