import { ShieldCheck } from "lucide-react";
import { VerifyForm } from "@/components/certificate/verify-form";

export default function VerifyCertificatePage() {
  return (
    <div className="bg-[#FBF9F4] min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <div className="w-14 h-14 rounded-full bg-[#B8912F]/10 flex items-center justify-center mb-6">
          <ShieldCheck className="w-7 h-7 text-[#B8912F]" />
        </div>
        <p className="text-xs font-semibold text-[#B8912F] uppercase tracking-widest mb-2">
          Certificate verification
        </p>
        <h1 className="font-serif text-3xl md:text-[44px] leading-tight text-[#0C1F33]">
          Verify a certificate
        </h1>
        <p className="mt-3 mb-8 text-[#64748B] leading-relaxed">
          Every certificate issued by 3i International Islamic Institute
          carries a unique verification code. Enter it below to confirm the
          certificate is genuine and still valid.
        </p>
        <VerifyForm />
      </div>
    </div>
  );
}
