import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed for EduMind THCS...");

  // Clean existing tables in order
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.teacherMaterial.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examVersion.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.questionAnswer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();

  // 1. School
  const school = await prisma.school.create({
    data: {
      name: "Trường THCS Chu Văn An",
      code: "THCS-CVA-HN",
      province: "Hà Nội",
      district: "Tây Hồ",
    },
  });

  // 2. Teacher (Cô Nguyễn Thị Lan)
  const teacher = await prisma.user.create({
    data: {
      email: "lan.nguyen@thcs-cva.edu.vn",
      passwordHash: "demo123456", // simple hash for demo
      name: "Nguyễn Thị Lan",
      role: "TEACHER",
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
      school: school.name,
      subjects: "Toán học",
      grades: "6, 7, 8, 9",
      phone: "0912 345 678",
    },
  });

  console.log(`✅ Created Teacher: ${teacher.name} (${teacher.email})`);

  // 3. Subjects
  const mathSubject = await prisma.subject.create({
    data: {
      code: "MATH",
      name: "Toán học",
      icon: "Calculator",
      description: "Chương trình Toán THCS theo định hướng phát triển năng lực (GDPT 2018)",
    },
  });

  await prisma.subject.createMany({
    data: [
      { code: "ENGLISH", name: "Tiếng Anh", icon: "BookOpen", description: "Tiếng Anh THCS Global Success" },
      { code: "SCIENCE", name: "Khoa học tự nhiên", icon: "FlaskConical", description: "KHTN 6, 7, 8, 9 (Vật lí, Hóa học, Sinh học)" },
      { code: "LITERATURE", name: "Ngữ văn", icon: "PenTool", description: "Ngữ văn THCS Cánh Diều & Kết Nối Tri Thức" },
    ],
  });

  // 4. Curriculum Hierarchy for Math Grade 7
  // Grade 7 - Chapter 1
  const ch1Grade7 = await prisma.chapter.create({
    data: {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      orderNumber: 1,
      title: "Chương 1: Số hữu tỉ",
      description: "Tập hợp các số hữu tỉ và các phép tính cộng, trừ, nhân, chia, lũy thừa số hữu tỉ",
    },
  });

  const lesson1_1 = await prisma.lesson.create({
    data: {
      chapterId: ch1Grade7.id,
      orderNumber: 1,
      title: "Bài 1: Tập hợp các số hữu tỉ",
    },
  });

  const skill1_1_1 = await prisma.skill.create({
    data: {
      lessonId: lesson1_1.id,
      code: "MATH7-C1-L1-S1",
      name: "Nhận biết và biểu diễn số hữu tỉ trên trục số",
      description: "Phân biệt số hữu tỉ, biểu diễn điểm biểu diễn số hữu tỉ và số đối của số hữu tỉ",
    },
  });

  const skill1_1_2 = await prisma.skill.create({
    data: {
      lessonId: lesson1_1.id,
      code: "MATH7-C1-L1-S2",
      name: "Cộng, trừ, nhân, chia số hữu tỉ",
      description: "Thực hiện thành thạo quy tắc cộng, trừ, nhân, chia phân số và số thập phân",
    },
  });

  // Grade 7 - Chapter 2
  const ch2Grade7 = await prisma.chapter.create({
    data: {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      orderNumber: 2,
      title: "Chương 2: Số thực và Tỉ lệ thức",
      description: "Tỉ lệ thức, dãy tỉ số bằng nhau, số vô tỉ và căn bậc hai số học",
    },
  });

  const lesson2_1 = await prisma.lesson.create({
    data: {
      chapterId: ch2Grade7.id,
      orderNumber: 1,
      title: "Bài 6: Tỉ lệ thức và dãy tỉ số bằng nhau",
    },
  });

  const skill2_1_1 = await prisma.skill.create({
    data: {
      lessonId: lesson2_1.id,
      code: "MATH7-C2-L1-S1",
      name: "Tìm giá trị ẩn x, y trong tỉ lệ thức",
      description: "Áp dụng tính chất tích chéo a*d = b*c để tìm số hạng chưa biết trong tỉ lệ thức",
    },
  });

  const skill2_1_2 = await prisma.skill.create({
    data: {
      lessonId: lesson2_1.id,
      code: "MATH7-C2-L1-S2",
      name: "Vận dụng tính chất dãy tỉ số bằng nhau",
      description: "Giải bài toán chia tỉ lệ thực tế (chia tiền thưởng, tỉ số học sinh, chu vi hình chữ nhật)",
    },
  });

  // Grade 7 - Chapter 3 (Hình học)
  const ch3Grade7 = await prisma.chapter.create({
    data: {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      orderNumber: 3,
      title: "Chương 4: Tam giác bằng nhau",
      description: "Các trường hợp bằng nhau của hai tam giác: c-c-c, c-g-c, g-c-g",
    },
  });

  const lesson3_1 = await prisma.lesson.create({
    data: {
      chapterId: ch3Grade7.id,
      orderNumber: 1,
      title: "Bài 13: Hai tam giác bằng nhau. Trường hợp bằng nhau thứ nhất (c-c-c)",
    },
  });

  const skill3_1_1 = await prisma.skill.create({
    data: {
      lessonId: lesson3_1.id,
      code: "MATH7-C4-L1-S1",
      name: "Chứng minh hai tam giác bằng nhau",
      description: "Xác định các cạnh tương ứng bằng nhau và kết luận hai tam giác bằng nhau",
    },
  });

  // Also seed Math 6 and Math 8 chapters
  const ch1Grade6 = await prisma.chapter.create({
    data: {
      subjectId: mathSubject.id,
      gradeLevel: 6,
      orderNumber: 1,
      title: "Chương 1: Tập hợp các số tự nhiên",
    },
  });
  const lesson6_1 = await prisma.lesson.create({
    data: { chapterId: ch1Grade6.id, orderNumber: 1, title: "Bài 1: Tập hợp" },
  });
  const skill6_1_1 = await prisma.skill.create({
    data: { lessonId: lesson6_1.id, code: "MATH6-C1-L1-S1", name: "Ghi số tự nhiên và phần tử tập hợp" },
  });

  const ch1Grade8 = await prisma.chapter.create({
    data: {
      subjectId: mathSubject.id,
      gradeLevel: 8,
      orderNumber: 1,
      title: "Chương 1: Đa thức nhiều biến",
    },
  });
  const lesson8_1 = await prisma.lesson.create({
    data: { chapterId: ch1Grade8.id, orderNumber: 1, title: "Bài 1: Đơn thức và đa thức" },
  });
  const skill8_1_1 = await prisma.skill.create({
    data: { lessonId: lesson8_1.id, code: "MATH8-C1-L1-S1", name: "Thu gọn và tính giá trị của đa thức" },
  });

  // 5. Classes
  const class7A1 = await prisma.class.create({
    data: {
      teacherId: teacher.id,
      name: "7A1",
      gradeLevel: 7,
      subject: "Toán học",
      schoolYear: "2026-2027",
      roomNumber: "P.204",
      notes: "Lớp chọn toán, tiếp thu nhanh, cần tăng cường bài toán vận dụng thực tế",
    },
  });

  const class7A2 = await prisma.class.create({
    data: {
      teacherId: teacher.id,
      name: "7A2",
      gradeLevel: 7,
      subject: "Toán học",
      schoolYear: "2026-2027",
      roomNumber: "P.205",
      notes: "Nhiều học sinh hổng kiến thức số hữu tỉ và tỉ lệ thức, cần phụ đạo thêm",
    },
  });

  const class6A1 = await prisma.class.create({
    data: {
      teacherId: teacher.id,
      name: "6A1",
      gradeLevel: 6,
      subject: "Toán học",
      schoolYear: "2026-2027",
      roomNumber: "P.102",
      notes: "Lớp năng động, thích các trò chơi trắc nghiệm tương tác",
    },
  });

  const class8A1 = await prisma.class.create({
    data: {
      teacherId: teacher.id,
      name: "8A1",
      gradeLevel: 8,
      subject: "Toán học",
      schoolYear: "2026-2027",
      roomNumber: "P.301",
      notes: "Học kỳ 1 chuẩn bị khảo sát chất lượng khối 8 toàn trường",
    },
  });

  console.log("✅ Created 4 classes: 6A1, 7A1, 7A2, 8A1");

  // 6. Students for Class 7A1 (20 students)
  const students7A1Data = [
    { code: "HS7A101", name: "Nguyễn Đức Minh", gender: "Nam", birthday: "2013-03-15", status: "ACTIVE" },
    { code: "HS7A102", name: "Trần Quỳnh Trang", gender: "Nữ", birthday: "2013-05-20", status: "ACTIVE" },
    { code: "HS7A103", name: "Lê Hoàng Nam", gender: "Nam", birthday: "2013-01-12", status: "ACTIVE" },
    { code: "HS7A104", name: "Phạm Phương Linh", gender: "Nữ", birthday: "2013-08-09", status: "ACTIVE" },
    { code: "HS7A105", name: "Vũ Gia Huy", gender: "Nam", birthday: "2013-11-23", status: "WARNING" }, // Struggling
    { code: "HS7A106", name: "Đỗ Hải Đăng", gender: "Nam", birthday: "2013-04-05", status: "ACTIVE" },
    { code: "HS7A107", name: "Hoàng Bảo Ngọc", gender: "Nữ", birthday: "2013-09-18", status: "ACTIVE" },
    { code: "HS7A108", name: "Bùi Quốc Anh", gender: "Nam", birthday: "2013-07-02", status: "WARNING" }, // Struggling
    { code: "HS7A109", name: "Võ Thùy Chi", gender: "Nữ", birthday: "2013-02-14", status: "ACTIVE" },
    { code: "HS7A110", name: "Đặng Tiến Dũng", gender: "Nam", birthday: "2013-06-30", status: "ACTIVE" },
    { code: "HS7A111", name: "Nguyễn Ngọc Ánh", gender: "Nữ", birthday: "2013-10-10", status: "ACTIVE" },
    { code: "HS7A112", name: "Trịnh Khắc Huy", gender: "Nam", birthday: "2013-12-05", status: "WARNING" }, // Struggling
    { code: "HS7A113", name: "Lương Mai Anh", gender: "Nữ", birthday: "2013-03-27", status: "ACTIVE" },
    { code: "HS7A114", name: "Phan Đình Trọng", gender: "Nam", birthday: "2013-05-19", status: "ACTIVE" },
    { code: "HS7A115", name: "Cao Thảo Nguyên", gender: "Nữ", birthday: "2013-08-16", status: "ACTIVE" },
    { code: "HS7A116", name: "Dương Minh Khang", gender: "Nam", birthday: "2013-09-04", status: "WARNING" },
    { code: "HS7A117", name: "Hồ Khánh Vy", gender: "Nữ", birthday: "2013-01-25", status: "ACTIVE" },
    { code: "HS7A118", name: "Ngô Nhật Minh", gender: "Nam", birthday: "2013-04-11", status: "ACTIVE" },
    { code: "HS7A119", name: "Tạ Thị Diễm My", gender: "Nữ", birthday: "2013-07-15", status: "ACTIVE" },
    { code: "HS7A120", name: "Phùng Thế Vinh", gender: "Nam", birthday: "2013-11-08", status: "WARNING" },
  ];

  const createdStudents7A1 = [];
  for (const s of students7A1Data) {
    const student = await prisma.student.create({
      data: {
        classId: class7A1.id,
        studentCode: s.code,
        name: s.name,
        gender: s.gender,
        birthday: s.birthday,
        status: s.status,
        parentPhone: "098" + Math.floor(1000000 + Math.random() * 9000000),
      },
    });
    createdStudents7A1.push(student);
  }

  // Seed 15 students for 7A2
  const students7A2Data = [
    { code: "HS7A201", name: "Trương Bá Lộc", gender: "Nam" },
    { code: "HS7A202", name: "Đào Kim Ngân", gender: "Nữ" },
    { code: "HS7A203", name: "Vương Đình Sang", gender: "Nam" },
    { code: "HS7A204", name: "Mạc Hồng Quân", gender: "Nam" },
    { code: "HS7A205", name: "Nguyễn Hà My", gender: "Nữ" },
    { code: "HS7A206", name: "Lê Văn Thịnh", gender: "Nam" },
    { code: "HS7A207", name: "Hoàng Lan Chi", gender: "Nữ" },
    { code: "HS7A208", name: "Phạm Hữu Đạt", gender: "Nam" },
    { code: "HS7A209", name: "Đoàn Thu Hà", gender: "Nữ" },
    { code: "HS7A210", name: "Thân Trọng Nghĩa", gender: "Nam" },
    { code: "HS7A211", name: "Vũ Thảo Vân", gender: "Nữ" },
    { code: "HS7A212", name: "Nguyễn Hữu Tài", gender: "Nam" },
    { code: "HS7A213", name: "Trần Yến Nhi", gender: "Nữ" },
    { code: "HS7A214", name: "Dương Quốc Bảo", gender: "Nam" },
    { code: "HS7A215", name: "Tô Minh Thư", gender: "Nữ" },
  ];
  for (const s of students7A2Data) {
    await prisma.student.create({
      data: {
        classId: class7A2.id,
        studentCode: s.code,
        name: s.name,
        gender: s.gender,
        status: "ACTIVE",
      },
    });
  }

  // Seed students for 6A1 & 8A1
  const names6A1 = ["Chu Diệu Anh", "Trần Việt Bách", "Đinh Tấn Cường", "Lê Thùy Dương", "Phan Gia Khiêm", "Nguyễn Tuấn Kiệt", "Bùi Mai Lan", "Hoàng Đăng Khôi", "Vũ Nhật Linh", "Ngô Quỳnh Mai", "Lý Thanh Phong", "Dương Tùng Quân", "Đỗ Thái Sơn", "Phạm Trà My", "Hà Vĩnh Thụy"];
  for (let i = 0; i < names6A1.length; i++) {
    await prisma.student.create({
      data: {
        classId: class6A1.id,
        studentCode: `HS6A1${String(i + 1).padStart(2, "0")}`,
        name: names6A1[i],
        gender: i % 2 === 0 ? "Nữ" : "Nam",
      },
    });
  }

  const names8A1 = ["Trần Tuấn Anh", "Nguyễn Thu Cúc", "Phạm Hoàng Dũng", "Lê Hương Giang", "Hoàng Trọng Hiếu", "Vũ Mai Hoa", "Đỗ Quang Khải", "Bùi Lan Hương", "Đặng Minh Long", "Ngô Bích Ngọc", "Phan Tuấn Phát", "Tô Diệu Quyên", "Lương Đức Thành", "Cao Bích Uyên", "Dương Quốc Việt"];
  for (let i = 0; i < names8A1.length; i++) {
    await prisma.student.create({
      data: {
        classId: class8A1.id,
        studentCode: `HS8A1${String(i + 1).padStart(2, "0")}`,
        name: names8A1[i],
        gender: i % 2 === 0 ? "Nam" : "Nữ",
      },
    });
  }

  console.log("✅ Seeded students across all 4 classes");

  // 7. Seed Question Bank (15 rich curated questions for Math 7)
  const questionsData = [
    {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      chapterId: ch2Grade7.id,
      lessonId: lesson2_1.id,
      skillId: skill2_1_1.id,
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      content: "Từ tỉ lệ thức $\\frac{a}{b} = \\frac{c}{d}$ (với $b, d \\neq 0$), khẳng định nào sau đây là đúng?",
      explanation: "Theo tính chất cơ bản của tỉ lệ thức: Nếu $\\frac{a}{b} = \\frac{c}{d}$ thì tích trung tỉ bằng tích ngoại tỉ: $a \\cdot d = b \\cdot c$.",
      source: "SGK Toán 7 Kết nối tri thức - Trang 32",
      tags: "ti-le-thuc,nhan-biet,toan-7",
      isFavorite: true,
      numberOfUses: 12,
      answers: [
        { label: "A", content: "$a \\cdot d = b \\cdot c$", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "$a \\cdot c = b \\cdot d$", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "$a \\cdot b = c \\cdot d$", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "$a + d = b + c$", isCorrect: false, orderNumber: 4 },
      ],
    },
    {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      chapterId: ch2Grade7.id,
      lessonId: lesson2_1.id,
      skillId: skill2_1_1.id,
      questionType: "SINGLE_CHOICE",
      difficulty: "THONG_HIEU",
      content: "Tìm số hữu tỉ $x$ biết: $\\frac{x}{12} = \\frac{5}{6}$.",
      explanation: "Áp dụng tính chất tỉ lệ thức: $x = \\frac{12 \\cdot 5}{6} = \\frac{60}{6} = 10$.",
      source: "SBT Toán 7 Cánh Diều",
      tags: "ti-le-thuc,thong-hieu,toan-7",
      isFavorite: true,
      numberOfUses: 8,
      answers: [
        { label: "A", content: "$x = 10$", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "$x = 8$", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "$x = 15$", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "$x = 12$", isCorrect: false, orderNumber: 4 },
      ],
    },
    {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      chapterId: ch2Grade7.id,
      lessonId: lesson2_1.id,
      skillId: skill2_1_2.id,
      questionType: "SINGLE_CHOICE",
      difficulty: "VAN_DUNG",
      content: "Cho $\\frac{x}{3} = \\frac{y}{5}$ và $x + y = 32$. Giá trị của $x$ và $y$ lần lượt là:",
      explanation: "Áp dụng tính chất dãy tỉ số bằng nhau:\n$\\frac{x}{3} = \\frac{y}{5} = \\frac{x+y}{3+5} = \\frac{32}{8} = 4$.\nDo đó: $x = 3 \\cdot 4 = 12$; $y = 5 \\cdot 4 = 20$.",
      source: "Đề khảo sát Toán 7 Quận Ba Đình",
      tags: "day-ti-so-bang-nhau,van-dung,toan-7",
      isFavorite: true,
      numberOfUses: 15,
      answers: [
        { label: "A", content: "$x = 12; y = 20$", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "$x = 20; y = 12$", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "$x = 14; y = 18$", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "$x = 10; y = 22$", isCorrect: false, orderNumber: 4 },
      ],
    },
    {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      chapterId: ch2Grade7.id,
      lessonId: lesson2_1.id,
      skillId: skill2_1_2.id,
      questionType: "SINGLE_CHOICE",
      difficulty: "VAN_DUNG_CAO",
      content: "Ba lớp 7A, 7B, 7C quyên góp ủng hộ đồng bào lũ lụt tỉ lệ với các số $7; 8; 9$. Biết số tiền lớp 7C quyên góp nhiều hơn lớp 7A là $400.000$ đồng. Hỏi tổng số tiền ba lớp quyên góp là bao nhiêu?",
      explanation: "Gọi số tiền ba lớp quyên góp lần lượt là $a, b, c$ (nghìn đồng).\nTa có: $\\frac{a}{7} = \\frac{b}{8} = \\frac{c}{9}$ và $c - a = 400$.\nÁp dụng tính chất dãy tỉ số bằng nhau:\n$\\frac{a}{7} = \\frac{b}{8} = \\frac{c}{9} = \\frac{c - a}{9 - 7} = \\frac{400}{2} = 200$.\nTổng số tiền: $a + b + c = (7 + 8 + 9) \\cdot 200 = 24 \\cdot 200 = 4.800$ nghìn đồng $= 4.800.000$ đồng.",
      source: "Đề thi học sinh giỏi THCS",
      tags: "toan-thuc-te,van-dung-cao,day-ti-so",
      isFavorite: true,
      numberOfUses: 6,
      answers: [
        { label: "A", content: "$4.800.000$ đồng", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "$4.200.000$ đồng", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "$5.400.000$ đồng", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "$3.600.000$ đồng", isCorrect: false, orderNumber: 4 },
      ],
    },
    {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      chapterId: ch1Grade7.id,
      lessonId: lesson1_1.id,
      skillId: skill1_1_1.id,
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      content: "Số đối của số hữu tỉ $-\\frac{3}{7}$ là:",
      explanation: "Hai số đối nhau có tổng bằng $0$. Số đối của $-\\frac{3}{7}$ là $\\frac{3}{7}$.",
      source: "SGK Toán 7",
      tags: "so-huu-ti,so-doi,nhan-biet",
      isFavorite: false,
      numberOfUses: 9,
      answers: [
        { label: "A", content: "$\\frac{3}{7}$", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "$-\\frac{7}{3}$", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "$\\frac{7}{3}$", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "$-\\frac{3}{7}$", isCorrect: false, orderNumber: 4 },
      ],
    },
    {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      chapterId: ch1Grade7.id,
      lessonId: lesson1_1.id,
      skillId: skill1_1_2.id,
      questionType: "SINGLE_CHOICE",
      difficulty: "THONG_HIEU",
      content: "Kết quả của phép tính $\\left(-\\frac{2}{3}\\right) + \\frac{5}{6}$ bằng:",
      explanation: "Quy đồng mẫu số chung là $6$:\n$\\left(-\\frac{2}{3}\\right) + \\frac{5}{6} = -\\frac{4}{6} + \\frac{5}{6} = \\frac{1}{6}$.",
      source: "SGK Toán 7",
      tags: "so-huu-ti,phep-tinh,thong-hieu",
      isFavorite: false,
      numberOfUses: 11,
      answers: [
        { label: "A", content: "$\\frac{1}{6}$", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "$-\\frac{1}{6}$", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "$\\frac{3}{3} = 1$", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "$\\frac{7}{6}$", isCorrect: false, orderNumber: 4 },
      ],
    },
    {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      chapterId: ch3Grade7.id,
      lessonId: lesson3_1.id,
      skillId: skill3_1_1.id,
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      content: "Cho $\\triangle ABC = \\triangle MNP$. Cặp cạnh tương ứng bằng nhau là:",
      explanation: "Theo định nghĩa hai tam giác bằng nhau, các đỉnh tương ứng: $A \\leftrightarrow M, B \\leftrightarrow N, C \\leftrightarrow P$. Do đó $AB = MN, BC = NP, AC = MP$.",
      source: "SGK Hình học 7",
      tags: "hinh-hoc-7,tam-giac-bang-nhau",
      isFavorite: false,
      numberOfUses: 5,
      answers: [
        { label: "A", content: "$AB = MN$", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "$AB = MP$", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "$BC = MN$", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "$AC = NP$", isCorrect: false, orderNumber: 4 },
      ],
    },
    {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      chapterId: ch2Grade7.id,
      lessonId: lesson2_1.id,
      skillId: skill2_1_1.id,
      questionType: "TRUE_FALSE",
      difficulty: "THONG_HIEU",
      content: "Tỉ số giữa hai số $0{,}8$ và $1{,}2$ bằng tỉ số giữa hai số $2$ và $3$. Khẳng định này Đúng hay Sai?",
      explanation: "Ta có: $\\frac{0{,}8}{1{,}2} = \\frac{8}{12} = \\frac{2}{3}$. Vậy khẳng định là Đúng.",
      source: "SBT Toán 7",
      tags: "ti-le-thuc,dung-sai",
      isFavorite: false,
      numberOfUses: 4,
      answers: [
        { label: "A", content: "Đúng", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Sai", isCorrect: false, orderNumber: 2 },
      ],
    },
    {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      chapterId: ch2Grade7.id,
      lessonId: lesson2_1.id,
      skillId: skill2_1_1.id,
      questionType: "FILL_BLANK",
      difficulty: "THONG_HIEU",
      content: "Điền số thích hợp vào chỗ trống: Cho tỉ lệ thức $\\frac{x}{8} = \\frac{9}{12}$. Khi đó $x =$ ____.",
      explanation: "$x = \\frac{8 \\cdot 9}{12} = \\frac{72}{12} = 6$.",
      source: "Phiếu học tập Toán 7",
      tags: "dien-khuyet,ti-le-thuc",
      isFavorite: false,
      numberOfUses: 7,
      answers: [
        { label: "A", content: "6", isCorrect: true, orderNumber: 1 },
      ],
    },
    {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      chapterId: ch2Grade7.id,
      lessonId: lesson2_1.id,
      skillId: skill2_1_2.id,
      questionType: "SHORT_ANSWER",
      difficulty: "VAN_DUNG",
      content: "Một mảnh đất hình chữ nhật có chu vi $64\\text{ m}$. Biết tỉ số giữa chiều rộng và chiều dài là $\\frac{3}{5}$. Tính diện tích mảnh đất.",
      explanation: "Nửa chu vi mảnh đất: $64 : 2 = 32\\text{ m}$.\nGọi chiều rộng là $a$, chiều dài là $b$ ($a, b > 0$).\n$\\frac{a}{3} = \\frac{b}{5} = \\frac{a+b}{3+5} = \\frac{32}{8} = 4$.\nChiều rộng: $a = 3 \\cdot 4 = 12\\text{ m}$. Chiều dài: $b = 5 \\cdot 4 = 20\\text{ m}$.\nDiện tích: $S = 12 \\cdot 20 = 240\\text{ m}^2$.",
      source: "Đề kiểm tra 1 tiết Toán 7",
      tags: "toan-thuc-te,dien-tich,ti-le",
      isFavorite: true,
      numberOfUses: 8,
      answers: [
        { label: "A", content: "240 m2", isCorrect: true, orderNumber: 1 },
      ],
    },
  ];

  const createdQuestions = [];
  for (const q of questionsData) {
    const { answers, ...qData } = q;
    const question = await prisma.question.create({
      data: {
        ...qData,
        teacherId: teacher.id,
        answer: answers.find((a) => a.isCorrect)?.label || "A",
        answers: {
          create: answers.map((a) => ({
            label: a.label,
            content: a.content,
            isCorrect: a.isCorrect,
            orderNumber: a.orderNumber,
          })),
        },
      },
    });
    createdQuestions.push(question);
  }

  console.log(`✅ Seeded ${createdQuestions.length} Questions in Question Bank`);

  // 8. Exam 1: 15-Minute Test on Tỉ lệ thức for 7A1
  const exam1 = await prisma.exam.create({
    data: {
      teacherId: teacher.id,
      classId: class7A1.id,
      title: "Kiểm tra 15 phút - Tỉ lệ thức và Dãy tỉ số bằng nhau",
      subject: "Toán học",
      gradeLevel: 7,
      durationMinutes: 15,
      totalScore: 10.0,
      questionCount: 5,
      matrixConfig: JSON.stringify({ nhanBiet: 40, thongHieu: 40, vanDung: 20, vanDungCao: 0 }),
      status: "COMPLETED",
      examType: "15MIN",
      schoolName: school.name,
    },
  });

  // Attach questions 0, 1, 2, 4, 5 to exam1
  const exam1QIndices = [0, 1, 2, 4, 5];
  for (let i = 0; i < exam1QIndices.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: exam1.id,
        questionId: createdQuestions[exam1QIndices[i]].id,
        orderNumber: i + 1,
        scorePoints: 2.0,
      },
    });
  }

  // Create 4 versions: 101, 102, 103, 104
  const v101 = await prisma.examVersion.create({
    data: {
      examId: exam1.id,
      versionCode: "101",
      questionOrder: JSON.stringify([1, 2, 3, 4, 5]),
      answerKey: JSON.stringify({ "1": "A", "2": "A", "3": "A", "4": "A", "5": "A" }),
    },
  });

  const v102 = await prisma.examVersion.create({
    data: {
      examId: exam1.id,
      versionCode: "102",
      questionOrder: JSON.stringify([3, 1, 5, 2, 4]),
      answerKey: JSON.stringify({ "1": "A", "2": "A", "3": "A", "4": "A", "5": "A" }),
    },
  });

  await prisma.examVersion.create({
    data: {
      examId: exam1.id,
      versionCode: "103",
      questionOrder: JSON.stringify([2, 5, 1, 4, 3]),
      answerKey: JSON.stringify({ "1": "A", "2": "A", "3": "A", "4": "A", "5": "A" }),
    },
  });

  await prisma.examVersion.create({
    data: {
      examId: exam1.id,
      versionCode: "104",
      questionOrder: JSON.stringify([5, 4, 3, 2, 1]),
      answerKey: JSON.stringify({ "1": "A", "2": "A", "3": "A", "4": "A", "5": "A" }),
    },
  });

  console.log("✅ Created Exam 1 with 4 versions (101, 102, 103, 104)");

  // 9. Exam Attempts & Scores for Class 7A1 students
  // 12 students struggle in Tỉ lệ thức (< 60%), matching requirement:
  // "Lớp 7A1 có 12 học sinh đạt dưới 60% ở chủ đề Tỉ lệ thức."
  const scores7A1 = [
    8.0, 9.0, 8.5, 9.5, 4.0, // Gia Huy: 4.0
    7.5, 8.0, 5.0, 8.0, 7.0, // Bùi Quốc Anh: 5.0
    8.5, 4.5, 9.0, 5.5, 7.5, // Khắc Huy: 4.5, Đình Trọng: 5.5
    4.0, 8.5, 5.0, 8.0, 5.0, // Minh Khang: 4.0, Thế Vinh: 5.0
  ];

  for (let i = 0; i < createdStudents7A1.length; i++) {
    const student = createdStudents7A1[i];
    const score = scores7A1[i] ?? 7.0;
    const version = i % 2 === 0 ? v101 : v102;

    await prisma.examAttempt.create({
      data: {
        examId: exam1.id,
        versionId: version.id,
        studentId: student.id,
        score: score,
        maxScore: 10.0,
        status: "GRADED",
        studentAnswers: JSON.stringify({
          q1: "A",
          q2: score < 6 ? "B" : "A",
          q3: score < 6 ? "C" : "A",
          q4: "A",
          q5: score < 8 ? "B" : "A",
        }),
        gradingDetail: JSON.stringify({
          correctCount: Math.round(score / 2),
          totalQuestions: 5,
          feedback: score >= 8 ? "Làm bài tốt, nắm chắc lý thuyết!" : "Cần rèn luyện thêm kỹ năng tính chéo và tỉ số.",
        }),
      },
    });

    // Seed Student Skill Mastery
    // Skill 1 (Tỉ lệ thức): lower for students with lower scores
    const masteryTiLeThuc = score < 6 ? 45 + Math.random() * 12 : 75 + Math.random() * 20;
    await prisma.studentSkill.create({
      data: {
        studentId: student.id,
        skillId: skill2_1_1.id,
        attemptCount: 5,
        correctCount: score < 6 ? 2 : 4,
        masteryScore: Math.round(masteryTiLeThuc),
      },
    });

    // Skill 2 (Dãy tỉ số bằng nhau)
    await prisma.studentSkill.create({
      data: {
        studentId: student.id,
        skillId: skill2_1_2.id,
        attemptCount: 4,
        correctCount: score < 6 ? 1 : 3,
        masteryScore: Math.round(score < 6 ? 40 + Math.random() * 15 : 70 + Math.random() * 20),
      },
    });

    // Skill 3 (Số hữu tỉ) - relatively stronger
    await prisma.studentSkill.create({
      data: {
        studentId: student.id,
        skillId: skill1_1_2.id,
        attemptCount: 8,
        correctCount: 7,
        masteryScore: Math.round(75 + Math.random() * 20),
      },
    });
  }

  console.log("✅ Seeded Exam Attempts, Scores & Student Skill Mastery");

  // 10. Exam 2 (Draft): 1-Period Test for Class 7A1 & 7A2
  await prisma.exam.create({
    data: {
      teacherId: teacher.id,
      classId: class7A1.id,
      title: "Kiểm tra 1 tiết Đại số 7 - Số hữu tỉ và Số thực",
      subject: "Toán học",
      gradeLevel: 7,
      durationMinutes: 45,
      totalScore: 10.0,
      questionCount: 10,
      matrixConfig: JSON.stringify({ nhanBiet: 30, thongHieu: 40, vanDung: 20, vanDungCao: 10 }),
      status: "READY",
      examType: "45MIN",
      schoolName: school.name,
    },
  });

  // 11. Teacher Materials
  await prisma.teacherMaterial.create({
    data: {
      teacherId: teacher.id,
      classId: class7A1.id,
      type: "LESSON_PLAN",
      title: "Giáo án Bài 6: Tỉ lệ thức và dãy tỉ số bằng nhau (Tiết 12)",
      content: `# GIÁO ÁN TOÁN 7 - BÀI 6: TỈ LỆ THỨC VÀ DÃY TỈ SỐ BẰNG NHAU

## I. MỤC TIÊU BÀI HỌC
1. **Kiến thức**:
   - Nắm vững định nghĩa tỉ lệ thức và các ngoại tỉ, trung tỉ.
   - Hiểu và vận dụng tính chất cơ bản: $a \\cdot d = b \\cdot c$.
2. **Năng lực**:
   - Năng lực tư duy và lập luận toán học.
   - Năng lực giải quyết vấn đề toán học thông qua các ví dụ thực tế.
3. **Phẩm chất**:
   - Chăm chỉ, tích cực tham gia các hoạt động xây dựng bài trên lớp.

## II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
- Máy chiếu, phiếu học tập nhóm, thước kẻ, máy tính cầm tay.

## III. TIẾN TRÌNH DẠY HỌC
- **Hoạt động 1 (Khởi động - 5p)**: Nhắc lại tỉ số giữa hai số thực và so sánh hai tỉ số.
- **Hoạt động 2 (Hình thành kiến thức - 20p)**: Khái niệm tỉ lệ thức và các ví dụ minh họa.
- **Hoạt động 3 (Luyện tập - 15p)**: Tìm ẩn x trong tỉ lệ thức dạng bài trắc nghiệm nhanh.
- **Hoạt động 4 (Vận dụng - 5p)**: Bài toán tính lượng đường và nước cốt dâu khi pha nước giải khát theo tỉ lệ.`,
      metaJson: JSON.stringify({ grade: 7, subject: "Toán học", duration: "45 phút" }),
    },
  });

  await prisma.teacherMaterial.create({
    data: {
      teacherId: teacher.id,
      classId: class7A1.id,
      type: "WORKSHEET",
      title: "Phiếu ôn tập chuyên đề: Dãy tỉ số bằng nhau (Cá nhân hóa nhóm cần chú ý)",
      content: `# PHIẾU BÀI TẬP BỔ TRỢ TOÁN 7
*Dành cho nhóm rèn luyện chuyên sâu tỉ số & tỉ lệ thức*

**Họ và tên:** ...................................... **Lớp:** 7A1

### Phần 1: Tóm tắt công thức trọng tâm
- Nếu $\\frac{a}{b} = \\frac{c}{d}$ thì $a \\cdot d = b \\cdot c$.
- $\\frac{a}{b} = \\frac{c}{d} = \\frac{a+c}{b+d} = \\frac{a-c}{b-d}$ ($b \\neq \\pm d$).

### Phần 2: Bài tập tự luyện
1. Tìm $x$ biết: $\\frac{x}{15} = \\frac{-4}{5}$.
2. Tìm hai số $x, y$ biết $\\frac{x}{2} = \\frac{y}{7}$ và $x + y = 36$.
3. Chia số $60$ thành ba phần tỉ lệ thuận với $2; 3; 5$.`,
      metaJson: JSON.stringify({ grade: 7, targetStudents: ["Vũ Gia Huy", "Bùi Quốc Anh", "Trịnh Khắc Huy"] }),
    },
  });

  // 12. AI Conversation seed
  const conv = await prisma.aIConversation.create({
    data: {
      teacherId: teacher.id,
      classId: class7A1.id,
      title: "Phân tích kết quả lớp 7A1 & Đề xuất bài luyện tập",
    },
  });

  await prisma.aIMessage.create({
    data: {
      conversationId: conv.id,
      role: "user",
      content: "Lớp 7A1 đang yếu phần nào và cần hỗ trợ những học sinh nào cô?",
    },
  });

  await prisma.aIMessage.create({
    data: {
      conversationId: conv.id,
      role: "assistant",
      content: `Dựa trên dữ liệu bài kiểm tra 15 phút gần nhất và chỉ số năng lực kỹ năng của lớp **7A1**:

1. **Chủ đề yếu nhất**: **Tỉ lệ thức và dãy tỉ số bằng nhau** (Mức độ thành thạo trung bình: **54.2%**, thấp hơn 21% so với phần Số hữu tỉ).
2. **Nhóm 5 học sinh cần chú ý đặc biệt**:
   - **Vũ Gia Huy** (Điểm bài thi: 4.0 | Kỹ năng tỉ lệ thức: 42%)
   - **Dương Minh Khang** (Điểm bài thi: 4.0 | Kỹ năng tỉ lệ thức: 44%)
   - **Trịnh Khắc Huy** (Điểm bài thi: 4.5 | Kỹ năng tỉ lệ thức: 48%)
   - **Bùi Quốc Anh** (Điểm bài thi: 5.0 | Kỹ năng tỉ lệ thức: 51%)
   - **Phùng Thế Vinh** (Điểm bài thi: 5.0 | Kỹ năng tỉ lệ thức: 53%)

💡 **Khuyến nghị hành động**:
- Tạo phiếu bài tập cá nhân hóa 5 câu tập trung vào phép nhân chéo và áp dụng dãy tỉ số bằng nhau.
- Tổ chức 10 phút đầu giờ tiết tới để ôn lại ví dụ chia tỉ lệ.`,
      structuredData: JSON.stringify({
        topic: "Tỉ lệ thức",
        averageMastery: 54.2,
        strugglingStudentsCount: 5,
        targetClass: "7A1",
      }),
      suggestedActions: JSON.stringify([
        { label: "Tạo bài luyện tập 15 phút", action: "CREATE_REVISION_EXAM", topic: "Tỉ lệ thức" },
        { label: "Xuất phiếu bài tập cá nhân", action: "EXPORT_WORKSHEET", classId: class7A1.id },
      ]),
    },
  });

  console.log("✅ Seeded AI Conversations & Teaching Materials");
  console.log("🎉 All seed data inserted successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
