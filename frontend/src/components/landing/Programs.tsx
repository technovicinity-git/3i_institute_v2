import { Monitor, TrendingUp, Languages } from "lucide-react";

const pathways = [
  {
    icon: Monitor,
    title: "Computer Science & Data",
    description:
      "From programming fundamentals to machine learning — structured tracks that build real analytical skill from day one.",
    modules: "14 Comprehensive Modules",
  },
  {
    icon: TrendingUp,
    title: "Business & Economics",
    description:
      "Micro and macroeconomics, financial modelling, and management theory — grounded in quantitative rigour and case-study practice.",
    modules: "10 Core Modules",
  },
  {
    icon: Languages,
    title: "Languages & Linguistics",
    description:
      "Academic language acquisition and linguistic theory — from grammar and phonology to sociolinguistics and translation studies.",
    modules: "8 Intensive Levels",
  },
];

export default function Programs() {
  return (
    <section className="w-full bg-[#FBF9F4] py-24 px-[120px]">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-12">
          <p className="text-[12px] font-bold tracking-[0.15em] uppercase text-[#B8912F]">
            Curriculum Pathways
          </p>
          <h2 className="font-serif text-[40px] text-[#12304E]">
            Choose Your Pathway
          </h2>
        </div>

        {/* Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pathways.map((pathway) => {
            const Icon = pathway.icon;
            return (
              <div
                key={pathway.title}
                className="bg-white rounded-xl border border-[#E3E8EF] p-8 flex flex-col gap-6"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-[#B8912F]/[0.08] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#B8912F]" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif text-[22px] text-[#12304E]">
                    {pathway.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-[#0C1F33]">
                    {pathway.description}
                  </p>
                </div>

                {/* Modules footer */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#E3E8EF]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-[#64748B]"
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M4.5 7L6.5 9L9.5 5.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[13px] text-[#64748B]">
                    {pathway.modules}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
