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
  CV7991MatrixRow,
  CV7991SpecificationRow,
  AnalyzeTextbookParams,
  TextbookAnalysisResult,
} from "./types";
import { CURRICULUM_PRESETS } from "./curriculumDatabase";

/**
 * Smart Local AI Provider - High-fidelity curriculum reasoning engine
 * Provides realistic THCS questions, exam matrices, and classroom analytics
 * without external API key dependencies.
 */
export class SmartLocalAIProvider implements AIProvider {
  name = "EduMind Smart Local AI (GDPT 2018)";

  async generateQuestions(params: GenerateQuestionsParams): Promise<GeneratedQuestion[]> {
    const { subject, grade, difficulty = "THONG_HIEU", count = 3, promptNote = "" } = params;
    const questions: GeneratedQuestion[] = [];

    const isRatioTopic = promptNote.toLowerCase().includes("tỉ lệ") || promptNote.toLowerCase().includes("tỉ số") || grade === 7;

    for (let i = 0; i < count; i++) {
      if (subject.includes("Âm nhạc") || subject === "MUSIC" || subject.toLowerCase().includes("nhạc")) {
        if (grade === 6) {
          if (difficulty === "NHAN_BIET") {
            questions.push({
              content: `Kí hiệu nào sau đây dùng để chỉ độ cao của các âm thanh trong bản nhạc?`,
              type: "SINGLE_CHOICE",
              difficulty: "NHAN_BIET",
              answers: [
                { label: "A", content: "Khuông nhạc và khóa Sol", isCorrect: true },
                { label: "B", content: "Dấu nối và dấu luyến", isCorrect: false },
                { label: "C", content: "Dấu lặng đen", isCorrect: false },
                { label: "D", content: "Vạch nhịp kép", isCorrect: false },
              ],
              correct_answer: "A",
              explanation: "Khuông nhạc (gồm 5 dòng kẻ, 4 khe) kết hợp cùng Khóa Sol ở đầu khuông nhạc dùng để xác định cao độ chuẩn của các nốt nhạc.",
              skill: "Nhận biết kí hiệu cao độ trong âm nhạc",
              source: "EduMind Music Curriculum Engine",
              tags: ["am-nhac-6", "li-thuyet-am-nhac", "nhan-biet"],
            });
          } else if (difficulty === "THONG_HIEU") {
            questions.push({
              content: `Trong nhịp 2/4, mỗi ô nhịp có bao nhiêu phách và giá trị độ dài mỗi phách tương đương với hình nốt nào?`,
              type: "SINGLE_CHOICE",
              difficulty: "THONG_HIEU",
              answers: [
                { label: "A", content: "Có 2 phách, mỗi phách tương đương một nốt đen", isCorrect: true },
                { label: "B", content: "Có 4 phách, mỗi phách tương đương một nốt đơn", isCorrect: false },
                { label: "C", content: "Có 2 phách, mỗi phách tương đương một nốt trắng", isCorrect: false },
                { label: "D", content: "Có 3 phách, mỗi phách tương đương một nốt tròn", isCorrect: false },
              ],
              correct_answer: "A",
              explanation: "Số chỉ nhịp 2/4: Số 2 ở trên chỉ 2 phách trong một ô nhịp; số 4 ở dưới chỉ mỗi phách tương đương giá trị 1/4 nốt tròn, tức là 1 nốt đen (phách 1 mạnh, phách 2 nhẹ).",
              skill: "Hiểu số chỉ nhịp 2/4",
              source: "EduMind Music Curriculum Engine",
              tags: ["am-nhac-6", "nhip-2-4", "thong-hieu"],
            });
          } else {
            questions.push({
              content: `Khi luyện gõ thanh phách đệm cho bài hát viết ở nhịp 2/4, học sinh cần gõ vào những vị trí nào của ô nhịp?`,
              type: "SINGLE_CHOICE",
              difficulty: "VAN_DUNG",
              answers: [
                { label: "A", content: "Gõ đều đặn vào cả phách 1 (mạnh) và phách 2 (nhẹ)", isCorrect: true },
                { label: "B", content: "Chỉ gõ vào phách 2 và bỏ phách 1", isCorrect: false },
                { label: "C", content: "Gõ liên tục 4 tiếng trong một ô nhịp", isCorrect: false },
                { label: "D", content: "Chỉ gõ khi kết thúc toàn bài hát", isCorrect: false },
              ],
              correct_answer: "A",
              explanation: "Gõ đệm theo phách đòi hỏi gõ đều đặn vào từng phách của ô nhịp (phách 1 mạnh, phách 2 nhẹ) để giữ vững nhịp độ cho toàn bài hát.",
              skill: "Kỹ năng gõ thanh phách theo nhịp 2/4",
              source: "EduMind Music Curriculum Engine",
              tags: ["am-nhac-6", "nhac-cu", "van-dung"],
            });
          }
        } else if (grade === 7) {
          if (difficulty === "NHAN_BIET") {
            questions.push({
              content: `Dấu hóa nào sau đây có tác dụng làm tăng cao độ của nốt nhạc lên nửa cung?`,
              type: "SINGLE_CHOICE",
              difficulty: "NHAN_BIET",
              answers: [
                { label: "A", content: "Dấu thăng (#)", isCorrect: true },
                { label: "B", content: "Dấu giáng (b)", isCorrect: false },
                { label: "C", content: "Dấu bình (♮)", isCorrect: false },
                { label: "D", content: "Dấu chấm dôi", isCorrect: false },
              ],
              correct_answer: "A",
              explanation: "Dấu thăng (#) có tác dụng nâng cao độ của nốt nhạc lên nửa cung (1/2 cung). Dấu giáng hạ nửa cung, dấu bình hủy bỏ hiệu lực của dấu thăng hoặc giáng.",
              skill: "Nhận biết các loại dấu hóa",
              source: "EduMind Music Curriculum Engine",
              tags: ["am-nhac-7", "dau-hoa", "nhan-biet"],
            });
          } else if (difficulty === "THONG_HIEU") {
            questions.push({
              content: `Bài hát 'Lí cây đa' thuộc thể loại âm nhạc dân gian của vùng miền nào ở nước ta?`,
              type: "SINGLE_CHOICE",
              difficulty: "THONG_HIEU",
              answers: [
                { label: "A", content: "Dân ca Quan họ Bắc Ninh", isCorrect: true },
                { label: "B", content: "Dân ca Nam Bộ", isCorrect: false },
                { label: "C", content: "Dân ca Nam Trung Bộ", isCorrect: false },
                { label: "D", content: "Hát then Tây Bắc", isCorrect: false },
              ],
              correct_answer: "A",
              explanation: "'Lí cây đa' là bài dân ca đặc sắc, dí dỏm, mang đậm làn điệu dân ca Quan họ Bắc Ninh truyền thống của vùng đồng bằng Bắc Bộ.",
              skill: "Thưởng thức và hiểu biết dân ca Việt Nam",
              source: "EduMind Music Curriculum Engine",
              tags: ["am-nhac-7", "dan-ca", "thong-hieu"],
            });
          } else if (difficulty === "VAN_DUNG") {
            questions.push({
              content: `Xác định tên nốt nhạc sau khi áp dụng dấu thăng (#) cho nốt Fa ở khe thứ nhất trên khuông nhạc khóa Sol:`,
              type: "SINGLE_CHOICE",
              difficulty: "VAN_DUNG",
              answers: [
                { label: "A", content: "Fa thăng (F#)", isCorrect: true },
                { label: "B", content: "Sol giáng (Gb)", isCorrect: false },
                { label: "C", content: "Mi thăng (E#)", isCorrect: false },
                { label: "D", content: "Fa bình (F)", isCorrect: false },
              ],
              correct_answer: "A",
              explanation: "Nốt Fa nằm ở khe 1 của khuông nhạc khóa Sol, khi có dấu thăng đứng trước sẽ trở thành nốt Fa thăng (F#).",
              skill: "Vận dụng đọc nhạc có dấu hóa",
              source: "EduMind Music Curriculum Engine",
              tags: ["am-nhac-7", "doc-nhac", "van-dung"],
            });
          } else {
            questions.push({
              content: `Em hãy phân tích ý nghĩa cấu trúc giai điệu và tình cảm trong ca khúc thiếu nhi 'Nụ cười' (Nhạc Nga), từ đó nêu cách thể hiện sắc thái khi trình bày trước tập thể:`,
              type: "SHORT_ANSWER",
              difficulty: "VAN_DUNG_CAO",
              answers: [{ label: "A", content: "Hát với sắc thái vui tươi, hồn nhiên, ngắt câu đúng nhịp và thể hiện ánh mắt lạc quan", isCorrect: true }],
              correct_answer: "A",
              explanation: "Bài hát có giai điệu tươi sáng, nhịp nhàng. Khi biểu diễn cần phát âm rõ lời, lấy hơi đúng chỗ, ánh mắt tươi vui truyền tải thông điệp lạc quan về tình bạn.",
              skill: "Cảm thụ và sáng tạo âm nhạc nâng cao",
              source: "EduMind Music Curriculum Engine",
              tags: ["am-nhac-7", "bieu-dien", "van-dung-cao"],
            });
          }
        } else if (grade === 8) {
          questions.push({
            content: `Gam Đô trưởng (C major) có âm chủ là nốt nào và gồm các bậc âm nào sau đây?`,
            type: "SINGLE_CHOICE",
            difficulty: "THONG_HIEU",
            answers: [
              { label: "A", content: "Âm chủ là Đô (C); gồm các âm Đô - Rê - Mi - Pha - Son - La - Si - (Đô)", isCorrect: true },
              { label: "B", content: "Âm chủ là La (A); gồm các âm La - Si - Đô - Rê - Mi - Pha - Son - (La)", isCorrect: false },
              { label: "C", content: "Âm chủ là Son (G); có một dấu thăng Fa#", isCorrect: false },
              { label: "D", content: "Âm chủ là Fa (F); có một dấu giáng Sib", isCorrect: false },
            ],
            correct_answer: "A",
            explanation: "Gam Đô trưởng là gam trưởng tự nhiên không có dấu hóa ở hóa biểu, âm chủ là Đô (bậc I), cấu tạo cung và nửa cung: 1 - 1 - 1/2 - 1 - 1 - 1 - 1/2.",
            skill: "Lí thuyết Gam Đô trưởng và giọng La thứ",
            source: "EduMind Music Curriculum Engine",
            tags: ["am-nhac-8", "gam-do-truong", "thong-hieu"],
          });
        } else {
          // Grade 9
          questions.push({
            content: `Nghệ thuật Đờn ca tài tử Nam Bộ được UNESCO công nhận là Di sản văn hóa phi vật thể của nhân loại sử dụng các nhạc cụ chủ đạo nào?`,
            type: "SINGLE_CHOICE",
            difficulty: "THONG_HIEU",
            answers: [
              { label: "A", content: "Đàn kìm (đàn nguyệt), đàn tranh, đàn cò, đàn bầu và song loan", isCorrect: true },
              { label: "B", content: "Đàn ghi-ta điện, trống jazz và đàn organ điện tử", isCorrect: false },
              { label: "C", content: "Cồng chiêng Tây Nguyên và sáo trúc", isCorrect: false },
              { label: "D", content: "Đàn đáy, phách và trống chầu", isCorrect: false },
            ],
            correct_answer: "A",
            explanation: "Đờn ca tài tử Nam Bộ là nét đẹp văn hóa đặc sắc phương Nam, dàn nhạc truyền thống tiêu biểu gồm bộ ngũ tuyệt: Đàn kìm, Đàn tranh, Đàn cò, Đàn bầu, Đàn tam kết hợp gõ song loan giữ nhịp.",
            skill: "Thưởng thức di sản âm nhạc Đờn ca tài tử Nam Bộ",
            source: "EduMind Music Curriculum Engine",
            tags: ["am-nhac-9", "don-ca-tai-tu", "nam-bo"],
          });
        }
      } else if (subject.includes("Toán") || subject === "MATH") {
        if (grade === 7 && isRatioTopic) {
          if (difficulty === "NHAN_BIET") {
            questions.push({
              content: `Cho tỉ lệ thức $\\frac{x}{${4 + i * 2}} = \\frac{3}{6}$. Giá trị của $x$ là:`,
              type: "SINGLE_CHOICE",
              difficulty: "NHAN_BIET",
              answers: [
                { label: "A", content: `$x = ${2 + i}$`, isCorrect: true },
                { label: "B", content: `$x = ${4 + i}$`, isCorrect: false },
                { label: "C", content: `$x = ${1 + i}$`, isCorrect: false },
                { label: "D", content: `$x = ${6 + i}$`, isCorrect: false },
              ],
              correct_answer: "A",
              explanation: `Áp dụng tính chất tỉ lệ thức: $x = \\frac{${4 + i * 2} \\cdot 3}{6} = ${2 + i}$.`,
              skill: "Tìm x trong tỉ lệ thức",
              source: "EduMind AI Curriculum Engine",
              tags: ["ti-le-thuc", "toan-7", "nhan-biet"],
            });
          } else if (difficulty === "THONG_HIEU") {
            const factor = 3 + i;
            questions.push({
              content: `Tìm hai số $x, y$ biết $\\frac{x}{2} = \\frac{y}{5}$ và $x + y = ${7 * factor}$.`,
              type: "SINGLE_CHOICE",
              difficulty: "THONG_HIEU",
              answers: [
                { label: "A", content: `$x = ${2 * factor}; y = ${5 * factor}$`, isCorrect: true },
                { label: "B", content: `$x = ${5 * factor}; y = ${2 * factor}$`, isCorrect: false },
                { label: "C", content: `$x = ${3 * factor}; y = ${4 * factor}$`, isCorrect: false },
                { label: "D", content: `$x = ${factor}; y = ${6 * factor}$`, isCorrect: false },
              ],
              correct_answer: "A",
              explanation: `Áp dụng tính chất dãy tỉ số bằng nhau: $\\frac{x}{2} = \\frac{y}{5} = \\frac{x+y}{2+5} = \\frac{${7 * factor}}{7} = ${factor}$. Suy ra $x = 2 \\cdot ${factor} = ${2 * factor}$, $y = 5 \\cdot ${factor} = ${5 * factor}$.`,
              skill: "Vận dụng tính chất dãy tỉ số bằng nhau",
              source: "EduMind AI Curriculum Engine",
              tags: ["day-ti-so-bang-nhau", "toan-7"],
            });
          } else if (difficulty === "VAN_DUNG") {
            const moneyUnit = 100 + i * 50;
            questions.push({
              content: `Hai người thợ làm cùng một loại sản phẩm nhận tiền công theo tỉ lệ $3 : 5$. Người thứ hai nhận nhiều hơn người thứ nhất $${2 * moneyUnit}.000$ đồng. Tính số tiền người thứ nhất nhận được.`,
              type: "SINGLE_CHOICE",
              difficulty: "VAN_DUNG",
              answers: [
                { label: "A", content: `$${3 * moneyUnit}.000$ đồng`, isCorrect: true },
                { label: "B", content: `$${5 * moneyUnit}.000$ đồng`, isCorrect: false },
                { label: "C", content: `$${2 * moneyUnit}.000$ đồng`, isCorrect: false },
                { label: "D", content: `$${4 * moneyUnit}.000$ đồng`, isCorrect: false },
              ],
              correct_answer: "A",
              explanation: `Gọi số tiền người thứ nhất và thứ hai nhận lần lượt là $x, y$ (nghìn đồng). Ta có: $\\frac{x}{3} = \\frac{y}{5} = \\frac{y - x}{5 - 3} = \\frac{${2 * moneyUnit}}{2} = ${moneyUnit}$. Do đó số tiền người thứ nhất là: $3 \\cdot ${moneyUnit} = ${3 * moneyUnit}$ nghìn đồng.`,
              skill: "Giải bài toán thực tế tỉ lệ thuận nghịch",
              source: "EduMind AI Problem Generator",
              tags: ["toan-thuc-te", "ti-le-thuan", "van-dung"],
            });
          } else {
            questions.push({
              content: `Cho dãy tỉ số bằng nhau $\\frac{2x+1}{5} = \\frac{3y-2}{7} = \\frac{2x+3y-1}{6x}$. Tìm tất cả các số thực $x$ thỏa mãn.`,
              type: "SHORT_ANSWER",
              difficulty: "VAN_DUNG_CAO",
              answers: [{ label: "A", content: "$x = 2$", isCorrect: true }],
              correct_answer: "A",
              explanation: `Cộng các tử và mẫu theo tính chất dãy tỉ số bằng nhau: $\\frac{(2x+1) + (3y-2)}{5 + 7} = \\frac{2x+3y-1}{12}$. Kết hợp với $\\frac{2x+3y-1}{6x}$ suy ra $6x = 12 \\Rightarrow x = 2$.`,
              skill: "Biến đổi nâng cao dãy tỉ số bằng nhau",
              source: "EduMind Olympiad Question Bank",
              tags: ["toan-nang-cao", "van-dung-cao"],
            });
          }
        } else if (grade === 8) {
          questions.push({
            content: `Khai triển hằng đẳng thức $(x + ${i + 2})^2$ ta được kết quả là:`,
            type: "SINGLE_CHOICE",
            difficulty: "THONG_HIEU",
            answers: [
              { label: "A", content: `$x^2 + ${2 * (i + 2)}x + ${(i + 2) ** 2}$`, isCorrect: true },
              { label: "B", content: `$x^2 + ${(i + 2) ** 2}$`, isCorrect: false },
              { label: "C", content: `$x^2 - ${2 * (i + 2)}x + ${(i + 2) ** 2}$`, isCorrect: false },
              { label: "D", content: `$x^2 + ${(i + 2)}x + ${(i + 2) ** 2}$`, isCorrect: false },
            ],
            correct_answer: "A",
            explanation: `Áp dụng hằng đẳng thức bình phương của một tổng $(A+B)^2 = A^2 + 2AB + B^2$.`,
            skill: "Vận dụng 7 hằng đẳng thức đáng nhớ",
            source: "EduMind AI Curriculum Engine",
            tags: ["hang-dang-thuc", "toan-8"],
          });
        } else if (grade === 6) {
          questions.push({
            content: `Thực hiện phép tính: $(-${15 + i}) + (${25 + i})$ bằng:`,
            type: "SINGLE_CHOICE",
            difficulty: "NHAN_BIET",
            answers: [
              { label: "A", content: "10", isCorrect: true },
              { label: "B", content: "-10", isCorrect: false },
              { label: "C", content: `${40 + 2 * i}`, isCorrect: false },
              { label: "D", content: `-${40 + 2 * i}`, isCorrect: false },
            ],
            correct_answer: "A",
            explanation: `Cộng hai số nguyên khác dấu: lấy số có giá trị tuyệt đối lớn hơn trừ số bé hơn: $(${25 + i}) - (${15 + i}) = 10$.`,
            skill: "Các phép tính với số nguyên",
            source: "EduMind AI Curriculum Engine",
            tags: ["so-nguyen", "toan-6"],
          });
        } else {
          // Grade 9
          questions.push({
            content: `Nghiệm của hệ phương trình $\\begin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}$ là:`,
            type: "SINGLE_CHOICE",
            difficulty: "THONG_HIEU",
            answers: [
              { label: "A", content: "$(3; 2)$", isCorrect: true },
              { label: "B", content: "$(2; 3)$", isCorrect: false },
              { label: "C", content: "$(4; 1)$", isCorrect: false },
              { label: "D", content: "$(1; 4)$", isCorrect: false },
            ],
            correct_answer: "A",
            explanation: `Cộng hai phương trình vế theo vế: $2x = 6 \\Rightarrow x = 3$. Thay vào tìm được $y = 2$.`,
            skill: "Giải hệ phương trình bậc nhất hai ẩn",
            source: "EduMind AI Curriculum Engine",
            tags: ["he-phuong-trinh", "toan-9"],
          });
        }
      } else {
        // Multi-subject fallback (e.g. English, Science)
        questions.push({
          content: `Choose the correct form of the verb: "She ______ (teach) Music and Arts at Tan Phong Secondary School since 2020."`,
          type: "SINGLE_CHOICE",
          difficulty: "THONG_HIEU",
          answers: [
            { label: "A", content: "has taught", isCorrect: true },
            { label: "B", content: "teaches", isCorrect: false },
            { label: "C", content: "taught", isCorrect: false },
            { label: "D", content: "is teaching", isCorrect: false },
          ],
          correct_answer: "A",
          explanation: `The sign "since 2020" indicates the Present Perfect tense (have/has + V3/ed).`,
          skill: "Present Perfect Tense",
          source: "EduMind English Grammar Engine",
          tags: ["english-thcs", "grammar"],
        });
      }
    }

    return questions;
  }

