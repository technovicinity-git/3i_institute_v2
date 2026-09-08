import type { Request, Response, NextFunction } from "express";
import { examService } from "#/modules/exam/service";
import {
  createQuestionSchema,
  createExamSchema,
  submitExamSchema,
} from "#/modules/exam/schema";
import { sendSuccess } from "#/shared/response";

export class ExamController {
  // Questions
  createQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user?.sub!;
      const input = createQuestionSchema.parse(req.body);
      const question = await examService.createQuestion(ownerId, input);
      sendSuccess(res, question, 201, "Question created");
    } catch (error) {
      next(error);
    }
  };

  getMyQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user?.sub!;
      const questions = await examService.getMyQuestions(ownerId);
      sendSuccess(res, questions, 200);
    } catch (error) {
      next(error);
    }
  };

  getAdminQuestions = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const questions = await examService.getAdminQuestions();
      sendSuccess(res, questions, 200);
    } catch (error) {
      next(error);
    }
  };

  getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub!;
      const userRole = req.user?.role!;
      const question = await examService.getQuestionById(
        req.params["id"] as string,
        userId,
        userRole,
      );
      sendSuccess(res, question, 200);
    } catch (error) {
      next(error);
    }
  };

  deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user?.sub!;
      await examService.deleteQuestion(req.params["id"] as string, ownerId);
      sendSuccess(res, null, 200, "Question deleted");
    } catch (error) {
      next(error);
    }
  };

  // Exams
  createExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const input = createExamSchema.parse(req.body);
      const exam = await examService.createExam(instructorId, input);
      sendSuccess(res, exam, 201, "Exam created");
    } catch (error) {
      next(error);
    }
  };

  getCourseExams = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params["courseId"] as string;
      const learnerProfileId = req.query["learnerProfileId"] as
        string | undefined;
      const exams = await examService.getCourseExams(
        courseId,
        learnerProfileId,
      );
      sendSuccess(res, exams, 200);
    } catch (error) {
      next(error);
    }
  };

  submitExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const input = submitExamSchema.parse(req.body);
      const attempt = await examService.submitExam(accountId, input);
      sendSuccess(res, attempt, 201, "Exam submitted");
    } catch (error) {
      next(error);
    }
  };

  gradeWrittenAnswer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const instructorId = req.user?.sub!;
      const { marksAwarded, questionId } = req.body;
      await examService.gradeWrittenAnswer(
        instructorId,
        req.params["attemptId"] as string,
        questionId,
        marksAwarded,
      );
      sendSuccess(res, null, 200, "Answer graded");
    } catch (error) {
      next(error);
    }
  };

  getExamAttempts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const examId = req.params["examId"] as string;
      const attempts = await examService.getExamAttempts(examId);
      sendSuccess(res, attempts, 200);
    } catch (error) {
      next(error);
    }
  };

  getAttemptDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const attemptId = req.params["attemptId"] as string;
      const attempt = await examService.getAttemptDetails(attemptId);
      sendSuccess(res, attempt, 200);
    } catch (error) {
      next(error);
    }
  };

  updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user?.sub!;
      const questionId = req.params["id"] as string;
      const input = createQuestionSchema.partial().parse(req.body);
      const question = await examService.updateQuestion(
        questionId,
        ownerId,
        input,
      );
      sendSuccess(res, question, 200, "Question updated");
    } catch (error) {
      next(error);
    }
  };

  getExamQuestions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const examId = req.params["examId"] as string;
      const questions = await examService.getExamQuestionsForLearner(examId);
      sendSuccess(res, questions, 200);
    } catch (error) {
      next(error);
    }
  };

  getMyAttempts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const examId = req.query["examId"] as string;
      const learnerProfileId = req.query["learnerProfileId"] as string;

      if (!examId || !learnerProfileId) {
        res.status(422).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "examId and learnerProfileId are required",
          },
        });
        return;
      }

      const attempts = await examService.getMyAttempts(
        examId,
        learnerProfileId,
      );
      sendSuccess(res, attempts, 200);
    } catch (error) {
      next(error);
    }
  };

  getExamResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const examId = req.query["examId"] as string;
      const learnerProfileId = req.query["learnerProfileId"] as string;

      if (!examId || !learnerProfileId) {
        res.status(422).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "examId and learnerProfileId are required",
          },
        });
        return;
      }

      const result = await examService.getExamResult(examId, learnerProfileId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const examController = new ExamController();
