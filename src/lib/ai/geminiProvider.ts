import {
  AIProvider,
  GenerateQuestionsParams,
  GeneratedQuestion,
  GenerateExamParams,
  GeneratedExam,
  AnalyzeStudentParams,
  StudentAnalysisResult,
  ChatMessage,
  AIChatResponse,
  GenerateLessonPlanParams,
  GeneratedLessonPlan,
  GenerateSlideParams,
  GeneratedSlideDeck,
  GenerateExamCV7991Params,
  CV7991ExamPackage,
  GenerateSCORMLessonParams,
  GeneratedInteractiveLesson,
  AnalyzeTextbookParams,
  TextbookAnalysisResult,
} from "./types";

/**
 * Google Gemini AI Provider - Direct REST integration with Google Gemini 3.8 Flash & 2.5 Flash
 * Models: models/gemini-2.5-flash (Primary with auto-fallback to 2.5-pro and 1.5-flash)
 * Supports Google Search Grounding tool, multimodal vision, 65536 max tokens.
 */
export class GeminiAIProvider implements AIProvider {
  name = "Google Gemini AI (GDPT 2018)";
  private fallbackProvider: any = null;
  private apiKey: string | null = null;
  private primaryModel: string = "gemini-2.5-flash";
  private fallbackModels: string[] = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-flash-latest"];

  constructor(apiKey?: string) {
    const rawKey = apiKey || process.env.GEMINI_API_KEY || "";
    // Ignore dead/leaked placeholder keys
    this.apiKey = rawKey && !rawKey.startsWith("AIzaSyA8GyEXlqo") ? rawKey : null;
  }

