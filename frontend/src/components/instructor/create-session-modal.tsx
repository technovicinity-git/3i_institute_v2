"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useAddSessionMutation } from "@/hooks/use-batches";
import { useQueryClient } from "@tanstack/react-query";

interface CreateSessionModalProps {
  batchId: string;
  onClose: () => void;
}

export function CreateSessionModal({
  batchId,
  onClose,
}: CreateSessionModalProps) {
  const queryClient = useQueryClient();
  const addSessionMutation = useAddSessionMutation();

  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!title.trim() || !scheduledAt) return;

    addSessionMutation.mutate(
      {
        batchId,
        input: {
          title: title.trim(),
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMinutes: Number(durationMinutes),
          meetingLink: meetingLink.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["batch", batchId] });
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-xl p-6 w-full max-w-[520px] max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#0C1F33]">
            Add New Session
          </h3>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0C1F33]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Session Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 1 - Introduction"
              disabled={addSessionMutation.isPending}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
            />
          </div>

          {/* Date + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                disabled={addSessionMutation.isPending}
                className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
                Duration (min)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                disabled={addSessionMutation.isPending}
                className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Meeting link */}
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Meeting Link
            </label>
            <input
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              disabled={addSessionMutation.isPending}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes about this session..."
              disabled={addSessionMutation.isPending}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[#E3E8EF]">
          <button
            type="button"
            onClick={onClose}
            disabled={addSessionMutation.isPending}
            className="px-5 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold text-[#0C1F33] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={
              addSessionMutation.isPending || !title.trim() || !scheduledAt
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {addSessionMutation.isPending ? "Adding..." : "Add Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
