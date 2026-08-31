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
      const exams = await examService.getCourseExams(
        req.params["courseId"] as string,
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
}

export const examController = new ExamController();
