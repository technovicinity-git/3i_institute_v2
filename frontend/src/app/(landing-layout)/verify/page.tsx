import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { VerifyForm } from "@/components/certificate/verify-form";

export default async function VerifyCertificatePage() {
  const t = await getTranslations("verify");
  return (
    <div className="bg-[#FBF9F4] min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <div className="w-14 h-14 rounded-full bg-[#B8912F]/10 flex items-center justify-center mb-6">
          <ShieldCheck className="w-7 h-7 text-[#B8912F]" />
        </div>
        <p className="text-xs font-semibold text-[#B8912F] uppercase tracking-widest mb-2">
          {t("eyebrow")}
        </p>
        <h1 className="font-serif text-3xl md:text-[44px] leading-tight text-[#0C1F33]">
          {t("title")}
        </h1>
        <p className="mt-3 mb-8 text-[#64748B] leading-relaxed">{t("intro")}</p>
        <VerifyForm />
      </div>
    </div>
  );
}
