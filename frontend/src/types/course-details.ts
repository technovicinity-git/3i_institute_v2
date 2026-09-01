export interface RatingBar {
  stars: number;
  count: number;
  pct: number;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface CurriculumLesson {
  title: string;
  duration: string;
}

export interface CurriculumModule {
  moduleNum: string;
  title: string;
  lessons: number;
  duration: string;
  lessonsList: CurriculumLesson[];
}

export interface InstructorInfo {
  id: string;
  name: string;
  bio: string;
  rating: number;
  courseCount: number;
  studentCount: number;
  avatarUrl: string;
}

export interface RelatedCourse {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  instructor: string;
  rating: number;
  level: string;
}

export interface CourseDetails {
  id: string;
  title: string;
  summary: string;
  description: string;
  thumbnailUrl: string | null;
  coverImageUrl: string | null;
  category: string;
  type: string;
  level: string;
  language: string;
  minimumAge: number;

  learningOutcomes: string[];
  requirements: string[];
  whatIncluded: string[];
  faq: Array<{ question: string; answer: string }>;
  aboutParagraphs: string[];

  totalModules: number;
  totalLessons: number;
  totalDurationMinutes: number;
  durationWeeks: number;

  instructor: InstructorInfo;
  ratingSummary: {
    average: number;
    total: number;
    distribution: RatingBar[];
  };
  reviews: Review[];
  curriculum: CurriculumModule[];
  relatedCourses: RelatedCourse[];
  enrolmentCount: number;
  isEnrolled: boolean;
  enrolmentBatchId: string | null;
}