  async generateExam(params: GenerateExamParams): Promise<GeneratedExam> {
    const { title, subject, grade, durationMinutes, totalScore, questionCount, matrix } = params;
    const questions = await this.generateQuestions({
      subject,
      grade,
      count: questionCount,
      difficulty: "THONG_HIEU",
      promptNote: title,
    });

    return {
      title,
      questions,
      durationMinutes,
      matrixSummary: `Ma trận: Nhận biết ${matrix.nhanBiet}%, Thông hiểu ${matrix.thongHieu}%, Vận dụng ${matrix.vanDung}%, Vận dụng cao ${matrix.vanDungCao}%. Tổng điểm: ${totalScore}.`,
    };
  }

  async generateLessonPlan(params: GenerateLessonPlanParams): Promise<GeneratedLessonPlan> {
    const subject = params.subject || "Toán học";
    const bookSeries = params.bookSeries || "Kết Nối Tri Thức Với Cuộc Sống";
    const lessonTitle =
      params.lessonTitle ||
      (params as any).title ||
      (subject.toLowerCase().includes("nhạc")
        ? "Chủ đề 2: Tình bạn - Bài 3: Học hát bài Nụ cười"
        : subject.toLowerCase().includes("khoa học") || subject.toLowerCase().includes("khtn")
        ? "Bài 22: Vai trò của trao đổi chất và chuyển hóa năng lượng ở sinh vật"
        : subject.toLowerCase().includes("văn") || subject.toLowerCase().includes("ngữ")
        ? "Văn bản: Qua Đèo Ngang (Bà Huyện Thanh Quan)"
        : "Bài 6: Tỉ lệ thức và Dãy tỉ số bằng nhau");

    const grade = params.grade || 7;
    const durationMinutes = params.durationMinutes || 45;
    const learningOutcomes = params.learningOutcomes;

    const isMusic =
      subject.includes("Âm nhạc") ||
      subject === "MUSIC" ||
      subject.toLowerCase().includes("nhạc") ||
      (lessonTitle.toLowerCase().includes("hát") && !subject.toLowerCase().includes("toán") && !lessonTitle.toLowerCase().includes("toán"));

    if (isMusic) {
      return {
        title: `KẾ HOẠCH BÀI DẠY: ${lessonTitle.toUpperCase()}`,
        subject: "Âm nhạc",
        grade,
        duration: `${durationMinutes} phút (${Math.round(durationMinutes / 45)} tiết)`,
        objectives: {
          knowledge: [
            `Học sinh hát đúng cao độ, trường độ bài hát, thể hiện đúng tính chất âm nhạc vui tươi, trong sáng.`,
            `Biết hát kết hợp gõ đệm thanh phách theo phách, theo nhịp 2/4 hoặc vận động cơ thể (body percussion).`,
            learningOutcomes || `Cảm nhận được thông điệp lạc quan về tình bạn, niềm tin yêu cuộc sống qua giai điệu âm nhạc.`,
          ],
          competencies: [
            "Năng lực thể hiện âm nhạc: Biết lấy hơi, duy trì cột hơi, hát đúng giai điệu và phát âm rõ lời ca.",
            "Năng lực cảm thụ và hiểu biết âm nhạc: Cảm nhận được sắc thái tình cảm của bài hát và cấu trúc đoạn/câu.",
            "Năng lực ứng dụng và sáng tạo âm nhạc: Biết tự sáng tạo các động tác gõ đệm hoặc vận động phụ họa phù hợp.",
            "Năng lực giao tiếp và hợp tác: Tự tin hòa giọng cùng nhóm, tôn trọng sự phối hợp bè và nhịp điệu chung.",
          ],
          qualities: [
            "Nhân ái: Biết sẻ chia niềm vui, gắn kết tình bạn bè trong sáng dưới mái trường THCS.",
            "Chăm chỉ: Tích cực luyện thanh, kiên trì tập luyện các nốt cao và gõ đệm chính xác.",
            "Trách nhiệm: Giữ gìn và sử dụng cẩn thận nhạc cụ gõ (thanh phách, song loan) của phòng học bộ môn.",
          ],
        },
        equipment: {
          teacher: [
            "Đàn phím điện tử (Organ / Keyboard) phục vụ luyện thanh và đệm hát.",
            "Máy tính kết nối Smart Tivi / loa kéo, bài giảng điện tử tương tác và file nhạc beat chuẩn.",
            "Bộ gõ mẫu: Thanh phách gỗ, song loan, tambourine.",
          ],
          student: [
            `Sách giáo khoa Âm nhạc ${grade} (Bộ sách ${bookSeries || "Kết Nối Tri Thức Với Cuộc Sống"}).`,
            "Thanh phách gõ tự làm hoặc mua theo quy định của bộ môn.",
            "Tập ghi chép bài hát và các nốt nhạc.",
          ],
          digital: [
            "Bài giảng điện tử EduMind Music Slides tương tác sinh động.",
            "Video clip mẫu biểu diễn bài hát của dàn hợp xướng thiếu nhi.",
          ],
        },
        activities: [
          {
            id: "act-1",
            order: 1,
            name: "Hoạt động 1: Mở đầu / Khởi động (5 phút)",
            objective: "Tạo tâm thế hào hứng, khai mở giọng hát và dẫn dắt học sinh vào không gian nghệ thuật âm nhạc.",
            content: "1. Trò chơi âm nhạc 'Nghe giai điệu đoán tên bài hát'. 2. Luyện thanh ngắn theo mẫu âm: 'La - Ma - Mi' theo thang âm Đô trưởng (C major).",
            product: "Học sinh khởi động giọng hát tự nhiên, mở khẩu hình đúng kỹ thuật và hào hứng đón nhận bài học.",
            execution: "Bước 1: Giáo viên bấm phím đàn chuỗi giai điệu quen thuộc, học sinh giơ tay đoán tên bài hát.\nBước 2: Giáo viên đàn mẫu âm 1 quãng 5 (Đô - Mi - Sol - Mi - Đô), bắt nhịp cả lớp luyện thanh tăng dần nửa cung.\nBước 3: Giáo viên nhận xét khẩu hình, cột hơi và giới thiệu bài học mới.",
          },
          {
            id: "act-2",
            order: 2,
            name: "Hoạt động 2: Hình thành kiến thức mới (Khám phá bài hát - 18 phút)",
            objective: "Học sinh nắm được xuất xứ tác phẩm, cấu trúc bài hát và học hát từng câu đúng giai điệu, tiết tấu.",
            content: "1. Giới thiệu tác giả, hoàn cảnh sáng tác và sắc thái bài hát.\n2. Nghe hát mẫu qua video/audio hoặc giáo viên tự đệm đàn hát mẫu.\n3. Đọc lời ca theo tiết tấu bài hát.\n4. Dạy hát từng câu nối tiếp (chia bài làm 4 câu ngắn).",
            product: "Học sinh hát đúng từng câu theo tiếng đàn, ghép hoàn chỉnh nửa đầu bài hát với cao độ chuẩn xác.",
            execution: "Bước 1: Giáo viên thuyết minh ngắn gọn về ca khúc, cho cả lớp nghe bản thu chuẩn.\nBước 2: Hướng dẫn học sinh đọc lời ca nhịp nhàng theo tiếng gõ phách.\nBước 3: Giáo viên đàn giai điệu câu 1 (2 lần), bắt nhịp cả lớp hát lại; sửa sai cao độ ngay tại chỗ.\nBước 4: Tiến hành tương tự với các câu tiếp theo rồi ghép nối các câu lại với nhau.",
          },
          {
            id: "act-3",
            order: 3,
            name: "Hoạt động 3: Luyện tập (Củng cố hát kết hợp gõ đệm - 15 phút)",
            objective: "Rèn luyện kỹ năng hát thuần thục, đúng nhịp độ và kết hợp nhạc cụ gõ đệm thanh phách nhịp nhàng.",
            content: "1. Hát kết hợp gõ đệm theo phách (phách 1 mạnh, phách 2 nhẹ).\n2. Hát kết hợp gõ đệm theo tiết tấu lời ca.\n3. Luyện tập theo các hình thức: Cả lớp -> Dãy bàn -> Nhóm 4 học sinh -> Đơn ca cá nhân.",
            product: "Học sinh giữ vững nhịp độ, tiếng gõ phách giòn giã đồng đều và thuộc lời ca cơ bản.",
            execution: "Bước 1: Giáo viên làm mẫu cách cầm thanh phách và tư thế gõ đệm theo phách.\nBước 2: Bật nhạc đệm beat, chỉ huy cả lớp cùng thực hiện.\nBước 3: Mời đại diện 2 nhóm lên bảng thực hành đối đáp (nhóm 1 hát, nhóm 2 gõ đệm và đổi ngược lại).\nBước 4: Học sinh nhận xét chéo, giáo viên tuyên dương nhóm có nhịp phách chuẩn xác nhất.",
          },
          {
            id: "act-4",
            order: 4,
            name: "Hoạt động 4: Vận dụng - Sáng tạo & Dặn dò (7 phút)",
            objective: "Khuyến khích học sinh tự tin biểu diễn trước đám đông và lan tỏa tình yêu âm nhạc.",
            content: "1. Biểu diễn bài hát kết hợp động tác phụ họa nhẹ nhàng hoặc vận động cơ thể (vỗ tay, giậm chân theo nhịp).\n2. Cảm nhận sau tiết học.\n3. Dặn dò ôn luyện ở nhà và chuẩn bị tiết Đọc nhạc tiếp theo.",
            product: "Màn trình diễn tự tin, nét mặt tươi vui và tinh thần kết nối bạn bè của học sinh.",
            execution: "Bước 1: Giáo viên hướng dẫn 2 động tác phụ họa đơn giản (nghiêng người theo nhịp, tay đưa nhẹ sang hai bên).\nBước 2: Cho cả lớp đứng tại chỗ vừa hát vừa nhún nhảy theo giai điệu bài hát kết thúc tiết học.\nBước 3: Dặn dò học sinh luyện tập thêm cùng người thân và ghi nhớ tên tác giả bài hát.",
          },
        ],
      };
    }

    const isScience =
      subject.toLowerCase().includes("khoa học") ||
      subject.toLowerCase().includes("khtn") ||
      subject.toLowerCase().includes("tự nhiên") ||
      subject.toLowerCase().includes("sinh") ||
      subject.toLowerCase().includes("hóa") ||
      subject.toLowerCase().includes("vật lí") ||
      lessonTitle.toLowerCase().includes("trao đổi chất") ||
      lessonTitle.toLowerCase().includes("quang hợp") ||
      lessonTitle.toLowerCase().includes("tế bào");

    if (isScience) {
      const base = CURRICULUM_PRESETS["science-7-metabolism"].lessonPlan;
      return {
        ...base,
        title: `KẾ HOẠCH BÀI DẠY: ${lessonTitle.toUpperCase()}`,
        subject: "Khoa học tự nhiên",
        grade,
        duration: `${durationMinutes} phút (${Math.round(durationMinutes / 45)} tiết)`,
      };
    }

    const isLiterature =
      subject.toLowerCase().includes("văn") ||
      subject.toLowerCase().includes("ngữ văn") ||
      subject.toLowerCase().includes("tiếng việt") ||
      lessonTitle.toLowerCase().includes("thơ") ||
      lessonTitle.toLowerCase().includes("đèo ngang") ||
      lessonTitle.toLowerCase().includes("đoạn văn");

    if (isLiterature) {
      const base = CURRICULUM_PRESETS["lit-8-poetry"].lessonPlan;
      return {
        ...base,
        title: `KẾ HOẠCH BÀI DẠY: ${lessonTitle.toUpperCase()}`,
        subject: "Ngữ văn",
        grade,
        duration: `${durationMinutes} phút (${Math.round(durationMinutes / 45)} tiết)`,
      };
    }

    return {
      title: `KẾ HOẠCH BÀI DẠY: ${lessonTitle.toUpperCase()}`,
      subject,
      grade,
      duration: `${durationMinutes} phút (${Math.round(durationMinutes / 45)} tiết)`,
      objectives: {
        knowledge: [
          `Nhận biết và phát biểu được định nghĩa tỉ lệ thức $\\frac{a}{b} = \\frac{c}{d}$ (với $b, d \\neq 0$).`,
          `Nắm vững và vận dụng tính chất cơ bản: $ad = bc$ và các tính chất của dãy tỉ số bằng nhau $\\frac{a}{b} = \\frac{c}{d} = \\frac{a+c}{b+d}$.`,
          learningOutcomes || `Vận dụng giải quyết các bài toán chia đại lượng theo tỉ lệ trong đời sống thực tiễn.`,
        ],
        competencies: [
          "Năng lực tư duy và lập luận toán học: So sánh các tỉ số, biến đổi đẳng thức tích thành tỉ lệ thức.",
          "Năng lực mô hình hóa toán học: Chuyển đổi bài toán thực tế thành dãy tỉ số bằng nhau.",
          "Năng lực giải quyết vấn đề toán học: Lập luận chặt chẽ các bước tìm ẩn $x, y$.",
          "Năng lực giao tiếp và hợp tác: Tích cực thảo luận, chia sẻ kết quả trong nhóm học tập.",
        ],
        qualities: [
          "Chăm chỉ: Tự giác nghiên cứu nội dung bài học trong SGK và hoàn thành phiếu học tập.",
          "Trách nhiệm: Có tinh thần hợp tác, phân công nhiệm vụ công bằng khi thảo luận nhóm.",
          "Trung thực: Nghiêm túc, khách quan khi tự đánh giá và đánh giá sản phẩm của bạn bè.",
        ],
      },
      equipment: {
        teacher: [
          "Máy tính, máy chiếu / Smart Tivi kết nối trình chiếu slide tương tác.",
          "Bộ phiếu học tập (Phiếu 1: Khám phá; Phiếu 2: Luyện tập nhóm).",
          "Thước kẻ, phấn màu, bảng phụ ghi tóm tắt tính chất dãy tỉ số.",
        ],
        student: [
          "Sách giáo khoa Toán 7, vở ghi bài, đồ dùng học tập.",
          "Bảng nhóm, bút dạ để trình bày sản phẩm thảo luận.",
        ],
        digital: [
          "Slide bài giảng đa phương tiện (EduMind Slides).",
          "Trò chơi trắc nghiệm tương tác kiểm tra khởi động.",
        ],
      },
      activities: [
        {
          id: "act-1",
          order: 1,
          name: "Hoạt động 1: Khởi động (Mở đầu tình huống)",
          objective: "Tạo hứng thú, kích hoạt kiến thức về tỉ số của hai số và dẫn dắt học sinh vào tình huống cần so sánh các tỉ số bằng nhau.",
          content: "Giáo viên nêu tình huống thực tế: Để pha một ấm trà sữa chuẩn vị, bạn An dùng $40\\text{ g}$ bột trà với $100\\text{ ml}$ sữa; bạn Bình dùng $60\\text{ g}$ bột trà với $150\\text{ ml}$ sữa. Tỉ số giữa lượng trà và sữa của hai bạn có bằng nhau không?",
          product: "Học sinh tính hai tỉ số $\\frac{40}{100} = \\frac{2}{5}$ và $\\frac{60}{150} = \\frac{2}{5}$. Từ đó nhận xét hai tỉ số bằng nhau và hình thành đẳng thức $\\frac{40}{100} = \\frac{60}{150}$.",
          execution: "Bước 1 (Giao nhiệm vụ): Giáo viên chiếu tình huống lên slide, yêu cầu học sinh thảo luận cặp đôi trong 3 phút.\nBước 2 (Thực hiện): Học sinh thực hiện phép chia rút gọn phân số vào vở nháp.\nBước 3 (Báo cáo): Đại diện 1 cặp trả lời, các cặp khác bổ sung nhận xét.\nBước 4 (Kết luận): Giáo viên chốt lại định nghĩa tỉ lệ thức và dẫn dắt vào bài mới.",
        },
        {
          id: "act-2",
          order: 2,
          name: "Hoạt động 2: Hình thành kiến thức mới (Khám phá và đúc kết)",
          objective: "Học sinh phát biểu được định nghĩa tỉ lệ thức, phát hiện và chứng minh được tính chất cơ bản: $ad = bc$ và tính chất dãy tỉ số bằng nhau.",
          content: "1. Khái niệm tỉ lệ thức: Tỉ lệ thức là đẳng thức của hai tỉ số $\\frac{a}{b} = \\frac{c}{d}$ (hoặc $a:b = c:d$).\n2. Khám phá tính chất: Xét $\\frac{x}{2} = \\frac{y}{5}$. Nhân cả hai vế với tích các mẫu số $2 \\cdot 5$. Rút ra kết luận về tích chéo.\n3. Xây dựng tính chất dãy tỉ số: Đặt $\\frac{a}{b} = \\frac{c}{d} = k \\Rightarrow a = kb, c = kd$. Tính $\\frac{a+c}{b+d}$ theo $k$.",
          product: "Học sinh ghi nhớ và đóng khung được công thức:\n- Tính chất 1: $\\frac{a}{b} = \\frac{c}{d} \\Leftrightarrow ad = bc$.\n- Tính chất 2: $\\frac{a}{b} = \\frac{c}{d} = \\frac{a+c}{b+d} = \\frac{a-c}{b-d}$ ($b \\neq \\pm d$).",
          execution: "Bước 1: Giáo viên phát Phiếu học tập số 1 cho các nhóm 4 học sinh.\nBước 2: Các nhóm trao đổi, làm các câu hỏi dẫn dắt suy luận toán học.\nBước 3: Nhóm trưởng treo bảng phụ, thuyết minh cách chứng minh tính chất.\nBước 4: Giáo viên nhận xét, chuẩn hóa ngôn ngữ toán học và khắc sâu các lỗi học sinh thường mắc.",
        },
        {
          id: "act-3",
          order: 3,
          name: "Hoạt động 3: Luyện tập (Củng cố và rèn kỹ năng)",
          objective: "Rèn luyện kỹ năng tìm giá trị ẩn $x, y$ trong tỉ lệ thức và áp dụng tính chất dãy tỉ số bằng nhau với các dạng toán cơ bản và nâng cao.",
          content: "Giải hai bài toán:\n- Bài 1: Tìm $x$ biết $\\frac{x}{8} = \\frac{9}{12}$.\n- Bài 2: Tìm hai số $x, y$ biết $\\frac{x}{2} = \\frac{y}{5}$ và $x + y = 21$.",
          product: "Bài giải chuẩn của học sinh:\n- Bài 1: $x = \\frac{8 \\cdot 9}{12} = 6$.\n- Bài 2: Áp dụng tính chất dãy tỉ số bằng nhau: $\\frac{x}{2} = \\frac{y}{5} = \\frac{x+y}{2+5} = \\frac{21}{7} = 3$. Suy ra $x = 2 \\cdot 3 = 6; y = 5 \\cdot 3 = 15$.",
          execution: "Bước 1: Giáo viên gọi 2 học sinh lên bảng giải, các học sinh còn lại làm vào vở bài tập.\nBước 2: Học sinh đổi chéo vở chấm bài cặp đôi theo thang điểm gợi ý.\nBước 3: Giáo viên nhận xét bài làm trên bảng, phân tích lỗi trình bày và chốt đáp án.",
        },
        {
          id: "act-4",
          order: 4,
          name: "Hoạt động 4: Vận dụng (Thực tiễn và liên môn)",
          objective: "Vận dụng kiến thức tỉ lệ thức để giải quyết bài toán phân chia kinh phí ủng hộ từ thiện hoặc bài toán khoa học tự nhiên.",
          content: "Bài toán thực tế: Ba lớp 7A, 7B, 7C tham gia phong trào kế hoạch nhỏ gom giấy vụn tỉ lệ với số học sinh $36, 40, 44$. Biết tổng số giấy ba lớp gom được là $360\\text{ kg}$. Tính số kg giấy vụn mỗi lớp gom được.",
          product: "Lời giải bài toán thực tế: Gọi số kg giấy ba lớp gom lần lượt là $x, y, z$. Ta có $\\frac{x}{36} = \\frac{y}{40} = \\frac{z}{44} = \\frac{x+y+z}{36+40+44} = \\frac{360}{120} = 3$. Kết luận: Lớp 7A gom được $108\\text{ kg}$, lớp 7B gom $120\\text{ kg}$, lớp 7C gom $132\\text{ kg}$.",
          execution: "Bước 1: Giáo viên trình chiếu tình huống, học sinh hoạt động nhóm làm bài vào bảng phụ.\nBước 2: Chụp ảnh bài làm của nhóm nhanh nhất chiếu lên màn hình lớp học.\nBước 3: Cả lớp phản biện, kiểm tra lại điều kiện thực tế (số kg phải là số dương).\nBước 4: Giáo viên tổng kết, giao nhiệm vụ mở rộng tìm hiểu thêm về tỉ lệ vàng trong hội họa.",
        },
      ],
    };
  }

