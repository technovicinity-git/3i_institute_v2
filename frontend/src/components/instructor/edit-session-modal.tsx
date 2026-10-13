"use client";

import { useState } from "react";
import { X, Save, Trash2 } from "lucide-react";
import {
  useUpdateSessionMutation,
  useDeleteSessionMutation,
} from "@/hooks/use-batches";
import type { Session } from "@/types/batch";
import {
  describeSessionNotice,
  plainDeleteConfirmation,
  type SessionNotice,
} from "@/lib/session-notice";
import { SessionNoticeDialog } from "@/components/instructor/session-notice-dialog";

interface EditSessionModalProps {
  session: Session;
  // Enrolled (non-waitlisted) learners, who are notified of changes.
  learnerCount: number;
  onClose: () => void;
}

// The change waiting for the instructor to confirm in the dialog.
type PendingConfirmation = { notice: SessionNotice; action: "save" | "delete" };

// Convert ISO date to datetime-local format
function toDateTimeLocal(dateStr: string): string {
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function EditSessionModal({
  session,
  learnerCount,
  onClose,
}: EditSessionModalProps) {
  const updateMutation = useUpdateSessionMutation();
  const deleteMutation = useDeleteSessionMutation();

  const [title, setTitle] = useState(session.title);
  const [scheduledAt, setScheduledAt] = useState(
    toDateTimeLocal(session.scheduledAt),
  );
  const [durationMinutes, setDurationMinutes] = useState(
    session.durationMinutes,
  );
  const [meetingLink, setMeetingLink] = useState(session.meetingLink ?? "");
  const [notes, setNotes] = useState(session.notes ?? "");
  const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(
    null,
  );

  const buildInput = () => ({
    title: title.trim(),
    scheduledAt: new Date(scheduledAt).toISOString(),
    durationMinutes: Number(durationMinutes),
    meetingLink: meetingLink.trim(),
    notes: notes.trim(),
  });

  // Asks for confirmation first when learners will be notified.
  const handleSave = () => {
    if (!title.trim() || !scheduledAt) return;

    const notice = describeSessionNotice(
      { action: "edit", before: session, after: buildInput() },
      learnerCount,
    );
    if (notice) {
      setConfirmation({ notice, action: "save" });
      return;
    }
    save();
  };

  const save = () => {
    updateMutation.mutate(
      { sessionId: session.id, input: buildInput() },
      {
        onSuccess: () => onClose(),
        onError: () => setConfirmation(null),
      },
    );
  };

  // Deleting always asks first; the message says whether learners hear
  // about it.
  const handleDelete = () => {
    const notice =
      describeSessionNotice(
        { action: "delete", before: session },
        learnerCount,
      ) ?? plainDeleteConfirmation;
    setConfirmation({ notice, action: "delete" });
  };

  const remove = () => {
    deleteMutation.mutate(session.id, {
      onSuccess: () => onClose(),
      onError: () => setConfirmation(null),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-xl p-6 w-full max-w-[520px] max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#0C1F33]">Edit Session</h3>
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
              disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
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
              disabled={updateMutation.isPending}
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
              disabled={updateMutation.isPending}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-[#E3E8EF]">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending || updateMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold text-[#0C1F33] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={
                updateMutation.isPending || !title.trim() || !scheduledAt
              }
              className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {confirmation && (
        <SessionNoticeDialog
          notice={confirmation.notice}
          pending={updateMutation.isPending || deleteMutation.isPending}
          onConfirm={confirmation.action === "save" ? save : remove}
          onCancel={() => setConfirmation(null)}
        />
      )}
    </div>
  );
}