  private getFallback() {
    if (!this.fallbackProvider) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { SmartLocalAIProvider } = require("./provider");
      this.fallbackProvider = new SmartLocalAIProvider();
    }
    return this.fallbackProvider;
  }

  public setApiKey(key: string) {
    this.apiKey = key && !key.startsWith("AIzaSyA8GyEXlqo") ? key.trim() : null;
  }

  public hasApiKey(): boolean {
    return !!(this.apiKey && this.apiKey.trim().length > 10);
  }

  /**
   * Ping Gemini API with lightweight request to verify key validity and calculate latency
   */
  public async testConnection(): Promise<{ success: boolean; model?: string; latencyMs?: number; error?: string }> {
    if (!this.hasApiKey()) {
      return { success: false, error: "Chưa cấu hình API Key hoặc key không hợp lệ." };
    }
    const key = this.apiKey!;
    const startTime = Date.now();

    for (const model of this.fallbackModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Kiểm tra kết nối EduMind THCS. Trả lời: Sẵn sàng." }] }],
            generationConfig: { maxOutputTokens: 20 },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          return {
            success: true,
            model,
            latencyMs: Date.now() - startTime,
          };
        }

        if (res.status === 403 || res.status === 400) {
          const errText = await res.text();
          let parsedMsg = "API key không được cấp quyền hoặc đã hết hạn";
          try {
            const jsonErr = JSON.parse(errText);
            if (jsonErr.error?.message) parsedMsg = jsonErr.error.message;
          } catch {}
          return { success: false, error: `Google API (${res.status}): ${parsedMsg}` };
        }
      } catch (err: any) {
        // try next fallback model
      }
    }

    return { success: false, error: "Không thể kết nối đến máy chủ Google Gemini. Vui lòng kiểm tra lại mạng hoặc API key." };
  }

  private cleanJsonText(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith("```json")) {
      clean = clean.substring(7);
    } else if (clean.startsWith("```")) {
      clean = clean.substring(3);
    }
    if (clean.endsWith("```")) {
      clean = clean.substring(0, clean.length - 3);
    }
    return clean.trim();
  }

  /**
   * Universal call to Google Gemini with automatic model failover and Google Search support
   */
  public async callGemini(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      jsonMode?: boolean;
      useSearch?: boolean;
      maxTokens?: number;
      temperature?: number;
      images?: Array<{ mimeType: string; data: string }>;
    }
  ): Promise<string> {
    const key = this.apiKey || "";
    if (!key || key.startsWith("AIzaSyA8GyEXlqo")) {
      throw new Error("NO_GEMINI_KEY");
    }

    const jsonMode = options?.jsonMode !== false;
    const useSearch = options?.useSearch === true;
    const maxTokens = options?.maxTokens || 65536;
    const temperature = options?.temperature ?? 0.4;

    const parts: Array<Record<string, unknown>> = [];
    if (options?.images && options.images.length > 0) {
      for (const img of options.images) {
        // Strip data prefix if user passed full data URL
        const cleanData = img.data.replace(/^data:[^;]+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: cleanData,
          },
        });
      }
    }
    parts.push({ text: `${systemPrompt}\n\n---\nNỘI DUNG YÊU CẦU:\n${userPrompt}` });

    const requestBody: Record<string, unknown> = {
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      generationConfig: {
        temperature,
        topP: 0.95,
        maxOutputTokens: maxTokens,
        ...(jsonMode && !useSearch ? { responseMimeType: "application/json" } : {}),
      },
      ...(useSearch ? { tools: [{ googleSearch: {} }] } : {}),
    };

    let lastError: unknown = null;

    // Attempt primary model first, followed by fallbacks if 503 or transient errors occur
    for (const model of this.fallbackModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
            const errText = await res.text();
            console.warn(`[Gemini ${model}] failed (${res.status}):`, errText.slice(0, 200));
            // If 503 high demand or 429 quota, try next model in fallback list
            if (res.status === 503 || res.status === 429 || res.status === 404) {
              lastError = new Error(`Gemini ${model} returned ${res.status}`);
              continue;
            }
            throw new Error(`Gemini API error: ${res.status}`);
          }

          const data = await res.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!candidate) {
            throw new Error("Empty response from Gemini");
          }

          return candidate;
        } finally {
          clearTimeout(timeoutId);
        }
    }

    throw lastError || new Error("All Gemini models failed");
  }

  /**
   * STEP 2: Gemini analyzes raw extracted document text, divides it into interactive knowledge checkpoints,
   * generates interactive quiz questions at checkpoints, and provides teacher voice narration scripts.
   */
  async generateInteractiveLesson(params: GenerateSCORMLessonParams): Promise<GeneratedInteractiveLesson> {
    const {
      documentText,
      lessonTitle = "Bài giảng THCS Chuyển đổi số",
      subject = "Âm nhạc",
      grade = 7,
      slideCount = 8,
    } = params;

    const systemPrompt = `Bạn là Chuyên gia Thiết kế Bài giảng Điện tử Tương tác E-Learning và Chuẩn đóng gói SCORM 1.2/2004 cho cấp THCS Việt Nam theo Chương trình GDPT 2018.

NHIỆM VỤ CỦA BẠN:
Dựa vào nội dung văn bản bài giảng được cung cấp, hãy phân tích và chia thành các mốc kiến thức (checkpoints), thiết kế dàn slide trực quan, đồng thời tạo ra các CÂU HỎI TRẮC NGHIỆM TƯƠNG TÁC tại các điểm dừng phù hợp kèm đáp án, giải thích sư phạm và LỜI THOẠI THUYẾT MINH (Voice Narration Script) để trợ lý AI đọc bài.

YÊU CẦU CẤU TRÚC JSON OUTPUT (BẮT BUỘC ĐÚNG ĐỊNH DẠNG):
{
  "lessonTitle": "Tên bài học",
  "subject": "${subject}",
  "grade": ${grade},
  "overview": "Tóm tắt mục tiêu bài học và năng lực cần đạt 2-3 câu",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Tiêu đề slide",
      "subtitle": "Phụ đề ngắn gọn",
      "mainContent": "Nội dung trọng tâm súc tích",
      "bullets": ["Ý chính 1", "Ý chính 2", "Ý chính 3"],
      "teacherNote": "Ghi chú sư phạm cho giáo viên",
      "suggestedVisual": "Gợi ý hình ảnh minh họa",
      "narrationScript": "Lời thoại thuyết minh tự nhiên của giáo viên bằng tiếng Việt (khoảng 2-3 câu) để công nghệ Text-to-Speech đọc tự động cho học sinh nghe.",
      "interactiveActivity": "Hướng dẫn học sinh dừng lại suy nghĩ hoặc thực hành",
      "quizQuestion": {
        "question": "Câu hỏi trắc nghiệm kiểm tra độ hiểu bài ngay tại slide này",
        "options": ["A. Lựa chọn 1", "B. Lựa chọn 2", "C. Lựa chọn 3", "D. Lựa chọn 4"],
        "answer": "A",
        "explanation": "Giải thích chi tiết vì sao A đúng để củng cố kiến thức"
      }
    }
  ],
  "checkpoints": [
    {
      "checkpointId": "cp-1",
      "order": 1,
      "title": "Mốc kiến thức 1",
      "conceptSummary": "Tóm tắt ngắn gọn khái niệm vừa học",
      "slideNumber": 2,
      "narrationScript": "Lời thoại chốt kiến thức và chuyển tiếp câu hỏi kiểm tra",
      "quizQuestion": {
        "question": "Câu hỏi kiểm tra",
        "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
        "answer": "A",
        "explanation": "Lời giải thích"
      }
    }
  ]
}

LƯU Ý QUAN TRỌNG:
1. Đảm bảo có ít nhất 2 đến 4 điểm dừng (checkpoints) có câu hỏi trắc nghiệm tương tác để học sinh buộc phải trả lời đúng mới được mở khóa slide tiếp theo.
2. Lời thoại 'narrationScript' phải dùng tiếng Việt tự nhiên, ấm áp, đúng ngữ điệu thầy cô giáo giảng bài cho học sinh lớp ${grade}.
3. Công thức toán học (nếu có) phải viết dạng LaTeX trong dấu $...$.`;

    const userPrompt = `TÀI LIỆU BÀI GIẢNG GỐC CẦN PHÂN TÍCH:\n${documentText.slice(0, 30000)}\n\nTên bài gợi ý: ${lessonTitle}\nMôn học: ${subject}\nKhối lớp: ${grade}\nSố lượng slide mong muốn: khoảng ${slideCount} slide.`;

    try {
      const rawText = await this.callGemini(systemPrompt, userPrompt, { jsonMode: true, maxTokens: 65536 });
      const parsed = JSON.parse(this.cleanJsonText(rawText));
      if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
        return parsed as GeneratedInteractiveLesson;
      }
    } catch (err) {
      console.warn("Gemini interactive lesson generation failed, using fallback:", err);
    }

    // Fallback if parsing or network fails
    const fallbackDeck = await this.getFallback().generateSlideDeck({
      lessonTitle,
      subject,
      grade,
      slideCount,
    });

    return {
      lessonTitle,
      subject,
      grade,
      overview: `Bài học ${lessonTitle} theo định hướng GDPT 2018 môn ${subject} lớp ${grade}.`,
      slides: fallbackDeck.slides.map((s: any, idx: number) => ({
        ...s,
        narrationScript: `Chào các em, ở nội dung ${s.title}, chúng ta cần nắm vững các ý trọng tâm sau đây: ${s.bullets.slice(0, 2).join(", ")}. Hãy cùng quan sát và ghi nhớ thật kĩ nhé!`,
        quizQuestion: s.quizQuestion ? {
          question: s.quizQuestion.question,
          options: s.quizQuestion.options,
          answer: s.quizQuestion.answer,
          explanation: "Đáp án đúng theo chuẩn kiến thức bài học.",
        } : (idx === 2 || idx === 5 ? {
          question: `Nội dung cốt lõi của phần ${s.title} là gì?`,
          options: ["A. Nắm vững khái niệm cơ bản", "B. Chỉ học thuộc lòng", "C. Bỏ qua ví dụ", "D. Không cần thực hành"],
          answer: "A",
          explanation: "Cần hiểu sâu bản chất khái niệm để vận dụng thực tế.",
        } : undefined),
      })),
      checkpoints: [
        {
          checkpointId: "cp-1",
          order: 1,
          title: "Khởi động & Khám phá",
          conceptSummary: "Tiếp cận vấn đề thực tiễn",
          slideNumber: 2,
          narrationScript: "Các em hãy trả lời nhanh câu hỏi tương tác để tiếp tục phần sau nhé!",
          quizQuestion: {
            question: "Mục tiêu trọng tâm của bài học hướng tới điều gì?",
            options: ["A. Năng lực và phẩm chất theo GDPT 2018", "B. Chỉ thi cử", "C. Lý thuyết trừu tượng", "D. Ghi nhớ tạm thời"],
            answer: "A",
            explanation: "Chương trình GDPT 2018 chú trọng phát triển toàn diện năng lực và phẩm chất học sinh.",
          },
        },
      ],
    };
  }

  async generateQuestions(params: GenerateQuestionsParams): Promise<GeneratedQuestion[]> {
    const {
      subject,
      grade,
      chapter,
      lesson,
      skill,
      questionType = "SINGLE_CHOICE",
      difficulty = "THONG_HIEU",
      count = 5,
      promptNote = "",
    } = params;

    const topicDetails: string[] = [];
    if (chapter) topicDetails.push(`Chương/Chủ đề: ${chapter}`);
    if (lesson) topicDetails.push(`Bài học: ${lesson}`);
    if (skill) topicDetails.push(`Kỹ năng đánh giá: ${skill}`);
    if (promptNote) topicDetails.push(`Yêu cầu giáo viên: ${promptNote}`);

    const systemPrompt = `Bạn là Chuyên gia Khảo thí và Ngân hàng Câu hỏi THCS Việt Nam theo Chương trình GDPT 2018.
Nhiệm vụ: Tạo ${count} câu hỏi trắc nghiệm chất lượng cao cho môn ${subject} lớp ${grade}, dạng ${questionType}, mức độ ${difficulty}.
${topicDetails.length > 0 ? `Nội dung trọng tâm:\n${topicDetails.join("\n")}\n` : ""}
Yêu cầu sư phạm: Bám sát chuẩn GDPT 2018, ngôn từ chuẩn mực, đáp án có lời giải chi tiết.
Công thức Toán học hoặc Khoa học dùng LaTeX $...$.

JSON Schema:
{
  "questions": [
    {
      "content": "Nội dung câu hỏi...",
      "type": "${questionType}",
      "difficulty": "${difficulty}",
      "answers": [
        { "label": "A", "content": "Đáp án A", "isCorrect": true },
        { "label": "B", "content": "Đáp án B", "isCorrect": false },
        { "label": "C", "content": "Đáp án C", "isCorrect": false },
        { "label": "D", "content": "Đáp án D", "isCorrect": false }
      ],
      "correct_answer": "A",
      "explanation": "Giải thích chi tiết lý do chọn đáp án này...",
      "skill": "${skill || "Tên kỹ năng đánh giá"}",
      "source": "Gemini Question Bank",
      "tags": ["${subject.toLowerCase()}", "lop-${grade}"]
    }
  ]
}`;

    const userPrompt =
      topicDetails.length > 0
        ? `Tạo ${count} câu hỏi môn ${subject} lớp ${grade}:\n${topicDetails.join("\n")}`
        : `Yêu cầu từ giáo viên: ${promptNote || `Tạo ${count} câu hỏi trắc nghiệm môn ${subject} lớp ${grade}`}`;

    try {
      const rawText = await this.callGemini(systemPrompt, userPrompt, { jsonMode: true, maxTokens: 16384 });
      const parsed = JSON.parse(this.cleanJsonText(rawText));
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed.questions as GeneratedQuestion[];
      }
    } catch (err) {
      console.warn("Gemini question generation failed, using local fallback:", err);
    }

    return this.getFallback().generateQuestions(params);
  }

  /**
   * Validate a CV7991 exam package: check total score, question count, and warnings.
   * Returns the package with consistencyCheck filled in.
   */
  private validateCV7991Package(pkg: CV7991ExamPackage, params: GenerateExamCV7991Params): CV7991ExamPackage {
    const warnings: string[] = [];
    let scoreSum = 0;

    if (Array.isArray(pkg.scoringGuide?.multipleChoice)) {
      scoreSum += pkg.scoringGuide.multipleChoice.reduce((s, q) => s + (q.points || 0), 0);
    }
    if (Array.isArray(pkg.scoringGuide?.trueFalse)) {
      pkg.scoringGuide.trueFalse.forEach((q) => {
        scoreSum += q.subItems?.reduce((s, i) => s + (i.points || 0), 0) || 0;
      });
    }
    if (Array.isArray(pkg.scoringGuide?.essayRubric)) {
      scoreSum += pkg.scoringGuide.essayRubric.reduce((s, q) => s + (q.totalPoints || 0), 0);
    }

    const expectedTotal = params.totalScore || 10;
    if (Math.abs(scoreSum - expectedTotal) > 0.5) {
      warnings.push(`Tổng điểm biểu điểm (${scoreSum.toFixed(1)}) chênh lệch với yêu cầu (${expectedTotal}).`);
    }

    if (!Array.isArray(pkg.questions) || pkg.questions.length === 0) {
      warnings.push("Không có câu hỏi nào được sinh ra.");
    }

    if (!Array.isArray(pkg.matrix) || pkg.matrix.length === 0) {
      warnings.push("Thiếu ma trận đề 2 chiều.");
    }

    if (!Array.isArray(pkg.specification) || pkg.specification.length === 0) {
      warnings.push("Thiếu bảng đặc tả.");
    }

    // Validate difficulty distribution
    const nhanBietQ = pkg.questions.filter((q) => q.difficulty === "NHAN_BIET").length;
    const totalQ = pkg.questions.length;
    const nhanBietPct = totalQ > 0 ? (nhanBietQ / totalQ) * 100 : 0;
    const expectedNB = params.matrixRatio?.nhanBiet || 40;
    if (Math.abs(nhanBietPct - expectedNB) > 20) {
      warnings.push(`Tỉ lệ câu Nhận biết (${nhanBietPct.toFixed(0)}%) không khớp yêu cầu (${expectedNB}%).`);
    }

    return {
      ...pkg,
      consistencyCheck: {
        isValid: warnings.length === 0,
        scoreSum: parseFloat(scoreSum.toFixed(1)),
        warnings,
      },
    };
  }

  async generateExamCV7991(params: GenerateExamCV7991Params): Promise<CV7991ExamPackage> {
    const strictSystemPrompt = `Bạn là Chuyên gia Khảo thí và Đo lường Giáo dục của Bộ Giáo dục và Đào tạo Việt Nam, am hiểu sâu sắc Công văn 7991/BGDĐT-GDTrH (ngày 17/12/2024) và Thông tư 22/2021/TT-BGDĐT.
Nhiệm vụ của bạn là khởi tạo trọn bộ Hồ sơ Kiểm tra Định kỳ Chuẩn Công văn 7991 cho cấp THCS gồm 4 phần:
1. Ma trận đề kiểm tra 2 chiều chuẩn (chủ đề, đơn vị kiến thức, số lượng theo 4 dạng thức: Nhiều lựa chọn, Đúng-Sai 4 ý, Trả lời ngắn, Tự luận và mức độ Biết, Hiểu, Vận dụng, VDC).
2. Bản đặc tả đề kiểm tra (Yêu cầu cần đạt chuẩn GDPT 2018).
3. Đề kiểm tra chính thức (10.0 điểm).
4. Hướng dẫn chấm & Đáp án chi tiết (biểu điểm thành phần).

YÊU CẦU TUYỆT ĐỐI:
- Tổng điểm scoringGuide phải ĐÚNG BẰNG ${params.totalScore || 10} điểm.
- questions phải có ít nhất 4 câu.
- matrix và specification phải có đủ các hàng theo chủ đề.
- Mỗi câu hỏi phải có đủ content, answers (4 lựa chọn), correct_answer, explanation.`;

    const userPrompt = JSON.stringify({
      monHoc: params.subject,
      khoiLop: params.grade,
      hocKy: params.semester,
      thoiGianPhut: params.durationMinutes,
      loaiDe: params.examType,
      chuDe: params.topics,
      tiLeMaTran: params.matrixRatio,
      tongDiem: params.totalScore || 10,
    });

    // Attempt 1: Gemini with strict prompt
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const rawJson = await this.callGemini(strictSystemPrompt, userPrompt, {
          jsonMode: true,
          maxTokens: 65536,
          temperature: attempt === 1 ? 0.4 : 0.2, // lower temp on retry for more precision
        });
        const parsed = JSON.parse(this.cleanJsonText(rawJson));

        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length >= 4) {
          const validated = this.validateCV7991Package(parsed as CV7991ExamPackage, params);
          // Accept if valid or only has minor warnings
          if (validated.consistencyCheck.isValid || validated.consistencyCheck.warnings.length <= 1) {
            return validated;
          }
          console.warn(`[CV7991 attempt ${attempt}] Warnings:`, validated.consistencyCheck.warnings);
          if (attempt === 2) return validated; // return best effort on 2nd try
        }
      } catch (error) {
        console.warn(`[CV7991 attempt ${attempt}] Gemini error:`, error);
      }
    }

    // Final fallback to local provider
    const fallbackResult = await this.getFallback().generateExamCV7991(params);
    return this.validateCV7991Package(fallbackResult, params);
  }

  async analyzeTextbook(params: AnalyzeTextbookParams): Promise<TextbookAnalysisResult> {
    const { documentText = "", fileName = "", imageBase64, imageMimeType, bookSeries } = params;

    const systemPrompt = `Bạn là Chuyên gia Phương pháp Dạy học THCS và Thẩm định Sách Giáo Khoa (Bộ Giáo dục và Đào tạo Việt Nam).
Nhiệm vụ: Đọc, bóc tách và phân tích sư phạm tài liệu hoặc ảnh chụp trang Sách Giáo Khoa (SGK) theo chuẩn Chương trình GDPT 2018.
Trích xuất chính xác cấu trúc bài dạy:
1. bookSeries: Tên bộ sách ("Kết Nối Tri Thức Với Cuộc Sống", "Chân Trời Sáng Tạo", "Cánh Diều", hoặc bộ sách nhận diện được).
2. subject: Môn học (Toán học, Khoa học tự nhiên, Ngữ văn, Âm nhạc, Tiếng Anh, Lịch sử và Địa lí...).
3. grade: Khối lớp (6, 7, 8, hoặc 9).
4. chapterTitle: Tên chương hoặc Chủ đề chứa bài học.
5. lessonTitle: Tên bài học chính xác trong SGK.
6. learningOutcomes: Yêu cầu cần đạt chuẩn GDPT 2018 (nêu rõ học sinh biết gì, làm được gì sau bài học).
7. keyConcepts: Mảng các khái niệm, định lý, công thức, nội dung kiến thức cốt lõi.
8. exercisesSummary: Mảng tóm tắt các câu hỏi khởi động, khám phá, bài tập trong SGK.
9. suggestedDuration: Thời lượng đề xuất (45 phút hoặc 90 phút).
10. extractedSnippet: Đoạn trích dẫn tóm tắt các phần tiêu biểu nhất của trang SGK.

Định dạng JSON Schema:
{
  "bookSeries": "string",
  "subject": "string",
  "grade": 7,
  "chapterTitle": "string",
  "lessonTitle": "string",
  "learningOutcomes": "string",
  "keyConcepts": ["string"],
  "exercisesSummary": ["string"],
  "suggestedDuration": 45,
  "extractedSnippet": "string"
}`;

    const userPrompt = `Tên file: ${fileName || "Tài liệu SGK"}.
Bộ sách giáo viên chọn trước (nếu có): ${bookSeries || "Tự động nhận diện từ tài liệu"}.
Văn bản trích xuất (nếu có):
${documentText.slice(0, 15000)}`;

    const images = imageBase64 ? [{ mimeType: imageMimeType || "image/jpeg", data: imageBase64 }] : undefined;

    try {
      const rawJson = await this.callGemini(systemPrompt, userPrompt, { jsonMode: true, maxTokens: 16384, images });
      const parsed = JSON.parse(this.cleanJsonText(rawJson));
      if (parsed && parsed.lessonTitle) {
        return parsed as TextbookAnalysisResult;
      }
    } catch (err) {
      console.warn("Gemini textbook analysis failed, using local fallback:", err);
    }

    return this.getFallback().analyzeTextbook(params);
  }

  async generateLessonPlan(params: GenerateLessonPlanParams): Promise<GeneratedLessonPlan> {
    const systemPrompt = `Bạn là Chuyên gia Phương pháp Dạy học THCS theo Chương trình GDPT 2018.
Nhiệm vụ của bạn là soạn Kế hoạch bài dạy (Giáo án) theo đúng chuẩn Công văn 5512/BGDĐT-GDTrH, bám sát Sách Giáo Khoa (SGK).
Kế hoạch bài dạy bắt buộc phải có đầy đủ:
I. MỤC TIÊU:
1. Kiến thức: Cụ thể theo nội dung bài học trong SGK.
2. Năng lực: Năng lực chung (tự chủ, giao tiếp, hợp tác) và Năng lực đặc thù của bộ môn.
3. Phẩm chất: Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm.
II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU:
1. Giáo viên: Thiết bị, dụng cụ, phiếu học tập số 1, 2.
2. Học sinh: Đúng bộ SGK được chỉ định, vở ghi chép, đồ dùng học tập.
3. Học liệu số: Slide bài giảng, video clip minh họa.
III. TIẾN TRÌNH DẠY HỌC (Đúng 4 hoạt động chuẩn 5512):
1. Hoạt động 1: Mở đầu / Khởi động (Mục tiêu, Nội dung bám sát câu hỏi mở đầu trong SGK, Sản phẩm, Tổ chức thực hiện 4 bước).
2. Hoạt động 2: Hình thành kiến thức mới (Mục tiêu, Nội dung các mục trong SGK, Sản phẩm, Tổ chức thực hiện 4 bước).
3. Hoạt động 3: Luyện tập (Mục tiêu, Nội dung bài tập SGK, Sản phẩm bài giải chi tiết, Tổ chức thực hiện 4 bước).
4. Hoạt động 4: Vận dụng (Mục tiêu, Nội dung liên hệ thực tiễn / mở rộng, Sản phẩm, Tổ chức thực hiện 4 bước).
Mỗi hoạt động bắt buộc có đủ 4 trường: objective (Mục tiêu), content (Nội dung), product (Sản phẩm), execution (Tổ chức thực hiện với 4 bước sư phạm: Bước 1 Giao nhiệm vụ, Bước 2 Thực hiện, Bước 3 Báo cáo thảo luận, Bước 4 Kết luận nhận định).`;

    const userPrompt = JSON.stringify({
      monHoc: params.subject,
      khoiLop: params.grade,
      tenBaiHoc: params.lessonTitle,
      chuong: params.chapter,
      boSachSGK: params.bookSeries || "Kết Nối Tri Thức",
      thoiLuongPhut: params.durationMinutes,
      yeuCauCanDat: params.learningOutcomes,
      phuongPhap: params.method,
      thietBi: params.equipment,
      noiDungSGKDacBiet: params.textbookContent ? params.textbookContent.slice(0, 10000) : undefined,
    });

    const images = params.textbookImageBase64
      ? [{ mimeType: params.textbookImageMimeType || "image/jpeg", data: params.textbookImageBase64 }]
      : undefined;

    try {
      const rawJson = await this.callGemini(systemPrompt, userPrompt, { jsonMode: true, maxTokens: 65536, images });
      const parsed = JSON.parse(this.cleanJsonText(rawJson));
      if (parsed && Array.isArray(parsed.activities) && parsed.activities.length === 4) {
        return parsed as GeneratedLessonPlan;
      }
    } catch (error) {
      console.warn("Gemini lesson plan failed, using Local Fallback:", error);
    }

    return this.getFallback().generateLessonPlan(params);
  }

  async generateSlideDeck(params: GenerateSlideParams): Promise<GeneratedSlideDeck> {
    const systemPrompt = `Bạn là Chuyên gia Thiết kế Bài giảng Điện tử Sư phạm THCS theo Chương trình GDPT 2018.
Nhiệm vụ: Tạo dàn slide bài giảng (${params.slideCount || 10} slide) bám sát CV 5512 và định hướng tương tác CV 7991.
Mỗi slide gồm:
- slideNumber, title, subtitle, mainContent, bullets (3-4 ý)
- teacherNote (lời thoại sư phạm)
- suggestedVisual (mô tả hình ảnh hoặc sơ đồ)
- quizQuestion (cho các slide luyện tập: question, options, answer)
JSON output: { "title": "...", "subject": "...", "grade": number, "slides": [...] }`;

    try {
      const rawJson = await this.callGemini(systemPrompt, JSON.stringify(params), { jsonMode: true, maxTokens: 65536 });
      const parsed = JSON.parse(this.cleanJsonText(rawJson));
      if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
        return parsed as GeneratedSlideDeck;
      }
    } catch (error) {
      console.warn("Gemini slide generation failed, using Local Fallback:", error);
    }

    return this.getFallback().generateSlideDeck(params);
  }

  async generateExam(params: GenerateExamParams): Promise<GeneratedExam> {
    const { title, subject, grade, durationMinutes, totalScore, questionCount, matrix, topics = [] } = params;

    const nhanBiet = matrix?.nhanBiet ?? 40;
    const thongHieu = matrix?.thongHieu ?? 30;
    const vanDung = matrix?.vanDung ?? 20;
    const vanDungCao = matrix?.vanDungCao ?? 10;

    const systemPrompt = `Bạn là Chuyên gia Khảo thí và Đo lường Đánh giá Giáo dục THCS Việt Nam theo Chương trình GDPT 2018.
Nhiệm vụ: Xây dựng Đề kiểm tra hoàn chỉnh gồm ${questionCount} câu hỏi trắc nghiệm khách quan môn ${subject} khối ${grade} theo Ma trận nhận thức chuẩn:
- Nhận biết: ${nhanBiet}%
- Thông hiểu: ${thongHieu}%
- Vận dụng: ${vanDung}%
- Vận dụng cao: ${vanDungCao}%
Thời gian làm bài: ${durationMinutes} phút. Thang điểm: ${totalScore} điểm.

Yêu cầu sư phạm:
1. Đảm bảo ngôn từ trong sáng, chuẩn mực tiếng Việt, chuẩn kiến thức kỹ năng GDPT 2018.
2. Công thức toán học/khoa học (nếu có) phải viết bằng LaTeX định dạng $...$.
3. Mỗi câu hỏi phải có 4 phương án A, B, C, D, chỉ có đúng 1 đáp án chính xác, và có lời giải thích sư phạm chi tiết.
4. Phân bố điểm số cho từng câu hỏi sao cho tổng điểm chính xác bằng ${totalScore}.

JSON Schema:
{
  "questions": [
    {
      "orderNumber": 1,
      "content": "Nội dung câu hỏi...",
      "type": "SINGLE_CHOICE",
      "difficulty": "NHAN_BIET",
      "scorePoints": 0.5,
      "answers": [
        { "label": "A", "content": "Đáp án A", "isCorrect": true },
        { "label": "B", "content": "Đáp án B", "isCorrect": false },
        { "label": "C", "content": "Đáp án C", "isCorrect": false },
        { "label": "D", "content": "Đáp án D", "isCorrect": false }
      ],
      "correct_answer": "A",
      "explanation": "Lời giải thích sư phạm chi tiết...",
      "skill": "Tên kỹ năng đánh giá",
      "source": "Gemini EduMind Exam Generator"
    }
  ]
}`;

    const userPrompt = `Đề thi: ${title}
Môn: ${subject} | Lớp: ${grade}
Chủ đề: ${topics.length > 0 ? topics.join(", ") : "Chương trình chuẩn GDPT 2018"}
Số lượng câu hỏi: ${questionCount}
Tổng điểm: ${totalScore}đ`;

    try {
      const rawText = await this.callGemini(systemPrompt, userPrompt, {
        jsonMode: true,
        maxTokens: 32768,
        temperature: 0.3,
      });
      const parsed = JSON.parse(this.cleanJsonText(rawText));
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return {
          title,
          questions: parsed.questions,
          durationMinutes,
          matrixSummary: `Ma trận GDPT 2018: Nhận biết ${nhanBiet}%, Thông hiểu ${thongHieu}%, Vận dụng ${vanDung}%, Vận dụng cao ${vanDungCao}%. Tổng điểm: ${totalScore}đ (${parsed.questions.length} câu).`,
        };
      }
    } catch (err) {
      console.warn("Gemini generateExam failed, using local fallback:", err);
    }

    return this.getFallback().generateExam(params);
  }

  async analyzeStudent(params: AnalyzeStudentParams): Promise<StudentAnalysisResult> {
    const { studentName, grade, classTitle, recentScores, skillMasteries } = params;

    const systemPrompt = `Bạn là Chuyên gia Tâm lý Giáo dục và Đánh giá Năng lực Học sinh THCS Việt Nam theo Thông tư 22/2021/TT-BGDĐT.
Nhiệm vụ: Phân tích toàn diện hồ sơ học tập của học sinh và tạo nhận xét cá nhân hóa.

JSON Schema bắt buộc:
{
  "summary": "Tóm tắt tổng thể tình hình học tập 2-3 câu, cụ thể, không chung chung",
  "strongSkills": ["Kỹ năng mạnh 1", "Kỹ năng mạnh 2"],
  "weakSkills": ["Kỹ năng yếu 1", "Kỹ năng yếu 2"],
  "trend": "IMPROVING" | "STABLE" | "DECLINING",
  "recommendedActions": ["Hành động cụ thể 1", "Hành động cụ thể 2", "Hành động cụ thể 3"],
  "teacherRemark": "Nhận xét sư phạm ấm áp, cụ thể để ghi vào học bạ hoặc gửi phụ huynh (2-3 câu, nhân ái, khuyến khích)."
}
Quy tắc: Dựa trên số liệu thực tế, đừng bịa dữ liệu, trend phải phù hợp với điểm gần đây.`;

    const userPrompt = `Học sinh: ${studentName}\nLớp: ${classTitle} (Khối ${grade})\n\nĐiểm bài kiểm tra gần đây:\n${recentScores.map((s) => `- ${s.examTitle}: ${s.score}/${s.maxScore} (${s.date})`).join("\n")}\n\nMức độ thành thạo kỹ năng:\n${skillMasteries.map((s) => `- ${s.skillName}: ${s.score}%`).join("\n")}`;

    try {
      const rawJson = await this.callGemini(systemPrompt, userPrompt, { jsonMode: true, maxTokens: 4096 });
      const parsed = JSON.parse(this.cleanJsonText(rawJson));
      if (parsed && parsed.summary && parsed.trend) {
        return parsed as StudentAnalysisResult;
      }
    } catch (err) {
      console.warn("Gemini analyzeStudent failed, using local fallback:", err);
    }

    return this.getFallback().analyzeStudent(params);
  }

  /**
   * Multi-turn chat call to Gemini with alternating role validation
   */
  public async callGeminiChat(
    systemPrompt: string,
    messages: ChatMessage[],
    options?: {
      useSearch?: boolean;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<string> {
    const key = this.apiKey || "";
    if (!key || key.startsWith("AIzaSyA8GyEXlqo")) {
      throw new Error("NO_GEMINI_KEY");
    }

    const useSearch = options?.useSearch === true;
    const maxTokens = options?.maxTokens || 16384;
    const temperature = options?.temperature ?? 0.3;

    // Convert messages to Gemini format alternating user/model
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const role: "user" | "model" = m.role === "assistant" ? "model" : "user";
      const text = i === 0 && systemPrompt ? `${systemPrompt}\n\n---\n${m.content}` : m.content;

      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n\n${text}`;
      } else {
        contents.push({ role, parts: [{ text }] });
      }
    }

    if (contents.length === 0) {
      contents.push({ role: "user", parts: [{ text: systemPrompt || "Xin chào." }] });
    } else if (contents[0].role !== "user") {
      contents.unshift({ role: "user", parts: [{ text: systemPrompt || "Bắt đầu trao đổi." }] });
    }

    const requestBody: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature,
        topP: 0.95,
        maxOutputTokens: maxTokens,
      },
      ...(useSearch ? { tools: [{ googleSearch: {} }] } : {}),
    };

    let lastError: unknown = null;
    for (const model of this.fallbackModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const candidate = data.candidates?.[0];
          if (candidate?.content?.parts?.[0]?.text) {
            return candidate.content.parts[0].text;
          }
        }
        lastError = new Error(`Gemini ${model} HTTP ${res.status}`);
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err;
      }
    }
    throw lastError || new Error("All Gemini models failed");
  }

  async chat(messages: ChatMessage[], context?: Record<string, unknown>): Promise<AIChatResponse> {
    // Build a rich data-aware system prompt using real classroom context
    const classroomContextText = (context?.classroomContextText as string) || "";
    const teacherName = (context?.teacher as any)?.name || "Giáo viên";

    const dataSection = classroomContextText
      ? `\n\n=== DỮ LIỆU THỰC TẾ LỚP HỌC CỦA ${teacherName.toUpperCase()} ===\n${classroomContextText}\n=== HẾT DỮ LIỆU ===\n\nQUAN TRỌNG: Khi giáo viên hỏi về học sinh, lớp, kỹ năng cụ thể, hãy trả lời DỰA TRÊN DỮ LIỆU TRÊN. Đừng bịa hoặc nói chung chung. Nếu dữ liệu không đủ, hãy nói rõ.`
      : "";

    const systemPrompt = `Bạn là Trợ lý AI Sư phạm THCS của hệ thống EduMind THCS, hỗ trợ đắc lực cho ${teacherName} trong việc:
1. Trả lời câu hỏi về dữ liệu học sinh, lớp học, điểm số, kỹ năng cụ thể dựa trên dữ liệu thực.
2. Xây dựng đề kiểm tra và ma trận 2 chiều theo Công văn 7991/BGDĐT-GDTrH.
3. Soạn kế hoạch bài dạy theo Công văn 5512/BGDĐT-GDTrH.
4. Tư vấn phương pháp dạy học phân hóa theo Thông tư 22/2021/TT-BGDĐT.
5. Nhận xét học sinh và đề xuất hành động cụ thể.
Hãy trả lời với giọng điệu sư phạm, ân cần, khúc chiết, chuẩn mực tiếng Việt.${dataSection}`;

    const lastUserMsg = messages[messages.length - 1]?.content || "";

    // Determine if query is about classroom data (skip Google Search grounding for data queries)
    const isDataQuery = /học sinh|lớp|điểm|kỹ năng|yếu|mạnh|kết quả|tiến bộ|phân tích|so sánh|nguy cơ|cần chú ý/i.test(lastUserMsg);

    try {
      // Use multi-turn conversation support
      const text = await this.callGeminiChat(systemPrompt, messages, {
        useSearch: !isDataQuery,
        maxTokens: 16384,
        temperature: 0.3,
      });

      // Auto-suggest actions based on response content
      const suggestedActions: AIChatResponse["suggestedActions"] = [];

      if (/yếu|kém|cần cải thiện|hổng kiến thức/i.test(text)) {
        suggestedActions.push({ label: "Tạo bài luyện tập cho nhóm yếu", action: "CREATE_EXAM", params: {} });
      }
      if (/đề kiểm tra|bài kiểm tra/i.test(text)) {
        suggestedActions.push({ label: "Mở trình tạo đề", action: "CREATE_EXAM", params: {} });
      }
      if (/học sinh nào|danh sách|cần chú ý/i.test(lastUserMsg)) {
        suggestedActions.push({ label: "Xem toàn bộ học sinh", action: "FILTER_STUDENTS", params: { warning: true } });
      }

      return {
        content: text,
        suggestedActions: suggestedActions.length ? suggestedActions : undefined,
      };
    } catch (err) {
      console.warn("Gemini chat with search failed, retrying without search:", err);
      try {
        const text = await this.callGeminiChat(systemPrompt, messages, {
          useSearch: false,
          maxTokens: 16384,
          temperature: 0.3,
        });
        return { content: text };
      } catch (innerErr) {
        console.warn("Gemini chat fallback to local:", innerErr);
        return this.getFallback().chat(messages, context);
      }
    }
  }
}
