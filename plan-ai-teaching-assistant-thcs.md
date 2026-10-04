# PLAN WEB APP – AI TEACHING ASSISTANT CHO GIÁO VIÊN THCS

## 1. Tổng quan sản phẩm

### Tên định hướng
**AI Teaching Assistant cho giáo viên THCS**

### Định vị
Một trợ lý AI hỗ trợ giáo viên THCS trong các công việc hằng ngày như:

- Soạn bài
- Tạo đề kiểm tra
- Quản lý ngân hàng câu hỏi
- Chấm bài
- Quản lý lớp học
- Theo dõi kết quả học sinh
- Viết nhận xét
- Phân tích năng lực học sinh
- Tạo báo cáo
- Tạo bài luyện tập cá nhân hóa

### Giá trị cốt lõi
Giảm đáng kể thời gian giáo viên phải dành cho các công việc hành chính và chuẩn bị bài ngoài giờ.

### Thông điệp gợi ý
> **Một trợ lý AI hiểu lớp học của bạn.**

---

## 2. Đối tượng người dùng

### Giai đoạn đầu
- Giáo viên THCS
- Ưu tiên giáo viên môn Toán
- Khối 6, 7, 8, 9

### Giai đoạn mở rộng
- Giáo viên Tiếng Anh
- Giáo viên Khoa học tự nhiên
- Giáo viên Ngữ văn
- Tổ trưởng chuyên môn
- Ban giám hiệu
- Trung tâm giáo dục / trường học

---

## 3. Bài toán chính cần giải quyết

| Nhóm nghiệp vụ | Khó khăn hiện tại | Giải pháp trên web app |
|---|---|---|
| Soạn bài | Tốn thời gian chuẩn bị giáo án | AI tạo giáo án theo bài học |
| Ra đề | Tốn thời gian nghĩ câu hỏi, đáp án, ma trận | AI tạo đề theo cấu trúc |
| Ngân hàng câu hỏi | Câu hỏi lưu rời rạc | Quản lý tập trung, phân loại |
| Chấm bài | Chấm thủ công nhiều | Chấm trắc nghiệm, hỗ trợ tự luận |
| Quản lý lớp | Dữ liệu học sinh phân tán | Hồ sơ lớp và học sinh tập trung |
| Theo dõi năng lực | Khó xác định học sinh yếu phần nào | AI phân tích theo chủ đề/kỹ năng |
| Nhận xét | Viết lặp lại nhiều lần | AI tạo nhận xét cá nhân hóa |
| Báo cáo | Tổng hợp thủ công | Tự động tổng hợp |
| Luyện tập | Khó cá nhân hóa theo từng học sinh | AI sinh bài tập theo năng lực |

---

# 4. Các module chính

## 4.1. Quản lý lớp học

### Chức năng
- Tạo lớp
- Gán môn học
- Thêm học sinh
- Import danh sách từ Excel
- Theo dõi trạng thái học sinh
- Xem lịch sử bài kiểm tra
- Xem điểm và tiến độ học tập

### Ví dụ

**Lớp 7A1**

- Môn: Toán
- Sĩ số: 42
- Năm học: 2026–2027

### Hồ sơ học sinh

- Họ tên
- Mã học sinh
- Điểm trung bình
- Điểm theo chủ đề
- Tỷ lệ hoàn thành bài tập
- Chủ đề mạnh
- Chủ đề yếu
- Xu hướng kết quả
- Nhận xét gần nhất

---

# 4.2. AI Soạn bài

### Input

Giáo viên chọn:

- Môn học
- Khối
- Chương
- Bài học
- Thời lượng
- Mục tiêu
- Phương pháp giảng dạy

### AI có thể tạo

- Mục tiêu bài học
- Kiến thức trọng tâm
- Hoạt động giáo viên
- Hoạt động học sinh
- Ví dụ minh họa
- Câu hỏi tương tác
- Bài tập trên lớp
- Bài tập về nhà
- Phiếu học tập

