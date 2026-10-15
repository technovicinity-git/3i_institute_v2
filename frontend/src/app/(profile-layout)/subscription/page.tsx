"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgePercent,
  Building2,
  CheckCircle,
  Clock,
  Copy,
  Info,
  Smartphone,
  UserPlus,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSubscriptionOverview,
  useCancelSubscriptionRequestMutation,
} from "@/hooks/use-subscription";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useProfileStore } from "@/stores/profile-store";
import { ApplySubscriptionDialog } from "@/components/subscription/apply-subscription-dialog";
import { WaiverRequestDialog } from "@/components/subscription/waiver-request-dialog";
import {
  formatMoney,
  PAYMENT_ACCOUNT_TYPE_LABEL,
  type PaymentAccount,
  type PaymentSettings,
  type ProfileSubscriptionStatus,
  type SubscriptionRequest,
  type Waiver,
} from "@/services/subscription.service";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const card = "bg-white border border-[#E3E8EF] rounded-xl shadow-sm";

// ---- How to pay ----

function copy(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success("Copied"))
    .catch(() => toast.error("Couldn't copy"));
}

function AccountIcon({ type }: { type: PaymentAccount["type"] }) {
  const Icon =
    type === "BANK"
      ? Building2
      : type === "MOBILE_BANKING"
        ? Smartphone
        : Wallet;
  return (
    <div className="w-10 h-10 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-[#B8912F]" />
    </div>
  );
}

