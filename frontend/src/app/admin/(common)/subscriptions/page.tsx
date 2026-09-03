"use client";

import { useState } from "react";
import { CreditCard, Search, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "ACTIVE", className: "bg-[#22A146]/10 text-[#22A146]" },
    PAST_DUE: { label: "PAST DUE", className: "bg-orange-50 text-orange-600" },
    CANCELLED: { label: "CANCELLED", className: "bg-red-50 text-red-600" },
    EXPIRED: { label: "EXPIRED", className: "bg-gray-100 text-gray-600" },
  };
  return (
    statusMap[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-600",
    }
  );
}

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAST_DUE", label: "Past Due" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
];

export default function AdminSubscriptionsPage() {
  const [tab, setTab] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-subscriptions", page, tab],
    queryFn: () => adminService.getSubscriptions(page, tab || undefined),
  });

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Subscriptions
        </h1>
        <p className="text-base text-[#64748B]">
          {data?.total ?? 0} total subscriptions
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

      {!isLoading && data?.subscriptions.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No subscriptions found.</p>
        </div>
      )}

      {!isLoading && data && data.subscriptions.length > 0 && (
        <div className="space-y-3">
          {data.subscriptions.map((subscription) => {
            const status = getStatusBadge(subscription.status);
            return (
              <div
                key={subscription.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-5"
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-[#B8912F]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0C1F33]">
                        {subscription.accountName}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {subscription.accountEmail}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        Stripe: {subscription.stripeSubscriptionId.slice(0, 20)}
                        ...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1 text-sm text-[#64748B]">
                      <Users className="w-4 h-4" />
                      {subscription.seats} seat(s)
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-1 rounded ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-[#64748B]">
                  <span>
                    Started: {formatDate(subscription.currentPeriodStart)}
                  </span>
                  <span>Ends: {formatDate(subscription.currentPeriodEnd)}</span>
                  <span>Created: {formatDate(subscription.createdAt)}</span>
                </div>
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
            disabled={data.subscriptions.length < 20}
            className="w-9 h-9 rounded-md border border-[#E3E8EF] disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