### Action

- Tạo giáo án
- Tạo slide
- Tạo worksheet
- Tạo bài tập
- Lưu vào thư viện cá nhân

---

# 4.3. AI Tạo đề kiểm tra

Đây là module nên ưu tiên trong MVP.

### Cấu hình đề

- Môn
- Khối
- Chương
- Chủ đề
- Thời lượng
- Số câu
- Thang điểm
- Hình thức

### Phân bổ mức độ

Ví dụ:

- Nhận biết: 30%
- Thông hiểu: 40%
- Vận dụng: 20%
- Vận dụng cao: 10%

### Hình thức câu hỏi

- Trắc nghiệm 1 đáp án
- Đúng / Sai
- Điền đáp án
- Tự luận ngắn
- Tự luận dài

### Output

- Đề thi
- Đáp án
- Lời giải
- Thang điểm
- Ma trận đề
- Bảng đặc tả

---

# 4.4. Tạo nhiều mã đề

### Tự động tạo

- Mã đề A
- Mã đề B
- Mã đề C
- Mã đề D

### Có thể đảo

- Thứ tự câu
- Thứ tự đáp án
- Số liệu trong bài
- Biến thể câu hỏi tương đương

### Yêu cầu
Các mã đề phải giữ:

- Cùng mức độ
- Cùng cấu trúc
- Cùng kiến thức kiểm tra
- Tương đương về độ khó

---

# 4.5. Ngân hàng câu hỏi

Mỗi câu hỏi được lưu thành một bản ghi riêng.

### Thuộc tính

- Môn học
- Khối
- Chương
- Bài
- Chủ đề
- Kỹ năng
- Mức độ
- Loại câu hỏi
- Nội dung
- Đáp án
- Lời giải
- Nguồn
- Người tạo
- Ngày tạo
- Số lần sử dụng
- Độ khó thực tế

### Chức năng

- Tạo câu hỏi thủ công
- Tạo câu hỏi bằng AI
- Import câu hỏi
- Tìm kiếm
- Lọc
- Gắn tag
- Sao chép
- Chỉnh sửa
- Lưu yêu thích
- Tạo đề từ ngân hàng

---

# 4.6. Chấm bài

## Giai đoạn 1

### Trắc nghiệm
- Nhập đáp án
- Upload file kết quả
- Chấm tự động
- Tính điểm
- Tổng hợp kết quả

## Giai đoạn 2

### Upload bài làm
Giáo viên có thể:

- Upload ảnh
- Upload PDF
- Upload nhiều bài

AI hỗ trợ:

- Nhận diện nội dung
- Nhận diện đáp án
- So sánh với đáp án chuẩn
- Đề xuất điểm
- Highlight lỗi
- Gợi ý nhận xét

### Lưu ý
AI chỉ nên đề xuất điểm đối với bài tự luận, giáo viên là người xác nhận cuối cùng.

---

# 4.7. Phân tích năng lực học sinh

Mục tiêu là không chỉ lưu điểm mà phải hiểu học sinh đang mạnh/yếu ở đâu.

### Ví dụ

**Nguyễn Văn A**

| Kỹ năng | Mức độ |
|---|---:|
| Số nguyên | 82% |
| Phân số | 75% |
| Đại số | 88% |
| Hình học | 52% |

### Hệ thống phân tích

- Chủ đề mạnh
- Chủ đề yếu
- Sai nhiều dạng nào
- Xu hướng tiến bộ
- Xu hướng giảm
- So sánh với trung bình lớp

---

# 4.8. AI nhận xét học sinh

AI dựa trên dữ liệu học tập thực tế để sinh nhận xét.

### Ví dụ

> Minh có tiến bộ tốt ở phần Đại số trong 4 tuần gần đây. Tuy nhiên, em vẫn gặp khó khăn với các bài toán hình học có nhiều bước suy luận. Nên luyện thêm nhóm bài chứng minh tam giác và bài toán vận dụng hình học.

