import Link from "next/link";
import { GraduationCap, Monitor, Users } from "lucide-react";
import { useTranslations } from "next-intl";

const BENEFITS = [
  { icon: Monitor, key: "b1" },
  { icon: Users, key: "b2" },
  { icon: GraduationCap, key: "b3" },
] as const;

export function MembershipBand() {
  const t = useTranslations("courseDetails.membership");
  return (
    <section className="bg-[#FBF9F4] pb-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="border border-[#E3E8EF] rounded-xl p-12 bg-[#FBF9F4] text-center">
          <p className="text-sm font-bold text-[#B8912F] uppercase tracking-wide mb-3">
            {t("eyebrow")}
          </p>
          <h2 className="font-serif text-[32px] text-[#0C1F33] mb-10">
            {t("title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 text-start">
            {BENEFITS.map(({ icon: Icon, key }) => (
              <div key={key} className="flex flex-col gap-3">
                <div className="w-8 h-8 rounded bg-[#B8912F]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#B8912F]" />
                </div>
                <h3 className="font-serif text-lg text-[#0C1F33]">
                  {t(`${key}Title`)}
                </h3>
                <p className="text-sm text-[#64748B] leading-6">
                  {t(`${key}Text`)}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 border border-[#12304E] rounded-lg text-[15px] font-semibold text-[#12304E] hover:bg-[#12304E] hover:text-white transition-colors"
          >
            {t("compare")}
          </Link>
        </div>
      </div>
    </section>
  );
}
