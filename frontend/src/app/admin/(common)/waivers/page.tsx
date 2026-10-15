"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  FileWarning,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  RefreshCw,
} from "lucide-react";
import {
  useAdminWaivers,
  useApproveWaiverMutation,
  useRejectWaiverMutation,
  useRevokeWaiverMutation,
} from "@/hooks/use-subscription";
import { ReasonDialog } from "@/components/ui/reason-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import {
  WAIVER_TIERS,
  type Waiver,
  type WaiverStatus,
} from "@/services/subscription.service";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "USED", label: "Used" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
  { value: "REVOKED", label: "Revoked" },
  { value: "", label: "All" },
];

const STATUS_BADGE: Record<WaiverStatus, { label: string; className: string }> =
  {
    PENDING: { label: "PENDING", className: "bg-yellow-50 text-yellow-700" },
    APPROVED: {
      label: "APPROVED",
      className: "bg-[#22A146]/10 text-[#22A146]",
    },
    USED: { label: "USED", className: "bg-blue-50 text-[#2D6CDF]" },
    REJECTED: { label: "REJECTED", className: "bg-red-50 text-red-600" },
    EXPIRED: { label: "EXPIRED", className: "bg-gray-100 text-gray-600" },
    REVOKED: { label: "REVOKED", className: "bg-gray-100 text-gray-600" },
  };

function accountName(waiver: Waiver): string {
  return (
    `${waiver.account.firstName} ${waiver.account.lastName}`.trim() ||
    waiver.account.email
  );
}

function statusDetail(waiver: Waiver): string | null {
  switch (waiver.status) {
    case "APPROVED":
      if (waiver.reservedByRequestId) return "On a pending subscription";
      return waiver.expiresAt ? `Use by ${formatDate(waiver.expiresAt)}` : null;
    case "USED":
      return waiver.usedAt ? `Used ${formatDate(waiver.usedAt)}` : null;
    case "EXPIRED":
      return waiver.expiresAt
        ? `Expired ${formatDate(waiver.expiresAt)}`
        : null;
    default:
      return null;
  }
}

