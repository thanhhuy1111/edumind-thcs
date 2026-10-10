/**
 * Client-side helper for attaching user-configured Gemini API Key
 * to any fetch request seamlessly.
 */
export function getGeminiAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const key = localStorage.getItem("edumind_gemini_key");
    if (key && key.trim().length > 10 && !key.startsWith("AIzaSyA8GyEXlqo")) {
      return { "x-gemini-key": key.trim() };
    }
  } catch {}
  return {};
}

export function getActiveGeminiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = localStorage.getItem("edumind_gemini_key");
    if (key && key.trim().length > 10 && !key.startsWith("AIzaSyA8GyEXlqo")) {
      return key.trim();
    }
  } catch {}
  return null;
}
