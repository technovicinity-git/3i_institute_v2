import Image from "next/image";
import Link from "next/link";
import HeroStats from "@/components/landing/HeroStats";
import { useTranslations } from "next-intl";

// Phones and tablets: text first, then the student card on a navy panel.
// From `lg`: side by side, the card on the navy diagonal.
export default function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative w-full bg-white overflow-hidden lg:h-[680px] xl:h-[720px]">
      <div className="flex flex-col lg:flex-row lg:h-full">
        {/* Left Content */}
        <div className="relative z-10 flex flex-col justify-center w-full lg:w-[55%] px-5 sm:px-10 lg:ps-14 xl:ps-24 lg:pe-10 xl:pe-12 pt-12 pb-12 sm:pt-16 lg:py-0">
          {/* Subtitle */}
          <p className="text-[13px] sm:text-[15px] lg:text-[16px] font-bold tracking-wide text-[#c8a415] uppercase mb-4 lg:mb-5">
            {t("eyebrow")}
          </p>

          {/* Heading */}
          <h1 className="font-serif text-[34px] leading-[1.18] sm:text-[44px] lg:text-[48px] xl:text-[56px] lg:leading-[1.14] text-[#12304E] mb-4 lg:mb-5 max-w-[624px]">
            {t("title")}
          </h1>

          {/* Description */}
          <p className="text-[16px] sm:text-[17px] xl:text-[18px] text-[#0C1F33] leading-[1.6] max-w-[624px] mb-7 lg:mb-8">
            {t("body")}
          </p>

          {/* Buttons: full width on phones, side by side from sm */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 mb-10 lg:mb-12">
            <Link
              href="/#pathways"
              className="inline-flex items-center justify-center px-7 py-3 bg-[#22A146] text-white font-semibold text-[15px] rounded-full hover:bg-[#1d8c3b] transition-colors"
            >
              {t("explore")}
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-7 py-3 border-2 border-[#12304E] text-[#12304E] font-semibold text-[15px] rounded-full hover:bg-[#12304E] hover:text-white transition-colors"
            >
              {t("curriculum")}
            </Link>
          </div>

          {/* Stats */}
          <HeroStats />
        </div>

        {/* Right Section - navy panel (diagonal from lg) with student card */}
        <div className="relative w-full lg:w-[45%] h-[440px] sm:h-[520px] lg:h-full bg-[#12304E] lg:bg-transparent">
          {/* Navy diagonal background (side-by-side layout only) */}
          <svg
            className="hidden lg:block absolute top-0 end-0 h-full w-full"
            viewBox="0 0 700 720"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <polygon points="0,0 700,0 700,720 400,720" fill="#12304E" />
          </svg>

          {/* Diamond/Star pattern overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            aria-hidden="true"
          >
            <div className="relative h-full aspect-[680/720] max-w-none opacity-[0.08]">
              <svg
                viewBox="0 0 680 720"
                fill="none"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M340 0 L680 360 L340 720 L0 360 Z"
                  stroke="white"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M340 60 L620 360 L340 660 L60 360 Z"
                  stroke="white"
                  strokeWidth="0.5"
                  fill="none"
                />
                <path
                  d="M340 120 L560 360 L340 600 L120 360 Z"
                  stroke="white"
                  strokeWidth="0.5"
                  fill="none"
                />
                <path
                  d="M340 180 L500 360 L340 540 L180 360 Z"
                  stroke="white"
                  strokeWidth="0.5"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          {/* Student Card */}
          <div className="absolute inset-0 flex items-center justify-center z-10 px-5">
            <div className="bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden w-full max-w-[290px] sm:max-w-[340px] xl:max-w-[380px]">
              {/* Student Image */}
              <div className="relative w-full aspect-[380/320]">
                <Image
                  src="/assets/images/landing_page/student-image.png"
                  alt={t("imageAlt")}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1280px) 380px, (min-width: 640px) 340px, 290px"
                />
              </div>

              {/* Student Details */}
              <div className="px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-[14px] font-bold text-[#12304E]">
                    Sarah Chen
                  </h3>
                  <span className="text-[12px] font-semibold text-[#6B7280]">
                    {t("graduate")}
                  </span>
                </div>
                <p className="text-[12px] text-[#4B5563] mb-3">
                  {t("program")}
                </p>
                <span className="inline-block px-3 py-1 bg-[#ECFDF5] text-[#059669] text-[11px] font-semibold rounded-full">
                  {t("completed")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
