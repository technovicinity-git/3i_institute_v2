"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Filter, Search, UsersRound, Eye, ArchiveRestore, Archive } from "lucide-react";
import { useAdminLearnerProfiles, useArchiveLearnerProfileMutation, useRestoreLearnerProfileMutation } from "@/hooks/use-admin";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminLearnerProfilesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [seatStatus, setSeatStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminLearnerProfiles(page, { search: debouncedSearch || undefined, status: status || undefined, seatStatus: seatStatus || undefined });
  const archiveMutation = useArchiveLearnerProfileMutation();
  const restoreMutation = useRestoreLearnerProfileMutation();

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6">
        <h1 className="text-3xl md:text-[36px] text-[#0C1F33]" style={{ fontFamily: "'Marcellus', serif" }}>Learner Profiles</h1>
        <p className="text-base text-[#64748B]">{data?.total ?? 0} learner profiles</p>
      </header>

      <section className="bg-white border border-[#E3E8EF] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 border border-[#E3E8EF] rounded-lg px-4 py-2.5 mb-4 max-w-lg">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search learner, parent, or email..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[#334155]"><Filter className="w-4 h-4" /> Filters</div>
        <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
          <select aria-label="Filter by profile status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border border-[#E3E8EF] bg-white px-3 py-2.5 text-sm text-[#334155]"><option value="">All profile statuses</option><option value="ACTIVE">Current profiles</option><option value="ARCHIVED">Archived profiles</option></select>
          <select aria-label="Filter by seat status" value={seatStatus} onChange={(event) => { setSeatStatus(event.target.value); setPage(1); }} className="rounded-lg border border-[#E3E8EF] bg-white px-3 py-2.5 text-sm text-[#334155]"><option value="">Any seat status</option><option value="ACTIVE">Has an active seat</option><option value="INACTIVE">No active seat</option></select>
        </div>
      </section>

      {isLoading && <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" /></div>}
      {isError && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Could not load learner profiles.</div>}
      {!isLoading && !isError && data?.profiles.length === 0 && <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center"><UsersRound className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-[#64748B]">No learner profiles found.</p></div>}

      {!isLoading && !isError && !!data?.profiles.length && <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden">
        <div className="hidden lg:grid grid-cols-7 gap-4 px-6 py-3 bg-[#FBF9F4] border-b border-[#E3E8EF] text-xs font-bold text-[#64748B] uppercase"><span>Learner</span><span>Parent / account</span><span>Profile</span><span>Seat</span><span>Courses</span><span>Exams</span><span className="text-right">Actions</span></div>
        <div className="divide-y divide-[#E3E8EF]">{data.profiles.map((profile) => {
          const archived = Boolean(profile.deletedAt);
          return <div key={profile.id} className="grid grid-cols-1 lg:grid-cols-7 gap-3 lg:gap-4 px-6 py-4 items-center hover:bg-gray-50">
            <div><p className="font-semibold text-sm text-[#0C1F33]">{profile.displayName}</p><p className="text-xs text-[#64748B]">Born {formatDate(profile.dateOfBirth)}</p></div>
            <div><p className="text-sm text-[#0C1F33]">{profile.account.firstName} {profile.account.lastName}</p><p className="text-xs text-[#64748B] truncate">{profile.account.email}</p></div>
            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${archived ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-700"}`}>{archived ? "Archived" : "Current"}</span>
            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${profile.isActive ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{profile.isActive ? "Active seat" : "No seat"}</span>
            <span className="text-sm text-[#64748B]">{profile._count.enrolments} enrolled</span>
            <span className="text-sm text-[#64748B]">{profile._count.examAttempts} attempts</span>
            <div className="flex items-center gap-2 lg:justify-end">
              <Link href={`/admin/learner-profiles/${profile.id}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E3E8EF] text-sm font-semibold text-[#0C1F33] hover:bg-gray-50"><Eye className="w-4 h-4" /> Details</Link>
              {archived ? <button onClick={() => restoreMutation.mutate(profile.id)} disabled={restoreMutation.isPending} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#22A146] hover:bg-green-50 disabled:opacity-50"><ArchiveRestore className="w-4 h-4" /> Restore</button> : <button onClick={() => { if (window.confirm(`Archive ${profile.displayName}'s profile?`)) archiveMutation.mutate(profile.id); }} disabled={archiveMutation.isPending} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50"><Archive className="w-4 h-4" /> Archive</button>}
            </div>
          </div>;
        })}</div>
      </div>}

      {data && data.total > 20 && <div className="flex items-center justify-center gap-3 mt-6"><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-2 rounded-md border border-[#E3E8EF] text-sm text-gray-600 disabled:opacity-40">Previous</button><span className="text-sm text-[#64748B]">Page {page}</span><button onClick={() => setPage(page + 1)} disabled={data.profiles.length < 20} className="px-3 py-2 rounded-md border border-[#E3E8EF] text-sm text-gray-600 disabled:opacity-40">Next</button></div>}
    </div>
  );
}
