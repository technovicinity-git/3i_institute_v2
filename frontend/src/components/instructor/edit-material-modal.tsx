"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { toast } from "sonner";
import { useUpdateMaterialMutation } from "@/hooks/use-materials";

interface EditMaterialModalProps {
  material: {
    id: string;
    title: string;
    description?: string | null;
    order: number;
  };
  onClose: () => void;
}

export function EditMaterialModal({
  material,
  onClose,
}: EditMaterialModalProps) {
  const updateMutation = useUpdateMaterialMutation();
  const [title, setTitle] = useState(material.title);
  const [description, setDescription] = useState(material.description ?? "");
  const [order, setOrder] = useState(material.order);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    updateMutation.mutate(
      {
        materialId: material.id,
        input: {
          title: title.trim(),
          description: description.trim(),
          order,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-[500px] z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#0C1F33]">
            Edit Material
          </h3>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0C1F33]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={updateMutation.isPending}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Overview / Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={updateMutation.isPending}
              rows={4}
              placeholder="Brief overview of this lesson..."
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              disabled={updateMutation.isPending}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="flex-1 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold text-[#0C1F33] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
