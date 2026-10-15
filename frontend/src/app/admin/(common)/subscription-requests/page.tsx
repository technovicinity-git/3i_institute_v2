"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  useAdminSubscriptionRequests,
  useApproveSubscriptionRequestMutation,
  useRejectSubscriptionRequestMutation,
} from "@/hooks/use-subscription";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ReasonDialog } from "@/components/ui/reason-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import {
  formatMoney,
  type AdminSubscriptionRequest,
  type SubscriptionRequestStatus,
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

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "", label: "All" },
];

const STATUS_BADGE: Record<
  SubscriptionRequestStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "PENDING", className: "bg-yellow-50 text-yellow-700" },
  APPROVED: { label: "APPROVED", className: "bg-[#22A146]/10 text-[#22A146]" },
  REJECTED: { label: "REJECTED", className: "bg-red-50 text-red-600" },
  CANCELLED: { label: "CANCELLED", className: "bg-gray-100 text-gray-600" },
};

function accountName(request: AdminSubscriptionRequest): string {
  return (
    `${request.account.firstName} ${request.account.lastName}`.trim() ||
    request.account.email
  );
}

export default function AdminSubscriptionRequestsPage() {
  const [status, setStatus] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reviewing, setReviewing] = useState<AdminSubscriptionRequest | null>(
    null,
  );
  const [rejecting, setRejecting] = useState<AdminSubscriptionRequest | null>(
    null,
  );

  const { data, isLoading, isError, isFetching, refetch } =
    useAdminSubscriptionRequests(page, {
      status: status || undefined,
      search: debouncedSearch || undefined,
    });
  const approveMutation = useApproveSubscriptionRequestMutation();
  const rejectMutation = useRejectSubscriptionRequestMutation();
  const confirm = useConfirm();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  };

  const handleApprove = (request: AdminSubscriptionRequest) => {
    confirm({
      tone: "success",
      title: "Approve this payment?",
      description: (
        <>
          <span className="font-semibold text-[#0C1F33]">
            {request.learnerProfile.displayName}
          </span>{" "}
          will be subscribed for one month
          {request.profileSubscribedUntil
            ? `, starting when the current period ends (${formatDateTime(request.profileSubscribedUntil)})`
            : " from now"}
          . It ends at 12am in the account holder&apos;s timezone.{" "}
          {request.transactionId ? (
            <>
              Make sure {formatMoney(request.amount, request.currency)} with
              transaction ID{" "}
              <span className="font-mono font-semibold text-[#0C1F33]">
                {request.transactionId}
              </span>{" "}
              has arrived.
            </>
          ) : (
            "A 100% fee waiver covers this month, so there's no payment to check."
          )}
          {request.discountPercent > 0 &&
            ` Their ${request.discountPercent}% waiver will be used up.`}
        </>
      ),
      confirmLabel: "Approve",
      onConfirm: async () => {
        await approveMutation.mutateAsync(request.id);
        setReviewing(null);
      },
    });
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
            Subscription Requests
          </h1>
          <p className="text-base text-[#64748B]">
            {data?.pendingCount ?? 0} waiting for review
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E3E8EF] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Search and status */}
      <div className="bg-white border border-[#E3E8EF] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 border border-[#E3E8EF] rounded-lg px-4 py-2.5 mb-4 max-w-[440px]">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search transaction ID, profile, name or email..."
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
          <p className="text-[#64748B] mb-4">
            Couldn&apos;t load subscription requests.
          </p>
          <button
            onClick={() => refetch()}
            className="text-sm font-semibold text-[#2563EB] hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && data?.requests.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            {status === "PENDING" && !debouncedSearch
              ? "All caught up — no payments waiting for review."
              : "No requests found."}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && data && data.requests.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[#FBF9F4] border-b border-[#E3E8EF] text-xs font-bold text-[#64748B] uppercase">
            <span className="col-span-3">Learner / account</span>
            <span className="col-span-2">Amount</span>
            <span className="col-span-3">Payment</span>
            <span className="col-span-2">Submitted</span>
            <span className="col-span-1">Status</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>

          <div className="divide-y divide-[#E3E8EF]">
            {data.requests.map((request) => {
              const badge = STATUS_BADGE[request.status];
              return (
                <div
                  key={request.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-gray-50"
                >
                  {/* Learner */}
                  <div className="md:col-span-3 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[#B8912F]">
                        {request.learnerProfile.displayName
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0C1F33] truncate">
                        {request.learnerProfile.displayName}
                        <span className="ml-1.5 font-normal text-xs text-[#64748B]">
                          age {request.learnerProfile.age}
                        </span>
                      </p>
                      <p className="text-xs text-[#64748B] truncate">
                        {accountName(request)} · {request.account.email}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-[#0C1F33]">
                      {formatMoney(request.amount, request.currency)}
                    </p>
                    {request.discountPercent > 0 && (
                      <p className="text-xs text-[#157A34]">
                        {request.discountPercent}% waiver
                      </p>
                    )}
                    {request.profileSubscribedUntil &&
                      request.status === "PENDING" && (
                        <p className="text-xs text-[#2D6CDF]">Renewal</p>
                      )}
                  </div>

                  {/* Payment */}
                  <div className="md:col-span-3 min-w-0">
                    <p className="text-sm text-[#334155] truncate">
                      {request.paymentMethod}
                    </p>
                    {request.transactionId && (
                      <p className="text-xs text-[#64748B] font-mono truncate">
                        {request.transactionId}
                      </p>
                    )}
                  </div>

                  {/* Submitted */}
                  <span className="md:col-span-2 text-sm text-[#64748B]">
                    {formatDate(request.createdAt)}
                  </span>

                  {/* Status */}
                  <span className="md:col-span-1">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </span>

                  {/* Actions */}
                  <div className="md:col-span-1 md:text-right">
                    <button
                      onClick={() => setReviewing(request)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E3E8EF] text-xs font-semibold text-[#0C1F33] hover:bg-gray-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {request.status === "PENDING" ? "Review" : "View"}
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
        itemLabel="requests"
      />

      <ReviewDialog
        request={reviewing}
        onOpenChange={(open) => !open && setReviewing(null)}
        onApprove={handleApprove}
        onReject={(request) => setRejecting(request)}
        busy={approveMutation.isPending || rejectMutation.isPending}
      />

      <ReasonDialog
        open={rejecting !== null}
        onOpenChange={(open) => !open && setRejecting(null)}
        title="Reject this payment?"
        description={
          rejecting && (
            <>
              <span className="font-semibold text-[#0C1F33]">
                {accountName(rejecting)}
              </span>{" "}
              will be told the payment for{" "}
              {rejecting.learnerProfile.displayName} wasn&apos;t approved, with
              your reason.
            </>
          )
        }
        placeholder="e.g. No payment found with this transaction ID"
        onConfirm={async (reason) => {
          if (!rejecting) return;
          await rejectMutation.mutateAsync({ requestId: rejecting.id, reason });
          setRejecting(null);
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
    <div className="grid grid-cols-[130px_1fr] gap-3 py-2 text-sm">
      <span className="text-[#64748B]">{label}</span>
      <span className="text-[#0C1F33] min-w-0 break-words">{children}</span>
    </div>
  );
}

function ReviewDialog({
  request,
  onOpenChange,
  onApprove,
  onReject,
  busy,
}: {
  request: AdminSubscriptionRequest | null;
  onOpenChange: (open: boolean) => void;
  onApprove: (request: AdminSubscriptionRequest) => void;
  onReject: (request: AdminSubscriptionRequest) => void;
  busy: boolean;
}) {
  return (
    <Dialog open={request !== null} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto gap-5 bg-white text-[#0C1F33] rounded-xl border border-[#E3E8EF] ring-0 p-6"
        overlayClassName="bg-black/40"
      >
        {request && (
          <>
            <div className="flex flex-col gap-1.5 pr-6">
              <DialogTitle
                className="text-2xl text-[#0C1F33] font-normal"
                style={{ fontFamily: "'Marcellus', serif" }}
              >
                {request.learnerProfile.displayName}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#475569]">
                {accountName(request)} · {request.account.email}
              </DialogDescription>
            </div>

            <div className="divide-y divide-[#E3E8EF] border-y border-[#E3E8EF]">
              <DetailRow label="Status">
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_BADGE[request.status].className}`}
                >
                  {STATUS_BADGE[request.status].label}
                </span>
              </DetailRow>
              <DetailRow label="Amount paid">
                <span className="font-semibold">
                  {formatMoney(request.amount, request.currency)}
                </span>
                {request.expectedAmount !== null &&
                  request.transactionId &&
                  request.amount !== request.expectedAmount && (
                    <span className="ml-2 text-xs text-orange-600">
                      expected{" "}
                      {formatMoney(request.expectedAmount, request.currency)}
                    </span>
                  )}
              </DetailRow>
              {request.discountPercent > 0 && request.listPrice !== null && (
                <DetailRow label="Fee waiver">
                  <span className="text-[#157A34] font-semibold">
                    {request.discountPercent}% off
                  </span>{" "}
                  <span className="text-[#64748B]">
                    ({formatMoney(request.listPrice, request.currency)} →{" "}
                    {formatMoney(request.expectedAmount ?? 0, request.currency)})
                  </span>
                </DetailRow>
              )}
              <DetailRow label="Paid to">{request.paymentMethod}</DetailRow>
              {request.transactionId && (
                <DetailRow label="Transaction ID">
                  <span className="font-mono">{request.transactionId}</span>
                </DetailRow>
              )}
              {request.senderAccount && (
                <DetailRow label="Paid from">
                  <span className="font-mono">{request.senderAccount}</span>
                </DetailRow>
              )}
              <DetailRow label="Payment date">
                {formatDate(request.paidAt)}
              </DetailRow>
              <DetailRow label="Submitted">
                {formatDateTime(request.createdAt)}
              </DetailRow>
              <DetailRow label="Learner age">
                {request.learnerProfile.age}
              </DetailRow>
              {request.profileSubscribedUntil && (
                <DetailRow label="Subscribed until">
                  {formatDateTime(request.profileSubscribedUntil)}
                </DetailRow>
              )}
              {request.note && (
                <DetailRow label="Note">
                  <span className="whitespace-pre-line">{request.note}</span>
                </DetailRow>
              )}
              {request.status === "APPROVED" &&
                request.periodStart &&
                request.periodEnd && (
                  <DetailRow label="Period">
                    {formatDateTime(request.periodStart)} –{" "}
                    {formatDateTime(request.periodEnd)}
                  </DetailRow>
                )}
              {request.status === "REJECTED" && request.rejectionReason && (
                <DetailRow label="Reason">
                  <span className="text-red-600">
                    {request.rejectionReason}
                  </span>
                </DetailRow>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase mb-2">
                Payment proof
              </p>
              {request.proofImageUrl ? (
                <a
                  href={request.proofImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block w-fit"
                >
                  <Image
                    src={request.proofImageUrl}
                    alt="Payment proof"
                    width={480}
                    height={480}
                    className="max-h-72 w-auto rounded-lg border border-[#E3E8EF] object-contain"
                  />
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-semibold text-[#0C1F33] opacity-0 group-hover:opacity-100">
                    <ExternalLink className="w-3 h-3" />
                    Open
                  </span>
                </a>
              ) : (
                <p className="text-sm text-[#94A3B8] italic">
                  No image attached.
                </p>
              )}
            </div>

            {request.status === "PENDING" && (
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={() => onReject(request)}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => onApprove(request)}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
