"use client";

import { useRouter } from "next/navigation";
import { useLearnerProfiles } from "@/hooks/use-learner-profiles";
import type { LearnerProfile } from "@/services/learner.service";
import Image from "next/image";
import { useTranslations } from "next-intl";

// ---- Icons (keep same) ----

function CheckCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.25" stroke="#0C1F33" strokeWidth="1.2" />
      <path
        d="M4 7.2L6 9.2L10 5.2"
        stroke="#0C1F33"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.25" stroke="#0C1F33" strokeWidth="1.2" />
      <line
        x1="7"
        y1="3.5"
        x2="7"
        y2="7"
        stroke="#0C1F33"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="7"
        x2="9.5"
        y2="7"
        stroke="#0C1F33"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PauseCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.25" stroke="#475569" strokeWidth="1.2" />
      <line
        x1="5.5"
        y1="4.5"
        x2="5.5"
        y2="9.5"
        stroke="#475569"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="8.5"
        y1="4.5"
        x2="8.5"
        y2="9.5"
        stroke="#475569"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M1.75 3.5H12.25"
        stroke="#475569"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.66667 3.5V2.33333C4.66667 2.02391 4.78958 1.72717 5.00838 1.50838C5.22717 1.28958 5.52391 1.16667 5.83333 1.16667H8.16667C8.47609 1.16667 8.77283 1.28958 8.99162 1.50838C9.21042 1.72717 9.33333 2.02391 9.33333 2.33333V3.5M11.0833 3.5V11.6667C11.0833 11.9761 10.9604 12.2728 10.7416 12.4916C10.5228 12.7104 10.2261 12.8333 9.91667 12.8333H4.08333C3.77391 12.8333 3.47717 12.7104 3.25838 12.4916C3.03958 12.2728 2.91667 11.9761 2.91667 11.6667V3.5H11.0833Z"
        stroke="#475569"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---- Helper Functions ----

type ProfileStatus = "active" | "never_activated" | "cancelled" | "deleted";

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

type CommonT = ReturnType<typeof useTranslations<"common">>;

function getAgeBand(age: number, t: CommonT): string {
  if (age >= 18) return t("ageAdult");
  if (age >= 16) return t("ageRange", { min: 16, max: 17 });
  if (age >= 13) return t("ageRange", { min: 13, max: 15 });
  if (age >= 9) return t("ageRange", { min: 9, max: 12 });
  if (age >= 5) return t("ageRange", { min: 5, max: 8 });
  return t("ageUnder", { max: 4 });
}

function getProfileStatus(profile: LearnerProfile): ProfileStatus {
  if (!profile.isActive && !profile.hasSeat) return "never_activated";
  if (!profile.isActive && profile.hasSeat) return "cancelled";
  return "active";
}

// ---- Status Badge (keep same) ----

function StatusBadge({ status }: { status: ProfileStatus }) {
  const t = useTranslations("family");
  const tCommon = useTranslations("common");
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-[#22A146] text-[11px] font-bold text-[#0C1F33]">
          <CheckCircleIcon />
          {t("statusSubscribed")}
        </span>
      );
    case "never_activated":
      return (
        <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-white border border-[#B8912F] text-[11px] font-bold text-[#0C1F33]">
          <ClockIcon />
          {t("statusNeverSubscribed")}
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-white border border-[#475569] text-[11px] font-bold text-[#475569]">
          <PauseCircleIcon />
          {t("statusEnded")}
        </span>
      );
    case "deleted":
      return (
        <span className="inline-flex items-center gap-1 text-[13px] text-[#475569]">
          <TrashIcon />
          {tCommon("delete")}
        </span>
      );
  }
}

// ---- Age Badge ----

function AgeBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center px-2 h-5 rounded-full bg-white border border-[#E3E8EF] text-[11px] font-bold text-[#0C1F33]">
      {label}
    </span>
  );
}

// ---- Action Button ----

interface ActionButtonProps {
  label: string;
  variant: "outline" | "green" | "red-text" | "green-text" | "ghost";
  onClick?: () => void;
}

