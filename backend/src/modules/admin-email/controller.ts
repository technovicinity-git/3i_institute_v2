import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendSuccess } from "#/shared/response";
import { ValidationError } from "#/shared/errors";
import type { MailAttachment } from "#/lib/mailer";
import {
  adminEmailService,
  ALLOWED_ATTACHMENT_EXTENSIONS,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENTS_BYTES,
} from "#/modules/admin-email/service";

const audienceSchema = z.enum(["INSTRUCTORS", "LEARNERS", "ALL", "USERS"]);

// Multipart form fields arrive as strings; userIds is a JSON array.
const userIdsField = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value) return undefined;
    try {
      return z
        .array(z.string().uuid())
        .max(100, "Choose at most 100 people")
        .parse(JSON.parse(value));
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid list of people" });
      return z.NEVER;
    }
  });

const sendSchema = z
  .object({
    audience: audienceSchema,
    userIds: userIdsField,
    subject: z.string().trim().min(1, "Subject is required").max(200),
    body: z.string().trim().min(1, "Message is required").max(50_000),
    greeting: z
      .enum(["true", "false"])
      .default("true")
      .transform((value) => value === "true"),
  })
  .refine((input) => input.audience !== "USERS" || input.userIds?.length, {
    message: "Choose at least one person",
    path: ["userIds"],
  });

const previewSchema = z.object({
  audience: audienceSchema,
  // Comma-separated in the query string.
  userIds: z
    .string()
    .optional()
    .transform((value) =>
      value ? value.split(",").filter(Boolean).slice(0, 100) : [],
    ),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function parse<T extends z.ZodType>(schema: T, value: unknown): z.output<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message ?? "Invalid input",
      result.error.issues,
    );
  }
  return result.data;
}

function toAttachments(files: Express.Multer.File[] = []): MailAttachment[] {
  if (files.length > MAX_ATTACHMENTS) {
    throw new ValidationError(`Attach at most ${MAX_ATTACHMENTS} files`);
  }
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_ATTACHMENTS_BYTES) {
    throw new ValidationError(
      `Attachments can be at most ${MAX_ATTACHMENTS_BYTES / 1024 / 1024}MB in total`,
    );
  }
  return files.map((file) => {
    const extension = file.originalname.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension)) {
      throw new ValidationError(
        `"${file.originalname}" can't be attached. Allowed: ${ALLOWED_ATTACHMENT_EXTENSIONS.join(", ")}`,
      );
    }
    return {
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype,
    };
  });
}

export class AdminEmailController {
  preview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { audience, userIds } = parse(previewSchema, req.query);
      sendSuccess(res, await adminEmailService.preview(audience, userIds), 200);
    } catch (error) {
      next(error);
    }
  };

  send = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = parse(sendSchema, req.body);
      const attachments = toAttachments(req.files as Express.Multer.File[]);
      const result = await adminEmailService.send(
        req.user!.sub,
        input,
        attachments,
      );
      sendSuccess(res, result, 201, "Email is being sent");
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = parse(listQuerySchema, req.query);
      sendSuccess(res, await adminEmailService.list(page, limit), 200);
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(
        res,
        await adminEmailService.get(req.params["id"] as string),
        200,
      );
    } catch (error) {
      next(error);
    }
  };
}

export const adminEmailController = new AdminEmailController();
