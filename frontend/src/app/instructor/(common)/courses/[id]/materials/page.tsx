/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUploadDocumentMutation } from "@/hooks/use-materials";
import { DocumentViewerModal } from "@/components/instructor/document-viewer-modal";
import {
  Video,
  FileText,
  Music,
  Link as LinkIcon,
  Upload,
  Trash2,
  Play,
  Search,
  X,
  AlertCircle,
  Edit3,
  FileUp,
  Eye,
  ChevronLeft,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useCourseMaterials,
  useUploadVideoMutation,
  useDeleteMaterialMutation,
  useSignedUrlMutation,
} from "@/hooks/use-materials";
import { MaterialPreviewModal } from "@/components/instructor/material-preview-modal";
import { CourseActions } from "@/components/instructor/CourseActions";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";
import { EditMaterialModal } from "@/components/instructor/edit-material-modal";

const addMaterialSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  type: z.enum(["video", "document", "audio", "link"]),
  url: z.string().url("Must be valid URL").optional().or(z.literal("")),
  order: z.number().int().min(0).optional(),
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
  const uploadVideoMutation = useUploadVideoMutation();
  const deleteMaterialMutation = useDeleteMaterialMutation();
  const signedUrlMutation = useSignedUrlMutation();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadOption, setUploadOption] = useState<
    "select" | "document" | "video"
  >("select");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoOrder, setVideoOrder] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [previewMaterial, setPreviewMaterial] = useState<any>(null);
  const [videoDescription, setVideoDescription] = useState("");
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentOrder, setDocumentOrder] = useState(0);
  const [documentPreview, setDocumentPreview] = useState<any>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Upload progress simulation
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { data: courses } = useInstructorCourses();
  const course = courses?.find((c) => c.id === courseId);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);

  const uploadDocumentMutation = useUploadDocumentMutation();

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadOption("select");
  };

  const {
    formState: { errors },
  } = useForm<AddMaterialFormData>({
    resolver: zodResolver(addMaterialSchema),
    defaultValues: {
      type: "link",
      order: 0,
    },
  });

  // Simulated progress bar — moves toward 95% while uploading
  useEffect(() => {
    if (uploadVideoMutation.isPending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUploadProgress(0);
      progressIntervalRef.current = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 5;
        });
      }, 500);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (uploadProgress > 0 && !uploadVideoMutation.isPending) {
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }

    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, [uploadVideoMutation.isPending, uploadProgress]);

  const handleUploadDocument = () => {
    if (!documentFile) {
      toast.error("Please select a document");
      return;
    }
    if (!documentTitle) {
      toast.error("Please enter a document title");
      return;
    }

    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("title", documentTitle);
    formData.append("description", documentDescription);
    formData.append("order", String(documentOrder));
    formData.append("document", documentFile);

    uploadDocumentMutation.mutate(formData, {
      onSuccess: () => {
        setDocumentFile(null);
        setDocumentTitle("");
        setDocumentDescription("");
        setDocumentOrder(0);
        closeUploadModal();
      },
    });
  };

  const handlePreview = async (material: any) => {
    if (material.type === "video" || material.type === "document") {
      signedUrlMutation.mutate(material.id, {
        onSuccess: (data: any) => {
          if (material.type === "video") {
            setPreviewMaterial({ ...material, signedUrl: data.url });
          } else {
            setDocumentPreview({
              ...material,
              signedUrl: data.url,
              mimeType: data.mimeType ?? "application/pdf",
            });
          }
        },
      });
    }
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
    formData.append("description", videoDescription);
    formData.append("order", String(videoOrder));
    formData.append("video", videoFile);
    if (captionFile) {
      formData.append("captions", captionFile);
    }

    uploadVideoMutation.mutate(formData, {
      onSuccess: () => {
        setVideoFile(null);
        setCaptionFile(null);
        setVideoTitle("");
        setVideoDescription("");
        setVideoOrder(0);
        closeUploadModal();
      },
    });
  };

  const handleDeleteMaterial = (materialId: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMaterialMutation.mutate(materialId);
    }
  };

  const filteredMaterials = materials?.filter((material) => {
    const matchesSearch = material.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || material.type === filterType;
    return matchesSearch && matchesType;
  });

  const videoCount = materials?.filter((m) => m.type === "video").length ?? 0;
  const docCount = materials?.filter((m) => m.type === "document").length ?? 0;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <button
          onClick={() => router.push("/instructor/courses")}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to courses
        </button>
        {course && (
          <CourseActions courseId={courseId} courseType={course.type} />
        )}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-3xl md:text-[36px] text-[#0C1F33]"
              style={{ fontFamily: "'Marcellus', serif" }}
            >
              Course Materials
            </h1>
            <p className="text-base text-[#64748B] mt-1">
              {materials?.length ?? 0} materials • {videoCount} videos •{" "}
              {docCount} documents
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowUploadModal(true);
                setUploadOption("select");
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {materials && materials.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0C1F33]">{videoCount}</p>
              <p className="text-xs text-[#64748B]">Videos</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0C1F33]">{docCount}</p>
              <p className="text-xs text-[#64748B]">Documents</p>
            </div>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      {materials && materials.length > 0 && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#E3E8EF] rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load materials</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && materials?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            No materials yet. Upload your first video or add a link.
          </p>
        </div>
      )}

      {/* Filtered empty */}
      {!isLoading &&
        !isError &&
        materials &&
        materials.length > 0 &&
        filteredMaterials?.length === 0 && (
          <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-[#64748B]">No materials match your search.</p>
          </div>
        )}

      {/* Materials List */}
      {!isLoading &&
        !isError &&
        filteredMaterials &&
        filteredMaterials.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] divide-y divide-[#E3E8EF]">
            {filteredMaterials.map((material, index) => (
              <div
                key={material.id}
                className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors"
              >
                {/* Order */}
                <span className="text-sm font-bold text-[#B8912F] w-8 shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                  {getTypeIcon(material.type)}
                </div>

                {/* Title + Type */}
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

                <button
                  onClick={() => setEditingMaterial(material)}
                  className="p-2 rounded-lg hover:bg-[#2563EB]/10 text-[#2563EB] transition-colors shrink-0"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Preview */}
                <button
                  onClick={() => handlePreview(material)}
                  disabled={
                    signedUrlMutation.isPending &&
                    previewMaterial?.id === material.id
                  }
                  className="p-2 rounded-lg hover:bg-[#22A146]/10 text-[#22A146] transition-colors shrink-0 disabled:opacity-50"
                  title="Preview"
                >
                  {material?.type === "video" ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() =>
                    handleDeleteMaterial(material.id, material.title)
                  }
                  disabled={deleteMaterialMutation.isPending}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={(e) => {
              if (
                e.target === e.currentTarget &&
                !uploadVideoMutation.isPending &&
                !uploadDocumentMutation.isPending
              ) {
                closeUploadModal();
              }
            }}
          />
          <div className="relative bg-white rounded-xl w-full max-w-[640px] z-10">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E8EF]">
              <h3 className="text-lg font-semibold text-[#0C1F33]">
                {uploadOption === "select"
                  ? "Upload Material"
                  : uploadOption === "document"
                    ? "Upload Document"
                    : "Upload Video"}
              </h3>
              <div className="flex items-center gap-3">
                {uploadOption !== "select" && (
                  <button
                    type="button"
                    onClick={() => setUploadOption("select")}
                    disabled={
                      uploadVideoMutation.isPending ||
                      uploadDocumentMutation.isPending
                    }
                    className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] disabled:opacity-50"
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={
                    uploadVideoMutation.isPending ||
                    uploadDocumentMutation.isPending
                  }
                  className="text-[#64748B] hover:text-[#0C1F33] disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
              {uploadOption === "select" ? (
                <div>
                  <p className="text-sm text-[#64748B] mb-4">
                    Choose what you would like to upload.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUploadOption("document")}
                      className="flex flex-col items-center justify-center gap-3 py-8 border-2 border-[#E3E8EF] rounded-xl hover:border-[#7C3AED] hover:bg-[#7C3AED]/5 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#7C3AED]/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#7C3AED]" />
                      </div>
                      <p className="text-sm font-semibold text-[#0C1F33]">
                        Document
                      </p>
                      <p className="text-xs text-[#64748B]">PDF — max 50MB</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUploadOption("video")}
                      className="flex flex-col items-center justify-center gap-3 py-8 border-2 border-[#E3E8EF] rounded-xl hover:border-[#22A146] hover:bg-[#22A146]/5 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#22A146]/10 flex items-center justify-center">
                        <Video className="w-6 h-6 text-[#22A146]" />
                      </div>
                      <p className="text-sm font-semibold text-[#0C1F33]">
                        Video
                      </p>
                      <p className="text-xs text-[#64748B]">MP4 — max 4GB</p>
                    </button>
                  </div>
                </div>
              ) : uploadOption === "document" ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Document Title *
                    </label>
                    <input
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      disabled={uploadDocumentMutation.isPending}
                      placeholder="e.g. Chapter 1 Notes"
                      className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#7C3AED] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Overview / Description (optional)
                    </label>
                    <textarea
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      disabled={uploadDocumentMutation.isPending}
                      rows={3}
                      placeholder="Brief description of this document..."
                      className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#7C3AED] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Document File * (PDF — max 50MB)
                    </label>
                    <input
                      ref={documentInputRef}
                      type="file"
                      accept=".pdf"
                      disabled={uploadDocumentMutation.isPending}
                      onChange={(e) =>
                        setDocumentFile(e.target.files?.[0] ?? null)
                      }
                      className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none disabled:opacity-50"
                    />
                    {documentFile && (
                      <p className="mt-1 text-xs text-[#7C3AED]">
                        {documentFile.name} (
                        {(documentFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      value={documentOrder}
                      onChange={(e) => setDocumentOrder(Number(e.target.value))}
                      disabled={uploadDocumentMutation.isPending}
                      className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#7C3AED] disabled:opacity-50"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeUploadModal}
                      disabled={uploadDocumentMutation.isPending}
                      className="px-6 py-3 border border-[#E3E8EF] rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUploadDocument}
                      disabled={
                        uploadDocumentMutation.isPending ||
                        !documentFile ||
                        !documentTitle
                      }
                      className="flex items-center gap-2 px-6 py-3 bg-[#7C3AED] text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                      <FileUp className="w-4 h-4" />
                      {uploadDocumentMutation.isPending
                        ? "Uploading..."
                        : "Upload Document"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Video Title *
                    </label>
                    <input
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      disabled={uploadVideoMutation.isPending}
                      placeholder="e.g. Introduction to Prophetic Medicine"
                      className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Overview / Description (optional)
                    </label>
                    <textarea
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      disabled={uploadVideoMutation.isPending}
                      rows={3}
                      placeholder="Brief overview of this lesson for the course page..."
                      className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
                    />
                    <p className="text-xs text-[#64748B] mt-1">
                      This will appear on the course details page.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Video File * (MP4, max 4GB)
                      </label>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        disabled={uploadVideoMutation.isPending}
                        onChange={(e) =>
                          setVideoFile(e.target.files?.[0] ?? null)
                        }
                        className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none disabled:opacity-50"
                      />
                      {videoFile && (
                        <p className="mt-1 text-xs text-[#22A146]">
                          {videoFile.name} (
                          {(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Caption File (VTT/SRT)
                      </label>
                      <input
                        ref={captionInputRef}
                        type="file"
                        accept=".vtt,.srt"
                        disabled={uploadVideoMutation.isPending}
                        onChange={(e) =>
                          setCaptionFile(e.target.files?.[0] ?? null)
                        }
                        className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none disabled:opacity-50"
                      />
                      {captionFile && (
                        <p className="mt-1 text-xs text-[#22A146]">
                          {captionFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      value={videoOrder}
                      onChange={(e) => setVideoOrder(Number(e.target.value))}
                      disabled={uploadVideoMutation.isPending}
                      className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#22A146] disabled:opacity-50"
                    />
                  </div>

                  {/* Progress Bar */}
                  {uploadVideoMutation.isPending && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#0C1F33]">
                          Uploading to Bunny Stream...
                        </span>
                        <span className="text-[#22A146] font-bold">
                          {Math.round(uploadProgress)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#22A146] rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Please don&apos;t close this window while the video
                        uploads.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeUploadModal}
                      disabled={uploadVideoMutation.isPending}
                      className="px-6 py-3 border border-[#E3E8EF] rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUploadVideo}
                      disabled={
                        uploadVideoMutation.isPending ||
                        !videoFile ||
                        !videoTitle
                      }
                      className="flex items-center gap-2 px-6 py-3 bg-[#22A146] text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadVideoMutation.isPending
                        ? "Uploading..."
                        : "Upload Video"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMaterial && (
        <MaterialPreviewModal
          material={previewMaterial}
          onClose={() => setPreviewMaterial(null)}
        />
      )}

      {editingMaterial && (
        <EditMaterialModal
          material={editingMaterial}
          onClose={() => setEditingMaterial(null)}
        />
      )}

      {documentPreview && (
        <DocumentViewerModal
          document={documentPreview}
          onClose={() => setDocumentPreview(null)}
        />
      )}
    </div>
  );
}