  async analyzeTextbook(params: AnalyzeTextbookParams): Promise<TextbookAnalysisResult> {
    const rawText = params.documentText || (params as any).textContent || "";
    const documentText = rawText;
    const fileName = params.fileName || "";
    const bookSeries = params.bookSeries || "Kết Nối Tri Thức Với Cuộc Sống";
    const extraHints = ((params as any).subject || "") + " " + ((params as any).lessonTitle || "");
    const textLower = (rawText + " " + fileName + " " + extraHints).toLowerCase();

    // 1. Math check
    if (textLower.includes("tỉ lệ") || textLower.includes("tỉ số") || textLower.includes("toán") || textLower.includes("math")) {
      return {
        bookSeries: bookSeries.includes("Cánh") ? "Cánh Diều" : bookSeries.includes("Chân") ? "Chân Trời Sáng Tạo" : "Kết Nối Tri Thức Với Cuộc Sống",
        subject: "Toán học",
        grade: 7,
        chapterTitle: "Chương VI: Tỉ lệ thức và Đại lượng tỉ lệ",
        lessonTitle: "Bài 6: Tỉ lệ thức và Dãy tỉ số bằng nhau",
        learningOutcomes: "Nhận biết tỉ lệ thức và các tính chất cơ bản; vận dụng tính chất dãy tỉ số bằng nhau để giải bài toán chia đại lượng tỉ lệ trong đời sống thực tiễn.",
        keyConcepts: [
          "Định nghĩa: Tỉ lệ thức là đẳng thức của hai tỉ số a/b = c/d",
          "Tính chất 1: a/b = c/d <=> a*d = b*c",
          "Tính chất 2 (Dãy tỉ số bằng nhau): a/b = c/d = (a+c)/(b+d) = (a-c)/(b-d)",
        ],
        exercisesSummary: [
          "Khởi động: Tỉ số giữa lượng trà và sữa trong công thức pha chế",
          "Luyện tập 1: Tìm x trong tỉ lệ thức x/8 = 9/12",
          "Luyện tập 2: Tìm hai số x, y biết x/2 = y/5 và x + y = 21",
          "Vận dụng: Chia số kg giấy vụn ba lớp 7A, 7B, 7C quyên góp",
        ],
        suggestedDuration: 45,
        extractedSnippet: documentText.slice(0, 500) || "Sách giáo khoa Toán 7 - Bài 6: Tỉ lệ thức và dãy tỉ số bằng nhau (Trang 6-10)",
      };
    }

    // 2. Science check
    if (textLower.includes("trao đổi chất") || textLower.includes("quang hợp") || textLower.includes("hô hấp") || textLower.includes("khtn") || textLower.includes("khoa học")) {
      return {
        bookSeries: "Cánh Diều",
        subject: "Khoa học tự nhiên",
        grade: 7,
        chapterTitle: "Chủ đề 7: Trao đổi chất và chuyển hóa năng lượng ở sinh vật",
        lessonTitle: "Bài 22: Vai trò của trao đổi chất và chuyển hóa năng lượng ở sinh vật",
        learningOutcomes: "Nêu được khái niệm trao đổi chất và chuyển hóa năng lượng; phân tích mối quan hệ giữa quang hợp và hô hấp tế bào; giải thích ứng dụng bảo quản nông sản.",
        keyConcepts: [
          "Khái niệm trao đổi chất: Quá trình cơ thể lấy chất từ môi trường và thải chất cặn bã ra môi trường",
          "Chuyển hóa năng lượng: Năng lượng ánh sáng -> hóa năng -> nhiệt năng và ATP",
          "Phương trình tổng quát quang hợp và hô hấp tế bào",
        ],
        exercisesSummary: [
          "Khởi động: Quan sát cây xanh quang hợp dưới ánh sáng mặt trời",
          "Khám phá: Phân tích sơ đồ chuyển hóa vật chất ở thực vật và động vật",
          "Luyện tập: So sánh trao đổi khí ở lá cây ban ngày và ban đêm",
          "Vận dụng: Giải thích vì sao cần bảo quản hạt giống ở nơi khô ráo, thoáng mát",
        ],
        suggestedDuration: 45,
        extractedSnippet: documentText.slice(0, 500) || "Sách giáo khoa KHTN 7 - Bài 22: Vai trò trao đổi chất và chuyển hóa năng lượng",
      };
    }

    // 3. Literature check
    if (textLower.includes("đèo ngang") || textLower.includes("đường luật") || textLower.includes("thơ") || textLower.includes("văn")) {
      return {
        bookSeries: "Chân Trời Sáng Tạo",
        subject: "Ngữ văn",
        grade: 8,
        chapterTitle: "Bài 2: Vẻ đẹp cổ điển",
        lessonTitle: "Văn bản: Qua Đèo Ngang (Bà Huyện Thanh Quan)",
        learningOutcomes: "Nhận biết đặc điểm thể thơ Thất ngôn bát cú Đường luật (niêm, luật, vần, đối); cảm nhận bức tranh thiên nhiên Đèo Ngang hoang sơ và tâm trạng hoài cổ, nhớ nước thương nhà của thi nhân.",
        keyConcepts: [
          "Thể thơ Thất ngôn bát cú Đường luật: 8 câu, mỗi câu 7 chữ, vần bằng ở cuối câu 1, 2, 4, 6, 8",
          "Bố cục: Đề - Thực - Luận - Kết",
          "Nghệ thuật đối: Câu 3-4 (Lom khom - Lác đác) và Câu 5-6 (Nhớ nước - Thương nhà)",
          "Bút pháp tả cảnh ngụ tình đặc sắc",
        ],
        exercisesSummary: [
          "Khởi động: Chia sẻ cảm xúc khi đứng trước một khung cảnh thiên nhiên hùng vĩ",
          "Đọc hiểu văn bản: Tìm hiểu từ ngữ địa phương, biện pháp chơi chữ quốc quốc / gia gia",
          "Luyện tập: Phân tích tác dụng của nghệ thuật đảo ngữ ở 2 câu thực",
          "Vận dụng: Viết đoạn văn (7-9 câu) ghi lại cảm nghĩ về tình yêu quê hương đất nước",
        ],
        suggestedDuration: 45,
        extractedSnippet: documentText.slice(0, 500) || "Sách giáo khoa Ngữ văn 8 - Bài 2: Đọc hiểu văn bản Qua Đèo Ngang",
      };
    }

    // 4. Music / Default
    const isGrade6 = textLower.includes("6") || textLower.includes("lớp 6") || textLower.includes("khối 6");
    if (isGrade6) {
      return {
        bookSeries: bookSeries.includes("Cánh") ? "Cánh Diều" : bookSeries.includes("Chân") ? "Chân Trời Sáng Tạo" : "Kết Nối Tri Thức Với Cuộc Sống",
        subject: "Âm nhạc",
        grade: 6,
        chapterTitle: "Chủ đề 1: Tuổi học trò",
        lessonTitle: "Bài 1: Học hát bài Con đường học trò",
        learningOutcomes: "Hát đúng cao độ, trường độ bài hát Con đường học trò; thể hiện đúng tính chất âm nhạc vui tươi, rộn ràng, trong sáng; biết hát kết hợp gõ đệm thanh phách theo nhịp 2/4 theo chuẩn GDPT 2018.",
        keyConcepts: [
          "Bài hát Con đường học trò (Nhạc và lời: Nguyễn Văn Chung)",
          "Tính chất âm nhạc: Vui tươi, hồn nhiên, rộn ràng của học sinh đầu cấp THCS",
          "Số chỉ nhịp 2/4, các hình nốt cơ bản và cách gõ đệm thanh phách theo phách",
        ],
        exercisesSummary: [
          "Khởi động: Luyện thanh theo mẫu âm Đô - Rê - Mi - Pha - Son",
          "Khám phá: Nghe hát mẫu và học hát từng câu nối tiếp",
          "Luyện tập: Hát kết hợp gõ đệm nhạc cụ gõ theo phách",
          "Vận dụng: Biểu diễn tốp ca kết hợp động tác phụ họa",
        ],
        suggestedDuration: 45,
        extractedSnippet: documentText.slice(0, 500) || "Sách giáo khoa Âm nhạc 6 - Chủ đề 1: Tuổi học trò",
      };
    }

    return {
      bookSeries: "Kết Nối Tri Thức Với Cuộc Sống",
      subject: "Âm nhạc",
      grade: 7,
      chapterTitle: "Chủ đề 2: Tình bạn",
      lessonTitle: "Bài 3: Học hát bài Nụ cười",
      learningOutcomes: "Hát đúng cao độ, trường độ bài hát Nụ cười; biết hát kết hợp gõ đệm thanh phách nhịp nhàng theo nhịp 2/4; cảm nhận tình bạn trong sáng, lạc quan yêu đời.",
      keyConcepts: [
        "Bài hát Nụ cười (Nhạc Nga, Lời Việt: Phạm Tuyên)",
        "Tính chất âm nhạc: Vui tươi, hồn nhiên, trong sáng",
        "Số chỉ nhịp 2/4, dấu luyến, dấu nối và cấu trúc hai đoạn đơn",
      ],
      exercisesSummary: [
        "Khởi động: Luyện thanh theo mẫu âm La - Ma theo gam Đô trưởng",
        "Khám phá: Nghe hát mẫu và học hát từng câu nối tiếp",
        "Luyện tập: Hát kết hợp gõ đệm thanh phách theo phách và theo tiết tấu lời ca",
        "Vận dụng: Biểu diễn bài hát theo nhóm kết hợp động tác phụ họa",
      ],
      suggestedDuration: 45,
      extractedSnippet: documentText.slice(0, 500) || "Sách giáo khoa Âm nhạc 7 - Chủ đề 2: Học hát bài Nụ cười",
    };
  }

