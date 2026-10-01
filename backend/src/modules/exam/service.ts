import { prisma } from "#/lib/prisma";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import type {
  CreateQuestionInput,
  CreateExamInput,
  SubmitExamInput,
} from "#/modules/exam/schema";

export class ExamService {
  // ──────────────────────────────────
  // Question Bank
  // ──────────────────────────────────

  async createQuestion(ownerId: string, input: CreateQuestionInput) {
    // Verify course belongs to instructor
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== ownerId) {
      throw new ForbiddenError(
        "You can only add questions to your own courses",
      );
    }

    const question = await prisma.question.create({
      data: {
        scope: "INSTRUCTOR",
        ownerId,
        courseId: input.courseId,
        type: input.type,
        question: input.question,
        options: input.options
          ? JSON.parse(JSON.stringify(input.options))
          : undefined,
        correctAnswer: input.correctAnswer
          ? JSON.parse(JSON.stringify(input.correctAnswer))
          : undefined,
        suggestedAnswer: input.suggestedAnswer ?? null,
        marks: input.marks,
        negativeMarks: input.negativeMarks,
        partialCredit: input.partialCredit,
        difficulty: input.difficulty,
        explanation: input.explanation ?? null,
      },
    });

    return question;
  }

  async getMyQuestions(ownerId: string, courseId: string) {
    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== ownerId) {
      throw new ForbiddenError(
        "You can only view questions for your own courses",
      );
    }

    return prisma.question.findMany({
      where: {
        scope: "INSTRUCTOR",
        ownerId,
        courseId,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAdminQuestions() {
    return prisma.question.findMany({
      where: { scope: "ADMIN" },
      orderBy: { createdAt: "desc" },
    });
  }

  async getQuestionById(questionId: string, userId: string, userRole: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        course: { select: { instructorId: true } },
      },
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (userRole === "INSTRUCTOR") {
      if (question.course.instructorId !== userId) {
        throw new NotFoundError("Question not found");
      }
    }

    return question;
  }

  async updateQuestion(
    questionId: string,
    ownerId: string,
    input: Partial<CreateQuestionInput>,
  ) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        course: { select: { instructorId: true } },
      },
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (question.course.instructorId !== ownerId) {
      throw new NotFoundError("Question not found");
    }

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...input,
        options: input.options
          ? JSON.parse(JSON.stringify(input.options))
          : undefined,
        correctAnswer: input.correctAnswer
          ? JSON.parse(JSON.stringify(input.correctAnswer))
          : undefined,
      },
    });

    return updated;
  }

  async deleteQuestion(questionId: string, ownerId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        course: { select: { instructorId: true } },
      },
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (question.course.instructorId !== ownerId) {
      throw new NotFoundError("Question not found");
    }

    await prisma.question.delete({
      where: { id: questionId },
    });
  }

  // ──────────────────────────────────
  // Exams
  // ──────────────────────────────────

  async createExam(instructorId: string, input: CreateExamInput) {
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenError(
        "You can only create exams for your own courses",
      );
    }

    // REGULAR course exams may use a dynamic question bank (no fixed list):
    // per attempt, questions are randomly selected from the course up to the
    // instructor-defined total marks. ONLINE_CLASS exams still require an
    // explicit question list.
    const isDynamic = input.questions.length === 0;

    if (isDynamic && course.type !== "REGULAR") {
      throw new ValidationError(
        "Online class exams require selecting at least one question",
      );
    }

    // Verify all questions belong to this course
    if (!isDynamic) {
      const questionIds = input.questions.map((q) => q.questionId);
      const questions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          courseId: input.courseId,
        },
        select: { id: true },
      });

      if (questions.length !== questionIds.length) {
        throw new ValidationError("All questions must belong to this course");
      }
    }

    // Check if final exam already exists
    if (input.type === "final") {
      const existingFinal = await prisma.exam.findFirst({
        where: { courseId: input.courseId, type: "final" },
      });

      if (existingFinal) {
        throw new ValidationError("Course already has a final exam");
      }
    }

    const exam = await prisma.exam.create({
      data: {
        courseId: input.courseId,
        title: input.title,
        type: input.type,
        duration: input.duration,
        passMark: input.passMark,
        totalMarks: input.totalMarks,
        maxAttempts: input.maxAttempts,
        cooldownHours: input.cooldownHours,
        openDate: input.openDate ? new Date(input.openDate) : null,
        closeDate: input.closeDate ? new Date(input.closeDate) : null,
        randomizeQuestions: input.randomizeQuestions,
        randomizeOptions: input.randomizeOptions,
        revealAnswers: input.revealAnswers,
        questions: JSON.parse(JSON.stringify(input.questions)),
      },
    });

    return exam;
  }
  async getCourseExams(courseId: string, learnerProfileId?: string) {
    const exams = await prisma.exam.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
    });

    if (!learnerProfileId) {
      return exams;
    }

    // Get learner's attempts for these exams
    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId: { in: exams.map((e) => e.id) },
        learnerProfileId,
      },
      orderBy: { score: "desc" },
    });

    const examsWithAttempts = exams.map((exam) => {
      const examAttempts = attempts.filter((a) => a.examId === exam.id);
      const bestAttempt = examAttempts[0] ?? null;
      const isDynamic =
        (exam.questions as Array<{ questionId: string }>).length === 0;

      return {
        ...exam,
        attemptCount: examAttempts.length,
        // REGULAR dynamic exams have no attempt limit.
        maxAttempts: isDynamic ? null : exam.maxAttempts,
        lastAttemptAt:
          examAttempts.length > 0
            ? examAttempts[examAttempts.length - 1]!.createdAt
            : null,
        bestScore: bestAttempt?.score ?? null,
        passed: bestAttempt?.passed ?? null,
      };
    });

    return examsWithAttempts;
  }

  async getExamById(examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundError("Exam not found");
    }

    return exam;
  }

  /**
   * Convert a percentage pass mark into the absolute score a learner must
   * reach. `passMark` is stored as a percentage (e.g. 50 = 50% of the total
   * marks), so the threshold is rounded up to the nearest whole mark.
   */
  private getPassThreshold(totalMarks: number, passMark: number): number {
    return Math.ceil((totalMarks * passMark) / 100);
  }

  /**
   * Randomly pick questions from a course's question bank so their combined
   * marks reach (but never exceed) the instructor-defined `targetMarks`.
   * REGULAR course exams use this to build a fresh question set for every
   * learner attempt.
   */
  private async buildRandomQuestionSet(
    courseId: string,
    targetMarks: number,
  ): Promise<Array<{ questionId: string; marks: number }>> {
    const bank = await prisma.question.findMany({
      where: { courseId },
      select: { id: true, marks: true },
    });

    if (bank.length === 0 || targetMarks <= 0) {
      return [];
    }

    // Fisher–Yates shuffle so every attempt sees a different order.
    const shuffled = [...bank];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }

    const selected: Array<{ questionId: string; marks: number }> = [];
    let total = 0;

    for (const question of shuffled) {
      const marks = question.marks ?? 1;
      if (marks <= 0) continue;
      if (total + marks > targetMarks) continue;
      selected.push({ questionId: question.id, marks });
      total += marks;
      if (total === targetMarks) break;
    }

    return selected;
  }

  async submitExam(accountId: string, input: SubmitExamInput) {
    const exam = await prisma.exam.findUnique({
      where: { id: input.examId },
    });

    if (!exam) {
      throw new NotFoundError("Exam not found");
    }

    // REGULAR course exams use a dynamic question bank: no fixed question list
    // is stored on the exam, no attempt limit exists and there is no cooldown.
    const examQuestions = exam.questions as Array<{
      questionId: string;
      marks?: number;
    }>;
    const isDynamic = examQuestions.length === 0;

    // Check learner profile belongs to account
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: input.learnerProfileId,
        accountId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // Check if exam is open
    const now = new Date();
    if (exam.openDate && now < exam.openDate) {
      throw new ValidationError("Exam has not opened yet");
    }
    if (exam.closeDate && now > exam.closeDate) {
      throw new ValidationError("Exam has closed");
    }

    // ONLINE_CLASS exams are scheduled with a start time (openDate). The
    // learner may only START the exam from the start time until 50% of the
    // exam duration has elapsed past the start time. `startedAt` is the time
    // the learner entered the exam, so submitting later (e.g. after running
    // out of time) is still allowed as long as the exam was started on time.
    if (exam.openDate) {
      const startedAt = input.startedAt ? new Date(input.startedAt) : now;
      const startWindowEnd = new Date(
        exam.openDate.getTime() + exam.duration * 0.5 * 60 * 1000,
      );
      if (startedAt > startWindowEnd) {
        throw new ValidationError(
          "The exam start window has closed. Exams can only be started within 50% of the exam duration after the scheduled start time.",
        );
      }
      if (startedAt < exam.openDate) {
        throw new ValidationError("Exam has not opened yet");
      }
    }

    // Check attempt count and cooldown (not applicable to dynamic REGULAR exams)
    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId: input.examId,
        learnerProfileId: input.learnerProfileId,
      },
      orderBy: { attemptNumber: "desc" },
    });

    if (!isDynamic && attempts.length >= exam.maxAttempts) {
      throw new ValidationError("Maximum attempts reached");
    }

    // Check cooldown
    const lastAttempt = attempts[0];
    if (!isDynamic && lastAttempt && exam.cooldownHours > 0) {
      const cooldownEnd = new Date(
        lastAttempt.submittedAt!.getTime() +
          exam.cooldownHours * 60 * 60 * 1000,
      );
      if (now < cooldownEnd) {
        throw new ValidationError(
          `Please wait ${Math.ceil((cooldownEnd.getTime() - now.getTime()) / 3600000)} hours before retrying`,
        );
      }
    }

    const attemptNumber = attempts.length + 1;

    // Resolve the question set used for this attempt.
    let selectedQuestions: Array<{ questionId: string; marks?: number }>;
    let attemptTotalMarks: number;

    if (isDynamic) {
      // The client echoes back the exact random questions shown. Marks are
      // always re-derived from the question bank so a learner cannot tamper
      // with the displayed marks.
      if (!input.questionSet || input.questionSet.length === 0) {
        throw new ValidationError(
          "Question set is required for this exam",
        );
      }

      const questionIds = input.questionSet.map((q) => q.questionId);
      const bankQuestions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          courseId: exam.courseId,
        },
        select: { id: true, marks: true },
      });

      selectedQuestions = questionIds
        .map((id) => {
          const question = bankQuestions.find((bq) => bq.id === id);
          return question
            ? { questionId: question.id, marks: question.marks ?? 1 }
            : null;
        })
        .filter(
          (item): item is { questionId: string; marks: number } =>
            item !== null,
        );

      if (selectedQuestions.length === 0) {
        throw new ValidationError("Question set is invalid");
      }

      attemptTotalMarks = selectedQuestions.reduce(
        (sum, q) => sum + (q.marks ?? 1),
        0,
      );
    } else {
      selectedQuestions = [...examQuestions];
      attemptTotalMarks = exam.totalMarks;
    }

    // Calculate score for auto-graded questions
    let score = 0;
    let totalGraded = 0;
    let needsManualGrading = false;

    for (const eq of selectedQuestions) {
      const question = await prisma.question.findUnique({
        where: { id: eq.questionId },
      });

      if (!question) continue;

      const userAnswer = input.answers[eq.questionId];
      const marks = eq.marks ?? question.marks;

      if (question.type === "mcq" || question.type === "true_false") {
        totalGraded += marks;
        const correct = question.correctAnswer as string;
        if (userAnswer === correct) {
          score += marks;
        } else if (question.negativeMarks > 0) {
          score -= question.negativeMarks;
        }
      } else if (question.type === "multi_select") {
        totalGraded += marks;
        const correct = question.correctAnswer as string[];
        const userAnswers = Array.isArray(userAnswer)
          ? userAnswer
          : [userAnswer];
        const isCorrect =
          correct.length === userAnswers.length &&
          correct.every((c) => userAnswers.includes(c));
        if (isCorrect) {
          score += marks;
        } else if (question.negativeMarks > 0) {
          score -= question.negativeMarks;
        }
      } else {
        // Short answer and essay — manual grading required
        needsManualGrading = true;
      }
    }

    const passed = !needsManualGrading
      ? score >= this.getPassThreshold(attemptTotalMarks, exam.passMark)
      : null;

    // Persist the question set used for this attempt so grading and result
    // views can reconstruct exactly what the learner saw (important for
    // dynamic REGULAR exams where each attempt is a random sample). Fixed
    // exams keep using the exam-level question list.
    const storedAnswers = JSON.parse(
      JSON.stringify(input.answers),
    );
    if (isDynamic) {
      storedAnswers["__questionSet"] = selectedQuestions;
    }

    const attempt = await prisma.examAttempt.create({
      data: {
        examId: input.examId,
        learnerProfileId: input.learnerProfileId,
        attemptNumber,
        answers: storedAnswers,
        score: needsManualGrading ? null : score,
        totalMarks: attemptTotalMarks,
        passed,
        graded: !needsManualGrading,
        startedAt: input.startedAt ? new Date(input.startedAt) : new Date(),
        submittedAt: new Date(),
      },
    });

    return attempt;
  }

  async gradeWrittenAnswer(
    instructorId: string,
    attemptId: string,
    questionId: string,
    marksAwarded: number,
  ) {
    return this.gradeWrittenAnswers(instructorId, attemptId, [
      { questionId, marksAwarded },
    ]);
  }

  async gradeWrittenAnswers(
    instructorId: string,
    attemptId: string,
    grades: Array<{ questionId: string; marksAwarded: number }>,
  ) {
    if (grades.length === 0) {
      throw new ValidationError("At least one answer grade is required");
    }
    if (new Set(grades.map((grade) => grade.questionId)).size !== grades.length) {
      throw new ValidationError("Each question can only be graded once per submission");
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { include: { course: true } },
      },
    });

    if (!attempt) {
      throw new NotFoundError("Attempt not found");
    }

    if (attempt.exam.course.instructorId !== instructorId) {
      throw new ForbiddenError("You can only grade your own course exams");
    }

    const answers = attempt.answers as Record<string, unknown>;

    // Questions attached to this attempt's exam. For REGULAR dynamic exams
    // (no fixed list on the exam) the exact set the learner saw is persisted
    // on the attempt itself under the reserved `__questionSet` key.
    const storedQuestionSet = answers["__questionSet"] as
      | Array<{ questionId: string; marks: number }>
      | undefined;
    const examQuestions =
      storedQuestionSet && storedQuestionSet.length > 0
        ? storedQuestionSet
        : (attempt.exam.questions as Array<{
            questionId: string;
            marks?: number;
          }>);

    const questions = await prisma.question.findMany({
      where: { id: { in: examQuestions.map((q) => q.questionId) } },
      select: {
        id: true,
        type: true,
        correctAnswer: true,
        marks: true,
        negativeMarks: true,
      },
    });

    // Only written (short answer / essay) questions can be graded manually
    for (const { questionId, marksAwarded } of grades) {
      if (!Number.isFinite(marksAwarded) || marksAwarded < 0) {
        throw new ValidationError("Marks awarded must be a non-negative number");
      }
      const targetQuestion = questions.find((q) => q.id === questionId);
      if (
        !targetQuestion ||
        (targetQuestion.type !== "short_answer" && targetQuestion.type !== "essay")
      ) {
        throw new ValidationError(
          "Only short answer and essay questions can be manually graded",
        );
      }
      const examQuestion = examQuestions.find((q) => q.questionId === questionId);
      const maxMarks = examQuestion?.marks ?? targetQuestion.marks;
      if (marksAwarded > maxMarks) {
        throw new ValidationError(`Marks awarded cannot exceed ${maxMarks}`);
      }
      answers[`${questionId}_marks`] = marksAwarded;
    }

    // Recompute the attempt score every time a written question is graded:
    //   - Auto-graded questions (mcq, true_false, multi_select) use the answer
    //     the learner submitted on the attempt.
    //   - Written questions (short_answer, essay) use the marks the instructor
    //     already awarded (stored as "<questionId>_marks").
    // The attempt is only marked as fully graded once ALL written questions
    // have been given marks. Until then score/passed/graded stay pending.
    let score = 0;
    let manualPending = false;

    for (const eq of examQuestions) {
      const question = questions.find((q) => q.id === eq.questionId);
      if (!question) continue;

      const marks = eq.marks ?? question.marks;
      const userAnswer = answers[eq.questionId];

      if (question.type === "mcq" || question.type === "true_false") {
        const correct = question.correctAnswer as string;
        if (userAnswer === correct) {
          score += marks;
        } else if (question.negativeMarks > 0) {
          score -= question.negativeMarks;
        }
      } else if (question.type === "multi_select") {
        const correct = question.correctAnswer as string[];
        const userAnswers = (
          Array.isArray(userAnswer) ? userAnswer : [userAnswer]
        ) as unknown[];
        const isCorrect =
          correct.length === userAnswers.length &&
          correct.every((c) => userAnswers.includes(c));
        if (isCorrect) {
          score += marks;
        } else if (question.negativeMarks > 0) {
          score -= question.negativeMarks;
        }
      } else {
        // short_answer / essay — graded manually by the instructor
        const awarded = answers[`${eq.questionId}_marks`];
        if (typeof awarded === "number" && awarded >= 0) {
          score += awarded;
        } else {
          manualPending = true;
        }
      }
    }

    const allGraded = !manualPending;
    const passThreshold = this.getPassThreshold(
      attempt.totalMarks,
      attempt.exam.passMark,
    );

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        // Once every written question has been graded, finalize the attempt:
        // store the total score and the pass/fail status.
        ...(allGraded
          ? {
              score,
              passed: score >= passThreshold,
              graded: true,
              gradedBy: instructorId,
            }
          : {}),
      },
    });

    return {
      message: allGraded ? "Attempt fully graded" : "Answer graded",
      graded: allGraded,
      ...(allGraded ? { score, passed: score >= passThreshold } : {}),
    };
  }

  async getExamAttempts(examId: string) {
    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      include: {
        learnerProfile: {
          select: {
            id: true,
            displayName: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return attempts.map((attempt) => ({
      id: attempt.id,
      examId: attempt.examId,
      examTitle: attempt.exam.title,
      learnerProfileId: attempt.learnerProfileId,
      learnerName: attempt.learnerProfile?.displayName ?? "Unknown",
      attemptNumber: attempt.attemptNumber,
      answers: attempt.answers,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      passed: attempt.passed,
      graded: attempt.graded,
      gradedBy: attempt.gradedBy,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    }));
  }

  async getAttemptDetails(attemptId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        learnerProfile: {
          select: {
            id: true,
            displayName: true,
          },
        },
        exam: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundError("Attempt not found");
    }

    // Fetch the questions belonging to this attempt so grading pages get the
    // exact questions the learner had to answer (not the whole bank). REGULAR
    // dynamic exams store the per-attempt set under `__questionSet`.
    const storedQuestionSet = (attempt.answers as Record<string, unknown>)[
      "__questionSet"
    ] as
      | Array<{ questionId: string; marks: number }>
      | undefined;
    const examQuestions =
      storedQuestionSet && storedQuestionSet.length > 0
        ? storedQuestionSet
        : (attempt.exam.questions as Array<{
            questionId: string;
            marks?: number;
          }>);

    const questions = await prisma.question.findMany({
      where: {
        id: { in: examQuestions.map((q) => q.questionId) },
      },
      select: {
        id: true,
        type: true,
        question: true,
        options: true,
        correctAnswer: true,
        suggestedAnswer: true,
        marks: true,
        explanation: true,
      },
    });

    // Attach per-question marks defined on the exam
    const questionList = examQuestions
      .map((examQuestion) => {
        const question = questions.find(
          (q) => q.id === examQuestion.questionId,
        );

        if (!question) return null;

        return {
          ...question,
          marks: examQuestion.marks ?? question.marks,
        };
      })
      .filter((q): q is NonNullable<typeof q> => q !== null);

    return {
      id: attempt.id,
      examId: attempt.examId,
      learnerProfileId: attempt.learnerProfileId,
      learnerName: attempt.learnerProfile?.displayName ?? "Unknown",
      attemptNumber: attempt.attemptNumber,
      answers: attempt.answers,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      passed: attempt.passed,
      graded: attempt.graded,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      questions: questionList,
    };
  }

  async getExamQuestionsForLearner(examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundError("Exam not found");
    }

    // Get question IDs from exam. REGULAR course exams (dynamic) have an empty
    // list — a fresh random set is generated from the course bank up to the
    // instructor-defined total marks for every attempt.
    const examQuestions = exam.questions as Array<{
      questionId: string;
      marks?: number;
    }>;
    const isDynamic = examQuestions.length === 0;

    let selected = examQuestions;
    if (isDynamic) {
      selected = await this.buildRandomQuestionSet(
        exam.courseId,
        exam.totalMarks,
      );
    }

    // Fetch full question details
    const questions = await prisma.question.findMany({
      where: {
        id: { in: selected.map((q) => q.questionId) },
      },
      select: {
        id: true,
        type: true,
        question: true,
        options: true,
        correctAnswer: true, // Include for auto-grading
        marks: true,
        difficulty: true,
      },
    });

    // Return questions WITHOUT correctAnswer for learner
    const learnerQuestions = questions.map((question) => {
      const selection = selected.find((s) => s.questionId === question.id);
      return {
        id: question.id,
        type: question.type,
        question: question.question,
        options: question.options,
        marks: selection?.marks ?? question.marks,
        difficulty: question.difficulty,
      };
    });

    // Include exam metadata (duration, marks, etc.) along with the questions
    // so the take page can build a dynamic countdown timer.
    return {
      exam: {
        id: exam.id,
        title: exam.title,
        type: exam.type,
        duration: exam.duration,
        passMark: exam.passMark,
        totalMarks: exam.totalMarks,
        maxAttempts: exam.maxAttempts,
        // Scheduled start time for ONLINE_CLASS exams (null for REGULAR).
        openDate: exam.openDate,
        closeDate: exam.closeDate,
      },
      questions: learnerQuestions,
    };
  }

  async getMyAttempts(examId: string, learnerProfileId: string) {
    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId,
        learnerProfileId,
      },
      orderBy: { attemptNumber: "desc" },
    });

    return attempts;
  }

  async getExamResult(examId: string, learnerProfileId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        title: true,
        passMark: true,
        totalMarks: true,
        type: true,
        duration: true,
        openDate: true,
        questions: true,
      },
    });

    if (!exam) {
      throw new NotFoundError("Exam not found");
    }

    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId,
        learnerProfileId,
      },
      orderBy: { attemptNumber: "asc" },
    });

    // Best graded attempt (highest score). When an exam contains short-answer /
    // essay questions the whole attempt is stored with score = null until it is
    // manually graded, so those attempts used to be dropped here and their
    // answers never returned. Fall back to the most recent attempt so the
    // learner's written answers are still shown while grading is pending.
    const gradedAttempts = attempts
      .filter((a) => a.score !== null)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const bestAttempt =
      gradedAttempts[0] ?? attempts[attempts.length - 1] ?? null;

    // Exam questions are stored as JSON on the Exam model. REGULAR dynamic
    // exams keep the per-attempt random set inside the attempt itself.
    const baseExamQuestions = exam.questions as Array<{
      questionId: string;
      marks?: number;
    }>;
    const storedQuestionSet = bestAttempt
      ? ((bestAttempt.answers as Record<string, unknown>)["__questionSet"] as
          | Array<{ questionId: string; marks: number }>
          | undefined)
      : undefined;
    const examQuestions =
      storedQuestionSet && storedQuestionSet.length > 0
        ? storedQuestionSet
        : baseExamQuestions;

    // Get the actual question records
    const questionIds = examQuestions.map((q) => q.questionId);

    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: questionIds,
        },
      },
      select: {
        id: true,
        type: true,
        question: true,
        options: true,
        correctAnswer: true,
        suggestedAnswer: true,
        marks: true,
        explanation: true,
      },
    });

    // Convert learner answers into an easy lookup object
    const answers = bestAttempt?.answers as Record<string, unknown> | null;

    // Build question-by-question result
    const questionResults = examQuestions
      .map((examQuestion) => {
        const question = questions.find(
          (q) => q.id === examQuestion.questionId,
        );

        if (!question) {
          return null;
        }

        const myAnswer = answers?.[question.id] ?? null;

        const marks = examQuestion.marks ?? question.marks;

        // Marks awarded for manually graded questions
        const marksAwarded = answers?.[`${question.id}_marks`] ?? null;

        return {
          questionId: question.id,
          question: question.question,
          type: question.type,
          options: question.options,

          // Correct answer
          correctAnswer: question.correctAnswer,

          // Learner's answer
          myAnswer,

          // Useful for written/manual questions
          suggestedAnswer: question.suggestedAnswer,

          marks,
          marksAwarded,
          attemptNumber: bestAttempt?.attemptNumber ?? null,

          explanation: question.explanation,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      exam: {
        id: exam.id,
        title: exam.title,
        passMark: exam.passMark,
        totalMarks: exam.totalMarks,
        type: exam.type,
        duration: exam.duration,
        openDate: exam.openDate,
      },

      attempts: attempts.map((a) => ({
        id: a.id,
        examId: a.examId,
        examTitle: exam.title,
        learnerProfileId: a.learnerProfileId,
        attemptNumber: a.attemptNumber,
        score: a.score,
        totalMarks: a.totalMarks,
        passed: a.passed,
        graded: a.graded,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
      })),

      bestAttempt: bestAttempt
        ? {
            id: bestAttempt.id,
            examId: bestAttempt.examId,
            examTitle: exam.title,
            learnerProfileId: bestAttempt.learnerProfileId,
            attemptNumber: bestAttempt.attemptNumber,
            score: bestAttempt.score,
            totalMarks: bestAttempt.totalMarks,
            passed: bestAttempt.passed,
            graded: bestAttempt.graded,
            startedAt: bestAttempt.startedAt,
            submittedAt: bestAttempt.submittedAt,
          }
        : null,

      questionResults,
    };
  }
}

export const examService = new ExamService();
