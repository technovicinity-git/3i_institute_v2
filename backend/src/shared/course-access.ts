import { prisma } from "#/lib/prisma";

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  return user?.role.name === "Admin";
}

// A course can be managed by its instructor or by any admin. Admins use the
// same course-management endpoints as instructors from the admin panel.
export async function canManageCourse(
  actorId: string,
  courseInstructorId: string,
): Promise<boolean> {
  if (actorId === courseInstructorId) return true;
  return isAdmin(actorId);
}
