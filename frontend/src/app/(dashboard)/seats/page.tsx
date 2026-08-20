"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import {
  useAccountSeats,
  useAssignSeatMutation,
  useCancelSeatMutation,
} from "@/hooks/use-seats";
import { useLearnerProfiles } from "@/hooks/use-learner-profiles";
import { toast } from "sonner";

export default function SeatsPage() {
  const router = useRouter();
  const { data: seats, isLoading: seatsLoading } = useAccountSeats();
  const { data: profiles, isLoading: profilesLoading } = useLearnerProfiles();

  const assignSeatMutation = useAssignSeatMutation();
  const cancelSeatMutation = useCancelSeatMutation();

  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const isLoading = seatsLoading || profilesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Profiles without active seats
  const profilesWithoutSeat =
    profiles?.filter((p) => !p.isActive && !p.hasSeat) ?? [];
  const profilesWithSeat = profiles?.filter((p) => p.hasSeat) ?? [];

  const handleAssignSeat = (profileId: string, profileName: string) => {
    if ((seats?.availableSeats ?? 0) <= 0) {
      toast.error("No available seats. Please purchase more seats first.");
      return;
    }

    assignSeatMutation.mutate(profileId, {
      onSuccess: () => {
        toast.success(`Seat assigned to ${profileName}`);
      },
    });
  };

  const handleCancelSeat = (profileId: string, profileName: string) => {
    if (confirmCancel === profileId) {
      cancelSeatMutation.mutate(profileId, {
        onSuccess: () => {
          setConfirmCancel(null);
          toast.success(`Seat cancelled for ${profileName}`);
        },
      });
    } else {
      setConfirmCancel(profileId);
      toast.info(`Click again to confirm cancelling seat for ${profileName}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-primary">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-[60px] max-w-5xl items-center justify-between px-5">
          <Logo size="sm" href="/profiles" />
          <button
            onClick={() => router.push("/profiles")}
            className="text-sm font-semibold text-gray-600 hover:text-primary"
          >
            Back to profiles
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="mb-8">
          <Eyebrow className="mb-2">Subscription Seats</Eyebrow>
          <h1 className="font-serif text-3xl">Manage Seats</h1>
          <p className="text-muted text-sm mt-2">
            Assign seats to profiles so they can start studying.
          </p>
        </div>

        {/* Seat Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">
                {seats?.totalSeats ?? 0}
              </p>
              <p className="text-xs text-muted mt-1">Total Seats</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green">
                {seats?.assignedSeats.length ?? 0}
              </p>
              <p className="text-xs text-muted mt-1">Assigned</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold">
                {seats?.availableSeats ?? 0}
              </p>
              <p className="text-xs text-muted mt-1">Available</p>
            </div>
          </div>
        </div>

        {/* Profiles without seats */}
        {profilesWithoutSeat.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-lg mb-4">
              Profiles needing seats
            </h2>
            <div className="space-y-3">
              {profilesWithoutSeat.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-avatar-bg flex items-center justify-center">
                      <span className="font-serif text-lg text-avatar-text">
                        {profile.displayName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{profile.displayName}</p>
                      <p className="text-xs text-muted">No seat assigned</p>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      handleAssignSeat(profile.id, profile.displayName)
                    }
                    disabled={
                      assignSeatMutation.isPending ||
                      (seats?.availableSeats ?? 0) <= 0
                    }
                    className="bg-green hover:bg-green-dark text-white text-sm px-4 py-2 rounded-lg"
                  >
                    Assign seat
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profiles with seats */}
        {profilesWithSeat.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg mb-4">
              Profiles with active seats
            </h2>
            <div className="space-y-3">
              {profilesWithSeat.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-avatar-bg flex items-center justify-center">
                      <span className="font-serif text-lg text-avatar-text">
                        {profile.displayName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{profile.displayName}</p>
                      <p className="text-xs text-green font-medium">Active</p>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      handleCancelSeat(profile.id, profile.displayName)
                    }
                    variant="outline"
                    className={`text-sm px-4 py-2 rounded-lg ${
                      confirmCancel === profile.id
                        ? "bg-red-50 border-red-300 text-red-600"
                        : "border-gray-300 text-muted"
                    }`}
                  >
                    {confirmCancel === profile.id
                      ? "Confirm cancel?"
                      : "Cancel seat"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No subscription notice */}
        {(seats?.totalSeats ?? 0) === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center mt-8">
            <p className="font-semibold text-yellow-800">
              No active subscription
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              You need a subscription to assign seats.
            </p>
            <Button
              onClick={() => router.push("/pricing")}
              className="mt-4 bg-green hover:bg-green-dark text-white px-6 py-2 rounded-lg"
            >
              View plans
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
