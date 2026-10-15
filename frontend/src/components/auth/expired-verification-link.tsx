"use client";

import { MailCheck } from "lucide-react";
import { useResendVerificationForTokenMutation } from "@/hooks/use-email-verification";
import { useTranslations } from "next-intl";

interface ExpiredVerificationLinkProps {
  /** Token from the expired link; it identifies the account for the resend. */
  token: string;
  loginHref: string;
}

/**
 * Body of the "link expired" state on the verify-email pages: one click
 * sends a fresh link to the same address, no typing needed.
 */
export function ExpiredVerificationLink({
  token,
  loginHref,
}: ExpiredVerificationLinkProps) {
  const t = useTranslations("auth.notices");
  const tCommon = useTranslations("common");
  const resendMutation = useResendVerificationForTokenMutation();

  if (resendMutation.isSuccess) {
    return (
      <div className="w-full max-w-[408px] flex flex-col items-center">
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-start text-sm text-green-900">
          <MailCheck className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{t("newLinkSent")}</p>
        </div>
        <a
          href={loginHref}
          className="mt-6 text-sm font-semibold text-[#157A34] underline hover:text-[#0F5C27]"
        >
          {tCommon("backToLogin")}
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[408px] flex flex-col items-center">
      <button
        type="button"
        onClick={() => resendMutation.mutate(token)}
        disabled={resendMutation.isPending}
        className="w-full h-12 rounded-lg bg-[#22A146] hover:bg-[#1B8A3A] text-[#0C1F33] font-semibold text-[15px] transition-colors disabled:opacity-50 cursor-pointer"
      >
        {resendMutation.isPending ? tCommon("sending") : t("sendNewLink")}
      </button>
      <a
        href={loginHref}
        className="mt-5 text-sm font-semibold text-[#157A34] underline hover:text-[#0F5C27]"
      >
        {tCommon("backToLogin")}
      </a>
    </div>
  );
}
