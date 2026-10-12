import { prisma } from "#/lib/prisma";
import { NotFoundError } from "#/shared/errors";
import {
  siteSettingsSchema,
  type FaqItemInput,
  type SiteSettings,
  type UpsertPageInput,
} from "#/modules/content/schema";

/** Pages every deployment needs; listed for admins even before they exist. */
export const STANDARD_PAGES = [
  { slug: "terms", title: "Terms of Service" },
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "child-safety", title: "Child Safety Policy" },
  { slug: "refund-policy", title: "Refund & Billing Policy" },
] as const;

const SETTINGS_KEY = "site";

export class ContentService {
  // ─── Pages ───

  /** Standard pages (created or not) followed by any custom pages. */
  async listPages() {
    const pages = await prisma.sitePage.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        publishedAt: true,
        updatedAt: true,
      },
      orderBy: { title: "asc" },
    });
    const bySlug = new Map(pages.map((p) => [p.slug, p]));
    const standard = STANDARD_PAGES.map(
      (std) =>
        bySlug.get(std.slug) ?? {
          id: null,
          slug: std.slug,
          title: std.title,
          published: false,
          publishedAt: null,
          updatedAt: null,
        },
    );
    const custom = pages.filter(
      (p) => !STANDARD_PAGES.some((std) => std.slug === p.slug),
    );
    return [...standard, ...custom];
  }

  async getPageForAdmin(slug: string) {
    const page = await prisma.sitePage.findUnique({ where: { slug } });
    if (page) return page;
    const std = STANDARD_PAGES.find((p) => p.slug === slug);
    if (!std) throw new NotFoundError("Page not found");
    return {
      id: null,
      slug,
      title: std.title,
      body: "",
      published: false,
      publishedAt: null,
      updatedAt: null,
    };
  }

  async upsertPage(slug: string, input: UpsertPageInput, adminId: string) {
    const existing = await prisma.sitePage.findUnique({
      where: { slug },
      select: { published: true, publishedAt: true },
    });
    // Keep the original publish date while it stays published.
    const publishedAt = input.published
      ? existing?.published
        ? existing.publishedAt
        : new Date()
      : null;
    return prisma.sitePage.upsert({
      where: { slug },
      create: { slug, ...input, publishedAt, updatedById: adminId },
      update: { ...input, publishedAt, updatedById: adminId },
    });
  }

  async deletePage(slug: string) {
    if (STANDARD_PAGES.some((p) => p.slug === slug)) {
      // Standard pages can be unpublished but not removed.
      await prisma.sitePage.updateMany({
        where: { slug },
        data: { published: false, publishedAt: null },
      });
      return;
    }
    await prisma.sitePage.deleteMany({ where: { slug } });
  }

  async getPublishedPage(slug: string) {
    const page = await prisma.sitePage.findFirst({
      where: { slug, published: true },
      select: { slug: true, title: true, body: true, updatedAt: true },
    });
    if (!page) throw new NotFoundError("Page not found");
    return page;
  }

  async listPublishedPages() {
    return prisma.sitePage.findMany({
      where: { published: true },
      select: { slug: true, title: true },
      orderBy: { title: "asc" },
    });
  }

  // ─── FAQ ───

  async listFaq(includeUnpublished: boolean) {
    return prisma.faqItem.findMany({
      where: includeUnpublished ? {} : { published: true },
      orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });
  }

  async createFaq(input: FaqItemInput) {
    return prisma.faqItem.create({ data: input });
  }

  async updateFaq(id: string, input: Partial<FaqItemInput>) {
    const exists = await prisma.faqItem.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("FAQ item not found");
    return prisma.faqItem.update({ where: { id }, data: input });
  }

  async deleteFaq(id: string) {
    await prisma.faqItem.deleteMany({ where: { id } });
  }

  // ─── Settings ───

  async getSettings(): Promise<SiteSettings> {
    const row = await prisma.siteSetting.findUnique({
      where: { key: SETTINGS_KEY },
    });
    // Parsing fills in defaults for any fields added since it was saved.
    const parsed = siteSettingsSchema.safeParse(row?.value ?? {});
    return parsed.success ? parsed.data : siteSettingsSchema.parse({});
  }

  async saveSettings(settings: SiteSettings, adminId: string) {
    await prisma.siteSetting.upsert({
      where: { key: SETTINGS_KEY },
      create: { key: SETTINGS_KEY, value: settings, updatedById: adminId },
      update: { value: settings, updatedById: adminId },
    });
    return settings;
  }
}

export const contentService = new ContentService();
