"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditProfilePage() {
  const params = useParams();
  const profileId = params.id as string;

  const [name, setName] = useState("Amina");
  const [showResetPin, setShowResetPin] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API
    console.log("Save profile:", { id: profileId, name });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-white border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <Logo size="md" href="/profiles" />
        <button className="text-primary font-medium hover:opacity-80">
          Log out
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="bg-white rounded-2xl shadow-card border border-outline-variant p-8 md:p-12 w-full max-w-md">
          <Eyebrow className="mb-3">State B: Edit</Eyebrow>
          <h1 className="text-4xl font-serif text-primary mb-10">
            Edit {name}&apos;s profile
          </h1>

          {/* Avatar */}
          <div className="flex justify-center mb-10">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full border-2 border-green flex items-center justify-center bg-surface text-green text-3xl font-serif">
                AM
              </div>
              <button
                aria-label="Change profile picture"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-sm border border-white"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <Label
                htmlFor="child-name"
                className="block text-sm font-semibold mb-2"
              >
                Child&apos;s name
              </Label>
              <Input
                id="child-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3"
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold mb-2">
                Security PIN
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResetPin(!showResetPin)}
                className="w-full px-4 py-3 border-primary text-primary font-semibold hover:bg-surface"
              >
                Reset PIN
              </Button>
            </div>

            {showResetPin && (
              <div className="rounded-xl bg-surface p-4">
                <Label className="mb-2 block text-xs text-gray-500">
                  New 4-Digit PIN
                </Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  className="px-4 py-3"
                  placeholder="••••"
                />
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-green hover:bg-green-dark text-white py-3 font-semibold shadow-sm"
              >
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
