"use client";

import { X, FileText, ExternalLink } from "lucide-react";

interface DocumentViewerModalProps {
  document: {
    id: string;
    title: string;
    signedUrl: string;
    mimeType: string;
  };
  onClose: () => void;
}

export function DocumentViewerModal({
  document,
  onClose,
}: DocumentViewerModalProps) {
  const isPDF = document.mimeType === "application/pdf";

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E8EF] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#B8912F]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0C1F33] truncate">
                {document.title}
              </p>
              <p className="text-xs text-[#64748B]">Read-only preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={document.signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#2563EB] hover:bg-[#2563EB]/10 rounded-lg"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in new tab
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-[#FBF9F4]">
          {isPDF ? (
            <iframe
              src={`${document.signedUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full"
              title={document.title}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-[#0C1F33] font-semibold mb-2">
                Preview not available
              </p>
              <p className="text-sm text-[#64748B] mb-6 max-w-md">
                This file type can&apos;t be previewed inline. Use the
                &ldquo;Open in new tab&rdquo; option above to view it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
