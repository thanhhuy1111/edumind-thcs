import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed for EduMind THCS - Giáo viên Phan Thị Ngọc Huyền...");

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
      name: "Trường THCS Tân Phong - Vĩnh Long",
      code: "THCS-TANPHONG-VL",
      province: "Vĩnh Long",
      district: "Tân Phong",
    },
  });

  // 2. Teacher (Cô Phan Thị Ngọc Huyền)
  const teacher = await prisma.user.create({
    data: {
      email: "annahuyen889@gmail.com",
      passwordHash: "demo123456",
      name: "Phan Thị Ngọc Huyền",
      role: "TEACHER",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      school: school.name,
      subjects: "Âm nhạc",
      grades: "6, 7, 8, 9",
      phone: "0987313889",
    },
  });

  console.log(`✅ Created Teacher: ${teacher.name} (${teacher.email}) - ${teacher.school}`);

  // 3. Subjects (Primary: Âm nhạc - MUSIC)
  const musicSubject = await prisma.subject.create({
    data: {
      code: "MUSIC",
      name: "Âm nhạc",
      icon: "Music",
      description: "Chương trình Âm nhạc THCS theo định hướng phát triển năng lực GDPT 2018 (Hát, Nhạc cụ, Đọc nhạc, Lí thuyết âm nhạc, Thưởng thức âm nhạc)",
    },
  });

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

  // 4. Curriculum Hierarchy for Music (Khối 6, 7, 8, 9 theo chuẩn GDPT 2018)
  // --- GRADE 7 MUSIC ---
  const ch1Music7 = await prisma.chapter.create({
    data: {
      subjectId: musicSubject.id,
      gradeLevel: 7,
      orderNumber: 1,
      title: "Chủ đề 1: Khai trường",
      description: "Học hát bài Khai trường, Đọc nhạc Bài số 1, Nhịp 2/4 và số chỉ nhịp",
    },
  });

  const lesson1_1_M7 = await prisma.lesson.create({
    data: {
      chapterId: ch1Music7.id,
      orderNumber: 1,
      title: "Bài 1: Học hát bài Khai trường",
      learningOutcomes: "Hát đúng giai điệu và lời ca bài hát Khai trường; biết hát kết hợp vỗ tay hoặc gõ đệm theo phách, nhịp; thể hiện được tình cảm vui tươi, hào hứng của ngày tựu trường.",
    },
  });

  const skill1_1_1_M7 = await prisma.skill.create({
    data: {
      lessonId: lesson1_1_M7.id,
      code: "MUSIC7-CD1-L1-S1",
      name: "Hát đúng giai điệu và tính chất bài hát Khai trường",
      description: "Kỹ thuật lấy hơi, mở khẩu hình, phát âm rõ lời, hát đồng đều hòa giọng với tập thể",
    },
  });

  const skill1_1_2_M7 = await prisma.skill.create({
    data: {
      lessonId: lesson1_1_M7.id,
      code: "MUSIC7-CD1-L1-S2",
      name: "Gõ đệm theo phách và nhịp 2/4 bằng thanh phách",
      description: "Thực hành gõ đệm nhạc cụ gõ theo phách mạnh, phách nhẹ của nhịp 2/4",
    },
  });

  const lesson1_2_M7 = await prisma.lesson.create({
    data: {
      chapterId: ch1Music7.id,
      orderNumber: 2,
      title: "Bài 2: Đọc nhạc Bài số 1 & Nhạc lí Nhịp 2/4",
      learningOutcomes: "Đọc đúng cao độ và trường độ Bài đọc nhạc số 1 (gam Đô trưởng); hiểu khái niệm nhịp 2/4, phách mạnh, phách nhẹ.",
    },
  });

  const skill1_2_1_M7 = await prisma.skill.create({
    data: {
      lessonId: lesson1_2_M7.id,
      code: "MUSIC7-CD1-L2-S1",
      name: "Đọc đúng cao độ trường độ Bài đọc nhạc số 1",
      description: "Đọc đúng các nốt Đô, Rê, Mi, Son, La kết hợp đánh nhịp 2/4",
    },
  });

  const ch2Music7 = await prisma.chapter.create({
    data: {
      subjectId: musicSubject.id,
      gradeLevel: 7,
      orderNumber: 2,
      title: "Chủ đề 2: Tình bạn",
      description: "Học hát bài Nụ cười, Nhạc cụ hòa tấu thanh phách và kèn phím Melodica, Thưởng thức âm nhạc Dân ca Nam Bộ",
    },
  });

  const lesson2_1_M7 = await prisma.lesson.create({
    data: {
      chapterId: ch2Music7.id,
      orderNumber: 1,
      title: "Bài 3: Học hát bài Nụ cười (Nhạc Nga, Lời Việt: Phạm Tuyên)",
      learningOutcomes: "Hát đúng giai điệu, lời ca bài Nụ cười; thể hiện tính chất lạc quan, tươi vui, gắn kết bè bạn.",
    },
  });

  const skill2_1_1_M7 = await prisma.skill.create({
    data: {
      lessonId: lesson2_1_M7.id,
      code: "MUSIC7-CD2-L1-S1",
      name: "Thể hiện sắc thái tình cảm trong thanh nhạc",
      description: "Điều chỉnh âm lượng, sắc thái to nhỏ (f, p) phù hợp với lời ca bài hát",
    },
  });

  const lesson2_2_M7 = await prisma.lesson.create({
    data: {
      chapterId: ch2Music7.id,
      orderNumber: 2,
      title: "Bài 4: Thưởng thức âm nhạc - Dân ca Nam Bộ (Lý cây bông)",
      learningOutcomes: "Nhận biết được đặc điểm của dân ca Nam Bộ qua điệu Lý cây bông; nêu được cảm nhận về giai điệu mộc mạc, ngọt ngào của âm nhạc phương Nam.",
    },
  });

  const skill2_2_1_M7 = await prisma.skill.create({
    data: {
      lessonId: lesson2_2_M7.id,
      code: "MUSIC7-CD2-L2-S1",
      name: "Cảm thụ và nhận biết làn điệu Dân ca Nam Bộ",
      description: "Phân biệt các điệu Lý, Hò Nam Bộ và âm hưởng đờn ca tài tử",
    },
  });

  // --- GRADE 6 MUSIC ---
  const ch1Music6 = await prisma.chapter.create({
    data: {
      subjectId: musicSubject.id,
      gradeLevel: 6,
      orderNumber: 1,
      title: "Chủ đề 1: Vui bước đến trường",
      description: "Học hát bài Mùa khai trường; Nhạc cụ gõ; Các thuộc tính cơ bản của âm thanh có tính nhạc",
    },
  });

  const lesson1_M6 = await prisma.lesson.create({
    data: {
      chapterId: ch1Music6.id,
      orderNumber: 1,
      title: "Bài 1: Hát bài Mùa khai trường & Khám phá âm thanh",
      learningOutcomes: "Nhận biết 4 thuộc tính của âm thanh: Cao độ, Trường độ, Cường độ, Âm sắc.",
    },
  });

  const skill1_M6 = await prisma.skill.create({
    data: {
      lessonId: lesson1_M6.id,
      code: "MUSIC6-CD1-L1-S1",
      name: "Phân biệt 4 thuộc tính cơ bản của âm thanh có tính nhạc",
      description: "Cao độ (trầm/bổng), Trường độ (ngắn/dài), Cường độ (to/nhỏ), Âm sắc (màu sắc âm thanh)",
    },
  });

  const ch2Music6 = await prisma.chapter.create({
    data: {
      subjectId: musicSubject.id,
      gradeLevel: 6,
      orderNumber: 2,
      title: "Chủ đề 2: Cuộc sống tươi đẹp",
      description: "Thưởng thức Đàn Bầu Việt Nam - Cây đàn một dây độc đáo của dân tộc",
    },
  });

  const lesson2_M6 = await prisma.lesson.create({
    data: {
      chapterId: ch2Music6.id,
      orderNumber: 1,
      title: "Bài 2: Nhạc cụ dân tộc Việt Nam - Đàn Bầu",
      learningOutcomes: "Hiểu cấu tạo, nguyên lý phát âm bồi và giá trị nghệ thuật của đàn Bầu trong kho tàng âm nhạc cổ truyền.",
    },
  });

  const skill2_M6 = await prisma.skill.create({
    data: {
      lessonId: lesson2_M6.id,
      code: "MUSIC6-CD2-L1-S1",
      name: "Nhận biết hình dáng và âm sắc nhạc cụ dân tộc Đàn Bầu",
      description: "Đặc điểm một dây, cần đàn, bầu đàn, tạo âm bồi luyến láy đặc sắc",
    },
  });

  // --- GRADE 8 MUSIC ---
  const ch1Music8 = await prisma.chapter.create({
    data: {
      subjectId: musicSubject.id,
      gradeLevel: 8,
      orderNumber: 1,
      title: "Chủ đề 1: Mùa thu ngày khai trường",
      description: "Học hát Mùa thu ngày khai trường; Nhạc lí Gam thứ và Giọng La thứ",
    },
  });

  const lesson1_M8 = await prisma.lesson.create({
    data: {
      chapterId: ch1Music8.id,
      orderNumber: 1,
      title: "Bài 1: Hát bài Mùa thu ngày khai trường & Giọng La thứ",
      learningOutcomes: "Hát bài hát với cảm xúc rộn ràng; nhận biết cấu tạo gam La thứ tự nhiên.",
    },
  });

  const skill1_M8 = await prisma.skill.create({
    data: {
      lessonId: lesson1_M8.id,
      code: "MUSIC8-CD1-L1-S1",
      name: "Nhận biết cấu tạo thang âm gam La thứ tự nhiên",
      description: "Cấu tạo gồm 7 bậc âm: La - Si - Đô - Rê - Mi - Pha - Son - (La), khoảng cách cung và nửa cung",
    },
  });

  // --- GRADE 9 MUSIC ---
  const ch1Music9 = await prisma.chapter.create({
    data: {
      subjectId: musicSubject.id,
      gradeLevel: 9,
      orderNumber: 1,
      title: "Chủ đề 1: Tuổi trẻ và tương lai",
      description: "Học hát Nối vòng tay lớn (Nhạc sĩ Trịnh Công Sơn); Hóa biểu và giọng Đô trưởng, La thứ",
    },
  });

  const lesson1_M9 = await prisma.lesson.create({
    data: {
      chapterId: ch1Music9.id,
      orderNumber: 1,
      title: "Bài 1: Học hát bài Nối vòng tay lớn",
      learningOutcomes: "Hát với khí thế hào hùng, đoàn kết; cảm nhận tinh thần đại đoàn kết dân tộc của nhạc sĩ Trịnh Công Sơn.",
    },
  });

  const skill1_M9 = await prisma.skill.create({
    data: {
      lessonId: lesson1_M9.id,
      code: "MUSIC9-CD1-L1-S1",
      name: "Hát tập thể phong cách hợp xướng hào hùng",
      description: "Kỹ thuật hát dứt khoát, hòa thanh đồng đều, lĩnh xướng truyền cảm",
    },
  });

  // Math chapters for compatibility
  const ch1Math7 = await prisma.chapter.create({
    data: {
      subjectId: mathSubject.id,
      gradeLevel: 7,
      orderNumber: 1,
      title: "Chương 1: Số hữu tỉ",
      description: "Tập hợp các số hữu tỉ và các phép tính số hữu tỉ",
    },
  });
  const lesson1Math7 = await prisma.lesson.create({
    data: { chapterId: ch1Math7.id, orderNumber: 1, title: "Bài 1: Tập hợp các số hữu tỉ" },
  });
  await prisma.skill.create({
    data: {
      lessonId: lesson1Math7.id,
      code: "MATH7-C1-L1-S1",
      name: "Nhận biết và biểu diễn số hữu tỉ trên trục số",
    },
  });

  // 5. Classes for Cô Phan Thị Ngọc Huyền at THCS Tân Phong - Vĩnh Long
  const class6A1 = await prisma.class.create({
    data: {
      teacherId: teacher.id,
      name: "6A1",
      gradeLevel: 6,
      subject: "Âm nhạc",
      schoolYear: "2026-2027",
      roomNumber: "P.Nghệ thuật 1",
      notes: "Lớp học sôi nổi, các em hào hứng tập hát và gõ đệm thanh phách rất nhịp nhàng",
    },
  });

  const class7A1 = await prisma.class.create({
    data: {
      teacherId: teacher.id,
      name: "7A1",
      gradeLevel: 7,
      subject: "Âm nhạc",
      schoolYear: "2026-2027",
      roomNumber: "P.Nghệ thuật 2",
      notes: "Lớp chọn văn thể mỹ, nhiều học sinh có chất giọng tốt, cảm thụ bài hát nhanh",
    },
  });

  const class7A2 = await prisma.class.create({
    data: {
      teacherId: teacher.id,
      name: "7A2",
      gradeLevel: 7,
      subject: "Âm nhạc",
      schoolYear: "2026-2027",
      roomNumber: "P.Nghệ thuật 2",
      notes: "Một số học sinh còn rụt rè khi hát đơn ca, cần khích lệ hoạt động nhóm và vỗ tay theo phách",
    },
  });

  const class8A1 = await prisma.class.create({
    data: {
      teacherId: teacher.id,
      name: "8A1",
      gradeLevel: 8,
      subject: "Âm nhạc",
      schoolYear: "2026-2027",
      roomNumber: "P.Nghệ thuật 1",
      notes: "Học sinh tiếp thu tốt kiến thức nhạc lí và đọc nhạc thang âm La thứ",
    },
  });

  const class9A1 = await prisma.class.create({
    data: {
      teacherId: teacher.id,
      name: "9A1",
      gradeLevel: 9,
      subject: "Âm nhạc",
      schoolYear: "2026-2027",
      roomNumber: "P.Nghệ thuật 1",
      notes: "Các em lớp 9 biểu diễn hợp xướng tự tin, biết sử dụng kèn melodica hòa tấu",
    },
  });

  console.log("✅ Created 5 Music Classes: 6A1, 7A1, 7A2, 8A1, 9A1");

  // 6. Students for Class 7A1
  const students7A1Data = [
    { code: "HS7A101", name: "Nguyễn Lê Bảo An", gender: "Nữ", status: "ACTIVE", notes: "Chất giọng trong trẻo, hát đơn ca rất hay" },
    { code: "HS7A102", name: "Trần Minh Khang", gender: "Nam", status: "ACTIVE", notes: "Chơi sáo recorder tốt, bắt nhịp chuẩn xác" },
    { code: "HS7A103", name: "Lê Huỳnh Mai Anh", gender: "Nữ", status: "ACTIVE", notes: "Cảm thụ âm nhạc tốt, đọc nốt nhạc lưu loát" },
    { code: "HS7A104", name: "Phạm Quốc Bảo", gender: "Nam", status: "ACTIVE", notes: "Gõ đệm thanh phách rất đều nhịp" },
    { code: "HS7A105", name: "Võ Ngọc Thảo Vy", gender: "Nữ", status: "ACTIVE", notes: "Tích cực xung phong biểu diễn trước lớp" },
    { code: "HS7A106", name: "Hoàng Gia Huy", gender: "Nam", status: "WARNING", notes: "Còn rụt rè khi hát, hay quên nhịp phách mạnh nhẹ" },
    { code: "HS7A107", name: "Đặng Thị Phương Linh", gender: "Nữ", status: "ACTIVE", notes: "Nắm vững lý thuyết nhịp 2/4 và 3/4" },
    { code: "HS7A108", name: "Bùi Tuấn Kiệt", gender: "Nam", status: "ACTIVE", notes: "Tham gia đội văn nghệ trường THCS Tân Phong" },
    { code: "HS7A109", name: "Đỗ Kim Ngân", gender: "Nữ", status: "ACTIVE", notes: "Hát bài Dân ca Nam Bộ ngọt ngào" },
    { code: "HS7A110", name: "Hồ Đức Phúc", gender: "Nam", status: "ACTIVE", notes: "Khả năng cảm âm cao độ rất nhạy" },
    { code: "HS7A111", name: "Ngô Mỹ Duyên", gender: "Nữ", status: "ACTIVE", notes: "Lấy hơi đúng chỗ, hát rõ lời ca" },
    { code: "HS7A112", name: "Dương Minh Trí", gender: "Nam", status: "WARNING", notes: "Chưa phân biệt rõ dấu luyến và dấu nối" },
    { code: "HS7A113", name: "Lý Gia Hân", gender: "Nữ", status: "ACTIVE", notes: "Biết đệm kèn melodica theo bài hát" },
    { code: "HS7A114", name: "Phan Trọng Tấn", gender: "Nam", status: "ACTIVE", notes: "Chăm chỉ luyện thanh và gõ phách" },
    { code: "HS7A115", name: "Trịnh Thùy Trang", gender: "Nữ", status: "ACTIVE", notes: "Thuộc lời ca nhanh, biểu cảm gương mặt tự nhiên" },
  ];

  const students7A1 = [];
  for (const s of students7A1Data) {
    const student = await prisma.student.create({
      data: {
        classId: class7A1.id,
        studentCode: s.code,
        name: s.name,
        gender: s.gender,
        status: s.status,
        notes: s.notes,
        birthday: "15/08/2013",
        parentPhone: "090" + Math.floor(1000000 + Math.random() * 9000000),
      },
    });
    students7A1.push(student);

    // Seed student skill competencies for Music 7 using masteryScore (Float)
    await prisma.studentSkill.create({
      data: {
        studentId: student.id,
        skillId: skill1_1_1_M7.id,
        masteryScore: s.status === "WARNING" ? 52.0 : 85.0 + (Math.random() * 10),
        attemptCount: 3,
        correctCount: s.status === "WARNING" ? 1 : 3,
      },
    });

    await prisma.studentSkill.create({
      data: {
        studentId: student.id,
        skillId: skill1_1_2_M7.id,
        masteryScore: s.status === "WARNING" ? 48.0 : 80.0 + (Math.random() * 12),
        attemptCount: 2,
        correctCount: s.status === "WARNING" ? 1 : 2,
      },
    });

    await prisma.studentSkill.create({
      data: {
        studentId: student.id,
        skillId: skill1_2_1_M7.id,
        masteryScore: s.status === "WARNING" ? 55.0 : 82.0 + (Math.random() * 10),
        attemptCount: 2,
        correctCount: s.status === "WARNING" ? 1 : 2,
      },
    });
  }

  // Also seed some students for 6A1, 8A1, 9A1
  const class6Students = [
    { code: "HS6A101", name: "Nguyễn Văn An", gender: "Nam" },
    { code: "HS6A102", name: "Lê Thị Bích", gender: "Nữ" },
    { code: "HS6A103", name: "Trần Minh Cường", gender: "Nam" },
  ];
  for (const s of class6Students) {
    await prisma.student.create({
      data: {
        classId: class6A1.id,
        studentCode: s.code,
        name: s.name,
        gender: s.gender,
        status: "ACTIVE",
        parentPhone: "0918123456",
      },
    });
  }

  // 7. Comprehensive Question Bank for Môn Âm nhạc (Khối 6, 7, 8, 9)
  console.log("🎼 Seeding Music Question Bank...");

  const musicQuestionsData = [
    // GRADE 7 QUESTIONS
    {
      gradeLevel: 7,
      subjectId: musicSubject.id,
      chapterId: ch1Music7.id,
      lessonId: lesson1_1_M7.id,
      skillId: skill1_1_1_M7.id,
      content: "Bài hát 'Khai trường' (Nhạc và lời: Quỳnh Hợp) có tính chất âm nhạc như thế nào?",
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      tags: "am-nhac-7,khai-truong,hoc-hat",
      answers: [
        { label: "A", content: "Vui tươi, rộn ràng, háo hức đón ngày khai giảng", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Tha thiết, trầm buồn, sâu lắng", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Trang nghiêm, hùng tráng như hành khúc", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Êm đềm, nhẹ nhàng như bài hát ru", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Bài hát 'Khai trường' mang giai điệu vui tươi, nhịp điệu rộn ràng, diễn tả niềm hân hoan náo nức của học sinh trong ngày tựu trường.",
      source: "Sách giáo khoa Âm nhạc 7 - GDPT 2018",
    },
    {
      gradeLevel: 7,
      subjectId: musicSubject.id,
      chapterId: ch1Music7.id,
      lessonId: lesson1_2_M7.id,
      skillId: skill1_2_1_M7.id,
      content: "Trong một ô nhịp của nhịp 2/4 có bao nhiêu phách và giá trị độ dài mỗi phách bằng hình nốt nào?",
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      tags: "am-nhac-7,nhip-2-4,nhac-li",
      answers: [
        { label: "A", content: "Có 2 phách, mỗi phách có giá trị bằng một hình nốt đen", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Có 4 phách, mỗi phách có giá trị bằng một hình nốt móc đơn", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Có 2 phách, mỗi phách có giá trị bằng một hình nốt trắng", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Có 3 phách, mỗi phách có giá trị bằng một hình nốt đen", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Định nghĩa nhịp 2/4: Số 2 chỉ trong mỗi ô nhịp có 2 phách; số 4 chỉ giá trị mỗi phách bằng 1 nốt đen (1/4 nốt tròn). Phách 1 mạnh, phách 2 nhẹ.",
      source: "Sách giáo khoa Âm nhạc 7",
    },
    {
      gradeLevel: 7,
      subjectId: musicSubject.id,
      chapterId: ch1Music7.id,
      lessonId: lesson1_2_M7.id,
      skillId: skill1_2_1_M7.id,
      content: "Trong bài đọc nhạc giọng Đô trưởng, thứ tự các bậc âm từ thấp lên cao trên khuông nhạc lần lượt là:",
      questionType: "SINGLE_CHOICE",
      difficulty: "THONG_HIEU",
      tags: "am-nhac-7,gam-do-truong,doc-nhac",
      answers: [
        { label: "A", content: "Đô - Rê - Mi - Pha - Son - La - Si - (Đô)", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "La - Si - Đô - Rê - Mi - Pha - Son - (La)", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Rê - Mi - Pha - Son - La - Si - Đô - (Rê)", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Son - La - Si - Đô - Rê - Mi - Pha - (Son)", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Thang âm gam Đô trưởng (C-dur) cơ bản gồm 7 bậc âm tự nhiên: Đô (C) - Rê (D) - Mi (E) - Pha (F) - Son (G) - La (A) - Si (B) và nốt Đô quãng 8.",
      source: "Sách giáo khoa Âm nhạc 7",
    },
    {
      gradeLevel: 7,
      subjectId: musicSubject.id,
      chapterId: ch2Music7.id,
      lessonId: lesson2_1_M7.id,
      skillId: skill2_1_1_M7.id,
      content: "Bài hát 'Nụ cười' là bài hát thiếu nhi nổi tiếng của nước nào được nhạc sĩ Phạm Tuyên viết lời Việt?",
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      tags: "am-nhac-7,nu-cuoi,pham-tuyen",
      answers: [
        { label: "A", content: "Nước Nga (Liên Xô cũ)", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Nước Pháp", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Nước Đức", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Nước Ý", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Bài hát 'Nụ cười' (nhạc của V. Shainsky) là ca khúc thiếu nhi rất được yêu thích tại nước Nga, được nhạc sĩ Phạm Tuyên đặt lời Việt giàu ý nghĩa nhân văn.",
      source: "Sách giáo khoa Âm nhạc 7",
    },
    {
      gradeLevel: 7,
      subjectId: musicSubject.id,
      chapterId: ch2Music7.id,
      lessonId: lesson2_2_M7.id,
      skillId: skill2_2_1_M7.id,
      content: "Điệu 'Lý cây bông' thuộc thể loại âm nhạc dân gian của vùng miền nào trên đất nước ta?",
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      tags: "am-nhac-7,dan-ca-nam-bo,ly-cay-bong",
      answers: [
        { label: "A", content: "Dân ca Nam Bộ", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Dân ca Quan họ Bắc Ninh", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Dân ca miền Trung (Huế)", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Dân ca các dân tộc Tây Nguyên", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "'Lý cây bông' là một điệu lý dân ca tiêu biểu của đồng bằng Nam Bộ với ca từ mộc mạc 'Bông xanh bông trắng rồi lại vàng bông...', giai điệu phóng khoáng, tình cảm.",
      source: "Âm nhạc dân gian Việt Nam",
    },
    {
      gradeLevel: 7,
      subjectId: musicSubject.id,
      chapterId: ch2Music7.id,
      lessonId: lesson2_1_M7.id,
      skillId: skill2_1_1_M7.id,
      content: "Khi hát kết hợp gõ đệm thanh phách theo phách bài hát viết ở nhịp 2/4, học sinh cần lưu ý điều gì?",
      questionType: "SINGLE_CHOICE",
      difficulty: "VAN_DUNG",
      tags: "am-nhac-7,nhac-cu-go,go-dem",
      answers: [
        { label: "A", content: "Gõ mạnh vào phách 1 và gõ nhẹ vào phách 2 để giữ đúng nhịp phách", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Gõ liên tục thật to ở cả hai phách để tạo không khí ồn ào", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Chỉ gõ ở đầu mỗi câu hát, giữa câu không cần gõ", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Gõ nhanh gấp đôi tốc độ hát của cả lớp", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Quy tắc gõ đệm theo phách của nhịp 2/4: Phách 1 là phách mạnh (nhấn rõ), phách 2 là phách nhẹ (gõ êm hơn), giúp giữ nhịp chắc chắn và hỗ trợ giai điệu bài hát.",
      source: "Phương pháp giảng dạy Âm nhạc THCS",
    },
    {
      gradeLevel: 7,
      subjectId: musicSubject.id,
      chapterId: ch2Music7.id,
      lessonId: lesson2_1_M7.id,
      skillId: skill2_1_1_M7.id,
      content: "Phân biệt dấu nối (tie) và dấu luyến (slur) trong bản nhạc:",
      questionType: "SINGLE_CHOICE",
      difficulty: "THONG_HIEU",
      tags: "am-nhac-7,dau-noi,dau-luyen",
      answers: [
        { label: "A", content: "Dấu nối liên kết các nốt cùng cao độ; dấu luyến liên kết hai hay nhiều nốt khác cao độ", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Dấu nối liên kết các nốt khác cao độ; dấu luyến liên kết các nốt cùng cao độ", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Cả hai dấu đều chỉ dùng để biểu thị ngân dài nốt cuối cùng", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Dấu nối dùng cho giọng hát, dấu luyến chỉ dùng cho đàn piano", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Dấu nối: hình vòng cung nối từ 2 nốt nhạc cùng cao độ (cộng dồn trường độ). Dấu luyến: hình vòng cung nối các nốt khác cao độ (hát liền giọng, không ngắt hơi).",
      source: "Sách giáo khoa Âm nhạc 7",
    },
    {
      gradeLevel: 7,
      subjectId: musicSubject.id,
      chapterId: ch2Music7.id,
      lessonId: lesson2_2_M7.id,
      skillId: skill2_2_1_M7.id,
      content: "Nhạc cụ cổ truyền nào sau đây thường giữ vai trò chủ đạo trong dàn nhạc Đờn ca tài tử Nam Bộ?",
      questionType: "SINGLE_CHOICE",
      difficulty: "THONG_HIEU",
      tags: "am-nhac-7,don-ca-tai-tu,nhac-cu-dan-toc",
      answers: [
        { label: "A", content: "Đàn kìm (đàn nguyệt), đàn tranh, đàn bầu và ghi-ta phím lõm", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Đàn piano, đàn cello và kèn saxophone", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Đàn t'rưng, cồng chiêng và khèn bè", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Trống đồng và tù và", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Dàn nhạc Đờn ca tài tử Nam Bộ thường gồm bộ ngũ tuyệt: Đàn Kìm (chủ trì), đàn Tranh, đàn Cò (nhị), đàn Bầu và sau này có thêm Đàn Ghi-ta phím lõm.",
      source: "Âm nhạc dân tộc học Việt Nam",
    },

    // GRADE 6 QUESTIONS
    {
      gradeLevel: 6,
      subjectId: musicSubject.id,
      chapterId: ch1Music6.id,
      lessonId: lesson1_M6.id,
      skillId: skill1_M6.id,
      content: "Âm thanh có tính nhạc có 4 thuộc tính cơ bản là:",
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      tags: "am-nhac-6,thuoc-tinh-am-thanh",
      answers: [
        { label: "A", content: "Cao độ, trường độ, cường độ và âm sắc", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Giai điệu, lời ca, nhịp điệu và tốc độ", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Tiếng vang, độ ồn, độ trầm và độ rè", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Độ cao, giọng hát, phách và vạch nhịp", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Bốn thuộc tính cơ bản của âm thanh có tính nhạc gồm: Cao độ (độ trầm bổng), Trường độ (độ ngân dài ngắn), Cường độ (độ to nhỏ), Âm sắc (màu sắc riêng của từng giọng/nhạc cụ).",
      source: "Sách giáo khoa Âm nhạc 6",
    },
    {
      gradeLevel: 6,
      subjectId: musicSubject.id,
      chapterId: ch2Music6.id,
      lessonId: lesson2_M6.id,
      skillId: skill2_M6.id,
      content: "Vì sao Đàn Bầu của Việt Nam còn được gọi là 'Độc huyền cầm'?",
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      tags: "am-nhac-6,dan-bau,nhac-cu-dan-toc",
      answers: [
        { label: "A", content: "Vì đàn chỉ có duy nhất một dây gảy tạo nên âm thanh ('độc' = một, 'huyền' = dây)", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Vì đàn chỉ có một người nghệ nhân duy nhất biết chế tác", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Vì đàn chỉ được chơi độc tấu, không thể hòa tấu với dàn nhạc", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Vì tiếng đàn nghe rất độc đáo và vang xa", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "'Độc' nghĩa là duy nhất một, 'huyền' nghĩa là dây đàn, 'cầm' là đàn. Đàn bầu chỉ có một dây căng trên thân đàn nhưng tạo ra âm bồi vô cùng quyến rũ, đậm hồn quê Việt Nam.",
      source: "Sách giáo khoa Âm nhạc 6",
    },
    {
      gradeLevel: 6,
      subjectId: musicSubject.id,
      chapterId: ch1Music6.id,
      lessonId: lesson1_M6.id,
      skillId: skill1_M6.id,
      content: "Nhạc sĩ nào là tác giả của bài Quốc ca Việt Nam (bài hát Tiến quân ca)?",
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      tags: "am-nhac-6,van-cao,tien-quan-ca",
      answers: [
        { label: "A", content: "Nhạc sĩ Văn Cao", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Nhạc sĩ Lưu Hữu Phước", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Nhạc sĩ Phong Nhã", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Nhạc sĩ Phạm Tuyên", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Nhạc sĩ Văn Cao sáng tác bài 'Tiến quân ca' vào cuối năm 1944 tại Hà Nội, sau đó được Chủ tịch Hồ Chí Minh và Quốc hội chọn làm Quốc ca chính thức của nước CHXHCN Việt Nam.",
      source: "Sách giáo khoa Âm nhạc 6",
    },

    // GRADE 8 QUESTIONS
    {
      gradeLevel: 8,
      subjectId: musicSubject.id,
      chapterId: ch1Music8.id,
      lessonId: lesson1_M8.id,
      skillId: skill1_M8.id,
      content: "Giọng La thứ (a-moll) tự nhiên có âm chủ là nốt nào và hóa biểu có bao nhiêu dấu thăng/dấu giáng?",
      questionType: "SINGLE_CHOICE",
      difficulty: "THONG_HIEU",
      tags: "am-nhac-8,giong-la-thu,nhac-li",
      answers: [
        { label: "A", content: "Âm chủ là nốt La (A), hóa biểu không có dấu thăng hoặc dấu giáng nào", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Âm chủ là nốt Đô (C), hóa biểu có 1 dấu thăng (Fa thăng)", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Âm chủ là nốt La (A), hóa biểu có 1 dấu giáng (Si giáng)", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Âm chủ là nốt Rê (D), hóa biểu có 2 dấu thăng", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Giọng La thứ tự nhiên là giọng thứ song song với giọng Đô trưởng: âm chủ là La (A) và hóa biểu không có bất kỳ dấu hóa nào.",
      source: "Sách giáo khoa Âm nhạc 8",
    },
    {
      gradeLevel: 8,
      subjectId: musicSubject.id,
      chapterId: ch1Music8.id,
      lessonId: lesson1_M8.id,
      skillId: skill1_M8.id,
      content: "Dân ca Quan họ Bắc Ninh đã được tổ chức UNESCO vinh danh là Di sản văn hóa phi vật thể đại diện của nhân loại vào năm nào?",
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      tags: "am-nhac-8,quan-ho,unesco",
      answers: [
        { label: "A", content: "Năm 2009", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Năm 2003", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Năm 2015", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Năm 2020", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Ngày 30/9/2009, Dân ca Quan họ Bắc Ninh chính thức được UNESCO công nhận là Di sản văn hóa phi vật thể đại diện của nhân loại.",
      source: "Di sản văn hóa Việt Nam",
    },
    {
      gradeLevel: 8,
      subjectId: musicSubject.id,
      chapterId: ch1Music8.id,
      lessonId: lesson1_M8.id,
      skillId: skill1_M8.id,
      content: "Trong nhịp 3/4, một ô nhịp có 3 phách. Sức mạnh của các phách diễn ra theo quy luật nào?",
      questionType: "SINGLE_CHOICE",
      difficulty: "THONG_HIEU",
      tags: "am-nhac-8,nhip-3-4,nhac-li",
      answers: [
        { label: "A", content: "Phách 1 mạnh, phách 2 nhẹ, phách 3 nhẹ", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Phách 1 mạnh, phách 2 mạnh, phách 3 nhẹ", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Phách 1 nhẹ, phách 2 mạnh, phách 3 nhẹ", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Cả 3 phách đều có độ mạnh bằng nhau", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Quy luật sức mạnh của nhịp 3/4: Phách 1 (Mạnh) - Phách 2 (Nhẹ) - Phách 3 (Nhẹ). Đây là cấu trúc nhịp đặc trưng của điệu Van-xơ (Valse) nhịp nhàng, uyển chuyển.",
      source: "Sách giáo khoa Âm nhạc 8",
    },

    // GRADE 9 QUESTIONS
    {
      gradeLevel: 9,
      subjectId: musicSubject.id,
      chapterId: ch1Music9.id,
      lessonId: lesson1_M9.id,
      skillId: skill1_M9.id,
      content: "Nhạc sĩ Trịnh Công Sơn đã sáng tác bài hát 'Nối vòng tay lớn' với thông điệp cốt lõi nào?",
      questionType: "SINGLE_CHOICE",
      difficulty: "THONG_HIEU",
      tags: "am-nhac-9,trinh-cong-son,noi-vong-tay-lon",
      answers: [
        { label: "A", content: "Tinh thần đoàn kết dân tộc, triệu con tim người Việt nối kết vì hòa bình và yêu thương", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Tình cảm lãng mạn lứa đôi trong những ngày mưa thu", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Miêu tả cảnh lao động sản xuất trên cánh đồng quê hương", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Kỉ niệm chia tay bạn bè dưới mái trường mến yêu", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "'Nối vòng tay lớn' là khúc tráng ca kêu gọi mọi người con đất Việt ở ba miền Bắc - Trung - Nam siết chặt bàn tay đoàn kết, xóa bỏ ranh giới vì tương lai hòa bình.",
      source: "Sách giáo khoa Âm nhạc 9",
    },
    {
      gradeLevel: 9,
      subjectId: musicSubject.id,
      chapterId: ch1Music9.id,
      lessonId: lesson1_M9.id,
      skillId: skill1_M9.id,
      content: "Nhà soạn nhạc người Đức Ludwig van Beethoven nổi tiếng thế giới với tác phẩm nào sau đây?",
      questionType: "SINGLE_CHOICE",
      difficulty: "NHAN_BIET",
      tags: "am-nhac-9,beethoven,co-dien",
      answers: [
        { label: "A", content: "Bản Giao hưởng số 5 (Định mệnh) và Bản sonata Ánh trăng", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Tổ khúc Bốn mùa (Four Seasons)", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Hành khúc Thổ Nhĩ Kỳ", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Vở nhạc kịch Hồ thiên nga", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "L.V. Beethoven (1770 - 1827) là thiên tài âm nhạc cổ điển phương Tây, nổi tiếng với Giao hưởng số 5 Định mệnh, Giao hưởng số 9 Hợp xướng và Sonata Ánh trăng.",
      source: "Sách giáo khoa Âm nhạc 9",
    },
    {
      gradeLevel: 7,
      subjectId: musicSubject.id,
      chapterId: ch2Music7.id,
      lessonId: lesson2_1_M7.id,
      skillId: skill2_1_1_M7.id,
      content: "Để thể hiện tốt một bài hát theo chuẩn định hướng năng lực GDPT 2018, học sinh cần rèn luyện năng lực cốt lõi nào?",
      questionType: "SINGLE_CHOICE",
      difficulty: "VAN_DUNG_CAO",
      tags: "am-nhac-7,nang-luc-am-nhac,gdpt-2018",
      answers: [
        { label: "A", content: "Năng lực thể hiện âm nhạc, cảm thụ và hiểu biết âm nhạc, cùng năng lực ứng dụng sáng tạo", isCorrect: true, orderNumber: 1 },
        { label: "B", content: "Chỉ cần ghi nhớ thật nhiều ngày sinh của các nhạc sĩ cổ điển", isCorrect: false, orderNumber: 2 },
        { label: "C", content: "Học thuộc lòng lời bài hát mà không cần đúng cao độ trường độ", isCorrect: false, orderNumber: 3 },
        { label: "D", content: "Chỉ tập trung nghe nhạc trên điện thoại mà không cần thực hành hát", isCorrect: false, orderNumber: 4 },
      ],
      answer: "A",
      explanation: "Chương trình Giáo dục phổ thông 2018 môn Âm nhạc hình thành và phát triển ở học sinh 3 năng lực đặc thù: 1) Thể hiện âm nhạc; 2) Cảm thụ và hiểu biết âm nhạc; 3) Ứng dụng và sáng tạo âm nhạc.",
      source: "Chương trình GDPT 2018 môn Âm nhạc - Bộ GD&ĐT",
    },
  ];

  for (const q of musicQuestionsData) {
    const { answers, ...questionData } = q;
    await prisma.question.create({
      data: {
        ...questionData,
        teacherId: teacher.id,
        answers: {
          create: answers,
        },
      },
    });
  }

  console.log(`✅ Created ${musicQuestionsData.length} Music Questions in Question Bank`);

  // 8. Sample Exam for Môn Âm nhạc 7 (Kiểm tra định kỳ Giữa kì I - Chuẩn CV 7991)
  console.log("📝 Seeding Music Exam Package...");

  const exam7 = await prisma.exam.create({
    data: {
      teacherId: teacher.id,
      classId: class7A1.id,
      title: "Đề kiểm tra định kỳ Giữa kì I - Môn Âm nhạc Khối 7",
      subject: "Âm nhạc",
      gradeLevel: 7,
      durationMinutes: 45,
      totalScore: 10.0,
      questionCount: 8,
      schoolName: school.name,
      examType: "MID_TERM",
      status: "APPROVED",
      matrixConfig: JSON.stringify({
        subject: "Âm nhạc",
        grade: 7,
        nhanBiet: 40,
        thongHieu: 30,
        vanDung: 20,
        vanDungCao: 10,
        totalScore: 10,
        topics: [
          { name: "Học hát (Khai trường, Nụ cười)", weight: 35 },
          { name: "Lí thuyết & Đọc nhạc (Nhịp 2/4, Gam Đô trưởng)", weight: 35 },
          { name: "Thưởng thức âm nhạc & Nhạc cụ (Dân ca Nam Bộ)", weight: 30 },
        ],
      }),
    },
  });

  // Create 4 versions (101, 102, 103, 104)
  const versions = ["101", "102", "103", "104"];
  const createdVersions = [];
  for (const v of versions) {
    const versionObj = await prisma.examVersion.create({
      data: {
        examId: exam7.id,
        versionCode: v,
        questionOrder: JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7]),
        answerKey: JSON.stringify({
          "1": "A", "2": "A", "3": "A", "4": "A",
          "5": "A", "6": "A", "7": "A", "8": "A",
        }),
      },
    });
    createdVersions.push(versionObj);
  }

  // Create mock student attempts
  for (let i = 0; i < 5; i++) {
    const student = students7A1[i];
    await prisma.examAttempt.create({
      data: {
        examId: exam7.id,
        versionId: createdVersions[i % 4].id,
        studentId: student.id,
        score: 8.5 + (i % 3) * 0.5,
        maxScore: 10.0,
        status: "GRADED",
        gradingDetail: JSON.stringify({
          feedback: "Em có năng khiếu âm nhạc tốt, hát đúng phách nhịp, hiểu rõ cấu tạo nhịp 2/4 và dân ca Nam Bộ.",
          evaluatedBy: "Cô Phan Thị Ngọc Huyền",
        }),
      },
    });
  }

  // 9. Teacher Material: Lesson Plan (Kế hoạch bài dạy 5512) & Slides for Music
  console.log("📚 Seeding Lesson Plan & Slides for Music...");

  await prisma.teacherMaterial.create({
    data: {
      teacherId: teacher.id,
      classId: class7A1.id,
      lessonId: lesson2_1_M7.id,
      title: "Kế hoạch bài dạy (5512): Chủ đề 2 - Tình bạn (Bài hát: Nụ cười & Thưởng thức Dân ca Nam Bộ)",
      type: "LESSON_PLAN",
      content: `KẾ HOẠCH BÀI DẠY (CÔNG VĂN 5512/BGDĐT)
Môn học: Âm nhạc - Lớp 7
Trường: THCS Tân Phong - Vĩnh Long
Giáo viên: Phan Thị Ngọc Huyền
Thời lượng: 1 tiết (45 phút)

I. MỤC TIÊU:
1. Kiến thức:
- Hát đúng cao độ, trường độ bài hát Nụ cười (nhạc Nga, lời Việt: Phạm Tuyên).
- Hiểu được giá trị của làn điệu Dân ca Nam Bộ qua điệu Lý cây bông.
2. Năng lực đặc thù:
- Thể hiện âm nhạc: Tự tin hát đơn ca, song ca và đồng ca kết hợp gõ đệm thanh phách.
- Cảm thụ âm nhạc: Cảm nhận giai điệu lạc quan, trong sáng của tình bạn.
3. Phẩm chất:
- Yêu mến bạn bè, tinh thần đoàn kết, trân trọng âm nhạc dân gian Việt Nam.

II. THIẾT BỊ DẠY HỌC:
- Đàn organ, thanh phách, loa bluetooth, tranh ảnh nhạc cụ Nam Bộ.

III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG):
- HĐ 1 (5p): Khởi động giọng hát với thang âm La - Ma.
- HĐ 2 (20p): Hình thành kiến thức - Dạy hát bài Nụ cười theo lối móc xích.
- HĐ 3 (12p): Luyện tập thực hành gõ đệm thanh phách nhịp 2/4.
- HĐ 4 (8p): Vận dụng sáng tạo - Biểu diễn theo nhóm và nhận xét.`,
      status: "APPROVED",
      metaJson: JSON.stringify({
        subject: "Âm nhạc",
        grade: 7,
        duration: "45 phút",
        school: school.name,
        teacher: teacher.name,
      }),
    },
  });

  await prisma.teacherMaterial.create({
    data: {
      teacherId: teacher.id,
      classId: class7A1.id,
      lessonId: lesson2_1_M7.id,
      title: "Slide bài giảng: Học hát bài Nụ cười (Âm nhạc 7 - Chủ đề Tình bạn)",
      type: "SLIDE_DECK",
      content: "Slide bài giảng Âm nhạc 7 - Học hát bài Nụ cười",
      status: "APPROVED",
      slidesJson: JSON.stringify([
        {
          slideNumber: 1,
          title: "ÂM NHẠC 7 - CHỦ ĐỀ 2: TÌNH BẠN",
          subtitle: "HỌC HÁT BÀI: NỤ CƯỜI (Nhạc Nga, Lời Việt: Phạm Tuyên)",
          mainContent: "Chào mừng các em học sinh lớp 7 đến với giờ học Âm nhạc hôm nay!",
          bullets: [
            "Giáo viên: Cô Phan Thị Ngọc Huyền",
            "Trường: THCS Tân Phong - Vĩnh Long",
            "Thời lượng: 1 tiết (45 phút)",
          ],
          teacherNote: "Tạo không khí phấn khởi, kiểm tra sĩ số và trang thiết bị học tập của các em.",
        },
        {
          slideNumber: 2,
          title: "MỤC TIÊU BÀI HỌC",
          subtitle: "Năng lực âm nhạc cần đạt chuẩn GDPT 2018",
          mainContent: "Sau bài học này, các em sẽ đạt được:",
          bullets: [
            "Hát đúng cao độ, trường độ bài hát Nụ cười với sắc thái tươi vui, trong sáng.",
            "Biết gõ đệm thanh phách nhịp nhàng theo phách 2/4.",
            "Cảm thụ được giá trị của tình bạn và nụ cười trong cuộc sống hằng ngày.",
          ],
          teacherNote: "Nhắc nhở học sinh tập trung lắng nghe giai điệu và chú ý khẩu hình khi hát.",
        },
      ]),
    },
  });

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
