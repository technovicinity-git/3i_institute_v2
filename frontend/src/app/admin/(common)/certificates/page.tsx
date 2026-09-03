/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Search, Award, ExternalLink, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTypeBadge(type: string) {
  return type === "COMPLETION"
    ? { label: "COMPLETION", className: "bg-[#22A146]/10 text-[#22A146]" }
    : { label: "ATTENDANCE", className: "bg-[#2563EB]/10 text-[#2563EB]" };
}

export default function AdminCertificatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [revokeTarget, setRevokeTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-certificates", page, debouncedSearch],
    queryFn: () =>
      adminService.getCertificates(page, debouncedSearch || undefined),
  });

  const revokeMutation = useMutation({
    mutationFn: ({
      certificateId,
      reason,
    }: {
      certificateId: string;
      reason: string;
    }) => adminService.revokeCertificate(certificateId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      toast.success("Certificate revoked");
      setRevokeTarget(null);
      setRevokeReason("");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to revoke certificate");
    },
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  };

  const handleRevoke = () => {
    if (!revokeTarget || !revokeReason.trim()) return;
    revokeMutation.mutate({
      certificateId: revokeTarget.id,
      reason: revokeReason,
    });
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Certificates
        </h1>
        <p className="text-base text-[#64748B]">
          {data?.total ?? 0} total certificates issued
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 mb-6 max-w-[400px]">
        <Search className="w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search by name, course, or code..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-transparent text-sm outline-none w-full"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && data?.certificates.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No certificates found.</p>
        </div>
      )}

      {!isLoading && data && data.certificates.length > 0 && (
        <div className="space-y-3">
          {data.certificates.map((cert) => {
            const type = getTypeBadge(cert.type);
            const isRevoked = cert.revokedAt !== null;

            return (
              <div
                key={cert.id}
                className={`bg-white rounded-xl border p-5 flex items-center justify-between flex-wrap gap-3 ${
                  isRevoked ? "border-red-200 bg-red-50/30" : "border-[#E3E8EF]"
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-[#B8912F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#0C1F33]">
                        {cert.learnerName}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${type.className}`}
                      >
                        {type.label}
                      </span>
                      {isRevoked && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-600">
                          REVOKED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      {cert.courseTitle}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Code: {cert.verificationCode} • Issued:{" "}
                      {formatDate(cert.issuedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/verify/${cert.verificationCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-50 text-[#2563EB]"
                    title="Verify"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {!isRevoked && (
                    <button
                      onClick={() =>
                        setRevokeTarget({ id: cert.id, name: cert.learnerName })
                      }
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                      title="Revoke"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
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
            disabled={data.certificates.length < 20}
            className="w-9 h-9 rounded-md border border-[#E3E8EF] disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}

      {/* Revoke Modal */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setRevokeTarget(null)}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-[400px] z-10">
            <h3 className="text-lg font-semibold text-[#0C1F33] mb-2">
              Revoke Certificate
            </h3>
            <p className="text-sm text-[#64748B] mb-4">
              Revoking for <strong>{revokeTarget.name}</strong>. This cannot be
              undone.
            </p>
            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              rows={3}
              placeholder="Reason for revocation..."
              className="w-full px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRevokeTarget(null)}
                className="flex-1 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={!revokeReason.trim() || revokeMutation.isPending}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {revokeMutation.isPending ? "Revoking..." : "Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
