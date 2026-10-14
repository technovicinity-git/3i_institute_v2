import Link from "next/link";
import { serif } from "./utils";

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
      <h2 className="text-[18px] text-[#0C1F33]" style={serif}>
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-[13px] font-semibold text-[#22A146] hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#64748B]">{children}</p>;
}
