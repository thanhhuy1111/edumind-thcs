import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Curriculum catalog for Vietnamese Secondary School (GDPT 2018)
const CURRICULUM_CATALOG: Record<string, Record<number, Array<{
  title: string;
  chapterTitle: string;
  durationPeriods: number;
  learningOutcomes: string;
  skills: string[];
}>>> = {
  MATH: {
    6: [
      {
        title: "Bài 1: Tập hợp các số tự nhiên",
        chapterTitle: "Chương 1: Số tự nhiên và các phép tính",
        durationPeriods: 2,
        learningOutcomes: "Nhận biết tập hợp các số tự nhiên $\\mathbb{N}$ và $\\mathbb{N}^*$. Viết tập hợp bằng hai cách và sử dụng đúng các kí hiệu $\\in, \\notin$.",
        skills: ["Tập hợp và phần tử", "Biểu diễn số tự nhiên trên tia số"],
      },
      {
        title: "Bài 4: Phép cộng và phép nhân số tự nhiên",
        chapterTitle: "Chương 1: Số tự nhiên và các phép tính",
        durationPeriods: 3,
        learningOutcomes: "Thực hiện thành thạo phép cộng và nhân số tự nhiên. Vận dụng tính chất giao hoán, kết hợp, phân phối tính nhanh hợp lý.",
        skills: ["Tính chất giao hoán, kết hợp", "Tính nhẩm và tính nhanh"],
      },
      {
        title: "Bài 7: Dấu hiệu chia hết cho 2, cho 5, cho 3, cho 9",
        chapterTitle: "Chương 1: Số tự nhiên và các phép tính",
        durationPeriods: 3,
        learningOutcomes: "Nhận biết các số chia hết cho 2, 5, 3, 9 dựa vào chữ số tận cùng và tổng các chữ số. Giải thích tính chất chia hết của một tổng.",
        skills: ["Dấu hiệu chia hết", "Phân tích điều kiện chia hết"],
      },
      {
        title: "Bài 13: Tập hợp các số nguyên",
        chapterTitle: "Chương 2: Số nguyên",
        durationPeriods: 2,
        learningOutcomes: "Nhận biết số nguyên âm qua các ví dụ thực tiễn (nhiệt độ âm, độ sâu dưới mực nước biển). Biểu diễn số nguyên trên trục số.",
        skills: ["Nhận dạng số nguyên âm", "So sánh hai số nguyên"],
      },
      {
        title: "Bài 23: Mở rộng phân số và phân số bằng nhau",
        chapterTitle: "Chương 3: Phân số",
        durationPeriods: 3,
        learningOutcomes: "Hiểu khái niệm phân số $\\frac{a}{b}$ với $a, b \\in \\mathbb{Z}, b \\neq 0$. Nhận biết hai phân số bằng nhau khi $a \\cdot d = b \\cdot c$.",
        skills: ["Quy tắc bằng nhau của hai phân số", "Rút gọn phân số về tối giản"],
      },
    ],
    7: [
      {
        title: "Bài 1: Tập hợp các số hữu tỉ",
        chapterTitle: "Chương 1: Số hữu tỉ",
        durationPeriods: 2,
        learningOutcomes: "Nhận biết số hữu tỉ và tập hợp $\\mathbb{Q}$. Biểu diễn số hữu tỉ trên trục số và tìm số đối của một số hữu tỉ.",
        skills: ["Nhận biết số hữu tỉ", "Số đối của số hữu tỉ"],
      },
      {
        title: "Bài 2: Cộng, trừ, nhân, chia số hữu tỉ",
        chapterTitle: "Chương 1: Số hữu tỉ",
        durationPeriods: 4,
        learningOutcomes: "Thực hiện thành thạo các phép tính với số hữu tỉ dưới dạng phân số hoặc số thập phân. Vận dụng quy tắc chuyển vế tìm $x$.",
        skills: ["Phép tính số hữu tỉ", "Quy tắc chuyển vế"],
      },
      {
        title: "Bài 6: Tỉ lệ thức và dãy tỉ số bằng nhau",
        chapterTitle: "Chương 2: Số thực và Tỉ lệ thức",
        durationPeriods: 4,
        learningOutcomes: "Nhận biết định nghĩa tỉ lệ thức $\\frac{a}{b} = \\frac{c}{d}$. Vận dụng tính chất tích chéo $a \\cdot d = b \\cdot c$ và tính chất dãy tỉ số bằng nhau $\\frac{a}{b} = \\frac{c}{d} = \\frac{a+c}{b+d}$ để giải bài toán chia phần tỉ lệ.",
        skills: ["Tìm ẩn trong tỉ lệ thức", "Toán chia phần tỉ lệ thực tế"],
      },
      {
        title: "Bài 7: Đại lượng tỉ lệ thuận",
        chapterTitle: "Chương 2: Số thực và Tỉ lệ thức",
        durationPeriods: 3,
        learningOutcomes: "Nhận biết hai đại lượng tỉ lệ thuận theo công thức $y = kx$ ($k \\neq 0$). Vận dụng tính chất tỉ số hai giá trị tương ứng để giải bài toán chuyển động, tiền công.",
        skills: ["Xác định hệ số tỉ lệ", "Giải toán đại lượng tỉ lệ thuận"],
      },
      {
        title: "Bài 8: Đại lượng tỉ lệ nghịch",
        chapterTitle: "Chương 2: Số thực và Tỉ lệ thức",
        durationPeriods: 3,
        learningOutcomes: "Nhận biết hai đại lượng tỉ lệ nghịch theo công thức $y = \\frac{a}{x}$. Vận dụng giải bài toán năng suất làm việc chung, thời gian và vận tốc.",
        skills: ["Xác định hệ số tỉ lệ nghịch", "Bài toán tỉ lệ nghịch thực tế"],
      },
      {
        title: "Bài 10: Tiên đề Euclid và tính chất hai đường thẳng song song",
        chapterTitle: "Chương 3: Góc và đường thẳng song song",
        durationPeriods: 3,
        learningOutcomes: "Phát biểu được tiên đề Euclid. Nhận biết các cặp góc so le trong, đồng vị bằng nhau khi hai đường thẳng song song bị cắt bởi một cát tuyến.",
        skills: ["Chứng minh hai đường thẳng song song", "Tính số đo góc"],
      },
    ],
    8: [
      {
        title: "Bài 1: Đơn thức và đa thức nhiều biến",
        chapterTitle: "Chương 1: Đa thức",
        durationPeriods: 3,
        learningOutcomes: "Nhận biết đơn thức, đa thức nhiều biến, bậc của đơn thức và đa thức. Thu gọn đa thức và tính giá trị của đa thức tại các giá trị cho trước của biến.",
        skills: ["Nhận dạng đơn thức - đa thức", "Thu gọn và tính giá trị"],
      },
      {
        title: "Bài 3: Hằng đẳng thức đáng nhớ",
        chapterTitle: "Chương 1: Đa thức",
        durationPeriods: 5,
        learningOutcomes: "Nhận biết và vận dụng thành thạo 7 hằng đẳng thức đáng nhớ: $(a+b)^2, (a-b)^2, a^2 - b^2, (a+b)^3, (a-b)^3, a^3 + b^3, a^3 - b^3$.",
        skills: ["Khai triển hằng đẳng thức", "Rút gọn biểu thức đại số"],
      },
      {
        title: "Bài 12: Hình bình hành và Hình chữ nhật",
        chapterTitle: "Chương 3: Tứ giác",
        durationPeriods: 4,
        learningOutcomes: "Mô tả định nghĩa, tính chất và dấu hiệu nhận biết hình bình hành, hình chữ nhật. Vận dụng chứng minh hình học và tính độ dài cạnh, đường chéo.",
        skills: ["Dấu hiệu nhận biết hình bình hành", "Tính chất đường chéo hình chữ nhật"],
      },
      {
        title: "Bài 15: Định lí Thalès trong tam giác",
        chapterTitle: "Chương 4: Định lí Thalès",
        durationPeriods: 4,
        learningOutcomes: "Phát biểu định lí Thalès thuận và đảo trong tam giác. Vận dụng tính độ dài đoạn thẳng và chứng minh hai đường thẳng song song.",
        skills: ["Tỉ số đoạn thẳng", "Định lí Thalès đảo"],
      },
    ],
    9: [
      {
        title: "Bài 1: Phương trình bậc nhất hai ẩn",
        chapterTitle: "Chương 1: Hệ phương trình bậc nhất hai ẩn",
        durationPeriods: 3,
        learningOutcomes: "Nhận biết phương trình bậc nhất hai ẩn $ax + by = c$. Biểu diễn tập nghiệm của phương trình trên mặt phẳng toạ độ.",
        skills: ["Nghiệm của phương trình bậc nhất 2 ẩn", "Biểu diễn hình học tập nghiệm"],
      },
      {
        title: "Bài 2: Hệ hai phương trình bậc nhất hai ẩn",
        chapterTitle: "Chương 1: Hệ phương trình bậc nhất hai ẩn",
        durationPeriods: 4,
        learningOutcomes: "Giải hệ hai phương trình bậc nhất hai ẩn bằng phương pháp thế và phương pháp cộng đại số. Vận dụng giải bài toán bằng cách lập hệ phương trình.",
        skills: ["Phương pháp cộng đại số", "Giải toán bằng cách lập hệ phương trình"],
      },
      {
        title: "Bài 3: Căn bậc hai và Căn thức bậc hai",
        chapterTitle: "Chương 2: Căn bậc hai và căn thức bậc hai",
        durationPeriods: 4,
        learningOutcomes: "Nhận biết căn bậc hai số học của một số không âm. Tìm điều kiện xác định của căn thức bậc hai $\\sqrt{A}$ và vận dụng hằng đẳng thức $\\sqrt{A^2} = |A|$.",
        skills: ["Điều kiện xác định của căn thức", "Rút gọn biểu thức chứa căn"],
      },
      {
        title: "Bài 9: Góc ở tâm và Góc nội tiếp",
        chapterTitle: "Chương 4: Đường tròn",
        durationPeriods: 4,
        learningOutcomes: "Nhận biết góc ở tâm, số đo cung, góc nội tiếp chắn cung. Vận dụng định lí góc nội tiếp bằng nửa số đo cung bị chắn và góc nội tiếp chắn nửa đường tròn là góc vuông.",
        skills: ["Tính số đo cung", "Định lí góc nội tiếp"],
      },
    ],
  },
  SCIENCE: {
    7: [
      {
        title: "Bài 1: Phương pháp và kĩ năng học tập môn Khoa học tự nhiên",
        chapterTitle: "Chương 1: Mở đầu",
        durationPeriods: 2,
        learningOutcomes: "Trình bày được các bước tiến hành nghiên cứu khoa học và sử dụng an toàn các thiết bị phòng thí nghiệm.",
        skills: ["Kĩ năng quan sát", "An toàn phòng thí nghiệm"],
      },
      {
        title: "Bài 4: Phân tử và Đơn chất, Hợp chất",
        chapterTitle: "Chương 2: Chất và sự biến đổi của chất",
        durationPeriods: 4,
        learningOutcomes: "Phân biệt được đơn chất và hợp chất. Tính được khối lượng phân tử dựa vào nguyên tử khối.",
        skills: ["Phân biệt đơn chất - hợp chất", "Tính khối lượng phân tử"],
      },
    ],
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade") ? parseInt(searchParams.get("grade")!, 10) : 7;
    let subjectCode = searchParams.get("subject") || "MATH";

    // Normalize subject codes
    if (subjectCode === "NATURAL_SCIENCES") subjectCode = "SCIENCE";
    if (subjectCode === "LITERATURE") subjectCode = "LITERATURE";

    // 1. First attempt to query DB
    let lessons = await prisma.lesson.findMany({
      where: {
        chapter: {
          gradeLevel: grade,
          subject: { code: subjectCode },
        },
      },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
        skills: true,
        _count: {
          select: {
            materials: true,
            exams: true,
            questions: true,
          },
        },
      },
      orderBy: [
        { chapter: { orderNumber: "asc" } },
        { orderNumber: "asc" },
      ],
    });

    // 2. If DB has no lessons for this grade/subject, auto-seed from standard catalog
    if (lessons.length === 0) {
      const subjectCatalog = CURRICULUM_CATALOG[subjectCode] || CURRICULUM_CATALOG["MATH"];
      const gradeLessons = subjectCatalog[grade] || subjectCatalog[7] || [];

      // Find or create subject
      let dbSubject = await prisma.subject.findFirst({
        where: { code: subjectCode },
      });

      if (!dbSubject) {
        dbSubject = await prisma.subject.create({
          data: {
            code: subjectCode,
            name: subjectCode === "SCIENCE" ? "Khoa học tự nhiên" : "Toán học",
            icon: "Calculator",
            description: "Chương trình chuẩn GDPT 2018",
          },
        });
      }

      // Group by chapter
      for (let i = 0; i < gradeLessons.length; i++) {
        const item = gradeLessons[i];
        let chapter = await prisma.chapter.findFirst({
          where: {
            subjectId: dbSubject.id,
            gradeLevel: grade,
            title: item.chapterTitle,
          },
        });

        if (!chapter) {
          chapter = await prisma.chapter.create({
            data: {
              subjectId: dbSubject.id,
              gradeLevel: grade,
              orderNumber: i + 1,
              title: item.chapterTitle,
              description: `Chương trình lớp ${grade}`,
            },
          });
        }

        const newLesson = await prisma.lesson.create({
          data: {
            chapterId: chapter.id,
            orderNumber: i + 1,
            title: item.title,
            description: `${item.durationPeriods} tiết`,
            learningOutcomes: item.learningOutcomes,
          },
        });

        for (let sIdx = 0; sIdx < item.skills.length; sIdx++) {
          await prisma.skill.create({
            data: {
              lessonId: newLesson.id,
              code: `${subjectCode}${grade}-C${chapter.orderNumber}-L${newLesson.orderNumber}-S${sIdx + 1}`,
              name: item.skills[sIdx],
            },
          });
        }
      }

      // Query again after auto-seeding
      lessons = await prisma.lesson.findMany({
        where: {
          chapter: {
            gradeLevel: grade,
            subject: { code: subjectCode },
          },
        },
        include: {
          chapter: {
            include: {
              subject: true,
            },
          },
          skills: true,
          _count: {
            select: {
              materials: true,
              exams: true,
              questions: true,
            },
          },
        },
        orderBy: [
          { chapter: { orderNumber: "asc" } },
          { orderNumber: "asc" },
        ],
      });
    }

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Fetch Lessons Error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách bài học" }, { status: 500 });
  }
}
