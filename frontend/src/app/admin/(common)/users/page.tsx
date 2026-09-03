"use client";

import { useState } from "react";
import {
  Search,
  Users,
  MoreVertical,
  Ban,
  CheckCircle,
  Trash2,
} from "lucide-react";
import {
  useAdminUsers,
  useSuspendUserMutation,
  useActivateUserMutation,
  useDeleteUserMutation,
} from "@/hooks/use-admin";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRoleBadge(role: string) {
  const roleMap: Record<string, { label: string; className: string }> = {
    Admin: { label: "ADMIN", className: "bg-[#B8912F]/10 text-[#B8912F]" },
    Instructor: {
      label: "INSTRUCTOR",
      className: "bg-[#7C3AED]/10 text-[#7C3AED]",
    },
    "Account Holder": {
      label: "LEARNER",
      className: "bg-[#22A146]/10 text-[#22A146]",
    },
  };
  return (
    roleMap[role] ?? {
      label: role.toUpperCase(),
      className: "bg-gray-100 text-gray-600",
    }
  );
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionUser, setActionUser] = useState<string | null>(null);

  const { data, isLoading, isError } = useAdminUsers(
    page,
    debouncedSearch || undefined,
  );
  const suspendMutation = useSuspendUserMutation();
  const activateMutation = useActivateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  };

  const handleSuspend = (userId: string) => {
    if (window.confirm("Suspend this user?")) {
      suspendMutation.mutate(userId);
    }
    setActionUser(null);
  };

  const handleActivate = (userId: string) => {
    activateMutation.mutate(userId);
    setActionUser(null);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm("Delete this user? This cannot be undone.")) {
      deleteMutation.mutate(userId);
    }
    setActionUser(null);
  };

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Users
        </h1>
        <p className="text-base text-[#64748B]">
          {data?.total ?? 0} total users
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 mb-6 max-w-[400px]">
        <Search className="w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-transparent text-sm outline-none w-full"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && data?.users.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No users found.</p>
        </div>
      )}

      {/* Users table */}
      {!isLoading && !isError && data && data.users.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-[#FBF9F4] border-b border-[#E3E8EF] text-xs font-bold text-[#64748B] uppercase">
            <span>User</span>
            <span>Role</span>
            <span>Type</span>
            <span>Profiles</span>
            <span>Joined</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-[#E3E8EF]">
            {data.users.map((user) => {
              const role = getRoleBadge(user.role);
              return (
                <div
                  key={user.id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-gray-50"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[#B8912F]">
                        {(user.firstName?.[0] ?? "") +
                          (user.lastName?.[0] ?? "")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0C1F33] truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-[#64748B] truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <span
                    className={`inline-block w-fit text-[10px] font-bold px-2 py-0.5 rounded ${role.className}`}
                  >
                    {role.label}
                  </span>

                  {/* Type */}
                  <span className="text-sm text-[#64748B]">
                    {user.accountType}
                  </span>

                  {/* Profiles */}
                  <span className="text-sm text-[#64748B]">
                    {user.learnerProfilesCount}
                  </span>

                  {/* Joined */}
                  <span className="text-sm text-[#64748B]">
                    {formatDate(user.createdAt)}
                  </span>

                  {/* Actions */}
                  <div className="relative text-right">
                    <button
                      onClick={() =>
                        setActionUser(actionUser === user.id ? null : user.id)
                      }
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <MoreVertical className="w-4 h-4 text-[#64748B]" />
                    </button>

                    {actionUser === user.id && (
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E3E8EF] rounded-lg shadow-lg z-20">
                        {user.subscriptionStatus === "ACTIVE" ? (
                          <button
                            onClick={() => handleSuspend(user.id)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50"
                          >
                            <Ban className="w-4 h-4" />
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#22A146] hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-md border border-[#E3E8EF] text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            ←
          </button>
          <span className="text-sm text-[#64748B]">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={data.users.length < 20}
            className="w-9 h-9 rounded-md border border-[#E3E8EF] text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
