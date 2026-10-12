"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";

/** Real course categories with published courses, largest first. */
export default function Programs() {
  const { data: categories, isLoading } = useCategories();

  const pathways = (categories ?? [])
    .filter((c) => c.courseCount > 0)
    .sort((a, b) => b.courseCount - a.courseCount)
    .slice(0, 6);

  if (!isLoading && pathways.length === 0) return null;

  return (
    <section
      id="pathways"
      className="w-full bg-[#FBF9F4] py-16 md:py-24 px-6 scroll-mt-20"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="flex flex-col gap-3">
            <p className="text-[12px] font-bold tracking-[0.15em] uppercase text-[#B8912F]">
              Curriculum Pathways
            </p>
            <h2 className="font-serif text-3xl md:text-[40px] text-[#12304E]">
              Choose Your Pathway
            </h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#12304E] hover:underline"
          >
            All courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="h-[220px] rounded-xl border border-[#E3E8EF] bg-white animate-pulse"
                />
              ))
            : pathways.map((pathway) => (
                <Link
                  key={pathway.id}
                  href={`/courses?category=${pathway.id}`}
                  className="group bg-white rounded-xl border border-[#E3E8EF] p-8 flex flex-col gap-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-[#B8912F]/[0.08] flex items-center justify-center text-xl">
                    {pathway.icon ? (
                      <span aria-hidden>{pathway.icon}</span>
                    ) : (
                      <BookOpen
                        className="w-5 h-5 text-[#B8912F]"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-3 flex-1">
                    <h3 className="font-serif text-[22px] text-[#12304E]">
                      {pathway.name}
                    </h3>
                    {pathway.description && (
                      <p className="text-[15px] leading-relaxed text-[#0C1F33] line-clamp-3">
                        {pathway.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E3E8EF]">
                    <span className="text-[13px] text-[#64748B]">
                      {pathway.courseCount} course
                      {pathway.courseCount === 1 ? "" : "s"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#B8912F] transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
