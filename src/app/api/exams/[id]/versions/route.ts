import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { versionCount = 4, shuffleAnswers = true } = body;

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: {
              include: { answers: true },
            },
          },
          orderBy: { orderNumber: "asc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Không tìm thấy đề thi" }, { status: 404 });
    }

    // Delete existing versions that don't have attempts
    await prisma.examVersion.deleteMany({
      where: {
        examId: id,
        attempts: { none: {} },
      },
    });

    const defaultCodes = ["101", "102", "103", "104", "105", "106"];
    const createdVersions = [];

    for (let v = 0; v < Math.min(versionCount, defaultCodes.length); v++) {
      const code = defaultCodes[v];

      // Clone question array and shuffle
      const qList = [...exam.questions];
      if (v > 0) {
        qList.sort(() => Math.random() - 0.5);
      }

      // Map answer key
      const answerKeyObj: Record<string, string> = {};
      const orderList = qList.map((eq, qIdx) => {
        const correctAns = eq.question.answers.find((a) => a.isCorrect);
        answerKeyObj[qIdx + 1] = correctAns?.label || "A";
        return eq.questionId;
      });

      const version = await prisma.examVersion.upsert({
        where: {
          examId_versionCode: {
            examId: id,
            versionCode: code,
          },
        },
        update: {
          questionOrder: JSON.stringify(orderList),
          answerKey: JSON.stringify(answerKeyObj),
        },
        create: {
          examId: id,
          versionCode: code,
          questionOrder: JSON.stringify(orderList),
          answerKey: JSON.stringify(answerKeyObj),
        },
      });

      createdVersions.push(version);
    }

    return NextResponse.json({
      success: true,
      versions: createdVersions,
    });
  } catch (error) {
    console.error("Generate Versions Error:", error);
    return NextResponse.json({ error: "Lỗi sinh mã đề" }, { status: 500 });
  }
}
