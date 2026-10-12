/**
 * EduMind THCS — Core TypeScript Types & Interfaces
 * Chuẩn hóa GDPT 2018, Công văn 5512/BGDĐT & Công văn 7991/BGDĐT
 */

/* ===== 1. USER & AUTH ===== */
export type UserRole = "TEACHER" | "ADMIN" | "PRINCIPAL";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  school?: string | null;
  subjects?: string | null;
  grades?: string | null;
  phone?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TeacherProfile {
  name: string;
  email: string;
  school: string;
  subject: string;
  grades: number[];
}

/* ===== 2. CLASS & STUDENT ===== */
export type StudentStatus = "GOOD" | "AVERAGE" | "WARNING";

export interface ClassItem {
  id: string;
  name: string;
  gradeLevel: number;
  academicYear: string;
  room?: string | null;
  description?: string | null;
  teacherId?: string;
  studentsCount?: number;
  students?: Student[];
  createdAt?: string | Date;
}

export interface Student {
  id: string;
  classId: string;
  studentCode: string;
  name: string;
  gender: string;
  dob?: string | Date | null;
  avatar?: string | null;
  status: StudentStatus;
  note?: string | null;
  class?: {
    id: string;
    name: string;
    gradeLevel: number;
  };
  examAttempts?: ExamAttempt[];
  studentSkills?: StudentSkill[];
  avgScore?: number | string;
}

export interface StudentSkill {
  id: string;
  studentId: string;
  skillId: string;
  masteryScore: number;
  skill?: Skill;
}

/* ===== 3. CURRICULUM HIERARCHY ===== */
export interface Subject {
  id: string;
  name: string;
  code: string;
  gradeLevel: number;
  description?: string | null;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  orderNumber: number;
  description?: string | null;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  orderNumber: number;
  periodsCount: number;
  contentOutline?: string | null;
  materialsCount?: number;
  chapter?: {
    id: string;
    title: string;
    subject?: {
      name: string;
      gradeLevel: number;
    };
  };
  skills?: Skill[];
}

export interface Skill {
  id: string;
  lessonId: string;
  code: string;
  name: string;
  domain: string;
  cognitiveLevel: CognitiveLevel;
}

/* ===== 4. QUESTION & EXAM BANK ===== */
export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "ESSAY"
  | "AUDIO_MATCH";

export type CognitiveLevel =
  | "RECOGNITION"       // Nhận biết
  | "COMPREHENSION"     // Thông hiểu
  | "APPLICATION"       // Vận dụng
  | "HIGH_APPLICATION"; // Vận dụng cao

export interface AnswerOption {
  id?: string;
  questionId?: string;
  content: string;
  isCorrect: boolean;
  orderNumber: number;
  audioSampleUrl?: string | null;
}

export interface Question {
  id: string;
  subjectId: string;
  chapterId?: string | null;
  lessonId?: string | null;
  skillId?: string | null;
  gradeLevel: number;
  difficulty: CognitiveLevel;
  questionType: QuestionType;
  content: string;
  explanation?: string | null;
  scoreWeight: number;
  tags?: string | null;
  isFavorite: boolean;
  audioPromptUrl?: string | null;
  answers: AnswerOption[];
  subject?: { name: string; code: string };
  chapter?: { title: string };
  lesson?: { title: string };
  skill?: { name: string; code: string };
  createdAt?: string | Date;
}

/* ===== 5. EXAM & CV 7991 MATRIX ===== */
export type ExamType = "REGULAR" | "MID_TERM" | "FINAL_TERM";
export type ExamStatus = "DRAFT" | "READY" | "PUBLISHED" | "ARCHIVED";

export interface ExamMatrixCell {
  chapterId: string;
  lessonId: string;
  recognitionCount: number;
  comprehensionCount: number;
  applicationCount: number;
  highApplicationCount: number;
  totalScore: number;
}

export interface ExamMatrixConfig {
  gradeLevel: number;
  durationMinutes: number;
  totalQuestions: number;
  scoreScale: number;
  cells: ExamMatrixCell[];
}

export interface ExamSpecificationItem {
  id: string;
  topic: string;
  requirement: string;
  cognitiveLevel: CognitiveLevel;
  questionType: QuestionType;
  questionOrder: number;
  score: number;
}

export interface ExamVersion {
  id: string;
  examId: string;
  versionCode: string;
  questionOrder: number[];
  scrambledKeys?: Record<string, string>;
  createdAt?: string | Date;
}

export interface Exam {
  id: string;
  teacherId: string;
  classId?: string | null;
  title: string;
  subject: string;
  gradeLevel: number;
  examType: ExamType;
  durationMinutes: number;
  totalScore: number;
  questionCount: number;
  status: ExamStatus;
  matrixConfig?: any;
  schoolName?: string;
  academicYear?: string;
  class?: {
    id: string;
    name: string;
    gradeLevel: number;
  } | null;
  versions: ExamVersion[];
  questions?: {
    id: string;
    orderNumber: number;
    score: number;
    question: Question;
  }[];
  _count?: {
    questions: number;
    attempts: number;
  };
  createdAt?: string | Date;
}

/* ===== 6. ATTEMPTS & GRADING ===== */
export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  versionCode: string;
  score: number;
  maxScore: number;
  submittedAt: string | Date;
  status: "GRADED" | "PENDING_REVIEW";
  student?: Student;
  studentAnswers?: StudentAnswer[];
}

export interface StudentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answerText?: string | null;
  selectedAnswerId?: string | null;
  isCorrect?: boolean | null;
  scoreAwarded: number;
  teacherFeedback?: string | null;
}

/* ===== 7. TEACHER MATERIALS & LESSON PLANS (CV 5512) ===== */
export type MaterialType =
  | "LESSON_PLAN"
  | "SLIDES"
  | "SCORM"
  | "WORKSHEET"
  | "MATRIX_7991";

export interface Activity5512 {
  id: string;
  title: string;
  type: "KHỞI ĐỘNG" | "HÌNH THÀNH KIẾN THỨC" | "LUYỆN TẬP" | "VẬN DỤNG";
  objective: string;
  content: string;
  product: string;
  implementation: string;
}

export interface LessonPlan5512 {
  id?: string;
  title: string;
  subject: string;
  gradeLevel: number;
  periodCount: number;
  objectives: {
    knowledge: string[];
    competencies: string[];
    qualities: string[];
  };
  equipment: {
    teacher: string[];
    student: string[];
  };
  activities: Activity5512[];
}

export interface TeacherMaterial {
  id: string;
  teacherId: string;
  lessonId?: string | null;
  title: string;
  type: MaterialType;
  fileUrl?: string | null;
  metadata?: any;
  lesson?: {
    id: string;
    title: string;
    chapter?: {
      title: string;
    };
  } | null;
  createdAt: string | Date;
}

/* ===== 8. AI CONVERSATION ===== */
export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string | Date;
  metadata?: any;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  contextType?: string | null;
  messages: AIMessage[];
  createdAt: string | Date;
}
