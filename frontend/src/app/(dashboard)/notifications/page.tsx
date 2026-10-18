"use client";

import { NotificationListPage } from "@/components/notifications/notification-list-page";
import { useProfileStore } from "@/stores/profile-store";
import { useTranslations } from "next-intl";

export default function LearnerNotificationsPage() {
  const t = useTranslations("notifications");
  const { activeProfile } = useProfileStore();
  return (
    <NotificationListPage
      learnerProfileId={activeProfile?.id}
      emptyScopeMessage={
        activeProfile ? undefined : t("selectProfile")
      }
    />
  );
}
