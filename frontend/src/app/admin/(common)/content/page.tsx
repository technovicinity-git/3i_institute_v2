"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  FileText,
  HelpCircle,
  Pencil,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import {
  useAdminFaq,
  useAdminPages,
  useAdminSettings,
  useCreateFaqMutation,
  useDeleteFaqMutation,
  useSaveSettingsMutation,
  useUpdateFaqMutation,
} from "@/hooks/use-content";
import type { FaqItem, SiteSettings } from "@/services/content.service";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { SOCIAL_LABELS, type SocialNetwork } from "@/components/landing/social-icon";
import { formatDate } from "@/lib/date-format";

type Tab = "pages" | "faq" | "settings";

const input =
  "w-full rounded-lg border border-[#E3E8EF] px-3 py-2 text-sm text-[#0C1F33] focus:outline-none focus:ring-2 focus:ring-[#12304E]/20";
const label = "block text-xs font-semibold text-[#64748B] mb-1";

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("pages");

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: "pages", label: "Pages", icon: FileText },
    { key: "faq", label: "FAQ", icon: HelpCircle },
    { key: "settings", label: "Site settings", icon: Settings2 },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Content
        </h1>
        <p className="text-base text-[#64748B]">
          Legal and info pages, help questions and contact details shown on
          the public site.
        </p>
      </div>

      <div className="flex gap-1 border-b border-[#E3E8EF] mb-6 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap ${
                tab === t.key
                  ? "border-[#12304E] text-[#0C1F33]"
                  : "border-transparent text-[#64748B] hover:text-[#0C1F33]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "pages" && <PagesTab />}
      {tab === "faq" && <FaqTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}

// ─── Pages ───

