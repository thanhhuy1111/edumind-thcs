# Kế Hoạch Cải Tiến EduMind THCS - Đạt Chuẩn Công Văn 7991 & Giành Giải Cuộc Thi

**Mục tiêu:** Nâng cấp toàn diện ứng dụng EduMind THCS thành sản phẩm công nghệ giáo dục số 1, xuất bản Kế hoạch bài dạy (CV 5512), Slide bài giảng tương tác và Đề kiểm tra định kỳ (CV 7991) với độ chính xác học thuật 100%, giao diện sư phạm chuẩn mực, tính năng xuất bản Word/PDF hoàn hảo và cơ chế AI Hybrid (Gemini API + Local GDPT 2018 Engine).

---

## Danh Sách Hạng Mục Triển Khai (Work Breakdown)

### Giai đoạn 1: Chuẩn hóa Học thuật & Pháp lý Công văn 7991 & 5512
- [x] Phân tích biểu mẫu chuẩn CV 7991/BGDĐT-GDTrH (17/12/2024) và CV 5512/BGDĐT-GDTrH.
- [ ] Cập nhật types và data models trong `src/lib/ai/types.ts` để ma trận 2 chiều phản ánh chính xác 4 dạng thức câu hỏi:
  + Dạng 1: Trắc nghiệm 4 lựa chọn (Biết, Hiểu, Vận dụng)
  + Dạng 2: Trắc nghiệm Đúng/Sai 4 ý a-b-c-d (Biết, Hiểu, Vận dụng) kèm quy tắc chấm lũy tiến (0.1 - 0.25 - 0.5 - 1.0)
  + Dạng 3: Trắc nghiệm Trả lời ngắn (Biết, Hiểu, Vận dụng)
  + Dạng 4: Tự luận (Vận dụng, Vận dụng cao)
  + Tổng số câu, Tổng điểm (thang 10), Tỉ lệ %

### Giai đoạn 2: Nâng cấp AI Engine Hybrid (Gemini API + Thư viện Môn học THCS phong phú)
- [ ] Tạo `src/lib/ai/geminiProvider.ts` kết nối trực tiếp Google Gemini API qua Google GenAI REST hoặc SDK với prompt sư phạm chuẩn Bộ GD&ĐT.
- [ ] Mở rộng `SmartLocalAIProvider` trong `src/lib/ai/provider.ts` để hỗ trợ kho dữ liệu thực nghiệm chất lượng cao cho:
  + Môn Toán học (Đại số & Hình học 6, 7, 8, 9)
  + Môn Khoa học tự nhiên (Lý, Hóa, Sinh)
  + Môn Ngữ văn (Đọc hiểu văn bản, Thực hành tiếng Việt, Viết đoạn/bài)
  + Môn Lịch sử & Địa lí
  + Môn Tiếng Anh
  + Môn Âm nhạc
- [ ] Bổ sung cài đặt cấu hình API Key linh hoạt cho giáo viên và giám khảo (Settings / Header Modal).

### Giai đoạn 3: Hoàn thiện Exam Wizard 7991 & Ma trận 2 chiều trực quan
- [ ] Nâng cấp `src/app/(dashboard)/exams/wizard/page.tsx`:
  + Cập nhật bảng Ma trận 2 chiều hiển thị đúng các cột của CV 7991.
  + Bản đặc tả đề thi chuẩn Yêu cầu cần đạt (YCCĐ).
  + Bộ câu hỏi hiển thị rõ Phần I (Nhiều lựa chọn), Phần II (Đúng/Sai a-b-c-d), Phần III (Trả lời ngắn), Phần IV (Tự luận).
  + Barem điểm tính đúng quy tắc lũy tiến Đúng/Sai của Bộ GD&ĐT.
  + Thêm nút **1-Click Presets** (Toán 7, Văn 8, KHTN 7, Âm nhạc 7, Tiếng Anh 7) cho BGK test nhanh.
  + Cải tiến bộ xuất file Word (.doc) theo chuẩn thể thức văn bản hành chính Nghị định 30/2020/NĐ-CP (Quốc hiệu, Tiêu ngữ, Tên trường, Khung ký duyệt BGH/Tổ trưởng).

### Giai đoạn 4: Hoàn thiện Kế hoạch bài dạy (CV 5512) & Slide Studio tương tác
- [ ] Nâng cấp `src/app/(dashboard)/materials/lesson-plan/page.tsx`:
  + Đảm bảo 100% Kế hoạch bài dạy có đủ 4 hoạt động sư phạm và mỗi hoạt động có đủ 4 mục a-b-c-d.
  + Thêm các Preset mẫu theo từng môn học.
  + Xuất Word (.doc) căn chỉnh chuẩn A4, lề 2cm, font Times New Roman 13pt.
- [ ] Nâng cấp `src/app/(dashboard)/materials/slides/page.tsx`:
  + Chế độ trình chiếu toàn màn hình (Fullscreen Presentation) mượt mà.
  + Quiz tương tác chọn đáp án có hiệu ứng âm thanh/chúc mừng trực quan.
  + Bổ sung chức năng In Slide (Print Friendly / PDF).

### Giai đoạn 5: Tính năng "Siêu Cấp" 3-trong-1 (All-in-One Generator)
- [ ] Xây dựng nút "Xuất 1 Chạm Liên Hoàn 3-trong-1" trong `Export Center` và `Trang chủ`:
  + Nhập 1 tên bài học $\rightarrow$ Sinh đồng bộ: Kế hoạch bài dạy + Slide bài giảng + Đề kiểm tra 7991.
  + Tải về gói nén / hồ sơ tài liệu đầy đủ chỉ trong 1 thao tác.

### Giai đoạn 6: Dọn dẹp lỗi Lint & Kiểm thử toàn diện
- [ ] Sửa lỗi `Date.now()` trong `FloatingAIAssistant.tsx`.
- [ ] Kiểm tra `npm run lint` và `npm run build` thành công 100%.
- [ ] Kiểm tra giao diện trên Desktop và Mobile.
