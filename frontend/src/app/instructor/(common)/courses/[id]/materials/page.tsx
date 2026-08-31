"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Video,
  FileText,
  Music,
  Link as LinkIcon,
  Upload,
  Trash2,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useCourseMaterials,
  useCreateMaterialMutation,
  useUploadVideoMutation,
  useDeleteMaterialMutation,
} from "@/hooks/use-materials";

const addMaterialSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  type: z.enum(["video", "document", "audio", "link"]),
  url: z.string().url("Must be valid URL").optional().or(z.literal("")),
  order: z.number().int().min(0).default(0),
});

type AddMaterialFormData = z.infer<typeof addMaterialSchema>;

function getTypeIcon(type: string) {
  switch (type) {
    case "video":
      return <Video className="w-5 h-5 text-[#2563EB]" />;
    case "document":
      return <FileText className="w-5 h-5 text-[#7C3AED]" />;
    case "audio":
      return <Music className="w-5 h-5 text-[#22A146]" />;
    case "link":
      return <LinkIcon className="w-5 h-5 text-[#B8912F]" />;
    default:
      return <FileText className="w-5 h-5 text-[#64748B]" />;
  }
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function CourseMaterialsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { data: materials, isLoading, isError } = useCourseMaterials(courseId);
  const createMaterialMutation = useCreateMaterialMutation();
  const uploadVideoMutation = useUploadVideoMutation();
  const deleteMaterialMutation = useDeleteMaterialMutation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadVideo, setShowUploadVideo] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMaterialFormData>({
    resolver: zodResolver(addMaterialSchema),
    defaultValues: {
      type: "link",
      order: 0,
    },
  });

  const handleAddMaterial = (data: AddMaterialFormData) => {
    createMaterialMutation.mutate(
      {
        courseId,
        title: data.title,
        type: data.type,
        url: data.url || undefined,
        order: Number(data.order),
      },
      {
        onSuccess: () => {
          reset();
          setShowAddForm(false);
        },
      },
    );
  };

  const handleUploadVideo = () => {
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }

    if (!videoTitle) {
      toast.error("Please enter a video title");
      return;
    }

    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("title", videoTitle);
    formData.append("order", "0");
    formData.append("video", videoFile);
    if (captionFile) {
      formData.append("captions", captionFile);
    }

    uploadVideoMutation.mutate(formData, {
      onSuccess: () => {
        setVideoFile(null);
        setCaptionFile(null);
        setVideoTitle("");
        setShowUploadVideo(false);
      },
    });
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      deleteMaterialMutation.mutate(materialId);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/instructor/courses")}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          ← Back to courses
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Course Materials
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-5 py-2.5 border border-[#12304E] text-[#12304E] rounded-lg text-sm font-semibold hover:bg-gray-50"
            >
              Add Material
            </button>
            <button
              onClick={() => setShowUploadVideo(!showUploadVideo)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
            >
              <Upload className="w-4 h-4" />
              Upload Video
            </button>
          </div>
        </div>
      </div>

      {/* Add Material Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit(handleAddMaterial)}
          className="bg-white rounded-xl border border-[#E3E8EF] p-6 mb-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-[#0C1F33]">Add Material</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Title *
              </label>
              <input
                {...register("title")}
                className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
              />
              {errors.title && (
                <p className="text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Type *</label>
              <select
                {...register("type")}
                className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
              >
                <option value="link">External Link</option>
                <option value="document">Document</option>
                <option value="audio">Audio</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              URL (for link type)
            </label>
            <input
              {...register("url")}
              placeholder="https://example.com/resource"
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
            {errors.url && (
              <p className="text-xs text-red-600">{errors.url.message}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 border border-[#E3E8EF] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMaterialMutation.isPending}
              className="px-6 py-3 bg-[#22A146] text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {createMaterialMutation.isPending ? "Adding..." : "Add Material"}
            </button>
          </div>
        </form>
      )}

      {/* Upload Video Form */}
      {showUploadVideo && (
        <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0C1F33]">Upload Video</h2>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Video Title *
            </label>
            <input
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="e.g. Introduction to Prophetic Medicine"
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Video File * (MP4, max 4GB)
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
            {videoFile && (
              <p className="mt-1 text-xs text-[#22A146]">
                Selected: {videoFile.name} (
                {(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Caption File (Optional — VTT/SRT)
            </label>
            <input
              ref={captionInputRef}
              type="file"
              accept=".vtt,.srt"
              onChange={(e) => setCaptionFile(e.target.files?.[0] ?? null)}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
            {captionFile && (
              <p className="mt-1 text-xs text-[#22A146]">
                Selected: {captionFile.name}
              </p>
            )}
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-semibold mb-2">Order</label>
            <input
              type="number"
              {...register("order", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowUploadVideo(false)}
              className="px-6 py-3 border border-[#E3E8EF] rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadVideo}
              disabled={
                uploadVideoMutation.isPending || !videoFile || !videoTitle
              }
              className="flex items-center gap-2 px-6 py-3 bg-[#22A146] text-white rounded-lg font-semibold disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploadVideoMutation.isPending ? "Uploading..." : "Upload Video"}
            </button>
          </div>
        </div>
      )}

      {/* Materials List */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {isError && (
        <div className="text-center py-20">
          <p className="text-red-600">Failed to load materials</p>
        </div>
      )}

      {!isLoading && !isError && materials?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            No materials yet. Upload your first video or add a link.
          </p>
        </div>
      )}

      {!isLoading && !isError && materials && materials.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E3E8EF] divide-y divide-[#E3E8EF]">
          {materials.map((material, index) => (
            <div key={material.id} className="flex items-center gap-4 p-5">
              {/* Order number */}
              <span className="text-sm font-bold text-[#B8912F] w-8 shrink-0">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                {getTypeIcon(material.type)}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0C1F33] truncate">
                  {material.title}
                </p>
                <p className="text-xs text-[#64748B] uppercase">
                  {material.type}
                </p>
              </div>

              {/* Duration */}
              <span className="text-sm text-[#64748B] shrink-0">
                {formatDuration(material.duration)}
              </span>

              {/* Delete */}
              <button
                onClick={() => handleDeleteMaterial(material.id)}
                disabled={deleteMaterialMutation.isPending}
                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
