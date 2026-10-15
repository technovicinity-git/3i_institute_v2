import Link from "next/link";
import { serif } from "./utils";
import { useTranslations } from "next-intl";

export function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  const tCommon = useTranslations("common");
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
          {linkLabel ?? tCommon("viewAll")}
        </Link>
      )}
    </div>
  );
}

export function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#64748B]">{children}</p>;
}
