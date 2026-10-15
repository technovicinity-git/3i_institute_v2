"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from "pdfjs-dist";
import {
  AlertTriangle,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
// Render pages this far outside the viewport so scrolling feels instant.
const PRELOAD_MARGIN = "800px 0px";

interface ProtectedPdfViewerProps {
  /** API path that streams the PDF to the signed-in user. */
  documentPath: string;
  title: string;
  className?: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; reason: "noAccess" | "gone" | "loadFailed" }
  | { status: "ready"; pdf: PDFDocumentProxy; pageSizes: PageSize[] };

interface PageSize {
  width: number;
  height: number;
}

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }
  return pdfjs;
}

/**
 * Read-only PDF viewer for lesson documents.
 *
 * Pages are drawn onto canvases with PDF.js instead of the browser's PDF
 * viewer, so there is no Save / Print / Download UI and no file URL to copy:
 * the bytes come from an authenticated API request and are never given a
 * URL. Right-click, text selection, dragging, Ctrl/Cmd+S/P and printing are
 * blocked. (No website can prevent screenshots.)
 */
export function ProtectedPdfViewer({
  documentPath,
  title,
  className,
}: ProtectedPdfViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("lesson.pdf");
  const tCommon = useTranslations("common");
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch and open the document.
  useEffect(() => {
    const controller = new AbortController();
    let pdf: PDFDocumentProxy | null = null;

    (async () => {
      try {
        const [pdfjs, response] = await Promise.all([
          loadPdfJs(),
          apiClient.get<ArrayBuffer>(documentPath, {
            responseType: "arraybuffer",
            signal: controller.signal,
          }),
        ]);
        if (controller.signal.aborted) return;
        pdf = await pdfjs.getDocument({
          data: new Uint8Array(response.data),
          // No text layer or annotations are rendered, so links and form
          // fields can't be used to reach the underlying file.
          isEvalSupported: false,
        }).promise;
        const pageSizes = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, i) => {
            const page = await pdf!.getPage(i + 1);
            const viewport = page.getViewport({ scale: 1 });
            return { width: viewport.width, height: viewport.height };
          }),
        );
        if (controller.signal.aborted) {
          void pdf.destroy();
          return;
        }
        setState({ status: "ready", pdf, pageSizes });
      } catch (error) {
        if (controller.signal.aborted) return;
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        setState({
          status: "error",
          reason:
            status === 403 ? "noAccess" : status === 404 ? "gone" : "loadFailed",
        });
      }
    })();

    return () => {
      controller.abort();
      void pdf?.destroy();
    };
  }, [documentPath, reloadKey]);

  // Track the available width so pages fit the container.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setContainerWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Block saving, printing and copying shortcuts while the viewer is open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ["s", "p"].includes(key)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void rootRef.current?.requestFullscreen?.();
    }
  }, []);

  const changeZoom = (delta: number) =>
    setZoom((z) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((z + delta) * 100) / 100)),
    );

  const block = (event: React.SyntheticEvent) => event.preventDefault();

  // Leave a little room inside the scroll area for padding.
  const pageWidth = Math.max(0, containerWidth - 24) * zoom;
  const pageCount = state.status === "ready" ? state.pdf.numPages : 0;

  return (
    <div
      ref={rootRef}
      data-protected-document
      className={cn(
        "flex flex-col w-full rounded-lg border border-[#E3E8EF] bg-white overflow-hidden select-none",
        isFullscreen ? "h-screen rounded-none border-0" : "h-[75vh]",
        className,
      )}
      onContextMenu={block}
      onCopy={block}
      onCut={block}
      onDragStart={block}
      aria-label={title}
    >
      {/* Hide the document from printouts. */}
      <style>{`@media print { [data-protected-document] { display: none !important; } }`}</style>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[#E3E8EF] bg-[#FBF9F4]">
        <p className="min-w-0 truncate text-xs sm:text-sm font-semibold text-[#0C1F33]">
          {pageCount > 0
            ? t("pageOf", { page: currentPage, total: pageCount })
            : title}
        </p>
        <div className="flex items-center gap-1">
          <ToolbarButton
            label={t("zoomOut")}
            onClick={() => changeZoom(-ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM || state.status !== "ready"}
          >
            <ZoomOut className="w-4 h-4" />
          </ToolbarButton>
          <button
            type="button"
            onClick={() => setZoom(1)}
            disabled={state.status !== "ready"}
            className="hidden sm:block min-w-14 h-9 px-2 rounded-md text-xs font-semibold text-[#334155] tabular-nums hover:bg-white disabled:opacity-40"
            aria-label={t("fitWidth")}
            title={t("fitWidth")}
          >
            {Math.round(zoom * 100)}%
          </button>
          <ToolbarButton
            label={t("zoomIn")}
            onClick={() => changeZoom(ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM || state.status !== "ready"}
          >
            <ZoomIn className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            label={isFullscreen ? t("exitFullscreen") : t("fullscreen")}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </ToolbarButton>
        </div>
      </div>

      {/* Pages */}
      <div
        ref={scrollRef}
        className="relative flex-1 min-h-0 overflow-auto bg-[#E9EDF2]"
      >
        {state.status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-[#64748B]">
            <Loader2 className="w-8 h-8 animate-spin text-[#12304E]" />
            {t("loading")}
          </div>
        )}

        {state.status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <p className="text-sm text-[#334155] max-w-sm">{t(state.reason)}</p>
            <button
              type="button"
              onClick={() => {
                setState({ status: "loading" });
                setReloadKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#12304E] text-white text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              {tCommon("tryAgain")}
            </button>
          </div>
        )}

        {state.status === "ready" && pageWidth > 0 && (
          <div className="flex flex-col items-center gap-3 p-3 w-max min-w-full">
            {state.pageSizes.map((size, i) => (
              <PdfPage
                key={i}
                pdf={state.pdf}
                pageNumber={i + 1}
                size={size}
                width={pageWidth}
                scrollRoot={scrollRef}
                onVisible={setCurrentPage}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FBF9F4] border-t border-[#E3E8EF] text-[11px] sm:text-xs text-[#64748B] text-center">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        {t("protected")}
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#334155] hover:bg-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function PdfPage({
  pdf,
  pageNumber,
  size,
  width,
  scrollRoot,
  onVisible,
}: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  size: PageSize;
  width: number;
  scrollRoot: React.RefObject<HTMLDivElement | null>;
  onVisible: (page: number) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const height = Math.round((width * size.height) / size.width);

  // Render lazily when the page comes near the viewport; report the page
  // that fills most of the view for the "Page X of N" indicator.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNearViewport(true);
      },
      { root: scrollRoot.current, rootMargin: PRELOAD_MARGIN },
    );
    const current = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onVisible(pageNumber);
      },
      { root: scrollRoot.current, threshold: 0.5 },
    );
    preload.observe(el);
    current.observe(el);
    return () => {
      preload.disconnect();
      current.disconnect();
    };
  }, [scrollRoot, pageNumber, onVisible]);

  useEffect(() => {
    if (!nearViewport) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let task: RenderTask | null = null;
    let cancelled = false;

    (async () => {
      let page: PDFPageProxy;
      try {
        page = await pdf.getPage(pageNumber);
      } catch {
        return;
      }
      if (cancelled) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({
        scale: (width / size.width) * pixelRatio,
      });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) return;
      task = page.render({ canvas, canvasContext: context, viewport });
      try {
        await task.promise;
      } catch {
        // Cancelled by a newer render.
      }
    })();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [nearViewport, pdf, pageNumber, width, size.width]);

  return (
    <div
      ref={wrapperRef}
      className="relative bg-white shadow-sm"
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full pointer-events-none"
        aria-label={`Page ${pageNumber}`}
        role="img"
      />
    </div>
  );
}