### Có thể tạo

- Nhận xét tuần
- Nhận xét tháng
- Nhận xét học kỳ
- Nhận xét cuối năm
- Nhận xét gửi phụ huynh

---

# 4.9. Dashboard giáo viên

### Dashboard nên hiển thị

- Lịch dạy hôm nay
- Các lớp đang phụ trách
- Bài chưa chấm
- Học sinh chưa nộp bài
- Học sinh có dấu hiệu giảm kết quả
- Đề gần đây
- Bài kiểm tra gần đây
- Tài liệu gần đây

### AI Suggestion

Ví dụ:

> Lớp 7A đang có 12 học sinh đạt dưới 60% ở chủ đề Tỉ lệ thức.

AI đề xuất:

> Tạo bài luyện tập 15 phút cho nhóm học sinh này.

---

# 4.10. Chat với dữ liệu lớp học

Đây là một feature tạo khác biệt lớn.

### Ví dụ câu hỏi

- Học sinh nào đang yếu phần phân số?
- Ai có điểm giảm trong 4 tuần gần đây?
- So sánh kết quả 7A và 7B.
- Những câu nào học sinh sai nhiều nhất?
- Học sinh nào có nguy cơ mất gốc?
- Tạo bài tập riêng cho 5 học sinh yếu nhất.
- Tạo đề kiểm tra dựa trên phần lớp đang yếu.

### Luồng

**Giáo viên hỏi**

↓  

**AI truy vấn dữ liệu lớp**

↓

**AI phân tích**

↓

**AI trả lời + đề xuất hành động**

---

# 5. MVP đề xuất

Không nên làm toàn bộ ngay từ đầu.

## MVP Version 1

### Module bắt buộc

1. Đăng ký / đăng nhập
2. Hồ sơ giáo viên
3. Quản lý lớp
4. Quản lý học sinh
5. Ngân hàng câu hỏi
6. AI tạo câu hỏi
7. AI tạo đề
8. Tạo nhiều mã đề
9. Xuất Word/PDF
10. Quản lý lịch sử đề

### Có thể thêm

11. Import câu hỏi từ Word/Excel
12. Chấm trắc nghiệm
13. Thống kê điểm cơ bản

---

# 6. Luồng sử dụng chính của MVP

```text
Đăng nhập
    ↓
Tạo lớp
    ↓
Chọn môn / khối
    ↓
Chọn chương / bài
    ↓
Tạo câu hỏi
    ↓
Lưu vào ngân hàng câu hỏi
    ↓
Tạo đề
    ↓
Tạo mã đề
    ↓
Xuất Word/PDF
    ↓
Học sinh làm bài
    ↓
Nhập/chấm kết quả
    ↓
Phân tích
```

---

# 7. Roadmap sản phẩm

## Phase 1 – Teacher Productivity

Mục tiêu: giúp giáo viên giảm thời gian chuẩn bị.

### Chức năng

- AI tạo câu hỏi
- Ngân hàng câu hỏi
- AI tạo đề
- Tạo mã đề
- Giáo án AI
- Worksheet
- Export Word/PDF

---

## Phase 2 – Classroom Management

### Chức năng

- Lớp học
- Học sinh
- Bài tập
- Submission
- Điểm
- Lịch kiểm tra
- Theo dõi tiến độ

---

## Phase 3 – AI Analytics

### Chức năng

- Phân tích năng lực học sinh
- Phân tích lớp
- Skill Mastery
- Phát hiện xu hướng giảm
- AI nhận xét
- Chat với dữ liệu lớp

---

## Phase 4 – Personalized Learning

### AI tự động

- Phân nhóm học sinh
- Tạo bài tập riêng
- Gợi ý bài ôn tập
- Điều chỉnh độ khó
- Theo dõi quá trình tiến bộ

---

## Phase 5 – School Platform

Đối tượng:

