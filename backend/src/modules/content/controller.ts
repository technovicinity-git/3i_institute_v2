import type { Request, Response, NextFunction } from "express";
import { contentService } from "#/modules/content/service";
import {
  faqItemSchema,
  pageSlugSchema,
  siteSettingsSchema,
  upsertPageSchema,
} from "#/modules/content/schema";
import { sendSuccess } from "#/shared/response";

type Handler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const handle =
  (fn: (req: Request, res: Response) => Promise<void>): Handler =>
  async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };

export class ContentController {
  // ─── Admin ───
  listPages = handle(async (_req, res) => {
    sendSuccess(res, await contentService.listPages(), 200);
  });

  getPage = handle(async (req, res) => {
    const slug = pageSlugSchema.parse(req.params["slug"]);
    sendSuccess(res, await contentService.getPageForAdmin(slug), 200);
  });

  savePage = handle(async (req, res) => {
    const slug = pageSlugSchema.parse(req.params["slug"]);
    const input = upsertPageSchema.parse(req.body);
    const page = await contentService.upsertPage(slug, input, req.user!.sub);
    sendSuccess(res, page, 200, "Page saved");
  });

  deletePage = handle(async (req, res) => {
    const slug = pageSlugSchema.parse(req.params["slug"]);
    await contentService.deletePage(slug);
    sendSuccess(res, null, 200, "Page removed");
  });

  listFaqAdmin = handle(async (_req, res) => {
    sendSuccess(res, await contentService.listFaq(true), 200);
  });

  createFaq = handle(async (req, res) => {
    const item = await contentService.createFaq(faqItemSchema.parse(req.body));
    sendSuccess(res, item, 201, "FAQ item created");
  });

  updateFaq = handle(async (req, res) => {
    const item = await contentService.updateFaq(
      req.params["id"] as string,
      faqItemSchema.partial().parse(req.body),
    );
    sendSuccess(res, item, 200, "FAQ item updated");
  });

  deleteFaq = handle(async (req, res) => {
    await contentService.deleteFaq(req.params["id"] as string);
    sendSuccess(res, null, 200, "FAQ item deleted");
  });

  getSettingsAdmin = handle(async (_req, res) => {
    sendSuccess(res, await contentService.getSettings(), 200);
  });

  saveSettings = handle(async (req, res) => {
    const settings = siteSettingsSchema.parse(req.body);
    sendSuccess(
      res,
      await contentService.saveSettings(settings, req.user!.sub),
      200,
      "Settings saved",
    );
  });

  // ─── Public ───
  publicPages = handle(async (_req, res) => {
    sendSuccess(res, await contentService.listPublishedPages(), 200);
  });

  publicPage = handle(async (req, res) => {
    const slug = pageSlugSchema.parse(req.params["slug"]);
    sendSuccess(res, await contentService.getPublishedPage(slug), 200);
  });

  publicFaq = handle(async (_req, res) => {
    sendSuccess(res, await contentService.listFaq(false), 200);
  });

  publicSettings = handle(async (_req, res) => {
    sendSuccess(res, await contentService.getSettings(), 200);
  });
}

export const contentController = new ContentController();
