"use client";

import { useRouter } from "next/navigation";
import { Check, Clock } from "lucide-react";

export default function EmailVerifiedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col">
      {/* Header */}
      <header className="flex items-center h-20 px-6 sm:px-[60px]">
        <div className="w-10 h-10 rounded-full bg-[#157A34] flex items-center justify-center">
          <span className="text-white font-bold text-sm">3i</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[480px] bg-white border border-[#E3E8EF] rounded-xl p-10">
          {/* Success */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#22A146] flex items-center justify-center">
              <Check className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <h2
              className="mt-5 text-[40px] leading-[48px] text-[#0C1F33] text-center"
              style={{ fontFamily: "'Marcellus', serif" }}
            >
              Email verified!
            </h2>
          </div>

          {/* Under Review Callout */}
          <div className="mt-8 flex bg-[#F9F6F0] border border-[#E3E8EF] rounded-lg overflow-hidden">
            <div className="w-1 shrink-0 bg-[#B8912F]" />
            <div className="flex items-start gap-3 p-5">
              <Clock
                className="w-[18px] h-[18px] shrink-0 mt-0.5"
                strokeWidth={2}
                stroke="#B8912F"
              />
              <p className="text-[15px] leading-[22px] text-[#0C1F33]">
                Your teaching application is under review. We&apos;ll email you
                once a decision is made.
              </p>
            </div>
          </div>

          {/* Continue */}
          <button
            onClick={() => router.push("/instructor/application-pending")}
            className="mt-8 w-full h-12 bg-[#22A146] hover:bg-[#1B8A3A] text-[#0C1F33] font-semibold text-[15px] rounded-lg transition-colors cursor-pointer"
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
}