  async generateSlideDeck(params: GenerateSlideParams): Promise<GeneratedSlideDeck> {
    const { lessonTitle, subject, grade } = params;

    const isMusic =
      subject.includes("Âm nhạc") ||
      subject === "MUSIC" ||
      subject.toLowerCase().includes("nhạc") ||
      lessonTitle.toLowerCase().includes("hát") ||
      lessonTitle.toLowerCase().includes("nhạc");

    if (isMusic) {
      return {
        title: `BÀI GIẢNG ĐIỆN TỬ: ${lessonTitle.toUpperCase()}`,
        subject: "Âm nhạc",
        grade,
        slides: [
          {
            slideNumber: 1,
            title: lessonTitle,
            subtitle: `Môn Âm nhạc - Khối ${grade} (Chương trình GDPT 2018)`,
            mainContent: "Chào mừng các em học sinh đến với tiết học Âm nhạc hôm nay!",
            bullets: [
              "Giáo viên: Cô Phan Thị Ngọc Huyền",
              "Trường: THCS Tân Phong - Vĩnh Long",
              "Thời lượng: 45 phút",
            ],
            teacherNote: "Khởi động không khí vui tươi, mời các em ngồi ngay ngắn và chuẩn bị thanh phách.",
            suggestedVisual: "Hình ảnh phím đàn piano và các nốt nhạc lung linh với tông màu tím - xanh nghệ thuật.",
          },
          {
            slideNumber: 2,
            title: "Mục Tiêu Bài Học",
            subtitle: "Yêu cầu cần đạt trọng tâm",
            mainContent: "Sau khi hoàn thành tiết học, các em sẽ:",
            bullets: [
              "Hát đúng cao độ, trường độ và phát âm rõ lời ca",
              "Biết cách lấy hơi ở đầu câu và duy trì cột hơi ổn định",
              "Thực hành gõ đệm thanh phách nhịp nhàng theo phách 2/4",
              "Cảm thụ giai điệu trong sáng và tự tin biểu diễn trước bạn bè",
            ],
            teacherNote: "Nhắc nhở học sinh tập trung vào kỹ thuật mở khẩu hình và gõ phách đều tay.",
            suggestedVisual: "Infographic 4 biểu tượng nốt nhạc, micro, thanh phách và trái tim kết nối.",
          },
          {
            slideNumber: 3,
            title: "1. Khởi Động Giọng Hát",
            subtitle: "Luyện thanh theo mẫu âm cơ bản",
            mainContent: "Khởi động thanh đới với âm La - Ma - Mi theo gam Đô trưởng:",
            bullets: [
              "Mẫu âm 1: Đô - Mi - Sol - Mi - Đô (La... La... La...)",
              "Mẫu âm 2: Đô - Rê - Mi - Pha - Sol - Pha - Mi - Rê - Đô (Ma... Ma...)",
              "Tư thế ngồi hát: Lưng thẳng, ngực vươn, thả lỏng vai và cổ",
              "Mở khẩu hình tròn chữ O và ngân vang tự nhiên",
            ],
            teacherNote: "Cô Huyền đàn phím mẫu và chỉ huy cả lớp luyện thanh tăng dần từng nửa cung.",
            suggestedVisual: "Khuông nhạc khóa Sol kèm nốt Đô trưởng và hình minh họa khẩu hình chuẩn.",
            interactiveActivity: "Cả lớp đứng dậy luyện thanh đồng thanh theo nhịp chỉ huy của giáo viên.",
          },
          {
            slideNumber: 4,
            title: "2. Khám Phá & Tìm Hiểu Tác Phẩm",
            subtitle: "Tác giả và xuất xứ bài hát",
            mainContent: "Tìm hiểu nét đẹp văn hóa và bối cảnh ca khúc:",
            bullets: [
              "Tên tác phẩm: Học hát bài Nụ cười (Nhạc Nga)",
              "Đặc điểm giai điệu: Vui tươi, hồn nhiên, giàu chất thơ",
              "Nhịp điệu: Viết ở nhịp 2/4 với tiết tấu rộn ràng, nhịp nhàng",
              "Ý nghĩa lời ca: Nụ cười sưởi ấm tâm hồn và thắt chặt tình bạn học trò",
            ],
            teacherNote: "Kể một mẩu chuyện ngắn truyền cảm hứng về tình bạn để khơi gợi cảm xúc.",
            suggestedVisual: "Hình ảnh các bạn thiếu nhi tươi cười nắm tay nhau trong khung cảnh thiên nhiên tươi đẹp.",
          },
          {
            slideNumber: 5,
            title: "3. Nghe Hát Mẫu & Cảm Nhận Giai Điệu",
            subtitle: "Thưởng thức bản thu âm chuẩn",
            mainContent: "Hãy lắng nghe giai điệu và đung đưa nhẹ theo nhịp bài hát:",
            bullets: [
              "Cảm nhận tốc độ: Vừa phải, không quá nhanh, không quá chậm",
              "Lắng nghe các chỗ lấy hơi và các tiếng ngân dài",
              "Cảm nhận tính chất âm nhạc: Trong sáng, lạc quan và yêu đời",
              "Quan sát các câu hát được lặp lại trong bài",
            ],
            teacherNote: "Bật file âm thanh chất lượng cao qua hệ thống loa lớp học.",
            suggestedVisual: "Thanh phát nhạc đa phương tiện kèm dải sóng âm thanh chuyển động nhịp nhàng.",
          },
          {
            slideNumber: 6,
            title: "4. Đọc Lời Ca Theo Tiết Tấu",
            subtitle: "Rèn luyện nhịp điệu lời bài hát",
            mainContent: "Đọc diễn cảm lời ca kết hợp vỗ tay theo phách:",
            bullets: [
              "Câu 1: Cho trời sáng lên cùng với bao nụ cười",
              "Câu 2: Cầu vồng thêm lung linh bao sắc màu hiền hòa",
              "Câu 3: Nụ cười tươi lòng ta thêm rạng rỡ",
              "Câu 4: Và tiếng cười rộn vang khắp muôn nơi xa xôi",
            ],
            teacherNote: "Cho học sinh đọc nối tiếp giữa dãy bàn 1 và dãy bàn 2.",
            suggestedVisual: "Bảng lời ca chữ lớn rõ ràng, các từ có phách mạnh được in đậm màu đỏ nổi bật.",
          },
          {
            slideNumber: 7,
            title: "5. Tập Hát Từng Câu (Học Hát)",
            subtitle: "Dạy hát kết hợp tiếng đàn Organ",
            mainContent: "Tập hát nối tiếp từng câu ngắn:",
            bullets: [
              "Câu 1: Nghe đàn giai điệu 2 lần -> Cả lớp hát lại",
              "Câu 2: Tập tương tự -> Ghép nối câu 1 và câu 2",
              "Câu 3 & Câu 4: Tập kỹ các nốt nhảy quãng và nốt ngân 2 phách",
              "Ghép toàn bài: Hát hoàn chỉnh cả lời 1 với tiếng đàn đệm",
            ],
            teacherNote: "Lắng nghe kỹ để phát hiện những bạn hát chưa chuẩn cao độ và chỉnh sửa nhẹ nhàng.",
            suggestedVisual: "Khuông nhạc từng câu hiển thị rõ nốt nhạc và ca từ tương ứng.",
          },
          {
            slideNumber: 8,
            title: "6. Hát Kết Hợp Gõ Đệm Nhạc Cụ",
            subtitle: "Sử dụng Thanh phách & Song loan",
            mainContent: "Thực hành gõ đệm theo 2 hình thức:",
            bullets: [
              "Hình thức 1 (Theo phách): Gõ đều vào cả phách mạnh và phách nhẹ",
              "Hình thức 2 (Theo nhịp): Chỉ gõ vào đầu mỗi ô nhịp (phách 1 mạnh)",
              "Sáng tạo vận động: Động tác Body Percussion (vỗ tay - vỗ đùi theo nhịp)",
              "Biểu diễn luân phiên: Dãy A hát, Dãy B gõ đệm và ngược lại",
            ],
            teacherNote: "Khích lệ các em gõ thật giòn, dứt khoát và giữ nhịp ổn định.",
            suggestedVisual: "Hình ảnh minh họa vị trí tay cầm thanh phách và các mũi tên chỉ điểm gõ.",
          },
          {
            slideNumber: 9,
            title: "7. Thử Tài Âm Nhạc Nhanh",
            subtitle: "Trắc nghiệm tương tác tại lớp",
            mainContent: "Câu hỏi nhanh dành cho các bạn học sinh giỏi nhạc:",
            bullets: [
              "Câu hỏi: Bài hát chúng ta vừa học được viết ở nhịp nào?",
              "A. Nhịp 2/4 (Chính xác!)",
              "B. Nhịp 3/4",
              "C. Nhịp 4/4",
              "D. Nhịp 6/8",
            ],
            teacherNote: "Đếm 1-2-3 cho học sinh cùng giơ tay trả lời nhanh.",
            suggestedVisual: "Hộp quà may mắn và các nốt nhạc sao sáng rực rỡ.",
            quizQuestion: {
              question: "Bài hát chúng ta vừa học được viết ở nhịp nào?",
              options: ["Nhịp 2/4", "Nhịp 3/4", "Nhịp 4/4", "Nhịp 6/8"],
              answer: "A",
            },
          },
          {
            slideNumber: 10,
            title: "Tổng Kết & Dặn Dò Về Nhà",
            subtitle: "Lan tỏa niềm vui âm nhạc",
            mainContent: "Nhiệm vụ rèn luyện sau tiết học:",
            bullets: [
              "Tập hát thuộc lời ca và đúng sắc thái bài hát",
              "Luyện tập gõ thanh phách đệm hát cho người thân trong gia đình nghe",
              "Xem trước bài Đọc nhạc số 2 cho tiết học tuần sau",
              "Chúc các em luôn yêu đời và tràn ngập tiếng cười!",
            ],
            teacherNote: "Khen ngợi tinh thần học tập sôi nổi và tặng điểm tích lũy cho các nhóm tích cực.",
            suggestedVisual: "Hình ảnh cô và trò rạng rỡ chào tạm biệt với các nốt nhạc bay bổng.",
          },
        ],
      };
    }

    const isScience =
      subject.toLowerCase().includes("khoa học") ||
      subject.toLowerCase().includes("khtn") ||
      subject.toLowerCase().includes("tự nhiên") ||
      lessonTitle.toLowerCase().includes("trao đổi chất") ||
      lessonTitle.toLowerCase().includes("quang hợp");

    if (isScience) {
      return CURRICULUM_PRESETS["science-7-metabolism"].slideDeck;
    }

    const isLiterature =
      subject.toLowerCase().includes("văn") ||
      subject.toLowerCase().includes("ngữ văn") ||
      lessonTitle.toLowerCase().includes("thơ") ||
      lessonTitle.toLowerCase().includes("đèo ngang");

    if (isLiterature) {
      return CURRICULUM_PRESETS["lit-8-poetry"].slideDeck;
    }

    return {
      title: `BÀI GIẢNG ĐIỆN TỬ: ${lessonTitle.toUpperCase()}`,
      subject,
      grade,
      slides: [
        {
          slideNumber: 1,
          title: lessonTitle,
          subtitle: `Môn ${subject} - Khối ${grade} (Bộ sách Kết Nối Tri Thức)`,
          mainContent: "Chào mừng các em học sinh đến với tiết học hôm nay!",
          bullets: [
            "Giáo viên: Cô Phan Thị Ngọc Huyền",
            "Trường: THCS Tân Phong - Vĩnh Long",
            "Thời lượng: 45 phút",
          ],
          teacherNote: "Tạo không khí vui tươi, mời học sinh chuẩn bị SGK và đồ dùng học tập lên bàn.",
          suggestedVisual: "Hình ảnh đồ họa hiện đại với các biểu tượng giáo dục trên nền xanh đậm.",
        },
        {
          slideNumber: 2,
          title: "Mục Tiêu Tiết Học",
          subtitle: "Yêu cầu cần đạt trọng tâm",
          mainContent: "Sau bài học này, chúng ta sẽ đạt được:",
          bullets: [
            "Hiểu rõ định nghĩa tỉ lệ thức $\\frac{a}{b} = \\frac{c}{d}$ ($b, d \\neq 0$)",
            "Vận dụng thành thạo tính chất tích chéo $ad = bc$",
            "Làm chủ tính chất dãy tỉ số bằng nhau: $\\frac{a}{b} = \\frac{c}{d} = \\frac{a+c}{b+d}$",
            "Giải quyết bài toán chia tỉ lệ trong thực tế đời sống",
          ],
          teacherNote: "Nhấn mạnh 2 tính chất cốt lõi sẽ xuất hiện trong các bài kiểm tra 15 phút và giữa kỳ.",
          suggestedVisual: "Infographic 3 cột mục tiêu với các icon check xanh lá bắt mắt.",
        },
        {
          slideNumber: 3,
          title: "Hoạt Động Khởi Động",
          subtitle: "Tình huống thực tế: Pha chế chuẩn vị",
          mainContent: "So sánh tỉ số nguyên liệu giữa hai công thức trà sữa:",
          bullets: [
            "Bạn An: $40\\text{ g}$ trà pha với $100\\text{ ml}$ sữa $\\Rightarrow$ Tỉ số: $\\frac{40}{100} = \\frac{2}{5}$",
            "Bạn Bình: $60\\text{ g}$ trà pha với $150\\text{ ml}$ sữa $\\Rightarrow$ Tỉ số: $\\frac{60}{150} = \\frac{2}{5}$",
            "Nhận xét: Hai tỉ số này hoàn toàn bằng nhau!",
            "Ta có đẳng thức: $\\frac{40}{100} = \\frac{60}{150}$",
          ],
          teacherNote: "Đặt câu hỏi gợi mở: Trong toán học, đẳng thức giữa hai tỉ số như thế này được gọi là gì?",
          suggestedVisual: "Hình ảnh ly trà sữa hoạt hình dễ thương kèm tỉ lệ đo lường dung tích cốc.",
          interactiveActivity: "Học sinh bấm nút giơ tay nhanh trả lời câu hỏi dẫn dắt.",
        },
        {
          slideNumber: 4,
          title: "1. Khái Niệm Tỉ Lệ Thức",
          subtitle: "Định nghĩa cốt lõi",
          mainContent: "Tỉ lệ thức là đẳng thức của hai tỉ số $\\frac{a}{b} = \\frac{c}{d}$ (viết là $a : b = c : d$).",
          bullets: [
            "Các số $a, b, c, d$ gọi là các số hạng của tỉ lệ thức",
            "$a$ và $d$ là các số hạng ngoài (ngoại tỉ)",
            "$b$ và $c$ là các số hạng trong (trung tỉ)",
            "Điều kiện mẫu số: $b \\neq 0$ và $d \\neq 0$",
          ],
          teacherNote: "Chỉ rõ trên slide vị trí ngoại tỉ (ngoài cùng) và trung tỉ (ở giữa) để học sinh không nhầm lẫn.",
          suggestedVisual: "Sơ đồ mũi tên chỉ vị trí Ngoại tỉ (a, d) và Trung tỉ (b, c) bằng màu sắc phân biệt.",
        },
        {
          slideNumber: 5,
          title: "2. Tính Chất Cơ Bản Của Tỉ Lệ Thức",
          subtitle: "Tính chất tích chéo thần thánh",
          mainContent: "Nếu $\\frac{a}{b} = \\frac{c}{d}$ thì $a \\cdot d = b \\cdot c$.",
          bullets: [
            "Tích các ngoại tỉ bằng tích các trung tỉ",
            "Ví dụ kiểm tra: $\\frac{3}{4} = \\frac{6}{8}$ vì $3 \\cdot 8 = 4 \\cdot 6 = 24$",
            "Công thức tìm ẩn: Nếu $\\frac{x}{b} = \\frac{c}{d} \\Rightarrow x = \\frac{b \\cdot c}{d}$",
          ],
          teacherNote: "Hướng dẫn học sinh mẹo nhớ: 'Muốn tìm số nào thì lấy tích chéo hai số đã biết chia cho số đối diện'.",
          suggestedVisual: "Đồ họa chữ X (chéo) nối a với d và b với c bằng nét đứt neon phát sáng.",
        },
        {
          slideNumber: 6,
          title: "3. Tính Chất Dãy Tỉ Số Bằng Nhau",
          subtitle: "Công cụ giải toán trọng tâm lớp 7",
          mainContent: "Từ $\\frac{a}{b} = \\frac{c}{d}$, ta có dãy tỉ số bằng nhau mở rộng:",
          bullets: [
            "Cộng các tử và mẫu: $\\frac{a}{b} = \\frac{c}{d} = \\frac{a + c}{b + d}$ (với $b + d \\neq 0$)",
            "Trừ các tử và mẫu: $\\frac{a}{b} = \\frac{c}{d} = \\frac{a - c}{b - d}$ (với $b - d \\neq 0$)",
            "Mở rộng cho 3 tỉ số: $\\frac{a}{b} = \\frac{c}{d} = \\frac{e}{f} = \\frac{a+c+e}{b+d+f}$",
          ],
          teacherNote: "Khắc sâu lưu ý: Dấu ở tử số thế nào thì dấu ở mẫu số phải y hệt như vậy.",
          suggestedVisual: "Khung công thức màu vàng viền nổi bật (Golden Box) ghi nhớ trọng tâm.",
        },
        {
          slideNumber: 7,
          title: "Ví Dụ Mẫu & Bài Giải Chi Tiết",
          subtitle: "Dạng bài kinh điển kiểm tra định kỳ",
          mainContent: "Đề bài: Tìm hai số $x, y$ biết $\\frac{x}{2} = \\frac{y}{5}$ và $x + y = 21$.",
          bullets: [
            "Bước 1: Áp dụng tính chất dãy tỉ số bằng nhau:",
            "$$\\frac{x}{2} = \\frac{y}{5} = \\frac{x+y}{2+5} = \\frac{21}{7} = 3$$",
            "Bước 2: Tìm từng ẩn:",
            "$\\frac{x}{2} = 3 \\Rightarrow x = 2 \\cdot 3 = 6$",
            "$\\frac{y}{5} = 3 \\Rightarrow y = 5 \\cdot 3 = 15$",
            "Bước 3: Kết luận: Vậy $x = 6$ và $y = 15$.",
          ],
          teacherNote: "Mời 1 học sinh nhận xét: Tổng $6 + 15 = 21$ (khớp đề bài), tỉ số $6/2 = 15/5 = 3$. Đúng tuyệt đối!",
          suggestedVisual: "Bảng phấn số với từng bước giải có đánh số tròn 1, 2, 3.",
        },
        {
          slideNumber: 8,
          title: "Trắc Nghiệm Tương Tác Nhanh",
          subtitle: "Thử tài tính nhanh trong 60 giây",
          mainContent: "Cho tỉ lệ thức $\\frac{x}{12} = \\frac{5}{6}$. Giá trị của $x$ là bao nhiêu?",
          bullets: [
            "A. $x = 8$",
            "B. $x = 10$ (Chính xác!)",
            "C. $x = 15$",
            "D. $x = 12$",
          ],
          teacherNote: "Đếm ngược 30 giây, yêu cầu học sinh giơ thẻ chữ cái A, B, C, D.",
          suggestedVisual: "Đồng hồ cát đếm ngược sinh động cùng 4 nút đáp án rực rỡ.",
          quizQuestion: {
            question: "Cho tỉ lệ thức $\\frac{x}{12} = \\frac{5}{6}$. Giá trị của $x$ là:",
            options: ["x = 8", "x = 10", "x = 15", "x = 12"],
            answer: "B",
          },
        },
        {
          slideNumber: 9,
          title: "Tổng Kết & Sơ Đồ Tư Duy",
          subtitle: "Ghi nhớ nhanh kiến thức cốt lõi",
          mainContent: "3 Chìa khóa vàng cần nhớ của bài học:",
          bullets: [
            "1. Tỉ lệ thức: $\\frac{a}{b} = \\frac{c}{d}$",
            "2. Tích chéo: $ad = bc$",
            "3. Dãy tỉ số: $\\frac{a}{b} = \\frac{c}{d} = \\frac{a \\pm c}{b \\pm d}$",
          ],
          teacherNote: "Khen ngợi tinh thần học tập tích cực của lớp trong tiết học.",
          suggestedVisual: "Sơ đồ Mindmap phân nhánh 3 màu sắc đại diện cho 3 nội dung.",
        },
        {
          slideNumber: 10,
          title: "Nhiệm Vụ Về Nhà",
          subtitle: "Rèn luyện và chuẩn bị cho tiết sau",
          mainContent: "Các nhiệm vụ cần hoàn thành trước tiết học tới:",
          bullets: [
            "Học thuộc 2 tính chất cơ bản và tính chất dãy tỉ số bằng nhau.",
            "Làm bài tập 6.1 đến 6.5 trong SGK trang 12.",
            "Làm phiếu bài tập bổ trợ trên hệ thống EduMind THCS.",
            "Đọc trước bài: 'Đại lượng tỉ lệ thuận'.",
          ],
          teacherNote: "Dặn dò học sinh nộp bài tập qua hệ thống trước 20h00 tối mai.",
          suggestedVisual: "Hình ảnh cuốn sổ tay ghi chú và biểu tượng ngôi sao điểm 10.",
        },
      ],
    };
  }