function PaymentDetails({ payment }: { payment: PaymentSettings }) {
  return (
    <div className={`${card} p-5 sm:p-6 flex flex-col gap-5`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2
            className="text-xl text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            How to pay
          </h2>
          <p className="text-sm text-[#475569] mt-1">
            Send the payment to one of the accounts below, then apply for each
            profile with your transaction details.
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-[28px] leading-none text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            {formatMoney(payment.monthlyPrice, payment.currency)}
          </p>
          <p className="text-[13px] text-[#64748B] mt-1">
            per profile · one month
          </p>
        </div>
      </div>

      {payment.instructions && (
        <div className="flex items-start gap-3 px-4 py-3 bg-[#B8912F]/10 border border-[#B8912F]/30 rounded-lg">
          <Info className="w-4 h-4 text-[#B8912F] shrink-0 mt-0.5" />
          <p className="text-sm text-[#0C1F33] whitespace-pre-line">
            {payment.instructions}
          </p>
        </div>
      )}

      {payment.accounts.length === 0 ? (
        <p className="text-sm text-[#64748B]">
          Payment details haven&apos;t been added yet. Please contact support.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {payment.accounts.map((account) => (
            <div
              key={account.id}
              className="flex gap-4 p-4 border border-[#E3E8EF] rounded-lg"
            >
              <AccountIcon type={account.type} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-[#B8912F] uppercase tracking-wide">
                  {PAYMENT_ACCOUNT_TYPE_LABEL[account.type]}
                </p>
                <p className="font-semibold text-[#0C1F33]">{account.label}</p>
                {account.accountName && (
                  <p className="text-sm text-[#475569]">
                    {account.accountName}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono text-[#0C1F33] break-all">
                    {account.accountNumber}
                  </p>
                  <button
                    onClick={() => copy(account.accountNumber)}
                    aria-label={`Copy ${account.label} account number`}
                    className="p-1 rounded hover:bg-gray-100 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                  </button>
                </div>
                {account.details && (
                  <p className="text-[13px] text-[#64748B] mt-1 whitespace-pre-line">
                    {account.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Profile row ----

function StatusBadge({ profile }: { profile: ProfileSubscriptionStatus }) {
  if (profile.isSubscribed) {
    return (
      <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-[#22A146] text-[11px] font-bold text-[#0C1F33]">
        <CheckCircle className="w-3 h-3" strokeWidth={2.5} />
        SUBSCRIBED
      </span>
    );
  }
  if (profile.pendingRequestId) {
    return (
      <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-white border border-[#2D6CDF] text-[11px] font-bold text-[#2D6CDF]">
        <Clock className="w-3 h-3" strokeWidth={2.5} />
        UNDER REVIEW
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-white border border-[#B8912F] text-[11px] font-bold text-[#0C1F33]">
      <Clock className="w-3 h-3" strokeWidth={2.5} />
      NOT SUBSCRIBED
    </span>
  );
}

function statusLine(profile: ProfileSubscriptionStatus): string {
  const parts: string[] = [];
  if (profile.isSubscribed && profile.subscribedUntil) {
    parts.push(`Subscribed until ${formatDateTime(profile.subscribedUntil)}`);
  }
  if (profile.pendingRequestId) {
    parts.push(
      profile.isSubscribed
        ? "Renewal payment under review"
        : "Payment under review — usually within a day",
    );
  }
  if (parts.length === 0) parts.push("Subscribe to enrol in courses");
  return parts.join(" · ");
}

function WaiverLine({
  profile,
  onRequestWaiver,
}: {
  profile: ProfileSubscriptionStatus;
  onRequestWaiver: () => void;
}) {
  const { usable, pending, lastRejectionReason, applicationsLeft } =
    profile.waiver;
  if (usable) {
    return (
      <p className="flex items-center gap-1.5 text-[13px] text-[#157A34] font-semibold">
        <BadgePercent className="w-4 h-4" />
        {usable.percent}% fee waiver ready — use by{" "}
        {formatDate(usable.expiresAt)}
      </p>
    );
  }
  if (pending) {
    return (
      <p className="flex items-center gap-1.5 text-[13px] text-[#2D6CDF]">
        <BadgePercent className="w-4 h-4" />
        Fee waiver request under review
      </p>
    );
  }
  return (
    <p className="text-[13px] text-[#475569]">
      {lastRejectionReason && (
        <span className="text-red-600">
          Waiver not approved: {lastRejectionReason}.{" "}
        </span>
      )}
      {applicationsLeft > 0 ? (
        <button
          onClick={onRequestWaiver}
          className="font-semibold text-[#12304E] underline hover:text-[#22A146]"
        >
          Need help with the fee? Request a waiver
        </button>
      ) : (
        <span className="text-[#64748B]">
          Waiver limit reached for this year
          {profile.waiver.nextApplicationAt
            ? ` (next on ${formatDate(profile.waiver.nextApplicationAt)})`
            : ""}
        </span>
      )}
    </p>
  );
}

function ProfileRow({
  profile,
  canApply,
  onApply,
  onCancel,
  onRequestWaiver,
}: {
  profile: ProfileSubscriptionStatus;
  canApply: boolean;
  onApply: () => void;
  onCancel: () => void;
  onRequestWaiver: () => void;
}) {
  return (
    <div
      className={`${card} flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:px-8 gap-4`}
    >
      <div className="flex items-center gap-5 sm:gap-6 min-w-0">
        <div className="w-14 h-14 rounded-full bg-[#F9F6F0] shrink-0 flex items-center justify-center overflow-hidden">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={56}
              height={56}
              className="rounded-full object-cover"
            />
          ) : (
            <span className="text-xl text-[#B8912F] font-serif">
              {profile.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <h3
            className="text-lg text-[#0C1F33] truncate"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            {profile.displayName}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge profile={profile} />
            <span className="inline-flex items-center justify-center px-2 h-5 rounded-full bg-white border border-[#E3E8EF] text-[11px] font-bold text-[#0C1F33]">
              Age {profile.age}
            </span>
          </div>
          <p className="text-[13px] text-[#475569]">{statusLine(profile)}</p>
          {!profile.pendingRequestId && profile.lastRejection && (
            <p className="text-[13px] text-red-600">
              Last payment wasn&apos;t approved
              {profile.lastRejection.reason
                ? `: ${profile.lastRejection.reason}`
                : "."}
            </p>
          )}
          <WaiverLine profile={profile} onRequestWaiver={onRequestWaiver} />
        </div>
      </div>

      <div className="shrink-0">
        {profile.pendingRequestId ? (
          <button
            onClick={onCancel}
            className="text-[13px] font-semibold px-4 py-2 rounded-lg border border-[#E3E8EF] text-[#475569] hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Cancel request
          </button>
        ) : (
          <button
            onClick={onApply}
            disabled={!canApply}
            className={`text-[13px] font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 ${
              profile.isSubscribed
                ? "border border-[#22A146] text-[#157A34] hover:bg-green-50"
                : "bg-[#22A146] text-[#0C1F33] hover:bg-[#1E9040]"
            }`}
          >
            {profile.isSubscribed ? "Renew" : "Apply for subscription"}
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Request history ----

const REQUEST_STATUS: Record<
  SubscriptionRequest["status"],
  { label: string; className: string }
> = {
  PENDING: { label: "Under review", className: "bg-blue-50 text-[#2D6CDF]" },
  APPROVED: { label: "Approved", className: "bg-[#22A146]/10 text-[#157A34]" },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-600" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-600" },
};

function RequestHistory({ requests }: { requests: SubscriptionRequest[] }) {
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="px-5 sm:px-6 py-4 border-b border-[#E3E8EF]">
        <h2
          className="text-xl text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Payment history
        </h2>
      </div>
      <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-[#FBF9F4] border-b border-[#E3E8EF] text-xs font-bold text-[#64748B] uppercase">
        <span>Profile</span>
        <span>Amount</span>
        <span className="col-span-2">Payment</span>
        <span>Submitted</span>
        <span>Status</span>
      </div>
      <div className="divide-y divide-[#E3E8EF]">
        {requests.map((request) => {
          const status = REQUEST_STATUS[request.status];
          return (
            <div
              key={request.id}
              className="grid grid-cols-1 md:grid-cols-6 gap-1 md:gap-4 px-5 sm:px-6 py-4 items-center text-sm"
            >
              <span className="font-semibold text-[#0C1F33] truncate">
                {request.learnerProfile.displayName}
              </span>
              <span className="text-[#334155]">
                {formatMoney(request.amount, request.currency)}
                {request.discountPercent > 0 && (
                  <span className="block text-xs text-[#157A34]">
                    {request.discountPercent}% waiver
                  </span>
                )}
              </span>
              <span className="md:col-span-2 text-[#475569] min-w-0">
                <span className="block truncate">{request.paymentMethod}</span>
                {request.transactionId && (
                  <span className="block text-xs text-[#64748B] font-mono truncate">
                    {request.transactionId}
                  </span>
                )}
              </span>
              <span className="text-[#64748B]">
                {formatDate(request.createdAt)}
              </span>
              <span className="flex flex-col gap-1">
                <span
                  className={`inline-block w-fit text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.className}`}
                >
                  {status.label}
                </span>
                {request.status === "APPROVED" && request.periodEnd && (
                  <span className="text-xs text-[#64748B]">
                    Until {formatDate(request.periodEnd)}
                  </span>
                )}
                {request.status === "REJECTED" && request.rejectionReason && (
                  <span className="text-xs text-red-600">
                    {request.rejectionReason}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Waiver history ----

const WAIVER_STATUS: Record<
  Waiver["status"],
  { label: string; className: string }
> = {
  PENDING: { label: "Under review", className: "bg-blue-50 text-[#2D6CDF]" },
  APPROVED: {
    label: "Ready to use",
    className: "bg-[#22A146]/10 text-[#157A34]",
  },
  USED: { label: "Used", className: "bg-gray-100 text-gray-600" },
  REJECTED: { label: "Not approved", className: "bg-red-50 text-red-600" },
  EXPIRED: { label: "Expired", className: "bg-gray-100 text-gray-600" },
  REVOKED: { label: "Withdrawn", className: "bg-gray-100 text-gray-600" },
};

function WaiverHistory({ waivers }: { waivers: Waiver[] }) {
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="px-5 sm:px-6 py-4 border-b border-[#E3E8EF]">
        <h2
          className="text-xl text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Fee waivers
        </h2>
      </div>
      <div className="divide-y divide-[#E3E8EF]">
        {waivers.map((waiver) => {
          const status = WAIVER_STATUS[waiver.status];
          const reason = waiver.rejectionReason ?? waiver.revokeReason;
          return (
            <div
              key={waiver.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 sm:px-6 py-4 text-sm"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[#0C1F33]">
                  {waiver.learnerProfile?.displayName ?? "Learner"}
                  {waiver.percent !== null && (
                    <span className="ml-2 font-normal text-[#475569]">
                      {waiver.percent}% off one month
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#64748B]">
                  Requested {formatDate(waiver.createdAt)}
                  {waiver.status === "APPROVED" &&
                    waiver.expiresAt &&
                    ` · use by ${formatDate(waiver.expiresAt)}`}
                  {waiver.status === "USED" &&
                    waiver.usedAt &&
                    ` · used ${formatDate(waiver.usedAt)}`}
                </p>
                {reason && (
                  <p className="text-xs text-red-600 mt-0.5">{reason}</p>
                )}
              </div>
              <span
                className={`inline-block w-fit text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${status.className}`}
              >
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Page ----

export default function SubscriptionPage() {
  const { data, isLoading, isError, refetch } = useSubscriptionOverview();
  const cancelMutation = useCancelSubscriptionRequestMutation();
  const confirm = useConfirm();
  const { activeProfile, setActiveProfile } = useProfileStore();
  const [applyFor, setApplyFor] = useState<ProfileSubscriptionStatus | null>(
    null,
  );
  const [waiverFor, setWaiverFor] = useState<ProfileSubscriptionStatus | null>(
    null,
  );

  // The active profile is cached in localStorage; keep its status current
  // (an admin may have approved or the month may have ended).
  useEffect(() => {
    if (!data || !activeProfile) return;
    const fresh = data.profiles.find((p) => p.id === activeProfile.id);
    if (fresh && fresh.isSubscribed !== activeProfile.isActive) {
      setActiveProfile({
        ...activeProfile,
        isActive: fresh.isSubscribed,
        hasSeat: fresh.isSubscribed,
      });
    }
  }, [data, activeProfile, setActiveProfile]);

  const handleCancel = (profile: ProfileSubscriptionStatus) => {
    const requestId = profile.pendingRequestId;
    if (!requestId) return;
    confirm({
      tone: "warning",
      title: "Cancel this request?",
      description: (
        <>
          The payment for{" "}
          <span className="font-semibold text-[#0C1F33]">
            {profile.displayName}
          </span>{" "}
          won&apos;t be reviewed. You can submit it again later.
        </>
      ),
      confirmLabel: "Cancel request",
      cancelLabel: "Keep it",
      onConfirm: () => cancelMutation.mutateAsync(requestId),
    });
  };

  const subscribedCount =
    data?.profiles.filter((profile) => profile.isSubscribed).length ?? 0;
  const pendingCount =
    data?.profiles.filter((profile) => profile.pendingRequestId).length ?? 0;

  return (
    <section
      className="w-full min-h-full bg-[#FBF9F4] px-6 sm:px-10 lg:px-[120px] pt-10 sm:pt-14 pb-16 sm:pb-20"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1
            className="text-3xl sm:text-[40px] leading-tight text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Subscription
          </h1>
          <p className="text-[15px] text-[#475569]">
            Each learner profile needs its own subscription to enrol in courses.
            A subscription lasts one month from approval.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-600 font-medium">
              Failed to load your subscription
            </p>
            <button
              onClick={() => refetch()}
              className="text-[#22A146] font-semibold hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            <PaymentDetails payment={data.payment} />

            <div className="flex items-center justify-between gap-4 flex-wrap mt-2">
              <h2
                className="text-xl text-[#0C1F33]"
                style={{ fontFamily: "'Marcellus', serif" }}
              >
                Learner profiles
              </h2>
              <p className="text-sm text-[#475569]">
                {subscribedCount} of {data.profiles.length} subscribed
                {pendingCount > 0 && ` · ${pendingCount} under review`}
              </p>
            </div>

            {data.profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white border border-dashed border-[#E3E8EF] rounded-xl">
                <p className="text-[#64748B]">
                  Add a learner profile to subscribe.
                </p>
                <Link
                  href="/profiles/add"
                  className="inline-flex items-center gap-2 text-[13px] font-bold px-4 py-2 rounded-lg bg-[#22A146] text-[#0C1F33] hover:bg-[#1E9040] transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add profile
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.profiles.map((profile) => (
                  <ProfileRow
                    key={profile.id}
                    profile={profile}
                    canApply={data.payment.accounts.length > 0}
                    onApply={() => setApplyFor(profile)}
                    onCancel={() => handleCancel(profile)}
                    onRequestWaiver={() => setWaiverFor(profile)}
                  />
                ))}
              </div>
            )}

            {data.requests.length > 0 && (
              <RequestHistory requests={data.requests} />
            )}

            {data.waivers.length > 0 && (
              <WaiverHistory waivers={data.waivers} />
            )}

            {data.requests.some((r) => r.status === "REJECTED") && (
              <p className="flex items-center gap-2 text-[13px] text-[#64748B]">
                <XCircle className="w-4 h-4" />
                If a payment was rejected by mistake, please contact support
                with your transaction ID.
              </p>
            )}

            <ApplySubscriptionDialog
              profile={applyFor}
              payment={data.payment}
              onOpenChange={(open) => !open && setApplyFor(null)}
            />

            <WaiverRequestDialog
              profile={waiverFor}
              onOpenChange={(open) => !open && setWaiverFor(null)}
            />
          </>
        )}
      </div>
    </section>
  );
}
