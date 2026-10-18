import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export const card = "bg-white rounded-xl border border-[#E3E8EF]";
export const serif = { fontFamily: "var(--font-display)" };

export function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(value: string): string {
  const hours = Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(value);
}

/** Percentage change of the last 30 days vs the 30 days before. */
export function Change({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0) {
    return current > 0 ? (
      <span className="text-xs font-semibold text-[#22A146]">New activity</span>
    ) : (
      <span className="text-xs text-[#94A3B8]">No change</span>
    );
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-[#22A146]" : "text-red-600"}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {Math.abs(pct)}% vs prior 30d
    </span>
  );
}

export function SectionHeader({
  title,
  href,
  linkLabel = "View all",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-[#0C1F33]">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-sm font-semibold text-[#22A146] hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
