import { prisma } from "#/lib/prisma";
import { NotFoundError } from "#/shared/errors";

export class NoteService {
  async getNotes(
    accountId: string,
    learnerProfileId: string,
    materialId: string,
  ) {
    // Verify profile belongs to account
    const profile = await prisma.learnerProfile.findFirst({
      where: { id: learnerProfileId, accountId, deletedAt: null },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    const note = await prisma.auditLog.findFirst({
      where: {
        userId: accountId,
        action: "LESSON_NOTE",
        resourceId: materialId,
      },
    });

    return note;
  }

  async saveNote(
    accountId: string,
    learnerProfileId: string,
    materialId: string,
    content: string,
  ) {
    const profile = await prisma.learnerProfile.findFirst({
      where: { id: learnerProfileId, accountId, deletedAt: null },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // Check if note exists
    const existing = await prisma.auditLog.findFirst({
      where: {
        userId: accountId,
        action: "LESSON_NOTE",
        resourceId: materialId,
      },
    });

    if (existing) {
      return prisma.auditLog.update({
        where: { id: existing.id },
        data: {
          details: {
            learnerProfileId,
            content,
          },
        },
      });
    }

    return prisma.auditLog.create({
      data: {
        userId: accountId,
        action: "LESSON_NOTE",
        resource: "lesson_note",
        resourceId: materialId,
        details: {
          learnerProfileId,
          content,
        },
      },
    });
  }
}

export const noteService = new NoteService();
