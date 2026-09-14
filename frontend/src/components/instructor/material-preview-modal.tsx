"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { X, FileText, ExternalLink } from "lucide-react";

interface MaterialPreviewModalProps {
  material: {
    id: string;
    title: string;
    type: string;
    signedUrl?: string;
    url?: string;
  };
  onClose: () => void;
}

export function MaterialPreviewModal({
  material,
  onClose,
}: MaterialPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (material.type !== "video" || !material.signedUrl) return;

    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(material.signedUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = material.signedUrl;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [material.signedUrl, material.type]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <p className="text-white font-semibold truncate pr-4">
            {material.title}
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {material.type === "video" && material.signedUrl ? (
          <video
            ref={videoRef}
            controls
            className="w-full aspect-video"
            autoPlay
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-12 h-12 text-white/40 mb-4" />
            <p className="text-white text-sm mb-4">
              Preview not available for {material.type}
            </p>
            {material.url && (
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold"
              >
                <ExternalLink className="w-4 h-4" />
                Open Link
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
