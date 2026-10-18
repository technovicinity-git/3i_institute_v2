"use client";

import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { usePublicSettings } from "@/hooks/use-content";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("contact");
  const { data: settings, isLoading } = usePublicSettings();

  const items = settings
    ? [
        settings.contactEmail && {
          icon: Mail,
          label: t("email"),
          value: settings.contactEmail,
          href: `mailto:${settings.contactEmail}`,
        },
        settings.contactPhone && {
          icon: Phone,
          label: t("phone"),
          value: settings.contactPhone,
          href: `tel:${settings.contactPhone.replace(/[^\d+]/g, "")}`,
        },
        settings.supportHours && {
          icon: Clock,
          label: t("hours"),
          value: settings.supportHours,
        },
        settings.address && {
          icon: MapPin,
          label: t("address"),
          value: settings.address,
        },
      ].filter(
        (
          item,
        ): item is {
          icon: typeof Mail;
          label: string;
          value: string;
          href?: string;
        } => !!item,
      )
    : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <p className="text-xs font-semibold text-[#B8912F] uppercase tracking-widest mb-2">
        {t("eyebrow")}
      </p>
      <h1 className="font-serif text-3xl md:text-[44px] leading-tight text-[#0C1F33]">
        {t("title")}
      </h1>
      <p className="mt-3 text-[#64748B]">
        {t.rich("intro", {
          link: (chunks) => (
            <Link
              href="/help"
              className="text-[#22A146] font-semibold hover:underline"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading
          ? Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-50 animate-pulse" />
            ))
          : items.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#B8912F]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-[#0C1F33] break-words whitespace-pre-line">
                      {item.value}
                    </p>
                  </div>
                </>
              );
              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex gap-4 rounded-xl border border-[#E3E8EF] bg-white p-5 hover:shadow-md transition-shadow"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={item.label}
                  className="flex gap-4 rounded-xl border border-[#E3E8EF] bg-white p-5"
                >
                  {content}
                </div>
              );
            })}
      </div>

      {!isLoading && items.length === 0 && (
        <p className="mt-6 text-sm text-[#64748B]">
          {t("soon")}
        </p>
      )}
    </div>
  );
}
