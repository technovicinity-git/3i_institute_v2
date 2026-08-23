import { Award, BookOpen, Globe, Shield, Network } from "lucide-react";

const partners = [
  { name: "Accreditation Council", icon: Award },
  { name: "Open Education Alliance", icon: BookOpen },
  { name: "Intl. Council for Distance Learning", icon: Globe },
  { name: "Quality Assurance Agency", icon: Shield },
  { name: "Global Universities Network", icon: Network },
];

export default function TrustStrip() {
  return (
    <section className="w-full bg-[#FBF9F4] py-10">
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Heading */}
        <p className="text-center text-[11px] font-semibold tracking-[0.15em] uppercase text-[#64748B] mb-6">
          Partnered &amp; Recognized By
        </p>

        {/* Partner Logos */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {partners.map((partner) => {
            const Icon = partner.icon;
            return (
              <div key={partner.name} className="flex items-center gap-2.5">
                <Icon
                  className="w-[18px] h-[18px] text-[#c8a415]"
                  strokeWidth={1.5}
                />
                <span className="font-serif text-[15px] text-[#12304E]">
                  {partner.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
