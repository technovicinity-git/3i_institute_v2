"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  Building2,
  SearchX,
  ShieldAlert,
} from "lucide-react";
import { siteService } from "@/services/site.service";
import { VerifyForm } from "@/components/certificate/verify-form";
import { useTranslations } from "next-intl";
import { useDateFormat } from "@/i18n/use-date-format";

export default function VerifyResultPage() {
  const t = useTranslations("verify");
  const format = useDateFormat();
  const formatDate = (value: string) => format.longDate(value);
  const { code } = useParams<{ code: string }>();
  const decoded = decodeURIComponent(code);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify-certificate", decoded],
    queryFn: () => siteService.verifyCertificate(decoded),
    retry: false,
  });

  return (
    <div className="bg-[#FBF9F4] min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-20">
        <p className="text-xs font-semibold text-[#B8912F] uppercase tracking-widest mb-2">
          {t("eyebrow")}
        </p>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && (isError || !data) && (
          <ResultCard
            tone="neutral"
            icon={<SearchX className="w-7 h-7 text-[#64748B]" />}
            title={t("notFound")}
            message={t("notFoundBody")}
            code={decoded}
          />
        )}

        {data && (
          <ResultCard
            tone={data.status === "VALID" ? "valid" : "revoked"}
            icon={
              data.status === "VALID" ? (
                <BadgeCheck className="w-7 h-7 text-[#22A146]" />
              ) : (
                <ShieldAlert className="w-7 h-7 text-red-600" />
              )
            }
            title={
              data.status === "VALID" ? t("validTitle") : t("revokedTitle")
            }
            message={
              data.status === "VALID"
                ? t("validBody")
                : t("revokedBody", { date: formatDate(data.revokedAt!) })
            }
            code={data.verificationCode}
          >
            <dl className="mt-6 grid gap-4 border-t border-[#E3E8EF] pt-6 sm:grid-cols-2">
              <Detail label={t("awardedTo")} value={data.learnerNameSnapshot} wide />
              <Detail
                label={t("course")}
                value={data.courseTitleSnapshot}
                icon={<Award className="w-4 h-4 text-[#B8912F]" />}
                wide
              />
              <Detail label={t("type")} value={t(`typeLabel.${data.type}`)} />
              <Detail
                label={t("issuedOn")}
                value={formatDate(data.issuedAt)}
                icon={<CalendarDays className="w-4 h-4 text-[#B8912F]" />}
              />
              <Detail
                label={t("issuedBy")}
                value={data.issuerName ?? "3i International Islamic Institute"}
                icon={<Building2 className="w-4 h-4 text-[#B8912F]" />}
                wide
              />
            </dl>
          </ResultCard>
        )}

        {!isLoading && (
          <div className="mt-10">
            <p className="text-sm font-semibold text-[#0C1F33] mb-3">
              {t("checkAnother")}
            </p>
            <VerifyForm />
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  tone,
  icon,
  title,
  message,
  code,
  children,
}: {
  tone: "valid" | "revoked" | "neutral";
  icon: React.ReactNode;
  title: string;
  message: string;
  code: string;
  children?: React.ReactNode;
}) {
  const t = useTranslations("verify");
  const styles = {
    valid: "border-[#22A146]/30",
    revoked: "border-red-200",
    neutral: "border-[#E3E8EF]",
  }[tone];
  const iconBg = {
    valid: "bg-[#22A146]/10",
    revoked: "bg-red-50",
    neutral: "bg-[#F1F5F9]",
  }[tone];

  return (
    <div className={`bg-white rounded-2xl border ${styles} p-6 md:p-8`}>
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h1 className="font-serif text-2xl md:text-3xl text-[#0C1F33]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
            {message}
          </p>
          <p className="mt-3 text-xs text-[#94A3B8]">
            {t("code")}{" "}
            <span className="font-mono text-[#475569] break-all" dir="ltr">
              {code}
            </span>
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
  wide = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
        {label}
      </dt>
      <dd className="mt-1 flex items-center gap-2 text-[15px] font-semibold text-[#0C1F33]">
        {icon}
        {value}
      </dd>
    </div>
  );
}
