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

    // Get ALL notes for this material under this account
    const notes = await prisma.auditLog.findMany({
      where: {
        userId: accountId,
        action: "LESSON_NOTE",
        resourceId: materialId,
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by learnerProfileId from details
    const learnerNote = notes.find((note) => {
      const details = note.details as any;
      return details?.learnerProfileId === learnerProfileId;
    });

    return learnerNote ?? null;
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

    // Find existing note for THIS specific learner profile
    const existingNotes = await prisma.auditLog.findMany({
      where: {
        userId: accountId,
        action: "LESSON_NOTE",
        resourceId: materialId,
      },
    });

    const existingNote = existingNotes.find((note) => {
      const details = note.details as any;
      return details?.learnerProfileId === learnerProfileId;
    });

    if (existingNote) {
      return prisma.auditLog.update({
        where: { id: existingNote.id },
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
