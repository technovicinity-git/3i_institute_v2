"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Clock, Info, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  useSubscriptionOverview,
  useSubscribeProfileMutation,
  useUnsubscribeProfileMutation,
} from "@/hooks/use-seats";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { ProfileSubscription } from "@/services/seat.service";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// ---- Status Badge ----

function StatusBadge({ subscribed }: { subscribed: boolean }) {
  return subscribed ? (
    <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-[#22A146] text-[11px] font-bold text-[#0C1F33]">
      <CheckCircle className="w-3 h-3" strokeWidth={2.5} />
      SUBSCRIBED
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-white border border-[#B8912F] text-[11px] font-bold text-[#0C1F33]">
      <Clock className="w-3 h-3" strokeWidth={2.5} />
      NOT SUBSCRIBED
    </span>
  );
}

// ---- Profile Row ----

interface ProfileRowProps {
  profile: ProfileSubscription;
  price: number;
  canManage: boolean;
  pending: boolean;
  onSubscribe: (profile: ProfileSubscription) => void;
  onUnsubscribe: (profile: ProfileSubscription) => void;
}

function ProfileRow({
  profile,
  price,
  canManage,
  pending,
  onSubscribe,
  onUnsubscribe,
}: ProfileRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:px-8 bg-white border border-[#E3E8EF] rounded-xl shadow-sm gap-4">
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
            <StatusBadge subscribed={profile.isSubscribed} />
            <span className="inline-flex items-center justify-center px-2 h-5 rounded-full bg-white border border-[#E3E8EF] text-[11px] font-bold text-[#0C1F33]">
              Age {profile.age}
            </span>
          </div>
          <p className="text-[13px] text-[#475569]">
            {profile.isSubscribed && profile.subscribedAt
              ? `Subscribed since ${formatDate(profile.subscribedAt)} · can enrol in courses`
              : `${formatPrice(price)} / month · subscribe to enrol in courses`}
          </p>
        </div>
      </div>

      {canManage && (
        <div className="shrink-0">
          {profile.isSubscribed ? (
            <button
              onClick={() => onUnsubscribe(profile)}
              disabled={pending}
              className="text-[13px] font-semibold px-4 py-2 rounded-lg border border-[#E3E8EF] text-[#475569] hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              Unsubscribe
            </button>
          ) : (
            <button
              onClick={() => onSubscribe(profile)}
              disabled={pending}
              className="text-[13px] font-bold px-4 py-2 rounded-lg bg-[#22A146] text-[#0C1F33] hover:bg-[#1E9040] transition-colors whitespace-nowrap disabled:opacity-50"
            >
              Subscribe
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Page ----

export default function SubscriptionPage() {
  const { data, isLoading, isError, refetch } = useSubscriptionOverview();
  const subscribeMutation = useSubscribeProfileMutation();
  const unsubscribeMutation = useUnsubscribeProfileMutation();
  const confirm = useConfirm();

  const pendingId = subscribeMutation.isPending
    ? subscribeMutation.variables
    : unsubscribeMutation.isPending
      ? unsubscribeMutation.variables
      : null;

  const subscribedCount =
    data?.profiles.filter((profile) => profile.isSubscribed).length ?? 0;
  const monthlyTotal = subscribedCount * (data?.pricePerProfile ?? 0);

  const handleSubscribe = (profile: ProfileSubscription) =>
    confirm({
      tone: "success",
      title: `Subscribe ${profile.displayName}?`,
      description: (
        <>
          <span className="font-semibold text-[#0C1F33]">
            {profile.displayName}
          </span>{" "}
          will be able to enrol in courses for their age. Payment isn&apos;t
          collected yet, so this is activated straight away.
        </>
      ),
      confirmLabel: "Subscribe",
      onConfirm: async () => {
        await subscribeMutation.mutateAsync(profile.id);
        toast.success(`${profile.displayName} is now subscribed`);
      },
    });

  const handleUnsubscribe = (profile: ProfileSubscription) =>
    confirm({
      tone: "warning",
      title: `Unsubscribe ${profile.displayName}?`,
      description: (
        <>
          <span className="font-semibold text-[#0C1F33]">
            {profile.displayName}
          </span>{" "}
          won&apos;t be able to enrol in new courses. Their progress,
          results and certificates are kept.
        </>
      ),
      confirmLabel: "Unsubscribe",
      cancelLabel: "Keep subscription",
      onConfirm: async () => {
        await unsubscribeMutation.mutateAsync(profile.id);
        toast.success(`${profile.displayName} has been unsubscribed`);
      },
    });

  return (
    <section
      className="w-full min-h-full bg-[#FBF9F4] px-6 sm:px-10 lg:px-[120px] pt-10 sm:pt-14 pb-16 sm:pb-20"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-3xl sm:text-[40px] leading-tight text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Subscription
          </h1>
          <p className="text-[15px] text-[#475569]">
            Each learner profile needs its own subscription to enrol in
            courses.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error */}
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
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="px-6 py-5 bg-white border border-[#E3E8EF] rounded-xl shadow-sm">
                <p className="text-[13px] text-[#475569]">
                  Subscribed profiles
                </p>
                <p
                  className="text-[28px] text-[#0C1F33] mt-1"
                  style={{ fontFamily: "'Marcellus', serif" }}
                >
                  {subscribedCount}{" "}
                  <span className="text-base text-[#64748B]">
                    of {data.profiles.length}
                  </span>
                </p>
              </div>
              <div className="px-6 py-5 bg-white border border-[#E3E8EF] rounded-xl shadow-sm">
                <p className="text-[13px] text-[#475569]">Price per profile</p>
                <p
                  className="text-[28px] text-[#0C1F33] mt-1"
                  style={{ fontFamily: "'Marcellus', serif" }}
                >
                  {formatPrice(data.pricePerProfile)}{" "}
                  <span className="text-base text-[#64748B]">/ month</span>
                </p>
              </div>
              <div className="px-6 py-5 bg-white border border-[#E3E8EF] rounded-xl shadow-sm">
                <p className="text-[13px] text-[#475569]">Monthly total</p>
                <p
                  className="text-[28px] text-[#0C1F33] mt-1"
                  style={{ fontFamily: "'Marcellus', serif" }}
                >
                  {formatPrice(monthlyTotal)}
                </p>
              </div>
            </div>

            {/* Payment notice */}
            {data.manualSubscriptionsEnabled ? (
              <div className="flex items-start gap-3 px-5 py-4 bg-[#B8912F]/10 border border-[#B8912F]/30 rounded-xl">
                <Info className="w-5 h-5 text-[#B8912F] shrink-0 mt-0.5" />
                <p className="text-sm text-[#0C1F33]">
                  Online payment is coming soon. For now, subscriptions are
                  activated as soon as you subscribe and no payment is taken.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 px-5 py-4 bg-white border border-[#E3E8EF] rounded-xl">
                <Info className="w-5 h-5 text-[#475569] shrink-0 mt-0.5" />
                <p className="text-sm text-[#475569]">
                  Subscriptions can&apos;t be changed here right now. Please
                  contact support.
                </p>
              </div>
            )}

            {/* Profiles */}
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
                    price={data.pricePerProfile}
                    canManage={data.manualSubscriptionsEnabled}
                    pending={pendingId === profile.id}
                    onSubscribe={handleSubscribe}
                    onUnsubscribe={handleUnsubscribe}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
