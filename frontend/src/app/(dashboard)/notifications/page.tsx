"use client";

import { NotificationListPage } from "@/components/notifications/notification-list-page";
import { useProfileStore } from "@/stores/profile-store";

export default function LearnerNotificationsPage() {
  const { activeProfile } = useProfileStore();
  return (
    <NotificationListPage
      learnerProfileId={activeProfile?.id}
      emptyScopeMessage={
        activeProfile ? undefined : "Select a learner profile to see notifications."
      }
    />
  );
}
