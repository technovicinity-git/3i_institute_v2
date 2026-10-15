"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CourseDetails } from "@/types/course-details";
import { useTranslations } from "next-intl";

export function CourseFaq({ faq }: { faq: CourseDetails["faq"] }) {
  // First question starts open.
  const t = useTranslations("courseDetails");
  const [openFaq, setOpenFaq] = useState<number>(0);

  return (
    <section className="bg-[#FBF9F4] pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="font-serif text-[32px] text-[#0C1F33] mb-10">
          {t("faq")}
        </h2>
        <div className="divide-y divide-[#E3E8EF]">
          {faq.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full flex items-center justify-between py-5 text-start"
              >
                <span className="font-serif text-lg text-[#0C1F33]">
                  {item.question}
                </span>
                {openFaq === i ? (
                  <ChevronUp className="w-5 h-5 text-[#64748B] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#64748B] shrink-0" />
                )}
              </button>
              {openFaq === i && item.answer && (
                <p className="pb-5 text-[15px] text-[#64748B] leading-7">
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
