"use client";

import { useState } from "react";
import { Search, Award, ExternalLink, XCircle } from "lucide-react";
import {
  useInstructorCertificates,
  useRevokeCertificateMutation,
} from "@/hooks/use-instructor-certificates";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";

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

export default function InstructorCertificatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [revokeTarget, setRevokeTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const { data: courses } = useInstructorCourses();
  const { data, isLoading } = useInstructorCertificates(
    selectedCourse || undefined,
  );
  const revokeMutation = useRevokeCertificateMutation();

  const filteredCertificates = data?.certificates.filter(
    (cert) =>
      cert.learnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRevoke = () => {
    if (!revokeTarget || !revokeReason.trim()) return;

    revokeMutation.mutate(
      { certificateId: revokeTarget.id, reason: revokeReason },
      {
        onSuccess: () => {
          setRevokeTarget(null);
          setRevokeReason("");
        },
      },
    );
  };

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Certificates
        </h1>
        <p className="text-base text-[#64748B]">
          {data?.total ?? 0} certificates issued
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by student or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2.5 bg-white border border-[#E3E8EF] rounded-lg text-sm"
        >
          <option value="">All Courses</option>
          {courses?.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && filteredCertificates?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No certificates issued yet.</p>
        </div>
      )}

      {/* Certificates List */}
      {!isLoading &&
        filteredCertificates &&
        filteredCertificates.length > 0 && (
          <div className="space-y-3">
            {filteredCertificates.map((cert) => {
              const type = getTypeBadge(cert.type);
              const isRevoked = cert.revokedAt !== null;

              return (
                <div
                  key={cert.id}
                  className={`bg-white rounded-xl border p-5 flex items-center justify-between ${
                    isRevoked
                      ? "border-red-200 bg-red-50/30"
                      : "border-[#E3E8EF]"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-[#B8912F]" />
                    </div>

                    {/* Info */}
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
                        Issued: {formatDate(cert.issuedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Verify link */}
                    <a
                      href={`/verify/${cert.verificationCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-50 text-[#2563EB]"
                      title="Verify"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Revoke */}
                    {!isRevoked && (
                      <button
                        onClick={() =>
                          setRevokeTarget({
                            id: cert.id,
                            name: cert.learnerName,
                          })
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
              Revoking certificate for <strong>{revokeTarget.name}</strong>.
              This cannot be undone.
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
                className="flex-1 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold text-[#0C1F33]"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={!revokeReason.trim() || revokeMutation.isPending}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
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
