"use client";

import { useEffect, useState } from "react";
import { Award, Copy, ExternalLink, Search, XCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminService,
  type AdminCertificate,
  type AdminCertificateFilters,
} from "@/services/admin.service";
import { Pagination } from "@/components/ui/pagination";
import { ReasonDialog } from "@/components/ui/reason-dialog";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TYPE_BADGE: Record<AdminCertificate["type"], { label: string; className: string }> = {
  COMPLETION: { label: "COMPLETION", className: "bg-[#22A146]/10 text-[#22A146]" },
  EXAM: { label: "EXAM", className: "bg-[#7C3AED]/10 text-[#7C3AED]" },
  ATTENDANCE: { label: "ATTENDANCE", className: "bg-[#2563EB]/10 text-[#2563EB]" },
};

const STATUS_TABS: { value: NonNullable<AdminCertificateFilters["status"]>; label: string }[] = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "REVOKED", label: "Revoked" },
];

export default function AdminCertificatesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState<AdminCertificateFilters["status"]>("");
  const [page, setPage] = useState(1);
  const [revokeTarget, setRevokeTarget] = useState<AdminCertificate | null>(
    null,
  );

  // Search once typing pauses.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-certificates", page, debouncedSearch, type, status],
    queryFn: () =>
      adminService.getCertificates(page, {
        search: debouncedSearch || undefined,
        type: type || undefined,
        status,
      }),
  });

  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.revokeCertificate(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      toast.success("Certificate revoked");
    },
    onError: (error: { response?: { data?: { error?: { message?: string } } } }) => {
      toast.error(
        error.response?.data?.error?.message ?? "Failed to revoke certificate",
      );
    },
  });

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Verification code copied");
    } catch {
      toast.error("Couldn't copy the code");
    }
  };

  const filtered = Boolean(debouncedSearch || type || status);

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
          {data?.total ?? 0} {filtered ? "matching" : "total"} certificate
          {data?.total === 1 ? "" : "s"}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-[#E3E8EF] mb-5 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value || "all"}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap ${
              status === tab.value
                ? "border-[#0D2B45] text-[#0C1F33]"
                : "border-transparent text-[#64748B] hover:text-[#0C1F33]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + type filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 w-full sm:w-[400px]">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by learner, course, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>
        <select
          aria-label="Filter by certificate type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="h-[42px] rounded-lg border border-[#E3E8EF] bg-white px-3 text-sm text-[#334155] outline-none"
        >
          <option value="">All types</option>
          <option value="COMPLETION">Completion</option>
          <option value="EXAM">Exam</option>
          <option value="ATTENDANCE">Attendance</option>
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}

      {isError && (
        <div className="bg-white border border-dashed border-red-200 rounded-xl p-10 text-center">
          <p className="text-red-600 font-medium">
            Failed to load certificates.
          </p>
        </div>
      )}

      {!isLoading && !isError && data?.certificates.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            {filtered
              ? "No certificates match these filters."
              : "No certificates have been issued yet."}
          </p>
        </div>
      )}

      {!isLoading && data && data.certificates.length > 0 && (
        <div className="space-y-3">
          {data.certificates.map((cert) => {
            const badge = TYPE_BADGE[cert.type] ?? TYPE_BADGE.COMPLETION;
            const isRevoked = cert.revokedAt !== null;

            return (
              <div
                key={cert.id}
                className={`bg-white rounded-xl border p-5 flex items-center justify-between flex-wrap gap-3 ${
                  isRevoked ? "border-red-200 bg-red-50/30" : "border-[#E3E8EF]"
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-[#B8912F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#0C1F33]">
                        {cert.learnerName}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      {isRevoked && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-600">
                          REVOKED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      {cert.courseTitle}
                      {cert.examTitle && ` · ${cert.examTitle}`}
                      {cert.score !== null &&
                        cert.totalMarks &&
                        ` · Score ${cert.score}/${cert.totalMarks}`}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Code:{" "}
                      <span className="font-mono text-[#475569]">
                        {cert.verificationCode}
                      </span>{" "}
                      • Issued {formatDate(cert.issuedAt)}
                    </p>
                    {isRevoked && (
                      <p className="text-xs text-red-600 mt-1">
                        Revoked {formatDate(cert.revokedAt!)}
                        {cert.revokeReason && ` — ${cert.revokeReason}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyCode(cert.verificationCode)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E3E8EF] px-3 py-1.5 text-xs font-semibold text-[#334155] hover:bg-gray-50"
                    title="Copy verification code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy code
                  </button>
                  <a
                    href={`/verify/${cert.verificationCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E3E8EF] px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-gray-50"
                    title="Open the public verification page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Verify
                  </a>
                  {!isRevoked && (
                    <button
                      onClick={() => setRevokeTarget(cert)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        pageSize={20}
        total={data?.total ?? 0}
        onPageChange={setPage}
        itemLabel="certificates"
      />

      <ReasonDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke this certificate?"
        description={
          <>
            The <strong>{revokeTarget?.courseTitle}</strong> certificate for{" "}
            <strong>{revokeTarget?.learnerName}</strong> will stop verifying.
            This cannot be undone.
          </>
        }
        label="Reason for revocation"
        confirmLabel="Revoke certificate"
        onConfirm={(reason) =>
          revokeMutation.mutateAsync({ id: revokeTarget!.id, reason })
        }
      />
    </div>
  );
}
