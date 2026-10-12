import Link from "next/link";
import { GraduationCap, Monitor, Users } from "lucide-react";

const BENEFITS = [
  {
    icon: Monitor,
    title: "All 140 courses",
    text: (
      <>
        Gain instant access to everything: classical Islamic studies,
        Qur&apos;anic Arabic, and medical health sciences.
      </>
    ),
  },
  {
    icon: Users,
    title: "Live classes included",
    text: (
      <>
        Join interactive weekly seminars and live Q&amp;As hosted by senior
        faculty.
      </>
    ),
  },
  {
    icon: GraduationCap,
    title: "Certificates included",
    text: <>Earn verified accredited certificates on every track you complete.</>,
  },
];

export function MembershipBand() {
  return (
    <section className="bg-[#FBF9F4] pb-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="border border-[#E3E8EF] rounded-xl p-12 bg-[#FBF9F4] text-center">
          <p className="text-sm font-bold text-[#B8912F] uppercase tracking-wide mb-3">
            Membership
          </p>
          <h2 className="font-serif text-[32px] text-[#0C1F33] mb-10">
            One membership. Every course.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 text-left">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col gap-3">
                <div className="w-8 h-8 rounded bg-[#B8912F]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#B8912F]" />
                </div>
                <h3 className="font-serif text-lg text-[#0C1F33]">{title}</h3>
                <p className="text-sm text-[#64748B] leading-6">{text}</p>
              </div>
            ))}
          </div>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 border border-[#12304E] rounded-lg text-[15px] font-semibold text-[#12304E] hover:bg-[#12304E] hover:text-white transition-colors"
          >
            Compare membership plans
          </Link>
        </div>
      </div>
    </section>
  );
}
