export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_BLANK"
  | "SHORT_ANSWER"
  | "ESSAY";

export type DifficultyLevel =
  | "NHAN_BIET"
  | "THONG_HIEU"
  | "VAN_DUNG"
  | "VAN_DUNG_CAO";

export interface GeneratedAnswerOption {
  label: string; // 'A' | 'B' | 'C' | 'D'
  content: string;
  isCorrect: boolean;
}

export interface GeneratedQuestion {
  content: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  answers: GeneratedAnswerOption[];
  correct_answer: string;
  explanation: string;
  skill: string;
  source?: string;
  tags?: string[];
}

export interface GenerateQuestionsParams {
  subject: string;
  grade: number;
  chapter?: string;
  lesson?: string;
  skill?: string;
  questionType?: QuestionType;
  difficulty?: DifficultyLevel;
  count: number;
  promptNote?: string;
}

export interface GenerateExamParams {
  title: string;
  subject: string;
  grade: number;
  durationMinutes: number;
  totalScore: number;
  questionCount: number;
  matrix: {
    nhanBiet: number; // percentage e.g. 30
    thongHieu: number; // e.g. 40
    vanDung: number; // e.g. 20
    vanDungCao: number; // e.g. 10
  };
  topics: string[];
}

export interface GeneratedExam {
  title: string;
  questions: GeneratedQuestion[];
  matrixSummary: string;
  durationMinutes: number;
}

export interface AnalyzeStudentParams {
  studentName: string;
  grade: number;
  classTitle: string;
  recentScores: { examTitle: string; score: number; maxScore: number; date: string }[];
  skillMasteries: { skillName: string; score: number }[];
}

export interface StudentAnalysisResult {
  summary: string;
  strongSkills: string[];
  weakSkills: string[];
  trend: "IMPROVING" | "STABLE" | "DECLINING";
  recommendedActions: string[];
  teacherRemark: string; // Tailored remark for report cards or parent communication
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SuggestedAction {
  label: string;
  action: "CREATE_EXAM" | "EXPORT_WORKSHEET" | "FILTER_STUDENTS" | "OPEN_QUESTION_BANK" | "VIEW_STUDENT";
  params?: Record<string, unknown>;
}

export interface AIChatResponse {
  content: string;
  structuredData?: {
    type?: "STUDENT_LIST" | "SKILL_BARS" | "EXAM_PROPOSAL" | "COMPARISON";
    data?: unknown;
  };
  suggestedActions?: SuggestedAction[];
}

export interface LessonPlanActivity {
  id: string;
  order: number;
  name: string; // e.g. "Hoạt động 1: Khởi động"
  objective: string; // Mục tiêu
  content: string; // Nội dung
  product: string; // Sản phẩm học tập
  execution: string; // Cách thức tổ chức thực hiện
}

export interface GeneratedLessonPlan {
  title: string;
  subject: string;
  grade: number;
  duration: string;
  objectives: {
    knowledge: string[];
    competencies: string[];
    qualities: string[];
  };
  equipment: {
    teacher: string[];
    student: string[];
    digital: string[];
  };
  activities: LessonPlanActivity[];
}

export interface GenerateLessonPlanParams {
  subject: string;
  grade: number;
  chapter?: string;
  lessonTitle: string;
  durationMinutes?: number;
  learningOutcomes?: string;
  keyContent?: string;
  method?: string;
  equipment?: string;
  notes?: string;
}

export interface SlideItem {
  slideNumber: number;
  title: string;
  subtitle?: string;
  mainContent: string;
  bullets: string[];
  teacherNote: string;
  suggestedVisual: string;
  interactiveActivity?: string;
  quizQuestion?: {
    question: string;
    options: string[];
    answer: string;
  };
}

export interface GeneratedSlideDeck {
  title: string;
  subject: string;
  grade: number;
  slides: SlideItem[];
}

export interface GenerateSlideParams {
  lessonTitle: string;
  subject: string;
  grade: number;
  slideCount?: number;
  style?: string;
  lessonPlanContent?: string;
}

export interface CV7991MatrixRow {
  topic: string;
  knowledgeUnit: string;
  learningOutcome: string;
  nhanBiet: { tn: number; tl: number; points: number };
  thongHieu: { tn: number; tl: number; points: number };
  vanDung: { tn: number; tl: number; points: number };
  vanDungCao: { tn: number; tl: number; points: number };
  totalQuestions: number;
  totalPoints: number;
}

export interface CV7991SpecificationRow {
  order: number;
  topic: string;
  knowledgeUnit: string;
  learningOutcome: string;
  assessmentLevel: "Nhận biết" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao";
  questionType: string;
  questionCount: number;
  points: number;
  questionNumbers: string;
}

export interface CV7991ExamPackage {
  title: string;
  subject: string;
  grade: number;
  durationMinutes: number;
  totalScore: number;
  questions: GeneratedQuestion[];
  matrix: CV7991MatrixRow[];
  specification: CV7991SpecificationRow[];
  scoringGuide: {
    multipleChoice: { questionNumber: number; answer: string; points: number }[];
    trueFalse?: { questionNumber: number; subItems: { item: string; answer: "Đúng" | "Sai"; points: number }[] }[];
    essayRubric?: { questionNumber: number; criteria: string; steps: { step: string; points: number }[]; totalPoints: number }[];
  };
  consistencyCheck: {
    isValid: boolean;
    scoreSum: number;
    warnings: string[];
  };
}

export interface GenerateExamCV7991Params {
  title: string;
  subject: string;
  grade: number;
  semester: number;
  durationMinutes: number;
  totalScore: number;
  examType: string; // 15MIN, GIUA_KY, CUOI_KY
  topics: string[];
  learningOutcomes: string[];
  matrixRatio: {
    nhanBiet: number;
    thongHieu: number;
    vanDung: number;
    vanDungCao: number;
  };
}

export interface AIProvider {
  name: string;
  generateQuestions(params: GenerateQuestionsParams): Promise<GeneratedQuestion[]>;
  generateExam(params: GenerateExamParams): Promise<GeneratedExam>;
  generateExamCV7991(params: GenerateExamCV7991Params): Promise<CV7991ExamPackage>;
  generateLessonPlan(params: GenerateLessonPlanParams): Promise<GeneratedLessonPlan>;
  generateSlideDeck(params: GenerateSlideParams): Promise<GeneratedSlideDeck>;
  analyzeStudent(params: AnalyzeStudentParams): Promise<StudentAnalysisResult>;
  chat(messages: ChatMessage[], context?: Record<string, unknown>): Promise<AIChatResponse>;
}
