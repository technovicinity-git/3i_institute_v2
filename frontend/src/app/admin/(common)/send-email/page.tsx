"use client";

import { useState } from "react";
import {
  GraduationCap,
  Loader2,
  Mail,
  Send,
  UserRoundSearch,
  Users,
  UsersRound,
} from "lucide-react";
import {
  ComposerSection,
  OptionCard,
} from "@/components/notifications/broadcast/broadcast-composer";
import { RichTextEditor } from "@/components/content/rich-text-editor";
import {
  UserPicker,
  type PickedUser,
} from "@/components/admin/send-email/user-picker";
import { AttachmentPicker } from "@/components/admin/send-email/attachment-picker";
import { EmailHistory } from "@/components/admin/send-email/email-history";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  useAdminEmailPreview,
  useSendAdminEmail,
} from "@/hooks/use-admin-emails";
import type { AdminEmailAudience } from "@/services/admin-email.service";

const SUBJECT_MAX = 200;

const AUDIENCES: {
  value: AdminEmailAudience;
  label: string;
  description: string;
  icon: typeof Users;
}[] = [
  {
    value: "INSTRUCTORS",
    label: "Instructors",
    description: "Every active instructor.",
    icon: GraduationCap,
  },
  {
    value: "LEARNERS",
    label: "Learners",
    description: "Every learner account.",
    icon: UsersRound,
  },
  {
    value: "ALL",
    label: "Everyone",
    description: "Instructors and learners.",
    icon: Users,
  },
  {
    value: "USERS",
    label: "Specific people",
    description: "Search and pick users.",
    icon: UserRoundSearch,
  },
];

const AUDIENCE_LABEL: Record<AdminEmailAudience, string> = {
  INSTRUCTORS: "all instructors",
  LEARNERS: "all learner accounts",
  ALL: "all instructors and learners",
  USERS: "the people you picked",
};

// True when the editor holds no visible text (e.g. only empty paragraphs).
const isBlankMarkdown = (markdown: string) =>
  markdown.replace(/&nbsp;|[\s#*_>\-\\]/g, "").length === 0;

export default function AdminSendEmailPage() {
  const confirm = useConfirm();
  const send = useSendAdminEmail();

  const [audience, setAudience] = useState<AdminEmailAudience>("LEARNERS");
  const [people, setPeople] = useState<PickedUser[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [greeting, setGreeting] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  // Changing the key remounts the editor, which clears it after sending.
  const [editorKey, setEditorKey] = useState(0);

  const userIds = people.map((p) => p.id);
  const preview = useAdminEmailPreview(audience, userIds);
  const recipients =
    audience === "USERS" && people.length === 0
      ? 0
      : (preview.data?.recipientCount ?? 0);

  const ready = audience !== "USERS" || people.length > 0;
  const canSend =
    ready &&
    !preview.isLoading &&
    recipients > 0 &&
    subject.trim().length > 0 &&
    !isBlankMarkdown(body) &&
    !send.isPending;

  const handleSend = () => {
    confirm({
      tone: "info",
      icon: Mail,
      title: `Email ${recipients} recipient${recipients === 1 ? "" : "s"}?`,
      description: (
        <>
          This email goes to {AUDIENCE_LABEL[audience]}
          {attachments.length > 0 &&
            ` with ${attachments.length} attachment${attachments.length === 1 ? "" : "s"}`}
          . It can&apos;t be recalled once sent.
        </>
      ),
      confirmLabel: "Send now",
      onConfirm: async () => {
        await send.mutateAsync({
          audience,
          userIds: audience === "USERS" ? userIds : undefined,
          subject: subject.trim(),
          body,
          greeting,
          attachments,
        });
        setSubject("");
        setBody("");
        setAttachments([]);
        setPeople([]);
        setEditorKey((key) => key + 1);
      },
    });
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Send Email
        </h1>
        <p className="text-base text-[#64748B]">
          Email instructors, learners or specific people, with attachments if
          needed.
        </p>
      </div>

      <div className="space-y-7 rounded-xl border border-[#E3E8EF] bg-white p-5 md:p-6">
        <ComposerSection step={1} title="Who should receive it?">
          <div
            role="radiogroup"
            aria-label="Audience"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {AUDIENCES.map((option) => (
              <OptionCard
                key={option.value}
                icon={option.icon}
                label={option.label}
                description={option.description}
                selected={audience === option.value}
                onClick={() => setAudience(option.value)}
              />
            ))}
          </div>
          {audience === "USERS" && (
            <div className="mt-3">
              <UserPicker value={people} onChange={setPeople} />
            </div>
          )}
        </ComposerSection>

        <ComposerSection step={2} title="Email">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="email-subject"
                  className="text-sm font-medium text-[#334155]"
                >
                  Subject
                </label>
                <span className="text-xs text-[#94A3B8]">
                  {subject.length}/{SUBJECT_MAX}
                </span>
              </div>
              <input
                id="email-subject"
                value={subject}
                maxLength={SUBJECT_MAX}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Ramadan timetable and class changes"
                className="w-full rounded-lg border border-[#E3E8EF] px-3 py-2.5 text-sm outline-none focus:border-[#0D2B45] focus:ring-2 focus:ring-[#0D2B45]/10"
              />
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium text-[#334155]">
                Message
              </p>
              <label className="mb-2 flex w-fit cursor-pointer items-center gap-2 text-sm text-[#334155]">
                <input
                  type="checkbox"
                  checked={greeting}
                  onChange={(e) => setGreeting(e.target.checked)}
                  className="h-4 w-4 accent-[#0D2B45]"
                />
                Start with &ldquo;Assalamu alaikum &lt;first name&gt;,&rdquo;
              </label>
              <RichTextEditor
                key={editorKey}
                value=""
                onChange={setBody}
                placeholder="Write your email…"
              />
            </div>
          </div>
        </ComposerSection>

        <ComposerSection step={3} title="Attachments">
          <AttachmentPicker value={attachments} onChange={setAttachments} />
        </ComposerSection>

        <div className="flex flex-col-reverse gap-3 border-t border-[#E3E8EF] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <RecipientSummary
            ready={ready}
            loading={preview.isLoading}
            recipients={recipients}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0D2B45] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0C1F33] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {send.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send email
          </button>
        </div>
      </div>

      <EmailHistory />
    </div>
  );
}

function RecipientSummary({
  ready,
  loading,
  recipients,
}: {
  ready: boolean;
  loading: boolean;
  recipients: number;
}) {
  if (!ready) {
    return (
      <p className="text-sm text-[#94A3B8]">Pick at least one person first.</p>
    );
  }
  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-[#64748B]">
        <Loader2 className="h-4 w-4 animate-spin" /> Counting recipients…
      </p>
    );
  }
  if (recipients === 0) {
    return (
      <p className="text-sm text-orange-600">
        No one in this audience has a verified email yet.
      </p>
    );
  }
  return (
    <p className="text-sm text-[#64748B]">
      Reaches{" "}
      <span className="font-semibold text-[#0C1F33]">{recipients}</span>{" "}
      {recipients === 1 ? "person" : "people"} with a verified email
    </p>
  );
}
