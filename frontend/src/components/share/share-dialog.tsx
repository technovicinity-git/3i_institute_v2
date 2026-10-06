"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  canUseNativeShare,
  copyToClipboard,
  shareTargetUrl,
  withShareTracking,
  type ShareChannel,
  type ShareContent,
} from "@/lib/share";

interface ShareDialogProps extends ShareContent {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional preview shown at the top of the dialog.
  imageUrl?: string | null;
  subtitle?: string;
}

type SocialChannel = Exclude<ShareChannel, "native" | "copy">;

const SOCIAL: Array<{
  channel: SocialChannel;
  label: string;
  color: string;
  icon: React.ReactNode;
}> = [
  {
    channel: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41" />
      </svg>
    ),
  },
  {
    channel: "facebook",
    label: "Facebook",
    color: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
      </svg>
    ),
  },
  {
    channel: "x",
    label: "X",
    color: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="currentColor" aria-hidden>
        <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.48 3.24H4.3z" />
      </svg>
    ),
  },
  {
    channel: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0" />
      </svg>
    ),
  },
  {
    channel: "telegram",
    label: "Telegram",
    color: "#26A5E4",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
        <path d="M11.94 0A12 12 0 1 0 24 12 12 12 0 0 0 11.94 0m4.96 7.22c-.16 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38" />
      </svg>
    ),
  },
  {
    channel: "email",
    label: "Email",
    color: "#64748B",
    icon: <Mail className="w-5 h-5" aria-hidden />,
  },
];

const noopSubscribe = () => () => {};

export function ShareDialog({
  open,
  onOpenChange,
  url,
  title,
  text,
  campaign,
  imageUrl,
  subtitle,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const content: ShareContent = { url, title, text, campaign };
  const copyUrl = withShareTracking(url, "copy", campaign);

  // False during server render so server and client markup match.
  const nativeShare = useSyncExternalStore(
    noopSubscribe,
    canUseNativeShare,
    () => false,
  );

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (await copyToClipboard(copyUrl)) {
      setCopied(true);
      toast.success("Link copied");
    } else {
      toast.error("Couldn't copy the link. Please copy it manually.");
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text,
        url: withShareTracking(url, "native", campaign),
      });
      onOpenChange(false);
    } catch (error) {
      // AbortError = the user closed the share sheet.
      if ((error as Error)?.name !== "AbortError") {
        toast.error("Sharing isn't available right now. Copy the link instead.");
      }
    }
  };

  const openTarget = (channel: SocialChannel) => {
    const target = shareTargetUrl(channel, content);
    if (channel === "email") {
      window.location.assign(target);
      return;
    }
    window.open(target, "_blank", "noopener,noreferrer,width=640,height=640");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[460px] gap-5 bg-white text-[#0C1F33] rounded-xl border border-[#E3E8EF] ring-0 shadow-card p-6"
        overlayClassName="bg-black/40"
      >
        <DialogHeader>
          <DialogTitle
            className="text-xl text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Share this course
          </DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">
            Invite friends and family to learn with you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border border-[#E3E8EF] bg-[#FBF9F4] p-3">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="w-16 h-12 rounded-md object-cover shrink-0"
            />
          ) : (
            <div className="w-16 h-12 rounded-md bg-[#12304E]/10 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0C1F33] line-clamp-2">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-[#64748B] truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {nativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#12304E] text-white rounded-lg text-sm font-semibold hover:bg-[#1a4268]"
          >
            <Share2 className="w-4 h-4" />
            Share via…
          </button>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {SOCIAL.map((item) => (
            <button
              key={item.channel}
              type="button"
              onClick={() => openTarget(item.channel)}
              className="flex flex-col items-center gap-1.5 rounded-lg p-2 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22A146]/40"
              aria-label={`Share on ${item.label}`}
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
              </span>
              <span className="text-[11px] text-[#475569]">{item.label}</span>
            </button>
          ))}
        </div>

        <div>
          <label
            htmlFor="share-link"
            className="block text-xs font-semibold text-[#64748B] mb-1.5"
          >
            Course link
          </label>
          <div className="flex items-center gap-2">
            <input
              id="share-link"
              readOnly
              value={url}
              onFocus={(event) => event.currentTarget.select()}
              className="flex-1 min-w-0 h-10 px-3 bg-white border border-[#E3E8EF] rounded-lg text-sm text-[#0C1F33]"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 h-10 px-4 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
