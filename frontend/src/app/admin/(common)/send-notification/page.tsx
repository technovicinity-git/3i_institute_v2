"use client";

import { useState } from "react";
import { GraduationCap, Users, UsersRound } from "lucide-react";
import {
  BroadcastComposer,
  OptionCard,
} from "@/components/notifications/broadcast/broadcast-composer";
import { BroadcastHistory } from "@/components/notifications/broadcast/broadcast-history";
import {
  useAdminBroadcastPreview,
  useSendAdminBroadcast,
} from "@/hooks/use-broadcasts";
import type { AdminAudience } from "@/services/broadcast.service";

const AUDIENCES: {
  value: AdminAudience;
  label: string;
  description: string;
  icon: typeof Users;
}[] = [
  {
    value: "INSTRUCTORS",
    label: "Instructors",
    description: "Every active instructor.",
    icon: GraduationCap,
  },
  {
    value: "LEARNERS",
    label: "Learners",
    description: "Every learner profile.",
    icon: UsersRound,
  },
  {
    value: "ALL",
    label: "Everyone",
    description: "Instructors and learners.",
    icon: Users,
  },
];

const AUDIENCE_LABEL: Record<AdminAudience, string> = {
  INSTRUCTORS: "all instructors",
  LEARNERS: "all learners",
  ALL: "all instructors and learners",
};

export default function AdminSendNotificationPage() {
  const [audience, setAudience] = useState<AdminAudience>("LEARNERS");
  const preview = useAdminBroadcastPreview(audience);
  const send = useSendAdminBroadcast();

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Send Notification
        </h1>
        <p className="text-base text-[#64748B]">
          Send an announcement to instructors, learners or everyone.
        </p>
      </div>

      <BroadcastComposer
        audienceLabel={AUDIENCE_LABEL[audience]}
        preview={preview.data}
        previewLoading={preview.isLoading}
        onSend={(content) => send.mutateAsync({ ...content, audience })}
        audience={
          <div
            role="radiogroup"
            aria-label="Audience"
            className="grid gap-3 sm:grid-cols-3"
          >
            {AUDIENCES.map((option) => (
              <OptionCard
                key={option.value}
                icon={option.icon}
                label={option.label}
                description={option.description}
                selected={audience === option.value}
                onClick={() => setAudience(option.value)}
              />
            ))}
          </div>
        }
      />

      <BroadcastHistory scope="admin" showSender />
    </div>
  );
}
