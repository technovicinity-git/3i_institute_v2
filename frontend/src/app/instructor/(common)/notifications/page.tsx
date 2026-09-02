"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  Users,
  FileText,
  Video,
  Award,
  Calendar,
  CheckCheck,
} from "lucide-react";
import {
  useInstructorNotifications,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
} from "@/hooks/use-instructor-notifications";

function getCategoryIcon(category: string) {
  switch (category) {
    case "enrolment":
      return <Users className="w-5 h-5 text-[#2563EB]" />;
    case "exam":
      return <FileText className="w-5 h-5 text-[#7C3AED]" />;
    case "batch":
      return <Video className="w-5 h-5 text-[#22A146]" />;
    case "certificate":
      return <Award className="w-5 h-5 text-[#B8912F]" />;
    case "payment":
      return <Calendar className="w-5 h-5 text-[#EA580C]" />;
    default:
      return <Bell className="w-5 h-5 text-[#64748B]" />;
  }
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour(s) ago`;
  if (diffDays < 7) return `${diffDays} day(s) ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function InstructorNotificationsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useInstructorNotifications(currentPage);
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllReadMutation();

  const handleMarkRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <div className="p-6 md:p-10 max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Notifications
          </h1>
          <p className="text-base text-[#64748B]">
            {data?.unreadCount ?? 0} unread notifications
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          disabled={markAllReadMutation.isPending || !data?.unreadCount}
          className="flex items-center gap-2 px-4 py-2 border border-[#E3E8EF] rounded-lg text-sm font-semibold text-[#0C1F33] hover:bg-gray-50 disabled:opacity-50"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && data?.notifications?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No notifications.</p>
        </div>
      )}

      {/* Notification List */}
      {!isLoading && data && data.notifications?.length > 0 && (
        <div className="space-y-3">
          {data?.notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                notification.read
                  ? "border-[#E3E8EF]"
                  : "border-[#22A146] bg-green-50/30"
              }`}
              onClick={() =>
                !notification.read && handleMarkRead(notification.id)
              }
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                {getCategoryIcon(notification.category)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#0C1F33]">
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-[#22A146] shrink-0" />
                  )}
                </div>
                <p className="text-sm text-[#64748B] mt-1 leading-5">
                  {notification.body}
                </p>
                <p className="text-xs text-[#94A3B8] mt-2">
                  {formatTimeAgo(notification.createdAt)}
                </p>
              </div>

              {notification.read && (
                <CheckCircle className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
