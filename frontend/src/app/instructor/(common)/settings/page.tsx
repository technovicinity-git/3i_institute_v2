"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useChangePasswordMutation } from "@/hooks/use-security";
import { useInstructorPhotoUploadMutation } from "@/hooks/use-instructor-photo";

export default function InstructorSettingsPage() {
  const { data: profile, isLoading } = useUserProfile();
  const changePasswordMutation = useChangePasswordMutation();
  const photoUploadMutation = useInstructorPhotoUploadMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatarUrl ?? null);
    }
  }, [profile]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size exceeds 5MB limit");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    photoUploadMutation.mutate(file, {
      onSuccess: (result) => {
        setAvatarUrl(result.url);
        setPreviewUrl(null);
      },
      onError: () => {
        setPreviewUrl(null);
      },
    });

    e.target.value = "";
  };

  const handleSaveProfile = () => {
    // TODO: Call update profile API
    toast.success("Profile updated");
  };

  const handleChangePassword = () => {
    if (newPassword.length < 10) {
      toast.error("Password must be at least 10 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setShowPassword(false);
        },
      },
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-[700px] mx-auto">
      <h1
        className="text-3xl md:text-[36px] text-[#0C1F33] mb-8"
        style={{ fontFamily: "'Marcellus', serif" }}
      >
        Settings
      </h1>

      <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 mb-6 space-y-5">
        <h2 className="text-lg font-semibold text-[#0C1F33]">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative inline-block">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Preview"
                width={64}
                height={64}
                className="rounded-full object-cover w-16 h-16"
              />
            ) : avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={profile?.firstName ?? "Instructor"}
                width={64}
                height={64}
                className="rounded-full object-cover w-16 h-16"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#12304E] text-white flex items-center justify-center text-xl font-semibold">
                {(profile?.firstName ?? "I").slice(0, 2).toUpperCase()}
              </div>
            )}

            <button
              type="button"
              onClick={handlePhotoClick}
              disabled={photoUploadMutation.isPending}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#12304E] text-white flex items-center justify-center shadow border border-white hover:bg-[#1a4268] disabled:opacity-50"
            >
              {photoUploadMutation.isPending ? (
                <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#0C1F33]">
              {profile?.firstName} {profile?.lastName}
            </p>
            <p className="text-xs text-[#64748B]">{profile?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22A146]/10 text-[#22A146]">
              INSTRUCTOR
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              First Name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Last Name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell students about yourself..."
            className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          className="px-6 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
        >
          Save Profile
        </button>
      </div>

      {/* Password Card */}
      <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-5">
        <h2 className="text-lg font-semibold text-[#0C1F33]">Password</h2>

        <button
          onClick={() => setShowPassword(!showPassword)}
          className="text-sm font-semibold text-[#22A146] hover:underline"
        >
          {showPassword ? "Cancel" : "Change Password"}
        </button>

        {showPassword && (
          <>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg"
              />
              <p className="text-xs text-[#64748B] mt-1">
                At least 10 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              className="px-6 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50"
            >
              {changePasswordMutation.isPending
                ? "Saving..."
                : "Update Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
