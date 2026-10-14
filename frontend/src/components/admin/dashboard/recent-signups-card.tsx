import Link from "next/link";
import type { AdminDashboardAccount } from "@/types/admin-dashboard";
import { SectionHeader, card, timeAgo } from "./utils";

export function RecentSignupsCard({
  accounts,
}: {
  accounts: AdminDashboardAccount[];
}) {
  return (
    <section className={`${card} p-5`}>
      <SectionHeader title="Recent sign-ups" href="/admin/users" />
      <div className="space-y-3">
        {accounts.map((account) =>
          // Instructors have a detail page; other accounts don't.
          account.role === "Instructor" ? (
            <Link
              key={account.id}
              href={`/admin/instructors/${account.id}`}
              className="flex items-center gap-3 rounded-lg p-1 -m-1 hover:bg-[#F8FAFC]"
            >
              <AccountRow account={account} />
            </Link>
          ) : (
            <div key={account.id} className="flex items-center gap-3">
              <AccountRow account={account} />
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function AccountRow({ account }: { account: AdminDashboardAccount }) {
  const initials = account.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center shrink-0 text-xs font-bold text-[#12304E]">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0C1F33] truncate">
          {account.name}
        </p>
        <p className="text-xs text-[#64748B] truncate">{account.email}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
          {account.role}
        </span>
        <p className="text-[11px] text-[#94A3B8] mt-1">
          {timeAgo(account.createdAt)}
        </p>
      </div>
    </>
  );
}
