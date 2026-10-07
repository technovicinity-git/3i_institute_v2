"use client";

import { useState, type ReactNode } from "react";
import {
  Bell,
  Check,
  Loader2,
  Megaphone,
  Send,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type {
  BroadcastChannel,
  BroadcastContent,
  BroadcastPreview,
} from "@/services/broadcast.service";

const TITLE_MAX = 100;
const BODY_MAX = 1000;

// ──────────────────────────────────
// Selectable card (used for audience and channel choices)
// ──────────────────────────────────

export function OptionCard({
  icon: Icon,
  label,
  description,
  selected,
  disabled,
  onClick,
  role = "radio",
}: {
  icon: LucideIcon;
  label: string;
  description?: ReactNode;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  role?: "radio" | "checkbox";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-[#0D2B45] bg-[#0D2B45]/[0.03] ring-1 ring-[#0D2B45]"
          : "border-[#E3E8EF] bg-white hover:border-[#CBD5E1]",
        disabled && "cursor-not-allowed opacity-50 hover:border-[#E3E8EF]",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          selected ? "bg-[#0D2B45] text-white" : "bg-[#F1F5F9] text-[#64748B]",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#0C1F33]">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-[#64748B]">
            {description}
          </span>
        )}
      </span>
      {selected && (
        <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#0D2B45] text-white">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}

export function ComposerSection({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#334155]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0D2B45] text-[11px] font-bold text-white">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

// ──────────────────────────────────
// Composer
// ──────────────────────────────────

interface BroadcastComposerProps {
  /** Audience controls, rendered as step 1. */
  audience: ReactNode;
  /** Short description of who will receive it, e.g. "all instructors". */
  audienceLabel: string;
  preview?: BroadcastPreview;
  previewLoading?: boolean;
  /** False until the audience is fully chosen. */
  ready?: boolean;
  onSend: (content: BroadcastContent) => Promise<unknown>;
}

export function BroadcastComposer({
  audience,
  audienceLabel,
  preview,
  previewLoading,
  ready = true,
  onSend,
}: BroadcastComposerProps) {
  const confirm = useConfirm();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channels, setChannels] = useState<BroadcastChannel[]>(["IN_APP"]);

  const pushAvailable = preview?.pushConfigured ?? true;
  const activeChannels = channels.filter(
    (c) => c !== "PUSH" || pushAvailable,
  );
  const recipients = preview?.recipientCount ?? 0;

  const toggleChannel = (channel: BroadcastChannel) =>
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((c) => c !== channel)
        : [...current, channel],
    );

  const canSend =
    ready &&
    !previewLoading &&
    recipients > 0 &&
    activeChannels.length > 0 &&
    title.trim().length > 0 &&
    body.trim().length > 0;

  const channelText = activeChannels
    .map((c) => (c === "IN_APP" ? "in-app" : "push"))
    .join(" and ");

  const handleSend = () => {
    confirm({
      tone: "info",
      icon: Megaphone,
      title: `Send to ${recipients} recipient${recipients === 1 ? "" : "s"}?`,
      description: (
        <>
          This {channelText} notification goes to {audienceLabel}. It
          can&apos;t be recalled once sent.
        </>
      ),
      confirmLabel: "Send now",
      onConfirm: async () => {
        await onSend({
          title: title.trim(),
          body: body.trim(),
          channels: activeChannels,
        });
        setTitle("");
        setBody("");
      },
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-7 rounded-xl border border-[#E3E8EF] bg-white p-5 md:p-6">
        <ComposerSection step={1} title="Who should receive it?">
          {audience}
        </ComposerSection>

        <ComposerSection step={2} title="How should it be delivered?">
          <div className="grid gap-3 sm:grid-cols-2">
            <OptionCard
              role="checkbox"
              icon={Bell}
              label="In-app"
              description="Appears in the notification bell on web and mobile."
              selected={channels.includes("IN_APP")}
              onClick={() => toggleChannel("IN_APP")}
            />
            <OptionCard
              role="checkbox"
              icon={Smartphone}
              label="Push"
              description={
                pushAvailable
                  ? "Pops up on phones that allowed notifications."
                  : "Not configured on the server yet."
              }
              selected={pushAvailable && channels.includes("PUSH")}
              disabled={!pushAvailable}
              onClick={() => toggleChannel("PUSH")}
            />
          </div>
          {activeChannels.length === 0 && (
            <p className="mt-2 text-xs text-red-600">
              Choose at least one channel.
            </p>
          )}
        </ComposerSection>

        <ComposerSection step={3} title="Message">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="broadcast-title"
                  className="text-sm font-medium text-[#334155]"
                >
                  Title
                </label>
                <span className="text-xs text-[#94A3B8]">
                  {title.length}/{TITLE_MAX}
                </span>
              </div>
              <input
                id="broadcast-title"
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Class rescheduled to Friday"
                className="w-full rounded-lg border border-[#E3E8EF] px-3 py-2.5 text-sm outline-none focus:border-[#0D2B45] focus:ring-2 focus:ring-[#0D2B45]/10"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="broadcast-body"
                  className="text-sm font-medium text-[#334155]"
                >
                  Message
                </label>
                <span className="text-xs text-[#94A3B8]">
                  {body.length}/{BODY_MAX}
                </span>
              </div>
              <textarea
                id="broadcast-body"
                value={body}
                maxLength={BODY_MAX}
                rows={5}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message…"
                className="w-full resize-y rounded-lg border border-[#E3E8EF] px-3 py-2.5 text-sm outline-none focus:border-[#0D2B45] focus:ring-2 focus:ring-[#0D2B45]/10"
              />
            </div>
          </div>
        </ComposerSection>

        <div className="flex flex-col-reverse gap-3 border-t border-[#E3E8EF] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <RecipientSummary
            ready={ready}
            loading={previewLoading}
            preview={preview}
            pushSelected={activeChannels.includes("PUSH")}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0D2B45] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0C1F33] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Send notification
          </button>
        </div>
      </div>

      <MessagePreview title={title} body={body} />
    </div>
  );
}

function RecipientSummary({
  ready,
  loading,
  preview,
  pushSelected,
}: {
  ready: boolean;
  loading?: boolean;
  preview?: BroadcastPreview;
  pushSelected: boolean;
}) {
  if (!ready) {
    return (
      <p className="text-sm text-[#94A3B8]">Choose who to notify first.</p>
    );
  }
  if (loading || !preview) {
    return (
      <p className="flex items-center gap-2 text-sm text-[#64748B]">
        <Loader2 className="h-4 w-4 animate-spin" /> Counting recipients…
      </p>
    );
  }
  if (preview.recipientCount === 0) {
    return (
      <p className="text-sm text-orange-600">
        No one to notify in this audience yet.
      </p>
    );
  }
  return (
    <p className="text-sm text-[#64748B]">
      Reaches{" "}
      <span className="font-semibold text-[#0C1F33]">
        {preview.recipientCount}
      </span>{" "}
      {preview.recipientCount === 1 ? "person" : "people"}
      {pushSelected && (
        <>
          {" · "}
          <span className="font-semibold text-[#0C1F33]">
            {preview.pushDeviceCount}
          </span>{" "}
          device{preview.pushDeviceCount === 1 ? "" : "s"} with push enabled
        </>
      )}
    </p>
  );
}

function MessagePreview({ title, body }: { title: string; body: string }) {
  return (
    <aside className="h-fit rounded-xl border border-[#E3E8EF] bg-[#FBF9F4] p-5 lg:sticky lg:top-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#64748B]">
        Preview
      </p>
      <div className="rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-[#E3E8EF]">
        <div className="mb-2 flex items-center gap-2 text-[11px] text-[#94A3B8]">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#0D2B45] text-[9px] font-bold text-white">
            3i
          </span>
          3i Institute · now
        </div>
        <p className="text-sm font-semibold break-words text-[#0C1F33]">
          {title.trim() || "Notification title"}
        </p>
        <p className="mt-0.5 line-clamp-4 text-sm break-words whitespace-pre-line text-[#64748B]">
          {body.trim() || "Your message will appear here."}
        </p>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#94A3B8]">
        Push notifications on phones may cut long messages short. The full
        text is always shown in the app.
      </p>
    </aside>
  );
}
