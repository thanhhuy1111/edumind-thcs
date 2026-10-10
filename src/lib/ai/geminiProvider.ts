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
 * Models: models/gemini-3.8-flash (Primary with auto-fallback to 2.5-flash)
 * Supports Google Search Grounding tool, medium thinking level, 65536 max tokens.
 */
export class GeminiAIProvider implements AIProvider {
  name = "Google Gemini 3.8 Flash AI (GDPT 2018)";
  private fallbackProvider: any = null;
  private apiKey: string | null = null;
  private primaryModel: string = "gemini-3.8-flash";
  private fallbackModels: string[] = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-2.5-flash", "gemini-flash-latest"];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "AIzaSyA8GyEXlqo77FrnMEncgmQu0ujXoFUUbYg";
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
    this.apiKey = key;
  }

  public hasApiKey(): boolean {
    return !!(this.apiKey && this.apiKey.trim().length > 10);
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
    const key = this.apiKey || process.env.GEMINI_API_KEY || "AIzaSyA8GyEXlqo77FrnMEncgmQu0ujXoFUUbYg";
    if (!key) {
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
    const { subject, grade, questionType = "SINGLE_CHOICE", difficulty = "THONG_HIEU", count = 5, promptNote = "" } = params;

    const systemPrompt = `Bạn là Chuyên gia Khảo thí và Ngân hàng Câu hỏi THCS Việt Nam.
Nhiệm vụ: Tạo ${count} câu hỏi trắc nghiệm chất lượng cao cho môn ${subject} lớp ${grade}, dạng ${questionType}, mức độ ${difficulty}.
Yêu cầu sư phạm: Bám sát chuẩn GDPT 2018, ngôn từ chuẩn mực, đáp án có lời giải chi tiết.
Công thức Toán học dùng LaTeX $...$.

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
      "skill": "Tên kỹ năng đánh giá",
      "source": "Gemini 3.8 Flash Question Bank",
      "tags": ["${subject.toLowerCase()}", "lop-${grade}"]
    }
  ]
}`;

    const userPrompt = `Yêu cầu thêm từ giáo viên: ${promptNote || `Tạo ${count} câu hỏi trắc nghiệm môn ${subject} lớp ${grade}`}`;

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

  async generateExamCV7991(params: GenerateExamCV7991Params): Promise<CV7991ExamPackage> {
    const systemPrompt = `Bạn là Chuyên gia Khảo thí và Đo lường Giáo dục của Bộ Giáo dục và Đào tạo Việt Nam, am hiểu sâu sắc Công văn 7991/BGDĐT-GDTrH (ngày 17/12/2024) và Thông tư 22/2021/TT-BGDĐT.
Nhiệm vụ của bạn là khởi tạo trọn bộ Hồ sơ Kiểm tra Định kỳ Chuẩn Công văn 7991 cho cấp THCS gồm 4 phần:
1. Ma trận đề kiểm tra 2 chiều chuẩn (chủ đề, đơn vị kiến thức, số lượng theo 4 dạng thức: Nhiều lựa chọn, Đúng-Sai 4 ý, Trả lời ngắn, Tự luận và mức độ Biết, Hiểu, Vận dụng, VDC).
2. Bản đặc tả đề kiểm tra (Yêu cầu cần đạt chuẩn GDPT 2018).
3. Đề kiểm tra chính thức (10.0 điểm).
4. Hướng dẫn chấm & Đáp án chi tiết (biểu điểm thành phần).`;

    const userPrompt = JSON.stringify({
      monHoc: params.subject,
      khoiLop: params.grade,
      hocKy: params.semester,
      thoiGianPhut: params.durationMinutes,
      loaiDe: params.examType,
      chuDe: params.topics,
      tiLeMaTran: params.matrixRatio,
    });

    try {
      const rawJson = await this.callGemini(systemPrompt, userPrompt, { jsonMode: true, maxTokens: 65536 });
      const parsed = JSON.parse(this.cleanJsonText(rawJson));
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed as CV7991ExamPackage;
      }
    } catch (error) {
      console.warn("Gemini generation failed, using Smart Local Fallback:", error);
    }

    return this.getFallback().generateExamCV7991(params);
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
    return this.getFallback().generateExam(params);
  }

  async analyzeStudent(params: AnalyzeStudentParams): Promise<StudentAnalysisResult> {
    return this.getFallback().analyzeStudent(params);
  }

  async chat(messages: ChatMessage[], context?: Record<string, unknown>): Promise<AIChatResponse> {
    const systemPrompt = `Bạn là Trợ lý AI Sư phạm THCS của hệ thống EduMind THCS, hỗ trợ đắc lực cho giáo viên trong việc:
1. Xây dựng đề kiểm tra và ma trận 2 chiều theo Công văn 7991/BGDĐT-GDTrH.
2. Soạn kế hoạch bài dạy theo Công văn 5512/BGDĐT-GDTrH.
3. Thiết kế slide bài giảng điện tử tương tác và chuẩn SCORM 1.2/2004.
4. Tư vấn phương pháp dạy học phân hóa và nhận xét học sinh theo Thông tư 22/2021/TT-BGDĐT.
Bạn có khả năng tra cứu thông tin thời gian thực bằng Google Search để cung cấp dữ liệu mới nhất.
Hãy trả lời với giọng điệu sư phạm, ân cần, khúc chiết, chuẩn mực tiếng Việt.`;

    const lastUserMsg = messages[messages.length - 1]?.content || "";

    try {
      // Use search grounding for live factual answers
      const text = await this.callGemini(systemPrompt, lastUserMsg, {
        jsonMode: false,
        useSearch: true,
        maxTokens: 16384,
      });

      return {
        content: text,
      };
    } catch (err) {
      console.warn("Gemini chat with search failed, retrying without search:", err);
      try {
        const text = await this.callGemini(systemPrompt, lastUserMsg, {
          jsonMode: false,
          useSearch: false,
          maxTokens: 16384,
        });
        return { content: text };
      } catch (innerErr) {
        console.warn("Gemini chat fallback to local:", innerErr);
        return this.getFallback().chat(messages, context);
      }
    }
  }
}
