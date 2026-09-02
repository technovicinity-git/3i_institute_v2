"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useCourseThumbnailUploadMutation } from "@/hooks/use-avatar-upload";

interface ThumbnailUploadProps {
  courseId: string;
  currentThumbnailUrl?: string | null;
  onUploadComplete?: (url: string) => void;
}

export function ThumbnailUpload({
  courseId,
  currentThumbnailUrl,
  onUploadComplete,
}: ThumbnailUploadProps) {
  const uploadMutation = useCourseThumbnailUploadMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    currentThumbnailUrl ?? null,
  );

  const handleClick = () => {
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

    uploadMutation.mutate(
      { courseId, file },
      {
        onSuccess: (result) => {
          setThumbnailUrl(result.url);
          setPreviewUrl(null);
          onUploadComplete?.(result.url);
        },
        onError: () => {
          setPreviewUrl(null);
        },
      },
    );

    e.target.value = "";
  };

  const removeThumbnail = () => {
    setThumbnailUrl(null);
    setPreviewUrl(null);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
        Thumbnail
      </label>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="relative w-[160px] h-[90px] rounded-lg overflow-hidden bg-gray-100 border border-[#E3E8EF]">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
          ) : thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt="Thumbnail"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-300" />
            </div>
          )}

          {/* Upload spinner */}
          {uploadMutation.isPending && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleClick}
            disabled={uploadMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-[#12304E] text-[#12304E] rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            {thumbnailUrl ? "Change" : "Upload"}
          </button>

          {thumbnailUrl && (
            <button
              type="button"
              onClick={removeThumbnail}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-[#64748B] mt-1.5">
        JPEG, PNG, WebP or GIF. Max 5MB.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
