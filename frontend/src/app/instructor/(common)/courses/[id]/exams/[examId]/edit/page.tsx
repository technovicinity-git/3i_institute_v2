"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ChevronLeft, Search } from "lucide-react";
import { examService } from "@/services/exam.service";
import type { CreateExamInput } from "@/types/exam";
import type { Question } from "@/types/question";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";
import { useMyQuestions } from "@/hooks/use-questions";
import { CourseActions } from "@/components/instructor/CourseActions";

const editExamSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  type: z.enum(["practice", "final"]),
  duration: z.number().int().min(5).max(480),
  passMark: z.number().int().min(1).max(100),
  maxAttempts: z.number().int().min(1).max(10),
  cooldownHours: z.number().int().min(0).max(168),
  randomizeQuestions: z.boolean(),
  randomizeOptions: z.boolean(),
  startTime: z.string().optional(),
  marks: z.number().int().min(1).max(1000).optional(),
});

type EditExamFormData = z.infer<typeof editExamSchema>;
type SelectedQuestion = { questionId: string; marks: number };

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const examId = params.examId as string;
  const queryClient = useQueryClient();
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: courses, isLoading: coursesLoading } = useInstructorCourses();
  const course = courses?.find((item) => item.id === courseId);
  const { data: allQuestions, isLoading: questionsLoading } = useMyQuestions(courseId);
  const { data: exam, isLoading } = useQuery({
    queryKey: ["exam-details", examId],
    queryFn: async () => {
      const exams = await examService.getCourseExams(courseId);
      return exams.find((item) => item.id === examId);
    },
    enabled: !!courseId && !!examId,
  });

  const updateMutation = useMutation({
    mutationFn: (input: CreateExamInput) => examService.updateExam(examId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-exams", courseId] });
      queryClient.invalidateQueries({ queryKey: ["exam-details", examId] });
      toast.success("Exam updated");
      router.push(`/instructor/courses/${courseId}/exams`);
    },
    onError: () => toast.error("Failed to update exam"),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditExamFormData>({
    resolver: zodResolver(editExamSchema),
    defaultValues: {
      type: "practice",
      duration: 60,
      passMark: 50,
      maxAttempts: 3,
      cooldownHours: 24,
      randomizeQuestions: false,
      randomizeOptions: false,
      marks: 20,
    },
  });

  useEffect(() => {
    if (!exam) return;
    reset({
      title: exam.title,
      type: exam.type,
      duration: exam.duration,
      passMark: exam.passMark,
      maxAttempts: Math.min(exam.maxAttempts, 10),
      cooldownHours: exam.cooldownHours,
      randomizeQuestions: exam.randomizeQuestions,
      randomizeOptions: exam.randomizeOptions,
      startTime: toLocalDateTime(exam.openDate),
      marks: exam.totalMarks,
    });
    setSelectedQuestions((exam.questions ?? []).map((item) => ({
      questionId: item.questionId,
      marks: item.marks ?? 1,
    })));
  }, [exam, reset]);

  const filteredQuestions = allQuestions?.filter((question) =>
    question.question.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const totalQuestionMarks = selectedQuestions.reduce((sum, item) => sum + item.marks, 0);

  const toggleQuestion = (question: Question) => {
    setSelectedQuestions((current) => {
      const exists = current.some((item) => item.questionId === question.id);
      return exists
        ? current.filter((item) => item.questionId !== question.id)
        : [...current, { questionId: question.id, marks: question.marks }];
    });
  };

  const onSubmit = (data: EditExamFormData) => {
    const isOnlineClass = course?.type === "ONLINE_CLASS";
    if (!isOnlineClass && !data.marks) {
      setError("marks", { type: "manual", message: "Total marks are required for regular course exams" });
      return;
    }
    if (isOnlineClass && selectedQuestions.length === 0) {
      toast.error("Select at least one question for this online class exam");
      return;
    }
    if (isOnlineClass && selectedQuestions.some((question) => !Number.isInteger(question.marks) || question.marks < 1)) {
      toast.error("Each selected question must have at least one mark");
      return;
    }
    if (isOnlineClass && !data.startTime) {
      setError("startTime", { type: "manual", message: "Exam start time is required for online class exams" });
      return;
    }

    updateMutation.mutate({
      courseId,
      title: data.title,
      type: data.type,
      duration: data.duration,
      passMark: data.passMark,
      totalMarks: isOnlineClass ? totalQuestionMarks : data.marks!,
      maxAttempts: isOnlineClass ? data.maxAttempts : 999999,
      cooldownHours: isOnlineClass ? data.cooldownHours : 0,
      randomizeQuestions: data.randomizeQuestions,
      randomizeOptions: data.randomizeOptions,
      openDate: isOnlineClass && data.startTime ? new Date(data.startTime).toISOString() : undefined,
      questions: isOnlineClass ? selectedQuestions : [],
    });
  };

  if (isLoading || coursesLoading || !exam || !course) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/exams`)}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to exams
        </button>
        <CourseActions courseId={courseId} courseType={course.type} />
        <h1 className="text-3xl md:text-[36px] text-[#0C1F33]" style={{ fontFamily: "'Marcellus', serif" }}>
          Edit Exam
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0C1F33]">Exam Details</h2>
          <div>
            <label className="block text-sm font-semibold mb-2">Exam Title *</label>
            <input {...register("title")} className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg" />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Type *</label>
              <select {...register("type")} className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg">
                <option value="practice">Practice</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Duration (minutes) *</label>
              <input type="number" {...register("duration", { valueAsNumber: true })} className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg" />
              {errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Pass Mark (%) *</label>
              <input type="number" {...register("passMark", { valueAsNumber: true })} className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg" />
              {errors.passMark && <p className="mt-1 text-xs text-red-600">{errors.passMark.message}</p>}
            </div>
            {course.type === "ONLINE_CLASS" ? (
              <div>
                <label className="block text-sm font-semibold mb-2">Max Attempts *</label>
                <input type="number" {...register("maxAttempts", { valueAsNumber: true })} className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg" />
                {errors.maxAttempts && <p className="mt-1 text-xs text-red-600">{errors.maxAttempts.message}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold mb-2">Exam Marks (Total) *</label>
                <input type="number" {...register("marks", { valueAsNumber: true })} className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg" />
                {errors.marks && <p className="mt-1 text-xs text-red-600">{errors.marks.message}</p>}
              </div>
            )}
          </div>

          {course.type === "ONLINE_CLASS" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Cooldown (hours)</label>
                  <input type="number" {...register("cooldownHours", { valueAsNumber: true })} className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Exam Start Time *</label>
                  <input type="datetime-local" {...register("startTime")} className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg" />
                  {errors.startTime && <p className="mt-1 text-xs text-red-600">{errors.startTime.message}</p>}
                </div>
              </div>
              <p className="text-xs text-[#64748B]">Learners can start from the scheduled time until 50% of the exam duration has elapsed.</p>
            </>
          ) : (
            <p className="text-xs text-[#64748B]">Questions are randomly selected from the course question bank in every learner attempt up to the total mark set above. Learners can attempt this exam unlimited times.</p>
          )}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register("randomizeQuestions")} /><span className="text-sm">Randomize questions</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register("randomizeOptions")} /><span className="text-sm">Randomize options</span></label>
          </div>
        </section>

        {course.type === "ONLINE_CLASS" && (
          <section className="bg-white rounded-xl border border-[#E3E8EF] p-6">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-[#0C1F33]">Select Questions</h2>
              <span className="text-sm text-[#64748B]">{selectedQuestions.length} selected · {totalQuestionMarks} marks</span>
            </div>
            <div className="flex items-center gap-2 border border-[#E3E8EF] rounded-lg px-4 py-2.5 mb-4">
              <Search className="w-4 h-4 text-[#94A3B8]" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search questions..." className="text-sm outline-none w-full" />
            </div>
            {questionsLoading ? <p className="text-sm text-[#64748B] py-6 text-center">Loading questions...</p> : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredQuestions?.map((question) => {
                  const selected = selectedQuestions.find((item) => item.questionId === question.id);
                  return (
                    <div key={question.id} className={`flex items-start gap-3 p-3 rounded-lg border ${selected ? "border-[#22A146] bg-green-50" : "border-[#E3E8EF]"}`}>
                      <button type="button" onClick={() => toggleQuestion(question)} aria-label={selected ? "Remove question" : "Add question"} className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border ${selected ? "bg-[#22A146] border-[#22A146] text-white" : "border-[#E3E8EF]"}`}>
                        {selected && <Check className="w-4 h-4" />}
                      </button>
                      <button type="button" onClick={() => toggleQuestion(question)} className="flex-1 min-w-0 text-left">
                        <p className="text-sm text-[#0C1F33]">{question.question}</p>
                        <p className="text-xs text-[#64748B] mt-1">{question.type.toUpperCase()} · {question.difficulty} · {question.marks} marks</p>
                      </button>
                      {selected && <input type="number" min={1} value={selected.marks} onChange={(event) => setSelectedQuestions((current) => current.map((item) => item.questionId === question.id ? { ...item, marks: Number(event.target.value) } : item))} className="w-20 px-2 py-1.5 border border-[#E3E8EF] rounded text-sm shrink-0" aria-label="Question marks" />}
                    </div>
                  );
                })}
                {filteredQuestions?.length === 0 && <p className="text-center py-8 text-[#64748B]">No questions found.</p>}
              </div>
            )}
          </section>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push(`/instructor/courses/${courseId}/exams`)} className="px-4 py-2 border border-[#E3E8EF] text-[#0C1F33] rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={updateMutation.isPending || (course.type === "ONLINE_CLASS" && selectedQuestions.length === 0)} className="px-4 py-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50">
            {updateMutation.isPending ? "Saving..." : course.type === "ONLINE_CLASS" && selectedQuestions.length === 0 ? "Select at least one question" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
