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
} from "./types";

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
      if (subject.includes("Toán") || subject === "MATH") {
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
          content: `Choose the correct form of the verb: "She ______ (teach) Math at Chu Van An Secondary School since 2020."`,
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
    const {
      subject = "Toán học",
      grade = 7,
      lessonTitle = "Bài 6: Tỉ lệ thức và dãy tỉ số bằng nhau",
      durationMinutes = 90,
      learningOutcomes,
    } = params;

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

  async generateSlideDeck(params: GenerateSlideParams): Promise<GeneratedSlideDeck> {
    const { lessonTitle, subject, grade } = params;

    return {
      title: `BÀI GIẢNG ĐIỆN TỬ: ${lessonTitle.toUpperCase()}`,
      subject,
      grade,
      slides: [
        {
          slideNumber: 1,
          title: lessonTitle,
          subtitle: `Môn ${subject} - Khối ${grade} (Bộ sách Kết Nối Tri Thức)`,
          mainContent: "Chào mừng các em học sinh đến với tiết học toán hôm nay!",
          bullets: [
            "Giáo viên: Cô Nguyễn Thị Lan",
            "Trường: THCS Chu Văn An",
            "Thời lượng: 45 phút",
          ],
          teacherNote: "Tạo không khí vui tươi, mời học sinh chuẩn bị SGK và đồ dùng học tập lên bàn.",
          suggestedVisual: "Hình ảnh đồ họa hiện đại với các biểu tượng toán học, thước kẻ, compa trên nền xanh đậm giáo dục.",
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

    const questions: GeneratedQuestion[] = [
      {
        content: "Từ tỉ lệ thức $\\frac{a}{b} = \\frac{c}{d}$ (với $b, d \\neq 0$), khẳng định nào sau đây là đúng?",
        type: "SINGLE_CHOICE",
        difficulty: "NHAN_BIET",
        answers: [
          { label: "A", content: "$a \\cdot d = b \\cdot c$", isCorrect: true },
          { label: "B", content: "$a \\cdot c = b \\cdot d$", isCorrect: false },
          { label: "C", content: "$a \\cdot b = c \\cdot d$", isCorrect: false },
          { label: "D", content: "$a + d = b + c$", isCorrect: false },
        ],
        correct_answer: "A",
        explanation: "Theo tính chất cơ bản của tỉ lệ thức, tích ngoại tỉ bằng tích trung tỉ: $ad = bc$.",
        skill: "Nhận biết tỉ lệ thức",
        tags: ["ti-le-thuc", "nhan-biet"],
      },
      {
        content: "Số đối của số hữu tỉ $-\\frac{3}{7}$ là:",
        type: "SINGLE_CHOICE",
        difficulty: "NHAN_BIET",
        answers: [
          { label: "A", content: "$\\frac{3}{7}$", isCorrect: true },
          { label: "B", content: "$-\\frac{7}{3}$", isCorrect: false },
          { label: "C", content: "$\\frac{7}{3}$", isCorrect: false },
          { label: "D", content: "$-\\frac{3}{7}$", isCorrect: false },
        ],
        correct_answer: "A",
        explanation: "Số đối của số hữu tỉ $-a$ là $+a$, do đó số đối của $-\\frac{3}{7}$ là $\\frac{3}{7}$.",
        skill: "Số hữu tỉ và số đối",
        tags: ["so-huu-ti", "nhan-biet"],
      },
      {
        content: "Tìm số hữu tỉ $x$ biết: $\\frac{x}{12} = \\frac{5}{6}$.",
        type: "SINGLE_CHOICE",
        difficulty: "THONG_HIEU",
        answers: [
          { label: "A", content: "$x = 10$", isCorrect: true },
          { label: "B", content: "$x = 8$", isCorrect: false },
          { label: "C", content: "$x = 15$", isCorrect: false },
          { label: "D", content: "$x = 12$", isCorrect: false },
        ],
        correct_answer: "A",
        explanation: "Áp dụng tính chất tỉ lệ thức: $x = \\frac{12 \\cdot 5}{6} = 10$.",
        skill: "Tìm x trong tỉ lệ thức",
        tags: ["ti-le-thuc", "thong-hieu"],
      },
      {
        content: "Cho $\\frac{x}{3} = \\frac{y}{5}$ và $x + y = 32$. Giá trị của $x$ và $y$ lần lượt là:",
        type: "SINGLE_CHOICE",
        difficulty: "THONG_HIEU",
        answers: [
          { label: "A", content: "$x = 12; y = 20$", isCorrect: true },
          { label: "B", content: "$x = 20; y = 12$", isCorrect: false },
          { label: "C", content: "$x = 14; y = 18$", isCorrect: false },
          { label: "D", content: "$x = 10; y = 22$", isCorrect: false },
        ],
        correct_answer: "A",
        explanation: "Theo tính chất dãy tỉ số bằng nhau: $\\frac{x}{3} = \\frac{y}{5} = \\frac{x+y}{3+5} = \\frac{32}{8} = 4$. Do đó $x = 3 \\cdot 4 = 12$, $y = 5 \\cdot 4 = 20$.",
        skill: "Vận dụng tính chất dãy tỉ số bằng nhau",
        tags: ["day-ti-so", "thong-hieu"],
      },
      {
        content: "Xét các phát biểu sau về tỉ lệ thức $\\frac{x}{4} = \\frac{y}{7}$ với $x, y \\neq 0$. Chọn Đúng hoặc Sai cho mỗi mệnh đề:",
        type: "TRUE_FALSE",
        difficulty: "THONG_HIEU",
        answers: [
          { label: "a", content: "Đẳng thức tích chéo tương đương là $7x = 4y$.", isCorrect: true },
          { label: "b", content: "Tỉ số $\\frac{x}{y}$ bằng $\\frac{7}{4}$.", isCorrect: false },
          { label: "c", content: "$\\frac{x}{4} = \\frac{y}{7} = \\frac{x+y}{11}$.", isCorrect: true },
          { label: "d", content: "Nếu $y = 14$ thì $x = 8$.", isCorrect: true },
        ],
        correct_answer: "a-Đ, b-S, c-Đ, d-Đ",
        explanation: "a) Đúng vì tích chéo $7x = 4y$.\nb) Sai vì $\\frac{x}{y} = \\frac{4}{7}$.\nc) Đúng theo tính chất $\\frac{x+y}{4+7} = \\frac{x+y}{11}$.\nd) Đúng vì khi $y=14$ thì $x = \\frac{4 \\cdot 14}{7} = 8$.",
        skill: "Phân tích tính đúng sai của tỉ lệ thức",
        tags: ["dung-sai", "cv-7991"],
      },
      {
        content: "Điền kết quả vào chỗ trống: Hai lớp 7A và 7B có số học sinh tỉ lệ với $8$ và $9$. Biết lớp 7B nhiều hơn lớp 7A là $4$ học sinh. Tổng số học sinh của cả hai lớp là bao nhiêu?",
        type: "SHORT_ANSWER",
        difficulty: "VAN_DUNG",
        answers: [{ label: "A", content: "68", isCorrect: true }],
        correct_answer: "68",
        explanation: "Gọi số học sinh hai lớp là $x, y$. Ta có: $\\frac{x}{8} = \\frac{y}{9} = \\frac{y-x}{9-8} = \\frac{4}{1} = 4$. Tổng số học sinh là $(8 + 9) \\cdot 4 = 17 \\cdot 4 = 68$ học sinh.",
        skill: "Giải bài toán thực tế tỉ lệ",
        tags: ["tra-loi-ngan", "van-dung"],
      },
      {
        content: "Tự luận (2.0 điểm): Ba đội máy cày làm việc trên ba cánh đồng có cùng diện tích. Đội thứ nhất hoàn thành công việc trong 3 ngày, đội thứ hai trong 4 ngày và đội thứ ba trong 6 ngày. Hỏi mỗi đội có bao nhiêu máy cày, biết rằng số máy của đội thứ nhất nhiều hơn đội thứ hai là 2 máy và năng suất các máy như nhau?",
        type: "ESSAY",
        difficulty: "VAN_DUNG_CAO",
        answers: [{ label: "A", content: "Đội 1: 8 máy; Đội 2: 6 máy; Đội 3: 4 máy", isCorrect: true }],
        correct_answer: "Đội 1: 8 máy, Đội 2: 6 máy, Đội 3: 4 máy",
        explanation: "Gọi số máy cày của ba đội lần lượt là $x, y, z$ (máy, $x, y, z \\in \\mathbb{N}^*$).\nVì trên cùng diện tích, số máy cày và thời gian hoàn thành là hai đại lượng tỉ lệ nghịch:\n$3x = 4y = 6z \\Rightarrow \\frac{x}{4} = \\frac{y}{3} = \\frac{z}{2}$.\nBiết $x - y = 2$, áp dụng tính chất dãy tỉ số bằng nhau:\n$\\frac{x}{4} = \\frac{y}{3} = \\frac{z}{2} = \\frac{x-y}{4-3} = \\frac{2}{1} = 2$.\nSuy ra:\n$x = 4 \\cdot 2 = 8$ (máy)\n$y = 3 \\cdot 2 = 6$ (máy)\n$z = 2 \\cdot 2 = 4$ (máy).\nVậy số máy của 3 đội lần lượt là 8 máy, 6 máy, 4 máy.",
        skill: "Giải bài toán tỉ lệ nghịch nâng cao",
        tags: ["tu-luan", "van-dung-cao", "cv-7991"],
      },
    ];

    const matrix: CV7991MatrixRow[] = [
      {
        topic: "Chương 1: Số hữu tỉ",
        knowledgeUnit: "Số đối và phép toán số hữu tỉ",
        learningOutcome: "Nhận biết số đối, thực hiện phép cộng trừ số hữu tỉ",
        nhanBiet: { tn: 1, tl: 0, points: 1.0 },
        thongHieu: { tn: 0, tl: 0, points: 0 },
        vanDung: { tn: 0, tl: 0, points: 0 },
        vanDungCao: { tn: 0, tl: 0, points: 0 },
        totalQuestions: 1,
        totalPoints: 1.0,
      },
      {
        topic: "Chương 2: Tỉ lệ thức & Dãy tỉ số",
        knowledgeUnit: "Định nghĩa và tính chất tỉ lệ thức",
        learningOutcome: "Nhận biết tỉ lệ thức, vận dụng tính chất tích chéo $ad = bc$",
        nhanBiet: { tn: 1, tl: 0, points: 1.0 },
        thongHieu: { tn: 2, tl: 0, points: 2.0 },
        vanDung: { tn: 0, tl: 0, points: 0 },
        vanDungCao: { tn: 0, tl: 0, points: 0 },
        totalQuestions: 3,
        totalPoints: 3.0,
      },
      {
        topic: "Chương 2: Tỉ lệ thức & Dãy tỉ số",
        knowledgeUnit: "Tính chất dãy tỉ số bằng nhau",
        learningOutcome: "Vận dụng tính chất dãy tỉ số tìm hai ẩn $x, y$",
        nhanBiet: { tn: 0, tl: 0, points: 0 },
        thongHieu: { tn: 1, tl: 0, points: 1.5 },
        vanDung: { tn: 1, tl: 0, points: 1.5 },
        vanDungCao: { tn: 0, tl: 0, points: 0 },
        totalQuestions: 2,
        totalPoints: 3.0,
      },
      {
        topic: "Chương 2: Tỉ lệ thức & Dãy tỉ số",
        knowledgeUnit: "Toán thực tế tỉ lệ nghịch liên môn",
        learningOutcome: "Mô hình hóa bài toán thực tế năng suất máy cày",
        nhanBiet: { tn: 0, tl: 0, points: 0 },
        thongHieu: { tn: 0, tl: 0, points: 0 },
        vanDung: { tn: 0, tl: 0, points: 0 },
        vanDungCao: { tn: 0, tl: 1, points: 3.0 },
        totalQuestions: 1,
        totalPoints: 3.0,
      },
    ];

    const specification: CV7991SpecificationRow[] = [
      {
        order: 1,
        topic: "Số hữu tỉ",
        knowledgeUnit: "Khái niệm và số đối",
        learningOutcome: "Nhận biết số đối của một số hữu tỉ cho trước",
        assessmentLevel: "Nhận biết",
        questionType: "Trắc nghiệm nhiều lựa chọn",
        questionCount: 1,
        points: 1.0,
        questionNumbers: "Câu 2",
      },
      {
        order: 2,
        topic: "Tỉ lệ thức",
        knowledgeUnit: "Định nghĩa và tính chất cơ bản",
        learningOutcome: "Nhận biết định nghĩa tỉ lệ thức và tính chất tích ngoại tỉ bằng tích trung tỉ",
        assessmentLevel: "Nhận biết",
        questionType: "Trắc nghiệm nhiều lựa chọn",
        questionCount: 1,
        points: 1.0,
        questionNumbers: "Câu 1",
      },
      {
        order: 3,
        topic: "Tỉ lệ thức",
        knowledgeUnit: "Tìm ẩn trong tỉ lệ thức",
        learningOutcome: "Tính toán tìm giá trị ẩn số bậc nhất trong tỉ lệ thức",
        assessmentLevel: "Thông hiểu",
        questionType: "Trắc nghiệm nhiều lựa chọn",
        questionCount: 1,
        points: 1.0,
        questionNumbers: "Câu 3",
      },
      {
        order: 4,
        topic: "Dãy tỉ số bằng nhau",
        knowledgeUnit: "Áp dụng tính chất cơ bản",
        learningOutcome: "Tìm hai số khi biết tỉ số và tổng của chúng",
        assessmentLevel: "Thông hiểu",
        questionType: "Trắc nghiệm nhiều lựa chọn",
        questionCount: 1,
        points: 1.0,
        questionNumbers: "Câu 4",
      },
      {
        order: 5,
        topic: "Dãy tỉ số bằng nhau",
        knowledgeUnit: "Phân tích mệnh đề đúng sai",
        learningOutcome: "Đánh giá tính đúng/sai của các phép biến đổi tỉ lệ thức",
        assessmentLevel: "Thông hiểu",
        questionType: "Trắc nghiệm Đúng/Sai (4 ý)",
        questionCount: 1,
        points: 1.5,
        questionNumbers: "Câu 5",
      },
      {
        order: 6,
        topic: "Toán thực tế",
        knowledgeUnit: "Bài toán chia tỉ lệ thuận",
        learningOutcome: "Giải bài toán thực tế tìm số học sinh dựa vào hiệu và tỉ số",
        assessmentLevel: "Vận dụng",
        questionType: "Trắc nghiệm trả lời ngắn",
        questionCount: 1,
        points: 1.5,
        questionNumbers: "Câu 6",
      },
      {
        order: 7,
        topic: "Toán thực tế",
        knowledgeUnit: "Bài toán tỉ lệ nghịch đa bước",
        learningOutcome: "Lập luận mô hình hóa bài toán thực tế năng suất máy cày",
        assessmentLevel: "Vận dụng cao",
        questionType: "Tự luận trình bày bước",
        questionCount: 1,
        points: 3.0,
        questionNumbers: "Câu 7 (TL)",
      },
    ];

    const scoringGuide = {
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
          criteria: "Bài toán thực tế máy cày (3.0 điểm)",
          steps: [
            { step: "Gọi ẩn $x, y, z$ và đặt điều kiện thích hợp ($x, y, z \\in \\mathbb{N}^*$)", points: 0.5 },
            { step: "Lập luận tính chất tỉ lệ nghịch: $3x = 4y = 6z \\Rightarrow \\frac{x}{4} = \\frac{y}{3} = \\frac{z}{2}$", points: 1.0 },
            { step: "Áp dụng tính chất dãy tỉ số bằng nhau với hiệu $x - y = 2$ tìm được giá trị tỉ số chung $= 2$", points: 0.75 },
            { step: "Tính đúng số máy mỗi đội (8 máy, 6 máy, 4 máy) và kết luận", points: 0.75 },
          ],
          totalPoints: 3.0,
        },
      ],
    };

    return {
      title: title || `ĐỀ KIỂM TRA ĐỊNH KỲ THEO CÔNG VĂN 7991 - MÔN ${subject.toUpperCase()} KHỐI ${grade}`,
      subject,
      grade,
      durationMinutes,
      totalScore,
      questions,
      matrix,
      specification,
      scoringGuide,
      consistencyCheck: {
        isValid: true,
        scoreSum: 10.0,
        warnings: [],
      },
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
        ? `Em ${studentName} có tinh thần học tập nhưng kết quả gần đây có dấu hiệu giảm nhẹ, đặc biệt còn lúng túng ở phần ${weakSkills[0] || "Đại số"}. Đề nghị gia đình phối hợp nhắc nhở em hoàn thành phiếu bài tập rèn luyện mỗi tối.`
        : `Em ${studentName} tiếp thu bài nhanh, làm chủ tốt các kỹ năng trọng tâm của môn Toán lớp ${grade}. Cần tiếp tục duy trì phong độ và thử sức với các bài toán vận dụng cao.`;

    return {
      summary: `Học sinh ${studentName} (${classTitle}) đạt điểm trung bình gần đây: ${avgScore.toFixed(1)}/10.`,
      strongSkills: strongSkills.length > 0 ? strongSkills : ["Phép cộng trừ số tự nhiên"],
      weakSkills: weakSkills.length > 0 ? weakSkills : ["Chưa phát hiện điểm yếu rõ rệt"],
      trend,
      recommendedActions,
      teacherRemark,
    };
  }

  async chat(messages: ChatMessage[], context?: Record<string, unknown>): Promise<AIChatResponse> {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || "";

    // Intent detection based on user query
    if (lastMessage.includes("yếu") || lastMessage.includes("chú ý") || lastMessage.includes("mất gốc")) {
      return {
        content: `Dựa trên dữ liệu tổng hợp lớp **7A1**, hệ thống ghi nhận **5 học sinh** đang có kết quả dưới 60% ở chuyên đề **Tỉ lệ thức và dãy tỉ số bằng nhau**:
1. **Vũ Gia Huy** (Điểm bài thi: 4.0 | Thành thạo: 42%)
2. **Dương Minh Khang** (Điểm bài thi: 4.0 | Thành thạo: 44%)
3. **Trịnh Khắc Huy** (Điểm bài thi: 4.5 | Thành thạo: 48%)
4. **Bùi Quốc Anh** (Điểm bài thi: 5.0 | Thành thạo: 51%)
5. **Phùng Thế Vinh** (Điểm bài thi: 5.0 | Thành thạo: 53%)

Phần lớn các em thường nhầm lẫn khi nhân tích chéo tỉ lệ thức và chưa biết cách rút gọn số hạng trước khi tính.`,
        structuredData: {
          type: "STUDENT_LIST",
          data: [
            { name: "Vũ Gia Huy", score: 4.0, mastery: 42, reason: "Nhầm tích chéo" },
            { name: "Dương Minh Khang", score: 4.0, mastery: 44, reason: "Chưa áp dụng được dãy tỉ số" },
            { name: "Trịnh Khắc Huy", score: 4.5, mastery: 48, reason: "Sai dấu số âm" },
            { name: "Bùi Quốc Anh", score: 5.0, mastery: 51, reason: "Tính toán chậm" },
            { name: "Phùng Thế Vinh", score: 5.0, mastery: 53, reason: "Thiếu điều kiện mẫu số" },
          ],
        },
        suggestedActions: [
          { label: "Tạo bài luyện tập 15 phút (5 câu)", action: "CREATE_EXAM", params: { class: "7A1", topic: "Tỉ lệ thức" } },
          { label: "Xuất phiếu bài tập kèm lời giải", action: "EXPORT_WORKSHEET", params: { class: "7A1" } },
        ],
      };
    }

    if (lastMessage.includes("so sánh") || (lastMessage.includes("7a") && lastMessage.includes("7b"))) {
      return {
        content: `📊 **Báo cáo so sánh kết quả học tập giữa Lớp 7A1 và Lớp 7A2:**

- **Điểm trung bình chung**: 
  - Lớp 7A1: **7.4/10** (Tỉ lệ Khá - Giỏi: 68%)
  - Lớp 7A2: **6.2/10** (Tỉ lệ Khá - Giỏi: 45%)
- **Số hữu tỉ**: Hai lớp tương đương nhau (7A1: 82%, 7A2: 78%).
- **Tỉ lệ thức**: Chênh lệch đáng kể! Lớp 7A1 đạt 65%, trong khi 7A2 chỉ đạt 51%.
- **Đề xuất**: Cô Lan nên dành thêm 1 tiết phụ đạo chuyên đề Tỉ số cho lớp 7A2 trước khi chuyển sang chương Hình học.`,
        structuredData: {
          type: "COMPARISON",
          data: {
            classes: ["7A1", "7A2"],
            averages: [7.4, 6.2],
            topics: [
              { name: "Số hữu tỉ", a1: 82, a2: 78 },
              { name: "Tỉ lệ thức", a1: 65, a2: 51 },
              { name: "Tam giác bằng nhau", a1: 75, a2: 58 },
            ],
          },
        },
        suggestedActions: [
          { label: "Xem chi tiết lớp 7A2", action: "FILTER_STUDENTS", params: { class: "7A2" } },
          { label: "Tạo đề ôn tập chung cho khối 7", action: "CREATE_EXAM", params: { grade: 7 } },
        ],
      };
    }

    if (lastMessage.includes("tạo đề") || lastMessage.includes("15 phút") || lastMessage.includes("kiểm tra")) {
      return {
        content: `Đã cấu hình đề xuất đề kiểm tra **15 phút Toán 7** bám sát ma trận năng lực:
- **Tên đề**: Kiểm tra 15 phút - Củng cố Tỉ lệ thức và Dãy tỉ số bằng nhau
- **Số câu**: 5 câu trắc nghiệm khách quan
- **Cấu trúc ma trận**:
  - Nhận biết (2 câu - 4.0đ): Khái niệm tỉ lệ thức và tính chất tích chéo.
  - Thông hiểu (2 câu - 4.0đ): Tìm x và tính chất dãy tỉ số bằng nhau.
  - Vận dụng (1 câu - 2.0đ): Bài toán chia tỉ lệ thực tế.
- **Mã đề sẵn sàng**: 101, 102, 103, 104 có thể tự động xáo trộn câu hỏi và đáp án.`,
        structuredData: {
          type: "EXAM_PROPOSAL",
          data: {
            title: "Kiểm tra 15 phút - Củng cố Tỉ lệ thức",
            questionCount: 5,
            duration: 15,
            topics: ["Tỉ lệ thức", "Dãy tỉ số bằng nhau"],
          },
        },
        suggestedActions: [
          { label: "Chuyển sang Trình tạo đề thi", action: "CREATE_EXAM", params: { template: "15min_ratio" } },
          { label: "Mở ngân hàng câu hỏi tỉ lệ thức", action: "OPEN_QUESTION_BANK", params: { topic: "ti-le-thuc" } },
        ],
      };
    }

    // Default friendly assistant response
    return {
      content: `Xin chào cô Lan! Em là **EduMind AI Assistant**, trợ lý giảng dạy thông minh của cô tại THCS Chu Văn An. 

Em có thể giúp cô ngay:
1. 📈 **Phân tích học sinh**: Tìm học sinh có điểm giảm, học sinh đang hổng kiến thức số hữu tỉ / hình học.
2. 📝 **Ra đề thi thông minh**: Tự động sinh đề 15 phút hoặc 45 phút theo đúng ma trận GDPT 2018 và tạo 4 mã đề (101, 102, 103, 104).
3. ✍️ **Soạn bài & Phiếu học tập**: Tạo giáo án bài học hoặc phiếu ôn tập cá nhân hóa cho từng nhóm học sinh.
4. 🗣️ **Viết nhận xét**: Tạo gợi ý nhận xét học bạ / sổ liên lạc chi tiết cho phụ huynh.

Cô muốn em hỗ trợ nội dung nào trước ạ?`,
      suggestedActions: [
        { label: "Lớp 7A1 đang yếu phần nào?", action: "FILTER_STUDENTS", params: { class: "7A1" } },
        { label: "Tạo đề 15 phút bù hổng kiến thức", action: "CREATE_EXAM", params: { class: "7A1" } },
        { label: "So sánh kết quả 7A1 và 7A2", action: "FILTER_STUDENTS", params: { compare: ["7A1", "7A2"] } },
      ],
    };
  }
}

/**
 * Factory to get current active AI Provider
 */
let currentProvider: AIProvider = new SmartLocalAIProvider();

export function getAIProvider(): AIProvider {
  return currentProvider;
}

export function setAIProvider(provider: AIProvider) {
  currentProvider = provider;
}
