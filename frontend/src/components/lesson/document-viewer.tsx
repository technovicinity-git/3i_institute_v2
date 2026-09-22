"use client";

import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";

interface DocumentViewerProps {
  documentUrl: string;
  mimeType: string;
  title: string;
  onComplete?: () => void;
}

export function DocumentViewer({
  documentUrl,
  mimeType,
  title,
  onComplete,
}: DocumentViewerProps) {
  const completeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mark complete after 30 seconds of viewing (per FR-CERT-03)
  useEffect(() => {
    completeTimerRef.current = setTimeout(() => {
      if (onComplete) onComplete();
    }, 30 * 1000);

    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
      }
    };
  }, [onComplete]);

  const isPDF = mimeType === "application/pdf";

  if (!isPDF) {
    return (
      <div className="relative w-full aspect-video bg-[#FBF9F4] flex flex-col items-center justify-center rounded-lg border border-[#E3E8EF]">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-[#0C1F33] font-semibold mb-2">
          Preview not available
        </p>
        <p className="text-sm text-[#64748B] max-w-md text-center px-4">
          This document format cannot be previewed inline. Contact your
          instructor if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-[#E3E8EF] bg-white overflow-hidden">
      <iframe
        src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
        className="w-full h-[75vh]"
        title={title}
        sandbox="allow-same-origin allow-scripts"
      />
      <div className="px-4 py-3 bg-[#FBF9F4] border-t border-[#E3E8EF] text-xs text-[#64748B] text-center">
        Read-only preview • Marked complete after 30 seconds
      </div>
    </div>
  );
}
