"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Markdown } from "@/components/content/markdown";
import { RichTextEditor } from "@/components/content/rich-text-editor";
import {
  useAdminPage,
  useDeletePageMutation,
  useSavePageMutation,
} from "@/hooks/use-content";
import type { SitePage } from "@/services/content.service";

const STANDARD_SLUGS = ["terms", "privacy", "child-safety", "refund-policy"];

export default function AdminPageEditor() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useAdminPage(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
      </div>
    );
  }

  // A custom page that doesn't exist yet starts empty.
  const page: Omit<SitePage, "id"> & { id: string | null } =
    data ??
    (isError
      ? {
          id: null,
          slug,
          title: "",
          body: "",
          published: false,
          publishedAt: null,
          updatedAt: null,
        }
      : (null as never));

  return <Editor key={page.updatedAt ?? "new"} page={page} />;
}

function Editor({
  page,
}: {
  page: Omit<SitePage, "id"> & { id: string | null };
}) {
  const router = useRouter();
  const save = useSavePageMutation(page.slug);
  const remove = useDeletePageMutation();
  const [title, setTitle] = useState(page.title);
  const [body, setBody] = useState(page.body);
  // The editor may tidy the stored Markdown when it loads; compare against
  // that so simply opening a page doesn't count as a change.
  const [savedBody, setSavedBody] = useState(page.body);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const isStandard = STANDARD_SLUGS.includes(page.slug);
  const dirty = title !== page.title || body !== savedBody;

  const submit = (published: boolean) =>
    save.mutate({ title: title.trim(), body, published });

  return (
    <div className="p-6 md:p-10">
      <button
        onClick={() => router.push("/admin/content")}
        className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to content
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-[#64748B]">/pages/{page.slug}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                page.published
                  ? "bg-[#22A146]/10 text-[#22A146]"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {page.published ? "PUBLISHED" : "DRAFT"}
            </span>
            {page.published && (
              <a
                href={`/pages/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
              >
                View live <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {dirty && (
              <span className="text-xs text-[#94A3B8]">Unsaved changes</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {page.id && (
            <button
              onClick={() => {
                const message = isStandard
                  ? "Unpublish this page? It will be hidden from the site."
                  : "Delete this page permanently?";
                if (!confirm(message)) return;
                remove.mutate(page.slug, {
                  onSuccess: () => {
                    if (!isStandard) router.push("/admin/content");
                  },
                });
              }}
              disabled={remove.isPending || (isStandard && !page.published)}
              className="px-4 py-2 rounded-lg border border-red-300 text-sm font-semibold text-red-600 disabled:opacity-40"
            >
              {isStandard ? "Unpublish" : "Delete"}
            </button>
          )}
          <button
            onClick={() => submit(false)}
            disabled={!title.trim() || save.isPending}
            className="px-4 py-2 rounded-lg border border-[#E3E8EF] text-sm font-semibold text-[#0C1F33] disabled:opacity-50"
          >
            {page.published ? "Save as draft" : "Save draft"}
          </button>
          <button
            onClick={() => submit(true)}
            disabled={!title.trim() || !body.trim() || save.isPending}
            className="px-4 py-2 rounded-lg bg-[#22A146] text-white text-sm font-semibold disabled:opacity-50"
          >
            {page.published ? "Save & keep published" : "Publish"}
          </button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Page title"
        className="w-full text-2xl md:text-3xl text-[#0C1F33] bg-transparent border-b border-[#E3E8EF] pb-2 mb-6 focus:outline-none focus:border-[#12304E]"
        style={{ fontFamily: "'Marcellus', serif" }}
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex rounded-lg border border-[#E3E8EF] bg-white p-0.5">
          {(["edit", "preview"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md capitalize ${
                view === v
                  ? "bg-[#12304E] text-white"
                  : "text-[#64748B] hover:text-[#0C1F33]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {view === "preview" && (
          <p className="text-xs text-[#94A3B8]">
            Shown exactly as visitors will see it.
          </p>
        )}
      </div>

      {/* Kept mounted while previewing so undo history survives. */}
      <div className={view === "edit" ? "" : "hidden"}>
        <RichTextEditor
          value={page.body}
          onChange={setBody}
          onReady={(markdown) => {
            setBody(markdown);
            setSavedBody(markdown);
          }}
          placeholder="Start writing the page content…"
        />
      </div>
      {view === "preview" && (
        <div className="bg-white border border-[#E3E8EF] rounded-xl p-6 md:p-10 min-h-[420px]">
          {body.trim() ? (
            <Markdown source={body} />
          ) : (
            <p className="text-sm text-[#94A3B8]">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
