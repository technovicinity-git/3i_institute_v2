import type { Request, Response, NextFunction } from "express";
import { assignmentService } from "#/modules/assignment/service";
import { sendSuccess } from "#/shared/response";
import { z } from "zod";

const createAssignmentSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dueDate: z.string().optional(),
  totalMarks: z.number().int().min(1).max(1000),
});

const gradeSubmissionSchema = z.object({
  marksAwarded: z.number().min(0),
  feedback: z.string().max(2000).optional(),
});

export class AssignmentController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const input = createAssignmentSchema.parse(req.body);
      const assignment = await assignmentService.create(instructorId, input);
      sendSuccess(res, assignment, 201, "Assignment created");
    } catch (error) {
      next(error);
    }
  };

  getAssignments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const courseId = req.query["courseId"] as string | undefined;
      const assignments = await assignmentService.getAssignments(
        instructorId,
        courseId,
      );
      sendSuccess(res, assignments, 200);
    } catch (error) {
      next(error);
    }
  };

  getSubmissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const assignmentId = req.params["assignmentId"] as string;
      const submissions = await assignmentService.getSubmissions(
        instructorId,
        assignmentId,
      );
      sendSuccess(res, submissions, 200);
    } catch (error) {
      next(error);
    }
  };

  gradeSubmission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const submissionId = req.params["submissionId"] as string;
      const { marksAwarded, feedback } = gradeSubmissionSchema.parse(req.body);
      const result = await assignmentService.gradeSubmission(
        instructorId,
        submissionId,
        marksAwarded,
        feedback ?? "",
      );
      sendSuccess(res, result, 200, "Submission graded");
    } catch (error) {
      next(error);
    }
  };
}

export const assignmentController = new AssignmentController();
