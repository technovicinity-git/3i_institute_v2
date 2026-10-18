"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, LifeBuoy, Search } from "lucide-react";
import { usePublicFaq } from "@/hooks/use-content";
import { useTranslations } from "next-intl";

export default function HelpPage() {
  const t = useTranslations("help");
  const { data: faq, isLoading } = usePublicFaq();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, NonNullable<typeof faq>>();
    for (const item of faq ?? []) {
      if (
        q &&
        !item.question.toLowerCase().includes(q) &&
        !item.answer.toLowerCase().includes(q)
      ) {
        continue;
      }
      map.set(item.category, [...(map.get(item.category) ?? []), item]);
    }
    return [...map];
  }, [faq, query]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <p className="text-xs font-semibold text-[#B8912F] uppercase tracking-widest mb-2">
        {t("eyebrow")}
      </p>
      <h1 className="font-serif text-3xl md:text-[44px] leading-tight text-[#0C1F33]">
        {t("title")}
      </h1>

      <div className="relative mt-8 mb-10">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="w-full h-12 ps-11 pe-4 rounded-xl border border-[#E3E8EF] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#12304E]/20"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="text-sm text-[#64748B]">
          {query ? t("noMatch", { query }) : t("none")}
        </p>
      ) : (
        <div className="space-y-10">
          {groups.map(([category, items]) => (
            <section key={category}>
              <h2 className="font-serif text-xl text-[#0C1F33] mb-4">
                {category}
              </h2>
              <div className="divide-y divide-[#E3E8EF] rounded-xl border border-[#E3E8EF] bg-white">
                {items.map((item) => {
                  const open = openId === item.id;
                  return (
                    <div key={item.id}>
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : item.id)}
                        aria-expanded={open}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start"
                      >
                        <span className="text-sm font-semibold text-[#0C1F33]">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 text-[#64748B] transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      {open && (
                        <p className="px-5 pb-5 -mt-1 text-sm leading-6 text-[#475569] whitespace-pre-line">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-14 rounded-xl bg-[#FBF9F4] p-6 flex flex-wrap items-center gap-4">
        <LifeBuoy className="w-8 h-8 text-[#B8912F]" />
        <div className="flex-1 min-w-[200px]">
          <p className="font-semibold text-[#0C1F33]">{t("stillNeed")}</p>
          <p className="text-sm text-[#64748B]">{t("happy")}</p>
        </div>
        <Link
          href="/contact"
          className="px-5 py-2.5 rounded-lg bg-[#12304E] text-white text-sm font-semibold hover:bg-[#1a4268]"
        >
          {t("contactUs")}
        </Link>
      </div>
    </div>
  );
}
