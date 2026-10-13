"use client";

import { useRef, useState } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENTS_BYTES,
} from "@/services/admin-email.service";

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const ACCEPT = ALLOWED_ATTACHMENT_EXTENSIONS.map((ext) => `.${ext}`).join(",");

export function AttachmentPicker({
  value,
  onChange,
}: {
  value: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const total = value.reduce((sum, file) => sum + file.size, 0);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setError(null);
    const next = [...value];
    for (const file of Array.from(incoming)) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) {
        setError(`"${file.name}" can't be attached.`);
        continue;
      }
      if (next.length >= MAX_ATTACHMENTS) {
        setError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
        break;
      }
      const size = next.reduce((sum, f) => sum + f.size, 0) + file.size;
      if (size > MAX_ATTACHMENTS_BYTES) {
        setError(
          `Attachments can be at most ${formatBytes(MAX_ATTACHMENTS_BYTES)} in total.`,
        );
        continue;
      }
      if (!next.some((f) => f.name === file.name && f.size === file.size)) {
        next.push(file);
      }
    }
    onChange(next);
  };

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-3 space-y-2">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-[#E3E8EF] bg-white px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-[#64748B]" />
              <span className="min-w-0 flex-1 truncate text-sm text-[#0C1F33]">
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-[#94A3B8]">
                {formatBytes(file.size)}
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#64748B] hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={value.length >= MAX_ATTACHMENTS}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-medium text-[#334155] hover:border-[#0D2B45] hover:text-[#0D2B45] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Paperclip className="h-4 w-4" />
        Attach files
      </button>
      <p className="mt-2 text-xs text-[#94A3B8]">
        Optional · up to {MAX_ATTACHMENTS} files,{" "}
        {formatBytes(MAX_ATTACHMENTS_BYTES)} in total
        {value.length > 0 && ` · ${formatBytes(total)} used`}. PDF, images,
        Word, Excel, PowerPoint, TXT or CSV.
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
