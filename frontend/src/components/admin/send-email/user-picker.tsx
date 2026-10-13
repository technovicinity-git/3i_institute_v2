"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Search, X } from "lucide-react";
import { adminService, type AdminUser } from "@/services/admin.service";
import { MAX_PICKED_USERS } from "@/services/admin-email.service";

export interface PickedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/** Search users by name or email and pick who gets the email. */
export function UserPicker({
  value,
  onChange,
}: {
  value: PickedUser[];
  onChange: (users: PickedUser[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const results = useQuery({
    queryKey: ["admin-email-user-search", debounced],
    queryFn: () =>
      adminService.getUsers(1, 8, {
        search: debounced,
        status: "ACTIVE",
        emailVerified: "true",
      }),
    enabled: debounced.length >= 2,
  });

  const pickedIds = new Set(value.map((u) => u.id));
  const full = value.length >= MAX_PICKED_USERS;

  const add = (user: AdminUser) => {
    if (pickedIds.has(user.id) || full) return;
    onChange([
      ...value,
      {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: user.role,
      },
    ]);
  };

  return (
    <div className="rounded-xl border border-[#E3E8EF] bg-white p-4">
      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {value.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0D2B45]/[0.06] py-1 pr-1 pl-3 text-xs text-[#0C1F33]"
              title={user.email}
            >
              <span className="font-semibold">{user.name}</span>
              <span className="text-[#64748B]">{user.email}</span>
              <button
                type="button"
                aria-label={`Remove ${user.name}`}
                onClick={() => onChange(value.filter((u) => u.id !== user.id))}
                className="flex h-5 w-5 items-center justify-center rounded-full text-[#64748B] hover:bg-white hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-lg border border-[#E3E8EF] px-3 py-2 focus-within:border-[#0D2B45] focus-within:ring-2 focus-within:ring-[#0D2B45]/10">
        <Search className="h-4 w-4 shrink-0 text-[#94A3B8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={full}
          placeholder={
            full
              ? `Up to ${MAX_PICKED_USERS} people per email`
              : "Search by name or email…"
          }
          className="w-full bg-transparent text-sm outline-none"
        />
        {results.isFetching && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#94A3B8]" />
        )}
      </div>

      {debounced.length >= 2 && results.data && (
        <ul className="mt-2 max-h-64 divide-y divide-[#F1F5F9] overflow-y-auto rounded-lg border border-[#E3E8EF]">
          {results.data.users.length === 0 && (
            <li className="px-3 py-3 text-sm text-[#64748B]">
              No active, verified users match “{debounced}”.
            </li>
          )}
          {results.data.users.map((user) => {
            const picked = pickedIds.has(user.id);
            return (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => add(user)}
                  disabled={picked || full}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F8FAFC] disabled:cursor-default disabled:opacity-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#0C1F33]">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="block truncate text-xs text-[#64748B]">
                      {user.email}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] text-[#334155]">
                    {user.role}
                  </span>
                  {picked ? (
                    <span className="text-xs text-[#22A146]">Added</span>
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-[#0D2B45]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-2 text-xs text-[#94A3B8]">
        Only active accounts with a verified email can be picked.
      </p>
    </div>
  );
}
