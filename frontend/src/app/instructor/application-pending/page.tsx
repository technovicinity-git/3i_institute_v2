"use client";

import { LandingLogo } from "@/components/landing/logo";
import { Clock } from "lucide-react";

export default function ApplicationPendingPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col">
      <header className="w-full px-6 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
        <LandingLogo size="md" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[480px] bg-white rounded-xl sm:rounded-2xl shadow-card border border-surface-high p-8 sm:p-10 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>

          <h1 className="text-2xl sm:text-[28px] leading-tight text-primary font-serif mb-3">
            Application Under Review
          </h1>

          <p className="text-sm text-muted leading-6 mb-6">
            Thank you for applying to become an instructor at 3i International
            Islamic Institute. Our team will review your application and WWCC
            details. You&apos;ll be notified by email once a decision is made.
          </p>

          <div className="bg-[#FBF9F4] rounded-lg p-4 mb-6">
            <p className="text-xs text-[#64748B]">
              Typical review time: 3-5 business days
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full py-3 bg-[#12304E] text-white rounded-lg text-sm font-semibold hover:bg-[#1a4268]"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full py-3 border border-[#E3E8EF] text-[#0C1F33] rounded-lg text-sm font-semibold hover:bg-gray-50"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
