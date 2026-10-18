"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  CheckCircle2,
  Circle,
  Eye,
  Filter,
  ListChecks,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  useAdminQuestion,
  useAdminQuestionAction,
  useAdminQuestionBulkAction,
  useAdminQuestionFilterOptions,
  useAdminQuestions,
} from "@/hooks/use-admin";
import type {
  AdminQuestion,
  AdminQuestionBulkAction,
  AdminQuestionUsage,
} from "@/services/admin.service";
import { Pagination } from "@/components/ui/pagination";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDate } from "@/lib/date-format";

const PAGE_SIZE = 20;

const TYPE_LABEL: Record<string, string> = {
  mcq: "Multiple choice",
  multi_select: "Multi-select",
  true_false: "True / False",
  short_answer: "Short answer",
  essay: "Essay",
};

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: "bg-green-50 text-green-700",
  medium: "bg-amber-50 text-amber-700",
  hard: "bg-red-50 text-red-700",
};

const select =
  "rounded-lg border border-[#E3E8EF] bg-white px-3 py-2.5 text-sm text-[#334155]";

const isUsed = (usage: AdminQuestionUsage) =>
  usage.exams + usage.attempts + usage.sessions > 0;

function usageLabel(usage: AdminQuestionUsage): string {
  const attempts = usage.attempts + usage.sessions;
  if (!usage.exams && !attempts) return "Not used";
  const parts = [];
  if (usage.exams) parts.push(`${usage.exams} exam${usage.exams === 1 ? "" : "s"}`);
  if (attempts) parts.push(`${attempts} attempt${attempts === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

export default function AdminQuestionsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      courseId: courseId || undefined,
      instructorId: instructorId || undefined,
      type: type || undefined,
      difficulty: difficulty || undefined,
      status: status || undefined,
    }),
    [debouncedSearch, courseId, instructorId, type, difficulty, status],
  );
  const { data, isLoading, isError } = useAdminQuestions(page, filters);
  const { data: options } = useAdminQuestionFilterOptions();
  const archive = useAdminQuestionAction("archive");
  const restore = useAdminQuestionAction("restore");
  const remove = useAdminQuestionAction("delete");
  const bulk = useAdminQuestionBulkAction();
  const confirm = useConfirm();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // A selection only makes sense for the rows on screen.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(new Set());
  }, [page, filters]);

  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const questions = data?.questions ?? [];
  const allOnPageSelected =
    questions.length > 0 && questions.every((q) => selected.has(q.id));
  const toggleAll = () =>
    setSelected(allOnPageSelected ? new Set() : new Set(questions.map((q) => q.id)));
  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const hasFilters =
    !!search || !!courseId || !!instructorId || !!type || !!difficulty || status !== "ACTIVE";
  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCourseId("");
    setInstructorId("");
    setType("");
    setDifficulty("");
    setStatus("ACTIVE");
    setPage(1);
  };

  const confirmArchive = (question: AdminQuestion) =>
    confirm({
      tone: "warning",
      icon: Archive,
      title: "Archive question?",
      description:
        "It will leave instructors' question banks, can't be added to exams and won't be picked for random exams. Exams and results that already use it keep working. You can restore it at any time.",
      confirmLabel: "Archive question",
      onConfirm: () => archive.mutateAsync(question.id),
    });

  const confirmDelete = (question: AdminQuestion) =>
    confirm({
      tone: "danger",
      icon: Trash2,
      title: "Delete question permanently?",
      description:
        "This can't be undone. Only questions that no exam or attempt has used can be deleted.",
      confirmLabel: "Delete question",
      onConfirm: () => remove.mutateAsync(question.id),
    });

  const runBulk = (action: AdminQuestionBulkAction) => {
    const ids = [...selected];
    const count = ids.length;
    const plural = count === 1 ? "question" : "questions";
    confirm({
      tone: action === "delete" ? "danger" : action === "archive" ? "warning" : "info",
      icon: action === "delete" ? Trash2 : action === "archive" ? Archive : ArchiveRestore,
      title:
        action === "delete"
          ? `Delete ${count} ${plural} permanently?`
          : action === "archive"
            ? `Archive ${count} ${plural}?`
            : `Restore ${count} ${plural}?`,
      description:
        action === "delete"
          ? "This can't be undone. Questions that an exam or attempt uses are skipped — archive those instead."
          : action === "archive"
            ? "They leave instructors' question banks and random exams. Existing exams and results keep working."
            : "They return to their instructors' question banks.",
      confirmLabel:
        action === "delete" ? "Delete" : action === "archive" ? "Archive" : "Restore",
      onConfirm: async () => {
        await bulk.mutateAsync({ ids, action });
        setSelected(new Set());
      },
    });
  };

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Question Bank
        </h1>
        <p className="text-base text-[#64748B]">
          {data?.total ?? 0} questions
          {data?.archivedCount ? ` · ${data.archivedCount} archived in total` : ""}
        </p>
      </header>

      <section className="bg-white border border-[#E3E8EF] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 border border-[#E3E8EF] rounded-lg px-4 py-2.5 mb-4 max-w-lg">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search question text, course or instructor..."
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-[#334155]">
            <Filter className="w-4 h-4" /> Filters
          </span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#2D6CDF] hover:underline"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select aria-label="Filter by course" value={courseId} onChange={(e) => changeFilter(setCourseId)(e.target.value)} className={select}>
            <option value="">All courses</option>
            {options?.courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          <select aria-label="Filter by instructor" value={instructorId} onChange={(e) => changeFilter(setInstructorId)(e.target.value)} className={select}>
            <option value="">All instructors</option>
            {options?.instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
            ))}
          </select>
          <select aria-label="Filter by type" value={type} onChange={(e) => changeFilter(setType)(e.target.value)} className={select}>
            <option value="">All types</option>
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select aria-label="Filter by difficulty" value={difficulty} onChange={(e) => changeFilter(setDifficulty)(e.target.value)} className={select}>
            <option value="">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select aria-label="Filter by status" value={status} onChange={(e) => changeFilter(setStatus)(e.target.value)} className={select}>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
            <option value="">Active and archived</option>
          </select>
        </div>
      </section>

      {selected.size > 0 && (
        <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#12304E]/20 bg-[#12304E] px-4 py-3 text-white">
          <span className="text-sm font-semibold me-auto">{selected.size} selected</span>
          <button onClick={() => runBulk("archive")} disabled={bulk.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20 disabled:opacity-50">
            <Archive className="w-4 h-4" /> Archive
          </button>
          <button onClick={() => runBulk("restore")} disabled={bulk.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20 disabled:opacity-50">
            <ArchiveRestore className="w-4 h-4" /> Restore
          </button>
          <button onClick={() => runBulk("delete")} disabled={bulk.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-1.5 text-sm font-semibold hover:bg-red-500 disabled:opacity-50">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button onClick={() => setSelected(new Set())} aria-label="Clear selection" className="rounded-lg p-1.5 hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Could not load questions.
        </div>
      )}
      {!isLoading && !isError && questions.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <ListChecks className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No questions found.</p>
        </div>
      )}

      {!isLoading && !isError && questions.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden">
          <div className="hidden lg:grid grid-cols-[32px_minmax(0,3fr)_minmax(0,2fr)_110px_130px_96px_200px] gap-4 px-6 py-3 bg-[#FBF9F4] border-b border-[#E3E8EF] text-xs font-bold text-[#64748B] uppercase items-center">
            <input type="checkbox" aria-label="Select all on this page" checked={allOnPageSelected} onChange={toggleAll} className="w-4 h-4 accent-[#12304E]" />
            <span>Question</span>
            <span>Course / Instructor</span>
            <span>Difficulty</span>
            <span>Used in</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-[#E3E8EF]">
            {questions.map((question) => {
              const archived = Boolean(question.archivedAt);
              const used = isUsed(question.usage);
              return (
                <div key={question.id} className={`grid grid-cols-1 lg:grid-cols-[32px_minmax(0,3fr)_minmax(0,2fr)_110px_130px_96px_200px] gap-3 lg:gap-4 px-6 py-4 items-center hover:bg-gray-50 ${archived ? "bg-gray-50/60" : ""}`}>
                  <input type="checkbox" aria-label="Select question" checked={selected.has(question.id)} onChange={() => toggle(question.id)} className="w-4 h-4 accent-[#12304E]" />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold line-clamp-2 ${archived ? "text-[#64748B]" : "text-[#0C1F33]"}`}>{question.question}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {TYPE_LABEL[question.type] ?? question.type} · {question.marks} mark{question.marks === 1 ? "" : "s"}
                      {question.negativeMarks > 0 ? ` · −${question.negativeMarks} if wrong` : ""}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[#0C1F33] truncate">{question.course.title}</p>
                    <p className="text-xs text-[#64748B] truncate">{question.instructor.firstName} {question.instructor.lastName}</p>
                  </div>
                  <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${DIFFICULTY_STYLE[question.difficulty] ?? "bg-gray-100 text-gray-600"}`}>{question.difficulty}</span>
                  <span className={`text-sm ${used ? "text-[#0C1F33]" : "text-[#94A3B8]"}`}>{usageLabel(question.usage)}</span>
                  <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${archived ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-700"}`}>{archived ? "Archived" : "Active"}</span>
                  <div className="flex items-center gap-1 lg:justify-end">
                    <button onClick={() => setViewing(question.id)} className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-[#E3E8EF] text-sm font-semibold text-[#0C1F33] hover:bg-gray-50">
                      <Eye className="w-4 h-4" /> View
                    </button>
                    {archived ? (
                      <button onClick={() => restore.mutate(question.id)} disabled={restore.isPending} className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-semibold text-[#22A146] hover:bg-green-50 disabled:opacity-50">
                        <ArchiveRestore className="w-4 h-4" /> Restore
                      </button>
                    ) : (
                      <button onClick={() => confirmArchive(question)} disabled={archive.isPending} className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50">
                        <Archive className="w-4 h-4" /> Archive
                      </button>
                    )}
                    <button
                      onClick={() => confirmDelete(question)}
                      disabled={used || remove.isPending}
                      title={used ? "Used by exams or attempts — archive it instead" : "Delete permanently"}
                      aria-label="Delete question"
                      className="inline-flex items-center px-2 py-2 rounded-lg text-red-600 hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onPageChange={setPage} itemLabel="questions" />

      <QuestionDetailsSheet id={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

function QuestionDetailsSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data: question, isLoading } = useAdminQuestion(id);
  const correct = new Set(
    Array.isArray(question?.correctAnswer)
      ? question.correctAnswer
      : question?.correctAnswer
        ? [question.correctAnswer]
        : [],
  );
  const written = question?.type === "short_answer" || question?.type === "essay";
  const options =
    question?.type === "true_false" && !question.options?.length
      ? ["True", "False"]
      : (question?.options ?? []);

  return (
    <Sheet open={Boolean(id)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full data-[side=right]:sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Question details</SheetTitle>
        </SheetHeader>
        {isLoading || !question ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="px-4 pb-6 space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-xs font-semibold text-[#334155]">{TYPE_LABEL[question.type] ?? question.type}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${DIFFICULTY_STYLE[question.difficulty] ?? ""}`}>{question.difficulty}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${question.archivedAt ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-700"}`}>
                {question.archivedAt ? `Archived ${formatDate(question.archivedAt)}` : "Active"}
              </span>
            </div>

            <p className="text-base font-semibold text-[#0C1F33] whitespace-pre-wrap">{question.question}</p>

            <p className="text-[#64748B]">
              {question.marks} mark{question.marks === 1 ? "" : "s"}
              {question.negativeMarks > 0 ? ` · −${question.negativeMarks} for a wrong answer` : ""}
            </p>

            {!written && options.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-[#64748B]">Options</p>
                {options.map((option) => {
                  const isCorrect = correct.has(option);
                  return (
                    <div key={option} className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${isCorrect ? "border-green-200 bg-green-50" : "border-[#E3E8EF]"}`}>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" /> : <Circle className="w-4 h-4 mt-0.5 shrink-0 text-[#CBD5E1]" />}
                      <span className={isCorrect ? "font-semibold text-green-800" : "text-[#334155]"}>{option}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {written && question.suggestedAnswer && (
              <div>
                <p className="text-xs font-bold uppercase text-[#64748B] mb-1">Suggested answer</p>
                <p className="rounded-lg bg-green-50 px-3 py-2 text-green-900 whitespace-pre-wrap">{question.suggestedAnswer}</p>
              </div>
            )}

            {question.explanation && (
              <div>
                <p className="text-xs font-bold uppercase text-[#64748B] mb-1">Explanation</p>
                <p className="text-[#334155] whitespace-pre-wrap">{question.explanation}</p>
              </div>
            )}

            <div className="rounded-lg bg-[#FBF9F4] px-3 py-3 space-y-1">
              <p><span className="text-[#64748B]">Course:</span> <span className="font-semibold text-[#0C1F33]">{question.course.title}</span></p>
              <p><span className="text-[#64748B]">Instructor:</span> {question.course.instructor.firstName} {question.course.instructor.lastName}</p>
              <p><span className="text-[#64748B]">Created:</span> {formatDate(question.createdAt, "dateTime")}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-[#64748B] mb-1">Used in</p>
              <p className="text-[#334155]">{usageLabel(question.usage)}</p>
              {question.exams.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {question.exams.map((exam) => (
                    <li key={exam.id} className="flex items-center justify-between rounded-md border border-[#E3E8EF] px-3 py-1.5">
                      <span className="truncate text-[#0C1F33]">{exam.title}</span>
                      <span className="ms-2 shrink-0 text-xs capitalize text-[#64748B]">{exam.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
