import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const warning = searchParams.get("warning");
    const search = searchParams.get("search");

    const where: any = {};
    if (classId) where.classId = classId;
    if (warning === "true") where.status = "WARNING";
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { studentCode: { contains: search } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        class: {
          select: { id: true, name: true, gradeLevel: true },
        },
        examAttempts: {
          select: { score: true, maxScore: true },
        },
        studentSkills: {
          include: { skill: true },
        },
      },
      orderBy: [{ class: { name: "asc" } }, { studentCode: "asc" }],
    });

    const studentsFormatted = students.map((s) => {
      const scores = s.examAttempts.map((a) => a.score);
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";
      
      const weakSkills = s.studentSkills.filter((sk) => sk.masteryScore < 60);
      const lowestSkill = s.studentSkills.sort((a, b) => a.masteryScore - b.masteryScore)[0];

      return {
        id: s.id,
        studentCode: s.studentCode,
        name: s.name,
        gender: s.gender,
        birthday: s.birthday,
        parentPhone: s.parentPhone,
        status: s.status,
        classId: s.classId,
        className: s.class.name,
        gradeLevel: s.class.gradeLevel,
        averageScore: avg,
        weakSkillsCount: weakSkills.length,
        lowestSkillName: lowestSkill?.skill.name || "Chưa có",
        lowestSkillScore: lowestSkill?.masteryScore ?? null,
      };
    });

    return NextResponse.json(studentsFormatted);
  } catch (error) {
    console.error("Students GET API Error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách học sinh" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if bulk import or single student
    if (body.bulkStudents && Array.isArray(body.bulkStudents)) {
      const { classId, bulkStudents } = body;
      if (!classId) {
        return NextResponse.json({ error: "Vui lòng chọn lớp học" }, { status: 400 });
      }

      const created = [];
      for (const item of bulkStudents) {
        if (!item.name || !item.studentCode) continue;
        const student = await prisma.student.upsert({
          where: {
            classId_studentCode: {
              classId,
              studentCode: item.studentCode.trim(),
            },
          },
          update: {
            name: item.name.trim(),
            gender: item.gender || "Nam",
            birthday: item.birthday,
            parentPhone: item.parentPhone,
          },
          create: {
            classId,
            studentCode: item.studentCode.trim(),
            name: item.name.trim(),
            gender: item.gender || "Nam",
            birthday: item.birthday,
            parentPhone: item.parentPhone,
            status: item.status || "ACTIVE",
          },
        });
        created.push(student);
      }

      return NextResponse.json({ count: created.length, students: created }, { status: 201 });
    }

    // Single creation
    const { classId, studentCode, name, gender = "Nam", birthday, parentPhone, status = "ACTIVE" } = body;
    if (!classId || !studentCode || !name) {
      return NextResponse.json({ error: "Vui lòng điền đủ Lớp, Mã học sinh và Họ tên" }, { status: 400 });
    }

    const newStudent = await prisma.student.create({
      data: {
        classId,
        studentCode: studentCode.trim(),
        name: name.trim(),
        gender,
        birthday,
        parentPhone,
        status,
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Create Student API Error:", error);
    return NextResponse.json({ error: "Không thể thêm học sinh" }, { status: 500 });
  }
}
