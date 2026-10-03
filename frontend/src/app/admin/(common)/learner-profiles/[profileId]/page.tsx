"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Archive, ArchiveRestore, BookOpen, ClipboardList, UserRound } from "lucide-react";
import { useAdminLearnerProfile, useArchiveLearnerProfileMutation, useRestoreLearnerProfileMutation } from "@/hooks/use-admin";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminLearnerProfileDetailsPage() {
  const params = useParams();
  const profileId = params.profileId as string;
  const { data: profile, isLoading, isError } = useAdminLearnerProfile(profileId);
  const archiveMutation = useArchiveLearnerProfileMutation();
  const restoreMutation = useRestoreLearnerProfileMutation();

  if (isLoading) return <div className="p-10 text-center text-[#64748B]">Loading learner profile…</div>;
  if (isError || !profile) return <div className="p-10"><Link href="/admin/learner-profiles" className="text-sm text-blue-700">← Back to learner profiles</Link><p className="mt-6 text-[#64748B]">Could not load this learner profile.</p></div>;

  const archived = Boolean(profile.deletedAt);
  const attempts = profile.enrolments.flatMap((enrolment) => enrolment.course.exams.flatMap((exam) => exam.attempts));

  return <div className="p-6 md:p-10 max-w-6xl mx-auto">
    <Link href="/admin/learner-profiles" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0C1F33] mb-6"><ArrowLeft className="w-4 h-4" /> Back to learner profiles</Link>

    <section className="bg-white rounded-xl border border-[#E3E8EF] p-6 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-4"><div className="w-14 h-14 rounded-full bg-[#F9F6F0] flex items-center justify-center"><UserRound className="w-7 h-7 text-[#B8912F]" /></div><div><h1 className="text-2xl text-[#0C1F33]">{profile.displayName}</h1><p className="text-sm text-[#64748B]">Learner profile</p><span className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${archived ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-700"}`}>{archived ? "Archived" : "Current"}</span></div></div>
        {archived ? <button onClick={() => restoreMutation.mutate(profile.id)} disabled={restoreMutation.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#22A146] text-white text-sm font-semibold disabled:opacity-50"><ArchiveRestore className="w-4 h-4" />{restoreMutation.isPending ? "Restoring…" : "Restore profile"}</button> : <button onClick={() => { if (window.confirm(`Archive ${profile.displayName}'s profile?`)) archiveMutation.mutate(profile.id); }} disabled={archiveMutation.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-300 text-orange-700 text-sm font-semibold disabled:opacity-50"><Archive className="w-4 h-4" />{archiveMutation.isPending ? "Archiving…" : "Archive profile"}</button>}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 border-t border-gray-100 mt-6 pt-5">
        <div><p className="text-xs uppercase font-bold text-[#64748B] mb-1">Date of birth</p><p className="text-sm text-[#0C1F33]">{formatDate(profile.dateOfBirth)}</p></div>
        <div><p className="text-xs uppercase font-bold text-[#64748B] mb-1">Parent / account holder</p><p className="text-sm text-[#0C1F33]">{profile.account.firstName} {profile.account.lastName}</p><p className="text-xs text-[#64748B]">{profile.account.email}</p></div>
        <div><p className="text-xs uppercase font-bold text-[#64748B] mb-1">Account type</p><p className="text-sm text-[#0C1F33]">{profile.account.accountType.replaceAll("_", " ")}</p></div>
        <div><p className="text-xs uppercase font-bold text-[#64748B] mb-1">Seat status</p><p className="text-sm text-[#0C1F33]">{profile.isActive ? "Active seat assigned" : "No active seat"}</p></div>
        <div><p className="text-xs uppercase font-bold text-[#64748B] mb-1">Chat</p><p className="text-sm text-[#0C1F33]">{profile.chatEnabled ? "Enabled" : "Disabled"}</p></div>
        <div><p className="text-xs uppercase font-bold text-[#64748B] mb-1">Profile created</p><p className="text-sm text-[#0C1F33]">{formatDate(profile.createdAt)}</p></div>
        <div><p className="text-xs uppercase font-bold text-[#64748B] mb-1">Exam attempts</p><p className="text-sm text-[#0C1F33]">{profile._count.examAttempts}</p></div>
        <div><p className="text-xs uppercase font-bold text-[#64748B] mb-1">Certificates</p><p className="text-sm text-[#0C1F33]">{profile._count.certificates}</p></div>
        {profile.nameLocked && <div><p className="text-xs uppercase font-bold text-[#64748B] mb-1">Name</p><p className="text-sm text-[#0C1F33]">Name changes locked</p></div>}
      </div>
    </section>

    <section>
      <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold text-[#0C1F33]">Enrolled courses and exams</h2><span className="text-sm text-[#64748B]">{profile.enrolments.length} courses · {attempts.length} attempts</span></div>
      {profile.enrolments.length === 0 ? <div className="bg-white rounded-xl border border-dashed border-[#E3E8EF] p-10 text-center"><BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-sm text-[#64748B]">This learner is not enrolled in any courses.</p></div> : <div className="space-y-4">{profile.enrolments.map((enrolment) => <article key={enrolment.id} className="bg-white rounded-xl border border-[#E3E8EF] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-[#F4F6F8] flex items-center justify-center"><BookOpen className="w-5 h-5 text-[#64748B]" /></div><div><h3 className="font-semibold text-[#0C1F33]">{enrolment.course.title}</h3><p className="text-xs text-[#64748B]">Enrolled {formatDate(enrolment.enrolledAt)}</p></div></div><div className="flex items-center gap-2"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-[#64748B]">{enrolment.course.status}</span>{enrolment.waitlisted && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700">Waitlist{enrolment.waitlistPosition ? ` #${enrolment.waitlistPosition}` : ""}</span>}</div></div>
        <div className="mt-5 border-t border-gray-100 pt-4"><h4 className="text-xs uppercase font-bold text-[#64748B] mb-3">Exams</h4>{enrolment.course.exams.length === 0 ? <p className="text-sm text-[#94A3B8]">No exams for this course.</p> : <div className="space-y-3">{enrolment.course.exams.map((exam) => <div key={exam.id} className="rounded-lg border border-[#E3E8EF] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-[#64748B]" /><p className="text-sm font-semibold text-[#0C1F33]">{exam.title}</p><span className="text-xs text-[#64748B]">{exam.type}</span></div><span className="text-xs text-[#64748B]">Pass mark: {exam.passMark}/{exam.totalMarks}</span></div>{exam.attempts.length === 0 ? <p className="text-xs text-[#94A3B8] mt-3">No attempts yet.</p> : <div className="mt-3 space-y-2">{exam.attempts.map((attempt) => <div key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 text-xs"><span className="text-[#334155]">Attempt {attempt.attemptNumber} · Started {formatDate(attempt.startedAt)}{attempt.submittedAt ? ` · Submitted ${formatDate(attempt.submittedAt)}` : " · In progress"}</span><span className="text-[#64748B]">{attempt.score === null ? "Not graded" : `Score ${attempt.score}/${attempt.totalMarks}`} · {attempt.passed === null ? "Pending result" : attempt.passed ? "Passed" : "Not passed"}</span></div>)}</div>}</div>)}</div>}</div>
      </article>)}</div>}
    </section>
  </div>;
}