- Tổ trưởng chuyên môn
- Ban giám hiệu
- Nhà trường

### Dashboard

- Giáo viên
- Lớp
- Môn
- Chất lượng học tập
- Đề thi
- Kết quả
- Báo cáo

---

# 8. Chiến lược môn học

## Giai đoạn đầu

### Toán THCS

- Toán 6
- Toán 7
- Toán 8
- Toán 9

### Lý do

- Kiến thức có cấu trúc rõ
- Dễ phân loại chủ đề
- Dễ đo lường đúng/sai
- Dễ sinh câu hỏi
- Dễ chấm
- Nhu cầu luyện tập lớn

## Giai đoạn tiếp theo

1. Tiếng Anh
2. Khoa học tự nhiên
3. Ngữ văn
4. Lịch sử
5. Địa lý

---

# 9. Data Model đề xuất

## Core Entity

```text
Teacher
School
Class
Student

Subject
Grade
Chapter
Lesson
Skill

Question
QuestionBank

Exam
ExamVersion
ExamQuestion

ExamAttempt
Answer

Assignment
Submission

Score

StudentSkill
StudentProgress

TeacherMaterial
```

---

# 10. Quan hệ dữ liệu quan trọng

```text
Student
   ↓
ExamAttempt
   ↓
Answer
   ↓
Question
   ↓
Lesson
   ↓
Skill
```

Từ đó hệ thống có thể tính:

```text
Student
→ Skill
→ Mastery Level
```

---

# 11. Một số bảng dữ liệu chính

## Teacher

```text
id
name
email
phone
school_id
subjects
grades
```

## Class

```text
id
teacher_id
name
grade
subject
school_year
student_count
```

## Student

```text
id
class_id
student_code
name
gender
birthday
status
```

## Question

```text
id
subject_id
grade_id
chapter_id
lesson_id
skill_id
question_type
difficulty
content
answer
explanation
source
created_by
created_at
```

## Exam

```text
id
teacher_id
class_id
name
duration
total_score
question_count
created_at
```

## ExamAttempt

```text
id
exam_id
student_id
score
started_at
submitted_at
```

## StudentSkill

```text
student_id
skill_id
attempt_count
correct_count
mastery_score
last_updated
```

---

# 12. AI Architecture đề xuất

## AI không nên hoạt động độc lập

AI cần kết hợp với dữ liệu có cấu trúc.

### Flow

```text
Teacher Prompt
      ↓
Context Builder
      ↓
Subject / Grade / Lesson
      ↓
Question Bank
      ↓
Student Data
      ↓
AI Model
      ↓
Structured Output
      ↓
Validation
      ↓
Teacher Review
```

### Nguyên tắc

- AI không tự ý ghi điểm cuối cùng
- Giáo viên có quyền kiểm duyệt
- Nội dung AI tạo cần lưu nguồn
- Có cơ chế regenerate
- Có version
- Có feedback để cải thiện chất lượng

---

# 13. UI chính

## Sidebar

```text
Dashboard

Lớp học
 ├── Lớp của tôi
 └── Học sinh

Soạn bài
 ├── Giáo án
 ├── Worksheet
 └── Tài liệu

Ngân hàng câu hỏi

Đề kiểm tra
 ├── Tạo đề
 ├── Đề của tôi
 └── Mã đề

Chấm bài

Phân tích

AI Assistant

Thư viện
```

---

# 14. Trang Dashboard

### Header

```text
Xin chào cô Lan 👋
Hôm nay bạn có 4 tiết học.
```

### KPI

```text
6 Lớp
216 Học sinh
12 Bài chưa chấm
8 Học sinh cần chú ý
```

### AI Insight

```text
Lớp 7A có kết quả phần Tỉ lệ thức thấp hơn 18%
so với trung bình các chủ đề khác.
```

CTA:

**Tạo bài luyện tập**

---

# 15. Mô hình kinh doanh gợi ý

## Free