function PagesTab() {
  const router = useRouter();
  const { data: pages, isLoading } = useAdminPages();
  const [newSlug, setNewSlug] = useState("");
  const slugValid = /^[a-z0-9-]+$/.test(newSlug);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden divide-y divide-[#E3E8EF]">
        {(pages ?? []).map((page) => (
          <div
            key={page.slug}
            className="flex flex-wrap items-center gap-4 px-5 py-4"
          >
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm font-semibold text-[#0C1F33]">
                {page.title}
              </p>
              <p className="text-xs text-[#64748B]">
                /pages/{page.slug}
                {page.updatedAt &&
                  ` · Updated ${formatDate(page.updatedAt)}`}
              </p>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                page.published
                  ? "bg-[#22A146]/10 text-[#22A146]"
                  : page.id
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-gray-100 text-[#64748B]"
              }`}
            >
              {page.published ? "PUBLISHED" : page.id ? "DRAFT" : "NOT WRITTEN"}
            </span>
            {page.published && (
              <a
                href={`/pages/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#64748B] hover:text-[#0C1F33]"
                aria-label="View public page"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <Link
              href={`/admin/content/pages/${page.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E3E8EF] px-3 py-1.5 text-sm font-semibold text-[#12304E] hover:bg-gray-50"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E3E8EF] rounded-xl p-5">
        <p className="text-sm font-semibold text-[#0C1F33] mb-1">
          New custom page
        </p>
        <p className="text-xs text-[#64748B] mb-3">
          Choose its web address, e.g. <code>about-us</code> becomes{" "}
          <code>/pages/about-us</code>.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={newSlug}
            onChange={(e) =>
              setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
            }
            placeholder="page-address"
            className={`${input} max-w-xs`}
          />
          <button
            disabled={!slugValid}
            onClick={() => router.push(`/admin/content/pages/${newSlug}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#22A146] text-white text-sm font-semibold disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ ───

const emptyFaq = { category: "", question: "", answer: "", order: 0, published: true };

function FaqTab() {
  const { data: faq, isLoading } = useAdminFaq();
  const createFaq = useCreateFaqMutation();
  const updateFaq = useUpdateFaqMutation();
  const deleteFaq = useDeleteFaqMutation();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<(typeof emptyFaq & { id?: string }) | null>(
    null,
  );

  if (isLoading) return <Spinner />;

  const categories = [...new Set((faq ?? []).map((f) => f.category))];
  const grouped = categories.map((category) => ({
    category,
    items: (faq ?? []).filter((f) => f.category === category),
  }));

  const save = () => {
    if (!editing) return;
    const { id, ...data } = editing;
    const onSuccess = () => setEditing(null);
    if (id) updateFaq.mutate({ id, input: data }, { onSuccess });
    else createFaq.mutate(data, { onSuccess });
  };

  const startEdit = (item: FaqItem) =>
    setEditing({
      id: item.id,
      category: item.category,
      question: item.question,
      answer: item.answer,
      order: item.order,
      published: item.published,
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() =>
            setEditing({ ...emptyFaq, category: categories[0] ?? "" })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#22A146] text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add question
        </button>
      </div>

      {grouped.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center text-sm text-[#64748B]">
          No questions yet. Add the questions families ask most — accounts,
          learner profiles, billing, live classes, certificates.
        </div>
      )}

      {grouped.map(({ category, items }) => (
        <section key={category}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#64748B] mb-2">
            {category}
          </h2>
          <div className="bg-white border border-[#E3E8EF] rounded-xl divide-y divide-[#E3E8EF]">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1F33]">
                    {item.question}
                    {!item.published && (
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-[#64748B]">
                        HIDDEN
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                    {item.answer}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(item)}
                  className="text-[#64748B] hover:text-[#0C1F33]"
                  aria-label="Edit question"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    confirm({
                      title: "Delete FAQ question?",
                      description: (
                        <>
                          &ldquo;{item.question}&rdquo; will be removed from the
                          help page. This can&apos;t be undone.
                        </>
                      ),
                      confirmLabel: "Delete question",
                      onConfirm: () => deleteFaq.mutateAsync(item.id),
                    })
                  }
                  className="text-[#64748B] hover:text-red-600"
                  aria-label="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            aria-label="Close"
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditing(null)}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold text-[#0C1F33]">
              {editing.id ? "Edit question" : "Add question"}
            </h2>
            <div>
              <label className={label}>Category</label>
              <input
                list="faq-categories"
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                placeholder="e.g. Billing"
                className={input}
              />
              <datalist id="faq-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={label}>Question</label>
              <input
                value={editing.question}
                onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Answer</label>
              <textarea
                rows={5}
                value={editing.answer}
                onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                className={input}
              />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <label className={label}>Order</label>
                <input
                  type="number"
                  min={0}
                  value={editing.order}
                  onChange={(e) =>
                    setEditing({ ...editing, order: Number(e.target.value) || 0 })
                  }
                  className={`${input} w-24`}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#0C1F33] mt-4">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) =>
                    setEditing({ ...editing, published: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#12304E]"
                />
                Show on Help Center
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2 border border-[#E3E8EF] rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={
                  !editing.category.trim() ||
                  !editing.question.trim() ||
                  !editing.answer.trim() ||
                  createFaq.isPending ||
                  updateFaq.isPending
                }
                className="flex-1 py-2 rounded-lg bg-[#22A146] text-white text-sm font-semibold disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Site settings ───

function SettingsTab() {
  const { data, isLoading } = useAdminSettings();
  if (isLoading || !data) return <Spinner />;
  // Keyed so the form re-initialises after the settings reload.
  return <SettingsForm key={JSON.stringify(data)} initial={data} />;
}

function SettingsForm({ initial }: { initial: SiteSettings }) {
  const save = useSaveSettingsMutation();
  const [form, setForm] = useState<SiteSettings>(initial);
  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm({ ...form, [key]: value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(form);
      }}
      className="space-y-6"
    >
      <section className="bg-white border border-[#E3E8EF] rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-[#0C1F33]">Contact details</h2>
        <p className="text-xs text-[#64748B] -mt-3">
          Shown on the Contact page. Leave a field empty to hide it.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Email</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input
              value={form.contactPhone}
              onChange={(e) => set("contactPhone", e.target.value)}
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Support hours</label>
            <input
              value={form.supportHours}
              onChange={(e) => set("supportHours", e.target.value)}
              placeholder="e.g. Mon–Fri, 9am–5pm AEST"
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Address</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className={input}
            />
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#E3E8EF] rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-[#0C1F33]">Social links</h2>
        <p className="text-xs text-[#64748B] -mt-3">
          Full URLs. Only filled-in links appear in the footer.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(form.social) as SocialNetwork[]).map((network) => (
            <div key={network}>
              <label className={label}>{SOCIAL_LABELS[network]}</label>
              <input
                type="url"
                value={form.social[network]}
                onChange={(e) =>
                  set("social", { ...form.social, [network]: e.target.value })
                }
                placeholder="https://"
                className={input}
              />
            </div>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={save.isPending}
        className="px-6 py-2.5 rounded-lg bg-[#22A146] text-white text-sm font-semibold disabled:opacity-50"
      >
        {save.isPending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
    </div>
  );
}