export default function AdminWaiversPage() {
  const [status, setStatus] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reviewing, setReviewing] = useState<Waiver | null>(null);
  const [rejecting, setRejecting] = useState<Waiver | null>(null);
  const [revoking, setRevoking] = useState<Waiver | null>(null);

  const { data, isLoading, isError, isFetching, refetch } = useAdminWaivers(
    page,
    { status: status || undefined, search: debouncedSearch || undefined },
  );
  const approveMutation = useApproveWaiverMutation();
  const rejectMutation = useRejectWaiverMutation();
  const revokeMutation = useRevokeWaiverMutation();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  };

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Fee Waivers
          </h1>
          <p className="text-base text-[#64748B]">
            {data?.pendingCount ?? 0} waiting for review · approved waivers
            discount one subscription and must be used within 30 days
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E3E8EF] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Search and status */}
      <div className="bg-white border border-[#E3E8EF] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 border border-[#E3E8EF] rounded-lg px-4 py-2.5 mb-4 max-w-[440px]">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search profile, name or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                status === tab.value
                  ? "bg-[#0C1F33] text-white"
                  : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
              }`}
            >
              {tab.label}
              {tab.value === "PENDING" && (data?.pendingCount ?? 0) > 0 && (
                <span className="ml-1.5 text-xs">({data?.pendingCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {!isLoading && isError && (
        <div className="bg-white border border-dashed border-red-200 rounded-xl p-10 text-center">
          <p className="text-[#64748B] mb-4">Couldn&apos;t load waivers.</p>
          <button
            onClick={() => refetch()}
            className="text-sm font-semibold text-[#2563EB] hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && data?.waivers.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <FileWarning className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            {status === "PENDING" && !debouncedSearch
              ? "All caught up — no waiver requests waiting."
              : "No waivers found."}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && data && data.waivers.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[#FBF9F4] border-b border-[#E3E8EF] text-xs font-bold text-[#64748B] uppercase">
            <span className="col-span-3">Learner / account</span>
            <span className="col-span-4">Reason</span>
            <span className="col-span-1">Discount</span>
            <span className="col-span-1">Requested</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>

          <div className="divide-y divide-[#E3E8EF]">
            {data.waivers.map((waiver) => {
              const badge = STATUS_BADGE[waiver.status];
              const detail = statusDetail(waiver);
              const name =
                waiver.learnerProfile?.displayName ?? "No learner profile";
              return (
                <div
                  key={waiver.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-gray-50"
                >
                  {/* Learner */}
                  <div className="md:col-span-3 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[#B8912F]">
                        {name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0C1F33] truncate">
                        {name}
                        {waiver.learnerProfile && (
                          <span className="ml-1.5 font-normal text-xs text-[#64748B]">
                            age {waiver.learnerProfile.age}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#64748B] truncate">
                        {accountName(waiver)} · {waiver.account.email}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  <p className="md:col-span-4 text-sm text-[#334155] line-clamp-2">
                    {waiver.explanation}
                  </p>

                  {/* Discount */}
                  <span className="md:col-span-1 text-sm font-semibold text-[#0C1F33]">
                    {waiver.percent ? `${waiver.percent}%` : "—"}
                  </span>

                  {/* Requested */}
                  <span className="md:col-span-1 text-sm text-[#64748B]">
                    {formatDate(waiver.createdAt)}
                  </span>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    {detail && (
                      <p className="text-xs text-[#64748B] mt-1">{detail}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 md:text-right">
                    <button
                      onClick={() => setReviewing(waiver)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E3E8EF] text-xs font-semibold text-[#0C1F33] hover:bg-gray-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {waiver.status === "PENDING" ? "Review" : "View"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Pagination
        page={page}
        pageSize={20}
        total={data?.total ?? 0}
        onPageChange={setPage}
        itemLabel="waivers"
      />

      <ReviewDialog
        waiver={reviewing}
        onOpenChange={(open) => !open && setReviewing(null)}
        onApprove={async (waiver, tier) => {
          await approveMutation.mutateAsync({ waiverId: waiver.id, tier });
          setReviewing(null);
        }}
        approving={approveMutation.isPending}
        onReject={setRejecting}
        onRevoke={setRevoking}
      />

      <ReasonDialog
        open={rejecting !== null}
        onOpenChange={(open) => !open && setRejecting(null)}
        title="Reject this waiver request?"
        description={
          rejecting && (
            <>
              <span className="font-semibold text-[#0C1F33]">
                {accountName(rejecting)}
              </span>{" "}
              will be emailed that the waiver for{" "}
              {rejecting.learnerProfile?.displayName ?? "their learner"}{" "}
              wasn&apos;t approved, with your reason.
            </>
          )
        }
        placeholder="e.g. Please include proof of income"
        onConfirm={async (reason) => {
          if (!rejecting) return;
          await rejectMutation.mutateAsync({ waiverId: rejecting.id, reason });
          setRejecting(null);
          setReviewing(null);
        }}
      />

      <ReasonDialog
        open={revoking !== null}
        onOpenChange={(open) => !open && setRevoking(null)}
        title="Revoke this waiver?"
        confirmLabel="Revoke"
        tone="warning"
        description={
          revoking && (
            <>
              The unused {revoking.percent}% waiver for{" "}
              <span className="font-semibold text-[#0C1F33]">
                {revoking.learnerProfile?.displayName ?? "this learner"}
              </span>{" "}
              will be withdrawn and the family emailed your reason.
            </>
          )
        }
        onConfirm={async (reason) => {
          if (!revoking) return;
          await revokeMutation.mutateAsync({ waiverId: revoking.id, reason });
          setRevoking(null);
          setReviewing(null);
        }}
      />
    </div>
  );
}

// ---- Review dialog ----

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-2 text-sm">
      <span className="text-[#64748B]">{label}</span>
      <span className="text-[#0C1F33] min-w-0 break-words">{children}</span>
    </div>
  );
}

function ReviewDialog({
  waiver,
  onOpenChange,
  onApprove,
  approving,
  onReject,
  onRevoke,
}: {
  waiver: Waiver | null;
  onOpenChange: (open: boolean) => void;
  onApprove: (waiver: Waiver, tier: number) => Promise<void>;
  approving: boolean;
  onReject: (waiver: Waiver) => void;
  onRevoke: (waiver: Waiver) => void;
}) {
  return (
    <Dialog open={waiver !== null} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto gap-5 bg-white text-[#0C1F33] rounded-xl border border-[#E3E8EF] ring-0 p-6"
        overlayClassName="bg-black/40"
      >
        {/* Keyed so the tier choice resets for each waiver */}
        {waiver && (
          <ReviewContent
            key={waiver.id}
            waiver={waiver}
            onApprove={onApprove}
            approving={approving}
            onReject={onReject}
            onRevoke={onRevoke}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReviewContent({
  waiver,
  onApprove,
  approving,
  onReject,
  onRevoke,
}: {
  waiver: Waiver;
  onApprove: (waiver: Waiver, tier: number) => Promise<void>;
  approving: boolean;
  onReject: (waiver: Waiver) => void;
  onRevoke: (waiver: Waiver) => void;
}) {
  const [tier, setTier] = useState<number>(50);
  const badge = STATUS_BADGE[waiver.status];
  const detail = statusDetail(waiver);

  return (
    <>
      <div className="flex flex-col gap-1.5 pr-6">
        <DialogTitle
          className="text-2xl text-[#0C1F33] font-normal"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          {waiver.learnerProfile?.displayName ?? "No learner profile"}
        </DialogTitle>
        <DialogDescription className="text-sm text-[#475569]">
          {accountName(waiver)} · {waiver.account.email}
        </DialogDescription>
      </div>

      <div className="divide-y divide-[#E3E8EF] border-y border-[#E3E8EF]">
        <DetailRow label="Status">
          <span
            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${badge.className}`}
          >
            {badge.label}
          </span>
          {detail && (
            <span className="ml-2 text-xs text-[#64748B]">{detail}</span>
          )}
        </DetailRow>
        {waiver.learnerProfile && (
          <DetailRow label="Learner age">{waiver.learnerProfile.age}</DetailRow>
        )}
        <DetailRow label="Requested">{formatDate(waiver.createdAt)}</DetailRow>
        {waiver.percent !== null && (
          <DetailRow label="Discount">{waiver.percent}%</DetailRow>
        )}
        {waiver.rejectionReason && (
          <DetailRow label="Rejected">
            <span className="text-red-600">{waiver.rejectionReason}</span>
          </DetailRow>
        )}
        {waiver.revokeReason && (
          <DetailRow label="Revoked">
            <span className="text-red-600">{waiver.revokeReason}</span>
          </DetailRow>
        )}
      </div>

      <div className="bg-[#FBF9F4] rounded-lg p-4">
        <p className="text-xs font-bold text-[#64748B] uppercase mb-2">
          Their situation
        </p>
        <p className="text-sm text-[#0C1F33] leading-6 whitespace-pre-line">
          {waiver.explanation}
        </p>
      </div>

      {waiver.evidenceFiles.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[#64748B] uppercase mb-2">
            Supporting images ({waiver.evidenceFiles.length})
          </p>
          <div className="flex gap-3 flex-wrap">
            {waiver.evidenceFiles.map((file, index) => (
              <a
                key={file}
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Image
                  src={file}
                  alt={`Supporting image ${index + 1}`}
                  width={160}
                  height={160}
                  className="h-28 w-auto rounded-lg border border-[#E3E8EF] object-cover hover:opacity-90"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {waiver.status === "PENDING" && (
        <div className="flex flex-col gap-4">
          {waiver.learnerProfile ? (
            <div>
              <p className="text-sm font-semibold text-[#0C1F33] mb-2">
                Discount on one month
              </p>
              <div className="grid grid-cols-4 gap-2">
                {WAIVER_TIERS.map((value) => (
                  <button
                    key={value}
                    onClick={() => setTier(value)}
                    className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      tier === value
                        ? "border-[#22A146] bg-[#22A146]/10 text-[#157A34]"
                        : "border-[#E3E8EF] text-[#475569] hover:bg-gray-50"
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#64748B] mt-2">
                {tier === 100
                  ? "A free month: no payment needed when they apply."
                  : `They'll pay ${100 - tier}% of the monthly price.`}{" "}
                The family is emailed and must use it within 30 days.
              </p>
            </div>
          ) : (
            <p className="text-sm text-orange-600">
              This is an old waiver with no learner profile, so it can only be
              rejected.
            </p>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              onClick={() => onReject(waiver)}
              disabled={approving}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            {waiver.learnerProfile && (
              <button
                onClick={() => void onApprove(waiver, tier)}
                disabled={approving}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {approving ? "Approving..." : `Approve ${tier}%`}
              </button>
            )}
          </div>
        </div>
      )}

      {waiver.status === "APPROVED" && (
        <div className="flex flex-col gap-2 sm:items-end">
          <button
            onClick={() => onRevoke(waiver)}
            disabled={waiver.reservedByRequestId !== null}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-orange-300 text-orange-600 rounded-lg text-sm font-semibold hover:bg-orange-50 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Ban className="w-4 h-4" />
            Revoke waiver
          </button>
          {waiver.reservedByRequestId && (
            <p className="text-xs text-[#64748B]">
              It&apos;s on a subscription request waiting for review. Reject
              that request first to revoke it.
            </p>
          )}
        </div>
      )}
    </>
  );
}