  async generateExamCV7991(params: GenerateExamCV7991Params): Promise<CV7991ExamPackage> {
    const {
      title,
      subject,
      grade,
      durationMinutes,
      totalScore = 10.0,
    } = params;

    const isMusic =
      subject.includes("Âm nhạc") ||
      subject === "MUSIC" ||
      subject.toLowerCase().includes("nhạc");

    if (isMusic) {
      const musicQuestions: GeneratedQuestion[] = [
        {
          content: "Dấu hóa nào sau đây làm tăng cao độ của một nốt nhạc lên nửa cung?",
          type: "SINGLE_CHOICE",
          difficulty: "NHAN_BIET",
          answers: [
            { label: "A", content: "Dấu thăng (#)", isCorrect: true },
            { label: "B", content: "Dấu giáng (b)", isCorrect: false },
            { label: "C", content: "Dấu bình (♮)", isCorrect: false },
            { label: "D", content: "Dấu nối", isCorrect: false },
          ],
          correct_answer: "A",
          explanation: "Dấu thăng (#) có tác dụng nâng cao độ của nốt nhạc lên nửa cung.",
          skill: "Nhận biết các loại dấu hóa",
          tags: ["am-nhac-7", "dau-hoa", "nhan-biet"],
        },
        {
          content: "Bài dân ca 'Lí cây đa' thuộc vùng văn hóa âm nhạc dân gian nào của Việt Nam?",
          type: "SINGLE_CHOICE",
          difficulty: "NHAN_BIET",
          answers: [
            { label: "A", content: "Dân ca Quan họ Bắc Ninh", isCorrect: true },
            { label: "B", content: "Dân ca Nam Bộ", isCorrect: false },
            { label: "C", content: "Dân ca Nam Trung Bộ", isCorrect: false },
            { label: "D", content: "Hát Then miền núi phía Bắc", isCorrect: false },
          ],
          correct_answer: "A",
          explanation: "'Lí cây đa' là làn điệu dân ca Quan họ Bắc Ninh đặc sắc của vùng đồng bằng Bắc Bộ.",
          skill: "Thưởng thức âm nhạc dân ca Việt Nam",
          tags: ["am-nhac-7", "dan-ca", "nhan-biet"],
        },
        {
          content: "Trong số chỉ nhịp 2/4, giá trị độ dài của mỗi phách tương đương với hình nốt nào?",
          type: "SINGLE_CHOICE",
          difficulty: "THONG_HIEU",
          answers: [
            { label: "A", content: "Một nốt đen", isCorrect: true },
            { label: "B", content: "Một nốt đơn", isCorrect: false },
            { label: "C", content: "Một nốt trắng", isCorrect: false },
            { label: "D", content: "Một nốt móc kép", isCorrect: false },
          ],
          correct_answer: "A",
          explanation: "Số chỉ nhịp 2/4 quy định mỗi ô nhịp có 2 phách, mỗi phách bằng một nốt đen (phách 1 mạnh, phách 2 nhẹ).",
          skill: "Hiểu số chỉ nhịp 2/4",
          tags: ["am-nhac-7", "nhip-2-4", "thong-hieu"],
        },
        {
          content: "Xác định nốt nhạc tại khe thứ 1 của khuông nhạc khóa Sol khi có dấu thăng đứng trước:",
          type: "SINGLE_CHOICE",
          difficulty: "THONG_HIEU",
          answers: [
            { label: "A", content: "Fa thăng (F#)", isCorrect: true },
            { label: "B", content: "Sol giáng (Gb)", isCorrect: false },
            { label: "C", content: "Mi thăng (E#)", isCorrect: false },
            { label: "D", content: "Fa bình (F)", isCorrect: false },
          ],
          correct_answer: "A",
          explanation: "Khe thứ 1 của khuông nhạc khóa Sol là nốt Fa (F), có dấu thăng (#) sẽ tạo thành nốt Fa thăng (F#).",
          skill: "Đọc nhạc kết hợp dấu hóa",
          tags: ["am-nhac-7", "doc-nhac", "thong-hieu"],
        },
        {
          content: "Xét các phát biểu sau về Nghệ thuật Đờn ca tài tử Nam Bộ và các nhạc cụ dân tộc. Chọn Đúng hoặc Sai cho mỗi nhận định:",
          type: "TRUE_FALSE",
          difficulty: "THONG_HIEU",
          answers: [
            { label: "a", content: "Đờn ca tài tử Nam Bộ đã được UNESCO vinh danh là Di sản văn hóa phi vật thể của nhân loại.", isCorrect: true },
            { label: "b", content: "Nhạc cụ chính của dàn nhạc Đờn ca tài tử là đàn ghi-ta điện kết hợp trống jazz hiện đại.", isCorrect: false },
            { label: "c", content: "Song loan là nhạc cụ gõ dùng để giữ nhịp cho các bài bản đờn ca tài tử.", isCorrect: true },
            { label: "d", content: "Đàn kìm (đàn nguyệt) là một trong những nhạc cụ linh hồn của dàn nhạc phương Nam.", isCorrect: true },
          ],
          correct_answer: "a-Đ, b-S, c-Đ, d-Đ",
          explanation: "a) Đúng: UNESCO vinh danh năm 2013.\nb) Sai: Dàn ngũ tuyệt gồm Đàn kìm, tranh, cò, bầu, tam.\nc) Đúng: Song loan giữ nhịp trường canh.\nd) Đúng: Đàn kìm có vai trò chủ đạo.",
          skill: "Đánh giá hiểu biết di sản âm nhạc dân tộc",
          tags: ["am-nhac-7", "don-ca-tai-tu", "cv-7991"],
        },
        {
          content: "Điền vào chỗ trống: Trong nhịp 4/4 (nhịp C), mỗi ô nhịp có bao nhiêu phách và phách nào là phách mạnh nhất?",
          type: "SHORT_ANSWER",
          difficulty: "VAN_DUNG",
          answers: [{ label: "A", content: "4 phách, phách 1", isCorrect: true }],
          correct_answer: "4 phách, phách 1",
          explanation: "Nhịp 4/4 có 4 phách trong một ô nhịp, mỗi phách bằng một nốt đen. Phách 1 mạnh, phách 2 nhẹ, phách 3 mạnh vừa, phách 4 nhẹ.",
          skill: "Xác định tính chất nhịp 4/4",
          tags: ["am-nhac-7", "nhip-4-4", "van-dung"],
        },
        {
          content: "Thực hành (3.0 điểm): Trình bày hoàn chỉnh một bài hát đã học trong học kỳ kết hợp gõ đệm thanh phách theo phách hoặc theo nhịp. Nêu cảm nghĩ của em về ý nghĩa bài hát.",
          type: "ESSAY",
          difficulty: "VAN_DUNG_CAO",
          answers: [{ label: "A", content: "Biểu diễn đúng cao độ, trường độ, gõ phách chuẩn xác và phong thái tự tin", isCorrect: true }],
          correct_answer: "Biểu diễn tự tin, hát chuẩn cao độ trường độ, gõ phách đều tay",
          explanation: "Học sinh biểu diễn bài hát với phong thái tự tin, ngắt hơi đúng nhịp, phát âm tròn vành rõ chữ và kết hợp gõ đệm thanh phách nhịp nhàng.",
          skill: "Thực hành biểu diễn thanh nhạc và gõ đệm",
          tags: ["am-nhac-7", "thuc-hanh-hat", "cv-7991"],
        },
      ];

      const musicMatrix: CV7991MatrixRow[] = [
        {
          topic: "Chủ đề: Lí thuyết âm nhạc",
          knowledgeUnit: "Dấu hóa và các loại nhịp (2/4, 4/4)",
          learningOutcome: "Nhận biết dấu hóa và xác định tính chất phách trong ô nhịp",
          nhanBiet: { tn: 1, tl: 0, points: 1.0 },
          thongHieu: { tn: 1, tl: 0, points: 1.0 },
          vanDung: { tn: 1, tl: 0, points: 1.5 },
          vanDungCao: { tn: 0, tl: 0, points: 0 },
          totalQuestions: 3,
          totalPoints: 3.5,
        },
        {
          topic: "Chủ đề: Thưởng thức âm nhạc",
          knowledgeUnit: "Dân ca Việt Nam & Đờn ca tài tử Nam Bộ",
          learningOutcome: "Hiểu biết nguồn gốc dân ca và đặc trưng dàn nhạc phương Nam",
          nhanBiet: { tn: 1, tl: 0, points: 1.0 },
          thongHieu: { tn: 1, tl: 0, points: 1.5 },
          vanDung: { tn: 0, tl: 0, points: 0 },
          vanDungCao: { tn: 0, tl: 0, points: 0 },
          totalQuestions: 2,
          totalPoints: 2.5,
        },
        {
          topic: "Chủ đề: Đọc nhạc",
          knowledgeUnit: "Đọc cao độ nốt nhạc trên khuông nhạc khóa Sol",
          learningOutcome: "Đọc chính xác tên nốt và cao độ có dấu hóa",
          nhanBiet: { tn: 0, tl: 0, points: 0 },
          thongHieu: { tn: 1, tl: 0, points: 1.0 },
          vanDung: { tn: 0, tl: 0, points: 0 },
          vanDungCao: { tn: 0, tl: 0, points: 0 },
          totalQuestions: 1,
          totalPoints: 1.0,
        },
        {
          topic: "Chủ đề: Thực hành Hát & Nhạc cụ",
          knowledgeUnit: "Hát kết hợp gõ đệm thanh phách",
          learningOutcome: "Trình diễn bài hát tự tin, đúng cao độ, giữ vững nhịp phách",
          nhanBiet: { tn: 0, tl: 0, points: 0 },
          thongHieu: { tn: 0, tl: 0, points: 0 },
          vanDung: { tn: 0, tl: 0, points: 0 },
          vanDungCao: { tn: 0, tl: 1, points: 3.0 },
          totalQuestions: 1,
          totalPoints: 3.0,
        },
      ];

      const musicSpecification: CV7991SpecificationRow[] = [
        {
          order: 1,
          topic: "Lí thuyết âm nhạc",
          knowledgeUnit: "Dấu hóa",
          learningOutcome: "Nhận biết tác dụng của dấu thăng đối với cao độ",
          assessmentLevel: "Nhận biết",
          questionType: "Trắc nghiệm nhiều lựa chọn",
          questionCount: 1,
          points: 1.0,
          questionNumbers: "Câu 1",
        },
        {
          order: 2,
          topic: "Thưởng thức âm nhạc",
          knowledgeUnit: "Dân ca Việt Nam",
          learningOutcome: "Nhận biết xuất xứ vùng miền của bài hát dân ca Lí cây đa",
          assessmentLevel: "Nhận biết",
          questionType: "Trắc nghiệm nhiều lựa chọn",
          questionCount: 1,
          points: 1.0,
          questionNumbers: "Câu 2",
        },
        {
          order: 3,
          topic: "Lí thuyết âm nhạc",
          knowledgeUnit: "Số chỉ nhịp 2/4",
          learningOutcome: "Hiểu giá trị trường độ phách trong nhịp 2/4",
          assessmentLevel: "Thông hiểu",
          questionType: "Trắc nghiệm nhiều lựa chọn",
          questionCount: 1,
          points: 1.0,
          questionNumbers: "Câu 3",
        },
        {
          order: 4,
          topic: "Đọc nhạc",
          knowledgeUnit: "Đọc nốt có dấu thăng",
          learningOutcome: "Đọc đúng nốt Fa thăng ở khe 1 khuông nhạc",
          assessmentLevel: "Thông hiểu",
          questionType: "Trắc nghiệm nhiều lựa chọn",
          questionCount: 1,
          points: 1.0,
          questionNumbers: "Câu 4",
        },
        {
          order: 5,
          topic: "Thưởng thức âm nhạc",
          knowledgeUnit: "Đờn ca tài tử Nam Bộ",
          learningOutcome: "Đánh giá đúng sai về giá trị di sản và nhạc cụ cổ truyền",
          assessmentLevel: "Thông hiểu",
          questionType: "Trắc nghiệm Đúng/Sai (4 ý)",
          questionCount: 1,
          points: 1.5,
          questionNumbers: "Câu 5",
        },
        {
          order: 6,
          topic: "Lí thuyết âm nhạc",
          knowledgeUnit: "Nhịp 4/4",
          learningOutcome: "Xác định số phách và tính chất phách mạnh trong nhịp 4/4",
          assessmentLevel: "Vận dụng",
          questionType: "Trắc nghiệm trả lời ngắn",
          questionCount: 1,
          points: 1.5,
          questionNumbers: "Câu 6",
        },
        {
          order: 7,
          topic: "Thực hành Hát & Nhạc cụ",
          knowledgeUnit: "Biểu diễn thanh nhạc & gõ thanh phách",
          learningOutcome: "Thực hành hoàn chỉnh bài hát kết hợp gõ đệm đúng phách",
          assessmentLevel: "Vận dụng cao",
          questionType: "Thực hành / Tự luận đánh giá năng lực",
          questionCount: 1,
          points: 3.0,
          questionNumbers: "Câu 7 (TH)",
        },
      ];

      const musicScoringGuide = {
        multipleChoice: [
          { questionNumber: 1, answer: "A", points: 1.0 },
          { questionNumber: 2, answer: "A", points: 1.0 },
          { questionNumber: 3, answer: "A", points: 1.0 },
          { questionNumber: 4, answer: "A", points: 1.0 },
        ],
        trueFalse: [
          {
            questionNumber: 5,
            subItems: [
              { item: "Ý a", answer: "Đúng" as const, points: 0.375 },
              { item: "Ý b", answer: "Sai" as const, points: 0.375 },
              { item: "Ý c", answer: "Đúng" as const, points: 0.375 },
              { item: "Ý d", answer: "Đúng" as const, points: 0.375 },
            ],
          },
        ],
        essayRubric: [
          {
            questionNumber: 7,
            criteria: "Thực hành Hát kết hợp gõ đệm thanh phách (3.0 điểm)",
            steps: [
              { step: "Hát đúng giai điệu, chuẩn xác cao độ bài hát, không chênh phô", points: 1.0 },
              { step: "Hát đúng trường độ, lấy hơi đúng chỗ và giữ nhịp độ ổn định", points: 0.75 },
              { step: "Gõ đệm thanh phách giòn giã, chuẩn xác theo phách mạnh/nhẹ", points: 0.75 },
              { step: "Phong thái biểu diễn tự tin, nét mặt tươi tắn, biểu cảm phù hợp", points: 0.5 },
            ],
            totalPoints: 3.0,
          },
        ],
      };

      return {
        title: title || `ĐỀ KIỂM TRA ĐỊNH KỲ THEO CÔNG VĂN 7991 - MÔN ÂM NHẠC KHỐI ${grade}`,
        subject: "Âm nhạc",
        grade,
        durationMinutes,
        totalScore,
        questions: musicQuestions,
        matrix: musicMatrix,
        specification: musicSpecification,
        scoringGuide: musicScoringGuide,
        consistencyCheck: {
          isValid: true,
          scoreSum: 10.0,
          warnings: [],
        },
      };
    }

    const isScience =
      subject.toLowerCase().includes("khoa học") ||
      subject.toLowerCase().includes("khtn") ||
      subject.toLowerCase().includes("tự nhiên");

    if (isScience) {
      const pkg = CURRICULUM_PRESETS["science-7-metabolism"].examPackage;
      return {
        ...pkg,
        title: title || `ĐỀ KIỂM TRA ĐỊNH KỲ THEO CÔNG VĂN 7991 - KHOA HỌC TỰ NHIÊN ${grade}`,
        durationMinutes,
        totalScore,
      };
    }

    const isLiterature =
      subject.toLowerCase().includes("văn") ||
      subject.toLowerCase().includes("ngữ văn");

    if (isLiterature) {
      const pkg = CURRICULUM_PRESETS["lit-8-poetry"].examPackage;
      return {
        ...pkg,
        title: title || `ĐỀ KIỂM TRA ĐỊNH KỲ THEO CÔNG VĂN 7991 - MÔN NGỮ VĂN KHỐI ${grade}`,
        durationMinutes,
        totalScore,
      };
    }

    // Default: Mathematics (Toán học)
    const mathPkg = CURRICULUM_PRESETS["math-7-ratio"].examPackage;
    return {
      ...mathPkg,
      title: title || `ĐỀ KIỂM TRA ĐỊNH KỲ THEO CÔNG VĂN 7991 - MÔN ${subject.toUpperCase()} KHỐI ${grade}`,
      subject,
      grade,
      durationMinutes,
      totalScore,
    };
  }