- Số lượng đề giới hạn
- AI credit giới hạn
- Một số template miễn phí

## Teacher Pro

Ví dụ:

**79.000 – 149.000 VNĐ/tháng**

Bao gồm:

- AI tạo đề
- Question Bank
- Export
- AI giáo án
- Analytics
- Lưu trữ

## School

Theo số lượng:

- Giáo viên
- Học sinh
- Module

Có thể báo giá theo năm.

---

# 16. Các chỉ số cần theo dõi

## Product Metrics

- Số giáo viên đăng ký
- Active Teacher / tuần
- Số đề được tạo
- Số câu hỏi được tạo
- Số câu hỏi lưu vào ngân hàng
- Số đề export
- Số lớp được tạo
- Retention 7 ngày
- Retention 30 ngày

## AI Metrics

- Tỷ lệ câu hỏi được giáo viên giữ lại
- Tỷ lệ regenerate
- Tỷ lệ chỉnh sửa
- Tỷ lệ AI suggestion được sử dụng

---

# 17. Competitive Moat

Lợi thế dài hạn không chỉ nằm ở AI.

### Moat nên xây

#### 1. Question Bank

Dữ liệu câu hỏi chất lượng.

#### 2. Teacher Data

Hiểu cách từng giáo viên ra đề.

#### 3. Student Learning Data

Hiểu học sinh yếu ở đâu.

#### 4. Skill Graph

Mapping:

```text
Môn
→ Chương
→ Bài
→ Kỹ năng
→ Câu hỏi
→ Kết quả học sinh
```

#### 5. AI Personalization

AI càng dùng lâu càng hiểu:

- Giáo viên
- Lớp
- Học sinh
- Cách ra đề

---

# 18. Feature tạo khác biệt

## AI Command Center

Giáo viên có thể nhập trực tiếp:

> Tạo cho tôi đề kiểm tra 15 phút cho lớp 7A dựa trên những phần học sinh đang yếu.

Hệ thống:

```text
Phân tích dữ liệu lớp
        ↓
Xác định kỹ năng yếu
        ↓
Chọn câu hỏi
        ↓
AI sinh câu hỏi bổ sung
        ↓
Tạo đề
        ↓
Tạo đáp án
```

Đây nên là trải nghiệm trung tâm của sản phẩm.

---

# 19. Thứ tự ưu tiên phát triển

## P0 – Bắt buộc

- Authentication
- Teacher
- Class
- Student
- Subject
- Grade
- Chapter
- Lesson
- Question Bank
- AI Question Generator
- Exam Builder
- Export

## P1

- Multiple Exam Version
- Auto Grading
- Analytics
- Worksheet
- Lesson Plan

## P2

- AI Student Analysis
- AI Comment
- AI Chat
- Personalized Exercise

## P3

- School Management
- Parent Portal
- Student Portal
- Mobile App

---

# 20. Đề xuất định vị ban đầu

Không nên truyền thông là:

> Phần mềm quản lý giáo viên

Nên truyền thông là:

> **AI Teaching Assistant cho giáo viên THCS**

Hoặc:

> **Một trợ lý AI hiểu lớp học của bạn**

### USP ban đầu

> Tạo đề – quản lý ngân hàng câu hỏi – phân tích năng lực học sinh trên cùng một nền tảng.

---

# 21. Core Loop của sản phẩm

```text
Teacher
   ↓
Tạo câu hỏi
   ↓
Question Bank
   ↓
Tạo đề
   ↓
Student làm bài
   ↓
Kết quả
   ↓
Skill Analytics
   ↓
AI phát hiện điểm yếu
   ↓
AI tạo bài luyện tập
   ↓
Student làm lại
```

Nếu xây được vòng lặp này, sản phẩm sẽ không chỉ là một công cụ tạo nội dung bằng AI mà trở thành một hệ thống hỗ trợ giảng dạy và ra quyết định dựa trên dữ liệu.
