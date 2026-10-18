"use client";

import { Fragment, useMemo, useState } from "react";
import { Award, Download, Eye, Search, ShieldCheck } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useLearnerCertificates } from "@/hooks/use-learner-certificates";
import {
  downloadExamCertificatePdf,
  type ExamCertificate,
} from "@/services/learner-certificate.service";
import { useTranslations } from "next-intl";
import { useDateFormat } from "@/i18n/use-date-format";

type CertificateFilter = "ALL" | ExamCertificate["type"];

function CertificatePreview({ certificate }: { certificate: ExamCertificate }) {
  const t = useTranslations("certificates");
  const format = useDateFormat();
  return (
    <div className="rounded-xl border-2 border-[#B8912F]/50 bg-[#FFFEFA] p-6 text-center shadow-inner sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9A7624]">
        {certificate.issuerName ?? "3i International Islamic Institute"}
      </p>
      <div className="mx-auto my-4 h-px max-w-xs bg-[#D8C58E]" />
      <p className="text-xl font-semibold uppercase tracking-wide text-[#12304E]">
        {t("preview.title")}
      </p>
      <p className="mt-5 text-sm text-[#64748B]">{t("preview.presentedTo")}</p>
      <p
        className="mt-1 text-2xl text-[#0C1F33]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {certificate.learnerNameSnapshot}
      </p>
      <p className="mt-4 text-sm text-[#64748B]">{t("preview.for")}</p>
      <p className="mt-1 text-xl font-semibold text-[#0C1F33]">
        {certificate.courseTitleSnapshot}
      </p>
      {certificate.details?.examTitle && (
        <div className="mt-4 text-sm text-[#475569]">
          <p>{certificate.details.examTitle}</p>
          {typeof certificate.details.score === "number" && (
            <p className="mt-1 font-semibold">
              {t("preview.result", {
                score: certificate.details.score,
                total: certificate.details.totalMarks ?? 0,
              })}
              {certificate.details.passed === true
                ? ` · ${t("passed")}`
                : certificate.details.passed === false
                  ? ` · ${t("notPassed")}`
                  : ""}
            </p>
          )}
        </div>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#64748B]">
        <span>
          {t("preview.issued", {
            date: format.longDate(certificate.issuedAt),
          })}
        </span>
        {certificate.details?.progress !== undefined && (
          <span>
            {t("preview.progress", { progress: certificate.details.progress })}
          </span>
        )}
      </div>
      <div className="mx-auto my-5 h-px max-w-xs bg-[#D8C58E]" />
      <p className="text-[11px] text-[#64748B]">
        {t("preview.id", { id: certificate.id })}
      </p>
      <p
        className="mt-1 break-all font-mono text-xs font-semibold text-[#12304E]"
        dir="ltr"
      >
        {t("preview.code", { code: certificate.verificationCode })}
      </p>
    </div>
  );
}

export default function CertificatesPage() {
  const t = useTranslations("certificates");
  const tCommon = useTranslations("common");
  const format = useDateFormat();
  const { activeProfile } = useProfileStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CertificateFilter>("ALL");
  const [openCertificateId, setOpenCertificateId] = useState<string | null>(
    null,
  );

  const {
    data: certificates,
    isLoading,
    isError,
    refetch,
  } = useLearnerCertificates(activeProfile?.id ?? "");

  const filteredCertificates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (certificates ?? []).filter((certificate) => {
      if (filter !== "ALL" && certificate.type !== filter) return false;
      if (!query) return true;
      return [
        certificate.courseTitleSnapshot,
        certificate.learnerNameSnapshot,
        certificate.verificationCode,
        certificate.id,
        certificate.details?.examTitle ?? "",
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [certificates, filter, search]);

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B8912F]">
          {t("eyebrow")}
        </p>
        <h1
          className="mt-1 text-3xl text-[#0C1F33] md:text-[36px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">{t("subtitle")}</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-[#E3E8EF] bg-white px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search")}
            className="w-full bg-transparent text-sm text-[#0C1F33] outline-none placeholder:text-[#94A3B8]"
            aria-label={t("searchLabel")}
          />
        </label>
        {/* <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as CertificateFilter)}
          className="rounded-lg border border-[#E3E8EF] bg-white px-4 py-3 text-sm text-[#0C1F33]"
          aria-label="Filter certificates by type"
        >
          <option value="ALL">All certificate types</option>
          <option value="COMPLETION">Course Completion</option>
          <option value="EXAM">Exam</option>
          <option value="ATTENDANCE">Attendance</option>
        </select> */}
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#12304E] border-t-transparent" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-100 bg-white p-8 text-center">
          <p className="text-sm text-red-700">{t("loadFailed")}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm font-semibold text-[#12304E] hover:underline"
          >
            {tCommon("tryAgain")}
          </button>
        </div>
      )}

      {!isLoading && !isError && filteredCertificates.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#E3E8EF] bg-white p-10 text-center">
          <Award className="mx-auto h-12 w-12 text-[#CBD5E1]" />
          <p className="mt-4 font-semibold text-[#0C1F33]">
            {certificates?.length ? t("noMatch") : t("empty")}
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            {certificates?.length ? t("noMatchHint") : t("emptyHint")}
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredCertificates.length > 0 && (
        <>
          <p className="mb-3 text-xs text-[#64748B]">
            {t("showing", {
              shown: filteredCertificates.length,
              total: certificates?.length ?? 0,
            })}
          </p>
          <div className="overflow-x-auto rounded-xl border border-[#E3E8EF] bg-white">
            <table className="w-full min-w-[950px] text-start">
              <thead className="bg-[#FBF9F4] text-xs uppercase tracking-wide text-[#64748B]">
                <tr>
                  <th className="px-5 py-4 font-semibold">{t("colType")}</th>
                  <th className="px-5 py-4 font-semibold">{t("colCourse")}</th>
                  <th className="px-5 py-4 font-semibold">{t("colIssued")}</th>
                  <th className="px-5 py-4 font-semibold">{t("colResult")}</th>
                  <th className="px-5 py-4 font-semibold">{t("colCode")}</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    {t("colActions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8EF]">
                {filteredCertificates.map((certificate) => {
                  const isOpen = openCertificateId === certificate.id;
                  return (
                    <Fragment key={certificate.id}>
                      <tr className="align-middle hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#F8F3E8] px-3 py-1.5 text-xs font-semibold text-[#8A6A22]">
                            <Award className="h-4 w-4" />
                            {t(`type.${certificate.type}`)}
                          </span>
                        </td>
                        <td className="max-w-[260px] px-5 py-4 text-sm font-semibold text-[#0C1F33]">
                          <span
                            className="block truncate"
                            title={certificate.courseTitleSnapshot}
                          >
                            {certificate.courseTitleSnapshot}
                          </span>
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#22A146]">
                            <ShieldCheck className="h-3.5 w-3.5" /> {t("valid")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-[#475569]">
                          {format.longDate(certificate.issuedAt)}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#475569]">
                          {certificate.details?.examTitle ? (
                            <>
                              <span
                                className="block max-w-[190px] truncate"
                                title={certificate.details.examTitle}
                              >
                                {certificate.details.examTitle}
                              </span>
                              {typeof certificate.details.score ===
                                "number" && (
                                <span className="mt-1 block text-xs font-semibold text-[#0C1F33]">
                                  {certificate.details.score} /{" "}
                                  {certificate.details.totalMarks}
                                  {certificate.details.passed
                                    ? ` · ${t("passed")}`
                                    : ""}
                                </span>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-[#475569]" dir="ltr">
                          <span
                            className="block max-w-[180px] truncate"
                            title={certificate.verificationCode}
                          >
                            {certificate.verificationCode}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenCertificateId(
                                  isOpen ? null : certificate.id,
                                )
                              }
                              aria-expanded={isOpen}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#12304E] px-3 py-2 text-xs font-semibold text-[#12304E] hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5" />{" "}
                              {isOpen ? t("hide") : t("view")}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                downloadExamCertificatePdf(certificate)
                              }
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#12304E] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0C1F33]"
                            >
                              <Download className="h-3.5 w-3.5" /> {t("pdf")}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={6} className="bg-[#FBF9F4] p-4 sm:p-6">
                            <CertificatePreview certificate={certificate} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
