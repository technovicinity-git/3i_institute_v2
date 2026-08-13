import { z } from "zod";

const sessionSchema = z.object({
  title: z.string().min(1, "Session title is required").max(255),
  scheduledAt: z.string().refine((value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, "Invalid date"),
  durationMinutes: z.number().int().min(15).max(480),
  meetingLink: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
});

export const createBatchSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  name: z.string().min(1, "Batch name is required").max(255),
  capacity: z.number().int().min(1).max(1000),
  sessions: z.array(sessionSchema).min(1, "At least one session is required"),
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export const updateBatchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  capacity: z.number().int().min(1).max(1000).optional(),
});

export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;

export const addSessionSchema = sessionSchema;

export type AddSessionInput = z.infer<typeof addSessionSchema>;

export const markAttendanceSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  learnerProfileId: z.string().uuid("Invalid learner profile ID"),
  status: z.enum(["present", "absent", "late", "excused"]),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