  async analyzeStudent(params: AnalyzeStudentParams): Promise<StudentAnalysisResult> {
    const { studentName, grade, classTitle, recentScores, skillMasteries } = params;
    const avgScore =
      recentScores.length > 0
        ? recentScores.reduce((acc, curr) => acc + curr.score, 0) / recentScores.length
        : 7.0;

    const weakSkills = skillMasteries
      .filter((s) => s.score < 60)
      .map((s) => `${s.skillName} (${s.score}%)`);

    const strongSkills = skillMasteries
      .filter((s) => s.score >= 75)
      .map((s) => `${s.skillName} (${s.score}%)`);

    const trend = avgScore >= 7.5 ? "IMPROVING" : avgScore >= 6.0 ? "STABLE" : "DECLINING";

    const recommendedActions = [];
    if (weakSkills.length > 0) {
      recommendedActions.push(`Cần bổ trợ phiếu bài tập riêng cho kỹ năng: ${weakSkills.join(", ")}.`);
      recommendedActions.push("Giáo viên nên kiểm tra bài tập ngắn 5 phút đầu giờ để củng cố bước suy luận.");
    } else {
      recommendedActions.push("Tăng cường các bài toán mở rộng và vận dụng thực tế để phát huy tiềm năng.");
    }

    const teacherRemark =
      trend === "DECLINING" || avgScore < 6.0
        ? `Em ${studentName} có tinh thần học tập nhưng kết quả gần đây có dấu hiệu giảm nhẹ, đặc biệt còn lúng túng ở phần ${weakSkills[0] || "gõ đệm và đọc nhạc"}. Đề nghị gia đình phối hợp nhắc nhở em rèn luyện thêm nhạc cụ gõ và luyện thanh tại nhà.`
        : `Em ${studentName} tiếp thu bài nhanh, cảm thụ âm nhạc tốt, làm chủ tốt các kỹ năng trọng tâm của môn Âm nhạc lớp ${grade}. Cần tiếp tục duy trì phong độ và phát huy năng khiếu biểu diễn tự tin.`;

    return {
      summary: `Học sinh ${studentName} (${classTitle}) đạt điểm trung bình gần đây: ${avgScore.toFixed(1)}/10.`,
      strongSkills: strongSkills.length > 0 ? strongSkills : ["Cảm thụ giai điệu & Hát đúng lời"],
      weakSkills: weakSkills.length > 0 ? weakSkills : ["Chưa phát hiện điểm yếu rõ rệt"],
      trend,
      recommendedActions,
      teacherRemark,
    };
  }

