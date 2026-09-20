"use client";

import { useState } from "react";
import { Tags, Plus, Edit3, Trash2, X } from "lucide-react";
import {
  useCategories,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/hooks/use-categories";
import type { Category } from "@/services/category.service";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories(true);
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Categories
          </h1>
          <p className="text-base text-[#64748B]">
            {categories?.length ?? 0} categories
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
        >
          <Plus className="w-4 h-4" />
          Create Category
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && categories?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Tags className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No categories yet.</p>
        </div>
      )}

      {/* Category list */}
      {!isLoading && categories && categories.length > 0 && (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`bg-white rounded-xl border p-5 flex items-center justify-between flex-wrap gap-3 ${
                category.active
                  ? "border-[#E3E8EF]"
                  : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                  <Tags className="w-5 h-5 text-[#B8912F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[#0C1F33]">
                      {category.name}
                    </p>
                    {!category.active && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    /{category.slug} • {category.courseCount} course(s)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="p-2 rounded-lg hover:bg-[#2563EB]/10 text-[#2563EB]"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {/* <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete "${category.name}"? This cannot be undone.`,
                      )
                    ) {
                      deleteMutation.mutate(category.id);
                    }
                  }}
                  disabled={
                    deleteMutation.isPending || category.courseCount > 0
                  }
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  title={
                    category.courseCount > 0
                      ? "Cannot delete: courses assigned"
                      : "Delete"
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCategory) && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCategory(null);
          }}
          onSubmit={(data) => {
            if (editingCategory) {
              updateMutation.mutate(
                { id: editingCategory.id, input: data },
                {
                  onSuccess: () => {
                    setEditingCategory(null);
                  },
                },
              );
            } else {
              createMutation.mutate(data, {
                onSuccess: () => {
                  setShowCreateModal(false);
                },
              });
            }
          }}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

// ─── Category Form Modal ───

function CategoryFormModal({
  category,
  onClose,
  onSubmit,
  isPending,
}: {
  category: Category | null;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    slug: string;
    description?: string;
    order?: number;
    active?: boolean;
  }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [order, setOrder] = useState(category?.order ?? 0);
  const [active, setActive] = useState(category?.active ?? true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!category);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      order,
      ...(category && { active }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-[500px] z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#0C1F33]">
            {category ? "Edit Category" : "Create Category"}
          </h3>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0C1F33]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Name *</label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isPending}
              placeholder="e.g. Islamic Studies"
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Slug *</label>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              disabled={isPending}
              placeholder="e.g. islamic-studies"
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
              required
            />
            <p className="text-xs text-[#64748B] mt-1">
              Used in URLs. Only lowercase letters, numbers, and hyphens.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={3}
              placeholder="Brief description (optional)"
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              disabled={isPending}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
            />
          </div>

          {category && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                disabled={isPending}
                className="w-4 h-4"
              />
              <label htmlFor="active" className="text-sm cursor-pointer">
                Active (visible to learners)
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim() || !slug.trim()}
              className="flex-1 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {isPending ? "Saving..." : category ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