function ActionButton({ label, variant, onClick }: ActionButtonProps) {
  const base =
    "text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap";
  const styles: Record<ActionButtonProps["variant"], string> = {
    outline: `${base} border border-[#E3E8EF] text-[#0C1F33] hover:bg-gray-50`,
    green: `${base} bg-[#22A146] text-[#0C1F33] font-bold hover:bg-[#1E9040]`,
    "red-text": `${base} text-red-600 hover:text-red-700`,
    "green-text": `${base} text-[#157A34] font-semibold hover:text-[#116B2C]`,
    ghost: `${base} border border-[#E3E8EF] text-[#475569] hover:bg-gray-50`,
  };

  return (
    <button onClick={onClick} className={styles[variant]}>
      {label}
    </button>
  );
}

// ---- Profile Row ----

interface ProfileRowProps {
  profile: LearnerProfile;
  onEdit: (profile: LearnerProfile) => void;
  onResetPin: (profile: LearnerProfile) => void;
  onSubscription: () => void;
}

function ProfileRow({
  profile,
  onEdit,
  onResetPin,
  onSubscription,
}: ProfileRowProps) {
  const t = useTranslations("family");
  const tCommon = useTranslations("common");
  const tForm = useTranslations("learnerForm");
  const age = calculateAge(profile.dateOfBirth);
  const status = getProfileStatus(profile);

  const actions: ActionButtonProps[] = [
    { label: tCommon("edit"), variant: "outline", onClick: () => onEdit(profile) },
    {
      label: tForm("resetPin"),
      variant: "outline",
      onClick: () => onResetPin(profile),
    },
  ];

  actions.push(
    status === "active"
      ? { label: t("subscription"), variant: "ghost", onClick: onSubscription }
      : { label: t("subscribe"), variant: "green", onClick: onSubscription },
  );

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-5 sm:px-8 bg-white border border-[#E3E8EF] rounded-xl shadow-sm gap-4">
      {/* Left: Avatar + Details */}
      <div className="flex items-center gap-5 sm:gap-6 shrink-0">
        <div className="w-14 h-14 rounded-full bg-[#F9F6F0] shrink-0 flex items-center justify-center">
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

        <div className="flex flex-col gap-2">
          <h3
            className="text-lg text-[#0C1F33]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {profile.displayName}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={status} />
            <AgeBadge label={getAgeBand(age, tCommon)} />
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 flex-wrap shrink-0">
        {actions.map((action) => (
          <ActionButton key={action.label} {...action} />
        ))}
      </div>
    </div>
  );
}

// ---- Main Component ----

export default function FamilyProfilesPage() {
  const t = useTranslations("family");
  const tProfiles = useTranslations("profiles");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: profiles, isLoading, isError } = useLearnerProfiles();

  const handleEdit = (profile: LearnerProfile) => {
    router.push(`/profiles/${profile.id}/edit`);
  };

  const handleResetPin = (profile: LearnerProfile) => {
    // Redirect to edit page — Reset PIN section will be there
    router.push(`/profiles/${profile.id}/edit?action=reset-pin`);
  };

  const handleAddProfile = () => {
    router.push("/profiles/add");
  };

  return (
    <section
      className="w-full min-h-full bg-[#FBF9F4] px-6 sm:px-10 lg:px-[120px] pt-10 sm:pt-14 pb-16 sm:pb-[100px]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6 sm:gap-9">
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1
            className="text-3xl sm:text-[40px] leading-tight text-[#0C1F33]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("title")}
          </h1>
          <button
            onClick={handleAddProfile}
            className="px-5 py-2.5 bg-[#22A146] rounded-lg text-sm font-bold text-[#0C1F33] hover:bg-[#1E9040] transition-colors"
          >
            {t("addProfile")}
          </button>
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
              {tProfiles("loadFailed")}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#22A146] font-semibold hover:underline"
            >
              {tCommon("tryAgain")}
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && profiles?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-[#475569]">{t("empty")}</p>
            <button
              onClick={handleAddProfile}
              className="text-[#22A146] font-semibold hover:underline"
            >
              {t("addFirst")}
            </button>
          </div>
        )}

        {/* Profile rows */}
        {!isLoading && !isError && profiles && profiles.length > 0 && (
          <div className="flex flex-col gap-6">
            {profiles.map((profile) => (
              <ProfileRow
                key={profile.id}
                profile={profile}
                onEdit={handleEdit}
                onResetPin={handleResetPin}
                onSubscription={() => router.push("/subscription")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
