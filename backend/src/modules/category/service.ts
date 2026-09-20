import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "#/shared/errors";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "#/modules/category/schema";

export class CategoryService {
  async create(input: CreateCategoryInput) {
    // Check duplicate name
    const existingName = await prisma.category.findUnique({
      where: { name: input.name },
    });

    if (existingName) {
      throw new ConflictError("A category with this name already exists");
    }

    // Check duplicate slug
    const existingSlug = await prisma.category.findUnique({
      where: { slug: input.slug },
    });

    if (existingSlug) {
      throw new ConflictError("A category with this slug already exists");
    }

    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        icon: input.icon ?? null,
        order: input.order,
      },
    });

    return category;
  }

  async update(categoryId: string, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Check duplicate name if changing
    if (input.name && input.name !== category.name) {
      const existing = await prisma.category.findUnique({
        where: { name: input.name },
      });
      if (existing) {
        throw new ConflictError("A category with this name already exists");
      }
    }

    // Check duplicate slug if changing
    if (input.slug && input.slug !== category.slug) {
      const existing = await prisma.category.findUnique({
        where: { slug: input.slug },
      });
      if (existing) {
        throw new ConflictError("A category with this slug already exists");
      }
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description !== undefined && {
          description: input.description || null,
        }),
        ...(input.icon !== undefined && { icon: input.icon || null }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.active !== undefined && { active: input.active }),
      },
    });

    return updated;
  }

  async delete(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    if (category._count.courses > 0) {
      throw new ValidationError(
        `Cannot delete category: ${category._count.courses} course(s) are assigned to it. Reassign them first.`,
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async list(includeInactive = false) {
    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { active: true },
      include: {
        _count: {
          select: {
            courses: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
      active: cat.active,
      courseCount: cat._count.courses,
      createdAt: cat.createdAt,
    }));
  }

  async getById(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return category;
  }
}

export const categoryService = new CategoryService();
