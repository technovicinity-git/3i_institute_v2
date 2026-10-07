"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Award,
  Bell,
  BookOpen,
  CalendarClock,
  CreditCard,
  GraduationCap,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  X,
  Megaphone,
} from "lucide-react";
import type { AppNotification } from "@/services/notification.service";

const CATEGORY_STYLE: Record<
  string,
  { icon: typeof Bell; color: string; background: string }
> = {
  schedule: { icon: CalendarClock, color: "#2563EB", background: "#2563EB1A" },
  learning: { icon: BookOpen, color: "#7C3AED", background: "#7C3AED1A" },
  enrolment: { icon: UserCheck, color: "#22A146", background: "#22A1461A" },
  certificate: { icon: Award, color: "#B8912F", background: "#B8912F1A" },
  chat: { icon: MessageSquare, color: "#0EA5E9", background: "#0EA5E91A" },
  billing: { icon: CreditCard, color: "#EA580C", background: "#EA580C1A" },
  account: { icon: UserCheck, color: "#12304E", background: "#12304E1A" },
  course: { icon: GraduationCap, color: "#22A146", background: "#22A1461A" },
  admin: { icon: ShieldAlert, color: "#DC2626", background: "#DC26261A" },
  announcement: { icon: Megaphone, color: "#B8912F", background: "#B8912F1A" },
};

export function NotificationIcon({ category }: { category: string }) {
  const style = CATEGORY_STYLE[category] ?? {
    icon: Bell,
    color: "#64748B",
    background: "#64748B1A",
  };
  const Icon = style.icon;
  return (
    <span
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: style.background }}
    >
      <Icon className="w-4 h-4" style={{ color: style.color }} />
    </span>
  );
}

export function timeAgo(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}

interface NotificationItemProps {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
  onRemove?: (notification: AppNotification) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onOpen,
  onRemove,
  compact = false,
}: NotificationItemProps) {
  const unread = !notification.read;
  return (
    <div
      className={`group relative flex items-start gap-3 ${
        compact ? "px-4 py-3" : "p-4"
      } ${unread ? "bg-[#F2FBF4]" : "bg-white"} hover:bg-gray-50 transition-colors`}
    >
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className="flex flex-1 items-start gap-3 text-left min-w-0"
      >
        <NotificationIcon category={notification.category} />
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2">
            <span
              className={`text-sm text-[#0C1F33] truncate ${
                unread ? "font-semibold" : "font-medium"
              }`}
            >
              {notification.title}
            </span>
            {unread && (
              <span
                className="w-2 h-2 rounded-full bg-[#22A146] shrink-0"
                aria-label="Unread"
              />
            )}
          </span>
          <span
            className={`block text-xs text-[#64748B] mt-0.5 ${
              compact ? "line-clamp-2" : ""
            }`}
          >
            {notification.body}
          </span>
          <span className="block text-[10px] text-[#94A3B8] mt-1">
            {timeAgo(notification.createdAt)}
          </span>
        </span>
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(notification)}
          className="p-1 rounded text-[#94A3B8] hover:text-[#0C1F33] hover:bg-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label="Remove notification"
          title="Remove"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
