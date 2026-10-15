import Link from "next/link";
import { NotebookPen } from "lucide-react";
import type { RecentNote } from "@/types/dashboard";
import { SectionHeader } from "./section-header";
import { card } from "./utils";
import { useTranslations } from "next-intl";

export function RecentNotes({ notes }: { notes: RecentNote[] }) {
  const t = useTranslations("dashboardHome.notes");
  if (notes.length === 0) return null;
  return (
    <div>
      <SectionHeader title={t("title")} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/my-courses/${note.courseId}/lessons/${note.lessonId}`}
            className={`${card} p-5 border-s-[3px] border-s-[#B8912F] hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#B8912F] uppercase mb-1">
              <NotebookPen className="w-3 h-3" />
              <span className="truncate">{note.courseTitle}</span>
            </div>
            <p className="text-[13px] font-semibold text-[#0C1F33] truncate mb-1.5">
              {note.lessonTitle}
            </p>
            <p className="text-[13px] text-[#4B5563] leading-relaxed line-clamp-3 whitespace-pre-line">
              {note.text}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