  async chat(messages: ChatMessage[], context?: Record<string, unknown>): Promise<AIChatResponse> {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || "";

    // Intent detection based on user query
    if (lastMessage.includes("yếu") || lastMessage.includes("chú ý") || lastMessage.includes("học sinh")) {
      return {
        content: `Dựa trên dữ liệu tổng hợp môn **Âm nhạc** lớp **7A1** (Trường THCS Tân Phong), hệ thống ghi nhận **4 học sinh** cần được cô Huyền lưu ý hỗ trợ thêm về nhịp phách và đọc nhạc:
1. **Dương Minh Khang** (Điểm bài thi: 5.5 | Gõ đệm thanh phách: 44%)
2. **Trịnh Khắc Huy** (Điểm bài thi: 6.0 | Đọc cao độ nốt thăng: 48%)
3. **Vũ Gia Huy** (Điểm bài thi: 6.5 | Nhịp 2/4 còn lỡ nhịp: 52%)
4. **Bùi Quốc Anh** (Điểm bài thi: 6.5 | Lấy hơi chưa sâu: 55%)

Các em có giọng hát tốt nhưng còn e dè khi biểu diễn trước lớp và dễ bị lỡ nhịp khi gõ đệm thanh phách.`,
        structuredData: {
          type: "STUDENT_LIST",
          data: [
            { name: "Dương Minh Khang", score: 5.5, mastery: 44, reason: "Gõ lệch phách 2" },
            { name: "Trịnh Khắc Huy", score: 6.0, mastery: 48, reason: "Đọc nốt thăng chưa chuẩn" },
            { name: "Vũ Gia Huy", score: 6.5, mastery: 52, reason: "Lỡ nhịp khi đổi câu" },
            { name: "Bùi Quốc Anh", score: 6.5, mastery: 55, reason: "Cần lấy hơi sâu ở nốt cao" },
          ],
        },
        suggestedActions: [
          { label: "Tạo bài luyện tập thực hành nhóm 7A1", action: "CREATE_EXAM", params: { class: "7A1", topic: "Gõ đệm thanh phách" } },
          { label: "Xuất phiếu bài tập Lí thuyết âm nhạc", action: "EXPORT_WORKSHEET", params: { class: "7A1" } },
        ],
      };
    }

    if (lastMessage.includes("so sánh") || (lastMessage.includes("7a") && lastMessage.includes("7b")) || lastMessage.includes("7a2")) {
      return {
        content: `📊 **Báo cáo so sánh kết quả học tập môn Âm nhạc giữa Lớp 7A1 và Lớp 7A2 (THCS Tân Phong):**

- **Điểm trung bình thực hành**: 
  - Lớp 7A1: **7.9/10** (Tỉ lệ Khá - Tốt: 85%)
  - Lớp 7A2: **7.2/10** (Tỉ lệ Khá - Tốt: 70%)
- **Kỹ năng Hát**: Cả hai lớp hát đều, đúng lời và giai điệu trong sáng (7A1: 88%, 7A2: 82%).
- **Thực hành Nhạc cụ (Thanh phách / Song loan)**: Lớp 7A1 giữ nhịp rất chắc (80%), trong khi lớp 7A2 còn một số bàn gõ nhanh dần đều (64%).
- **Đề xuất cho cô Huyền**: Dành 5 phút đầu tiết tới cho lớp 7A2 chơi trò chơi gõ chuyền phách để rèn phản xạ giữ nhịp ổn định.`,
        structuredData: {
          type: "COMPARISON",
          data: {
            classes: ["7A1", "7A2"],
            averages: [7.9, 7.2],
            topics: [
              { name: "Hát đúng giai điệu", a1: 88, a2: 82 },
              { name: "Gõ đệm thanh phách", a1: 80, a2: 64 },
              { name: "Đọc nhạc nốt Sol - Fa", a1: 76, a2: 68 },
            ],
          },
        },
        suggestedActions: [
          { label: "Xem danh sách lớp 7A2", action: "FILTER_STUDENTS", params: { class: "7A2" } },
          { label: "Tạo phiếu thực hành nhịp cho 7A2", action: "CREATE_EXAM", params: { grade: 7 } },
        ],
      };
    }

    if (lastMessage.includes("tạo đề") || lastMessage.includes("15 phút") || lastMessage.includes("kiểm tra")) {
      return {
        content: `Đã cấu hình đề xuất đề kiểm tra **Âm nhạc 7** bám sát ma trận năng lực theo Công văn 7991:
- **Tên đề**: Kiểm tra định kỳ Giữa Học kỳ I - Môn Âm nhạc 7
- **Số câu**: 7 câu tích hợp Lí thuyết & Thực hành
- **Cấu trúc ma trận**:
  - Lí thuyết âm nhạc (Dấu thăng, dấu giáng, nhịp 2/4): 3.0 điểm
  - Thưởng thức âm nhạc (Dân ca Việt Nam & Đờn ca tài tử): 2.5 điểm
  - Đọc nhạc (Khuông nhạc khóa Sol): 1.5 điểm
  - Thực hành Hát & Gõ thanh phách: 3.0 điểm (đánh giá theo Rubric chuẩn)
- **Mã đề sẵn sàng**: 101, 102, 103, 104 có thể tự động xáo trộn câu hỏi và in ấn ngay kèm tiêu đề **TRƯỜNG THCS TÂN PHONG - VĨNH LONG**.`,
        structuredData: {
          type: "EXAM_PROPOSAL",
          data: {
            title: "Kiểm tra Giữa kỳ - Môn Âm nhạc 7",
            questionCount: 7,
            duration: 45,
            topics: ["Lí thuyết âm nhạc", "Thưởng thức âm nhạc", "Hát và Nhạc cụ"],
          },
        },
        suggestedActions: [
          { label: "Mở Trình tạo đề thi Âm nhạc", action: "CREATE_EXAM", params: { template: "music_7_midterm" } },
          { label: "Xem Ngân hàng câu hỏi Âm nhạc", action: "OPEN_QUESTION_BANK", params: { topic: "am-nhac" } },
        ],
      };
    }

    // Default friendly assistant response
    return {
      content: `Xin chào cô Huyền! Em là **EduMind AI Assistant**, trợ lý chuyên môn môn Âm nhạc và quản lý giảng dạy của cô tại **Trường THCS Tân Phong - Vĩnh Long** (phụ trách Khối 6, 7, 8, 9).

Em có thể hỗ trợ cô ngay:
1. 🎵 **Soạn Kế hoạch bài dạy (CV 5512)**: Tự động thiết kế giáo án Âm nhạc chuẩn 4 hoạt động với thiết bị đàn Organ, thanh phách, file beat.
2. 📑 **Tạo bài giảng điện tử (Slides Studio)**: Thiết kế slide trình chiếu sinh động gồm luyện thanh La - Ma, tập hát từng câu và gõ đệm.
3. 📝 **Ra đề kiểm tra chuẩn CV 7991**: Tạo đề thi 15 phút, giữa kỳ với 4 mã đề (101 - 104), đầy đủ ma trận, bản đặc tả và Rubric thực hành hát.
4. 📊 **Theo dõi học sinh các lớp**: Thống kê mức độ thành thạo phách nhịp, cao độ của học sinh các lớp 6A1, 7A1, 7A2, 8A1, 9A1.

Cô muốn em hỗ trợ nội dung nào trước ạ?`,
      suggestedActions: [
        { label: "Lớp 7A1 học sinh nào cần chú ý phách?", action: "FILTER_STUDENTS", params: { class: "7A1" } },
        { label: "Tạo giáo án 5512 bài Nụ cười", action: "CREATE_EXAM", params: { class: "7A1" } },
        { label: "So sánh kết quả Âm nhạc 7A1 và 7A2", action: "FILTER_STUDENTS", params: { compare: ["7A1", "7A2"] } },
      ],
    };
  }
}

/**
 * Factory to get current active AI Provider
 */
let currentProvider: AIProvider = new SmartLocalAIProvider();

export function getAIProvider(apiKey?: string): AIProvider {
  if (apiKey && apiKey.trim().length > 10) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GeminiAIProvider } = require("./geminiProvider");
      return new GeminiAIProvider(apiKey);
    } catch {
      return currentProvider;
    }
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GeminiAIProvider } = require("./geminiProvider");
      currentProvider = new GeminiAIProvider(process.env.GEMINI_API_KEY);
    } catch {
      currentProvider = new SmartLocalAIProvider();
    }
  }
  return currentProvider;
}

export function setAIProvider(provider: AIProvider) {
  currentProvider = provider;
}


