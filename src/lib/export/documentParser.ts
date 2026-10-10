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
 * Compresses large camera photos in browser down to max 1600px width/height and JPEG quality 0.82
 * to ensure request stays well under Vercel serverless 4.5MB payload limit.
 */
async function compressImageInBrowser(file: File | { arrayBuffer: () => Promise<ArrayBuffer> }, mimeType: string): Promise<string> {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer], { type: mimeType });
      const img = new Image();
      const url = URL.createObjectURL(blob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = url;
      });
      URL.revokeObjectURL(url);

      const maxDim = 1600;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        return dataUrl.split(",")[1] || "";
      }
    } catch (e) {
      console.warn("Browser image compression skipped, falling back to direct base64:", e);
    }
  }
  const arrayBuffer = await file.arrayBuffer();
  return bufferToBase64(arrayBuffer);
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
    imageMimeType = "image/jpeg";
    imageBase64 = await compressImageInBrowser(file, ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");
    const estimatedKb = Math.round((imageBase64.length * 3) / 4 / 1024);
    extractedText = `[Ảnh chụp trang Sách Giáo Khoa: ${fileName}]\nĐã nạp hình ảnh thành công (~${estimatedKb} KB), sẵn sàng phân tích cấu trúc bài học GDPT 2018.`;
  } else if (ext === "docx") {
    fileType = "DOCX";
    try {
      if (typeof Buffer !== "undefined") {
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } else {
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value || "";
      }
    } catch (err) {
      console.warn("Mammoth parse error, falling back to XML extraction:", err);
      try {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const documentXml = await zip.files["word/document.xml"]?.async("text");
        if (documentXml) {
          extractedText = documentXml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        } else {
          throw new Error("Không tìm thấy word/document.xml trong file docx");
        }
      } catch (zipErr) {
        console.error("DOCX parsing error:", zipErr);
        throw new Error("Không thể đọc định dạng file DOCX. Vui lòng kiểm tra lại file.");
      }
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
