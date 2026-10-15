"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileQuestion } from "lucide-react";
import { Markdown } from "@/components/content/markdown";
import { usePublicPage } from "@/hooks/use-content";
import { useTranslations } from "next-intl";
import { useDateFormat } from "@/i18n/use-date-format";

export default function SitePageView() {
  const t = useTranslations("sitePage");
  const format = useDateFormat();
  const params = useParams<{ slug: string }>();
  const { data: page, isLoading, isError } = usePublicPage(params.slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="font-serif text-2xl text-[#0C1F33]">{t("notFound")}</h1>
        <p className="mt-2 text-sm text-[#64748B]">{t("notFoundBody")}</p>
        <Link
          href="/"
          className="inline-block mt-6 text-sm font-semibold text-[#22A146] hover:underline"
        >
          {t("home")}
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <h1 className="font-serif text-3xl md:text-[44px] leading-tight text-[#0C1F33]">
        {page.title}
      </h1>
      <p className="mt-3 mb-10 text-sm text-[#64748B]">
        {t("updated", { date: format.longDate(page.updatedAt) })}
      </p>
      <Markdown source={page.body} />
    </article>
  );
}
