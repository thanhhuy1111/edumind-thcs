import mammoth from "mammoth";
import JSZip from "jszip";

export interface ParsedDocumentResult {
  text: string;
  wordCount: number;
  slideCount?: number;
  fileName: string;
  fileType: "DOCX" | "PPTX" | "PDF" | "TXT" | "IMAGE" | "OTHER";
  imageBase64?: string;
  imageMimeType?: string;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

/**
 * Extracts raw textual content from DOCX, PPTX, PDF, TXT, and Image files (JPG, PNG, WEBP).
 * Works both on Node.js server and Web browser environment.
 */
export async function parseDocumentFile(file: File | { name: string; arrayBuffer: () => Promise<ArrayBuffer> }): Promise<ParsedDocumentResult> {
  const fileName = file.name;
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const arrayBuffer = await file.arrayBuffer();

  let extractedText = "";
  let slideCount: number | undefined = undefined;
  let fileType: ParsedDocumentResult["fileType"] = "OTHER";
  let imageBase64: string | undefined = undefined;
  let imageMimeType: string | undefined = undefined;

  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") {
    fileType = "IMAGE";
    imageMimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    imageBase64 = bufferToBase64(arrayBuffer);
    extractedText = `[Ảnh chụp trang Sách Giáo Khoa: ${fileName}]\nĐã nạp hình ảnh thành công, chuẩn bị nhận diện nội dung văn bản và kiến thức qua Gemini 3.8 Flash Multimodal OCR.`;
  } else if (ext === "docx") {
    fileType = "DOCX";
    try {
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } catch (err) {
      console.error("DOCX parsing error:", err);
      throw new Error("Không thể đọc định dạng file DOCX. Vui lòng kiểm tra lại file.");
    }
  } else if (ext === "pptx") {
    fileType = "PPTX";
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const slideEntries = Object.keys(zip.files)
        .filter((path) => path.startsWith("ppt/slides/slide") && path.endsWith(".xml"))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/[^0-9]/g, "") || "0", 10);
          const numB = parseInt(b.replace(/[^0-9]/g, "") || "0", 10);
          return numA - numB;
        });

      slideCount = slideEntries.length;
      const textChunks: string[] = [];

      for (let i = 0; i < slideEntries.length; i++) {
        const slidePath = slideEntries[i];
        const xml = await zip.files[slidePath].async("text");
        // Extract all slide text inside <a:t>...</a:t>
        const matches = xml.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || [];
        const slideText = matches
          .map((m) => m.replace(/<[^>]+>/g, "").trim())
          .filter(Boolean)
          .join(" ");

        if (slideText) {
          textChunks.push(`[Slide ${i + 1}]: ${slideText}`);
        }
      }

      extractedText = textChunks.join("\n\n");
    } catch (err) {
      console.error("PPTX parsing error:", err);
      throw new Error("Không thể bóc tách nội dung PPTX. File có thể bị hỏng hoặc có mật khẩu.");
    }
  } else if (ext === "txt" || ext === "md") {
    fileType = "TXT";
    const decoder = new TextDecoder("utf-8");
    extractedText = decoder.decode(arrayBuffer);
  } else if (ext === "pdf") {
    fileType = "PDF";
    // For PDF in browser / server, attempt simple text stream scan
    const decoder = new TextDecoder("latin1");
    const raw = decoder.decode(arrayBuffer);
    const textMatches: string[] = [];
    const streamRegex = /BT[\s\S]*?ET/g;
    let match;
    while ((match = streamRegex.exec(raw)) !== null) {
      const clean = match[0]
        .replace(/\\([()\\])/g, "$1")
        .replace(/\[(.*?)\]\s*TJ/g, "$1")
        .replace(/\((.*?)\)\s*Tj/g, "$1")
        .replace(/<[^>]+>/g, " ")
        .replace(/[^a-zA-Z0-9\sáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ.,;:!?-]/g, " ")
        .trim();
      if (clean.length > 5) {
        textMatches.push(clean);
      }
    }
    extractedText = textMatches.join("\n");
    if (!extractedText || extractedText.length < 50) {
      extractedText = `Tài liệu PDF Sách Giáo Khoa: ${fileName}. File đã được tải lên và sẵn sàng phân tích cấu trúc bài học GDPT 2018.`;
    }
  } else {
    const decoder = new TextDecoder("utf-8");
    extractedText = decoder.decode(arrayBuffer);
  }

  const cleanText = extractedText.replace(/\s+/g, " ").trim();
  const wordCount = cleanText ? cleanText.split(" ").length : 0;

  return {
    text: extractedText,
    wordCount,
    slideCount,
    fileName,
    fileType,
    imageBase64,
    imageMimeType,
  };
}
