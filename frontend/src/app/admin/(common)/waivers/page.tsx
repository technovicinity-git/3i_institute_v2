"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, FileText } from "lucide-react";
import {
  useAdminAllWaivers,
  useApproveWaiverMutation,
  useRejectWaiverMutation,
} from "@/hooks/use-admin";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    PENDING: { label: "PENDING", className: "bg-yellow-50 text-yellow-700" },
    APPROVED: {
      label: "APPROVED",
      className: "bg-[#22A146]/10 text-[#22A146]",
    },
    REJECTED: { label: "REJECTED", className: "bg-red-50 text-red-600" },
    REVOKED: { label: "REVOKED", className: "bg-gray-100 text-gray-600" },
  };
  return (
    statusMap[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-600",
    }
  );
}

const TIERS = [
  { value: 25, label: "25%" },
  { value: 50, label: "50%" },
  { value: 75, label: "75%" },
  { value: 100, label: "100%" },
];

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function AdminWaiversPage() {
  const [tab, setTab] = useState<string>("PENDING");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminAllWaivers(page, tab || undefined);
  const approveMutation = useApproveWaiverMutation();
  const rejectMutation = useRejectWaiverMutation();

  const [approveTarget, setApproveTarget] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(50);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (waiverId: string) => {
    approveMutation.mutate(
      { waiverId, tier: selectedTier },
      {
        onSuccess: () => {
          setApproveTarget(null);
          setSelectedTier(50);
        },
      },
    );
  };

  const handleReject = (waiverId: string) => {
    if (!rejectReason.trim()) return;
    rejectMutation.mutate(
      { waiverId, reason: rejectReason },
      {
        onSuccess: () => {
          setRejectTarget(null);
          setRejectReason("");
        },
      },
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-[900px] mx-auto">
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Waiver Requests
        </h1>
        <p className="text-base text-[#64748B]">
          {data?.total ?? 0} total requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E3E8EF] mb-6 overflow-x-auto">
        {STATUS_TABS.map((statusTab) => (
          <button
            key={statusTab.value}
            onClick={() => {
              setTab(statusTab.value);
              setPage(1);
            }}
            className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              tab === statusTab.value
                ? "border-[#22A146] text-[#22A146]"
                : "border-transparent text-[#64748B] hover:text-[#0C1F33]"
            }`}
          >
            {statusTab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && data?.waivers.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No waiver requests found.</p>
        </div>
      )}

      {!isLoading && data && data.waivers.length > 0 && (
        <div className="space-y-4">
          {data.waivers.map((waiver) => {
            const status = getStatusBadge(waiver.status);
            return (
              <div
                key={waiver.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#0C1F33]">
                      {waiver.account.firstName} {waiver.account.lastName}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {waiver.account.email}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Requested: {formatDate(waiver.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {waiver.status === "APPROVED" && waiver.tier && (
                      <span className="text-sm font-bold text-[#22A146]">
                        {waiver.tier}% off
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-bold px-2 py-1 rounded ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-[#FBF9F4] rounded-lg p-4 mb-4">
                  <p className="text-xs font-bold text-[#64748B] uppercase mb-2">
                    Explanation
                  </p>
                  <p className="text-sm text-[#0C1F33] leading-6">
                    {waiver.explanation}
                  </p>
                </div>

                {/* Evidence */}
                {waiver.evidenceFiles.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-[#64748B] uppercase mb-2">
                      Evidence ({waiver.evidenceFiles.length})
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {waiver.evidenceFiles.map((file, index) => (
                        <a
                          key={index}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E3E8EF] rounded-lg text-xs font-semibold text-[#2563EB] hover:bg-gray-50"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          File {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review info */}
                {waiver.status !== "PENDING" && (
                  <div className="text-xs text-[#64748B] mb-4">
                    Reviewed: {formatDate(waiver.reviewedAt)}
                  </div>
                )}

                {/* Actions - only for pending */}
                {waiver.status === "PENDING" && (
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    {approveTarget === waiver.id ? (
                      <div className="flex items-center gap-3 flex-1">
                        <select
                          value={selectedTier}
                          onChange={(e) =>
                            setSelectedTier(Number(e.target.value))
                          }
                          className="px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm"
                        >
                          {TIERS.map((tier) => (
                            <option key={tier.value} value={tier.value}>
                              {tier.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleApprove(waiver.id)}
                          disabled={approveMutation.isPending}
                          className="px-4 py-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setApproveTarget(null)}
                          className="px-4 py-2 border border-[#E3E8EF] rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setApproveTarget(waiver.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    )}

                    {rejectTarget === waiver.id ? (
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection..."
                          className="flex-1 px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm"
                        />
                        <button
                          onClick={() => handleReject(waiver.id)}
                          disabled={
                            !rejectReason.trim() || rejectMutation.isPending
                          }
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setRejectTarget(null)}
                          className="px-4 py-2 border border-[#E3E8EF] rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRejectTarget(waiver.id)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-md border border-[#E3E8EF] disabled:opacity-40"
          >
            ←
          </button>
          <span className="text-sm py-2">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={data.waivers.length < 20}
            className="w-9 h-9 rounded-md border border-[#E3E8EF] disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
