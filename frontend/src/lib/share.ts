export type ShareChannel =
  | "native"
  | "copy"
  | "whatsapp"
  | "facebook"
  | "x"
  | "linkedin"
  | "telegram"
  | "email";

// Public site origin. Set NEXT_PUBLIC_SITE_URL in production so shared links
// always use the canonical domain (not a preview or internal host).
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

// Adds campaign tags so shares can be measured in analytics.
export function withShareTracking(
  url: string,
  channel: ShareChannel,
  campaign: string,
): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", channel);
    parsed.searchParams.set("utm_medium", "share");
    parsed.searchParams.set("utm_campaign", campaign);
    return parsed.toString();
  } catch {
    return url;
  }
}

export interface ShareContent {
  url: string;
  title: string;
  text: string;
  campaign: string;
}

const encode = encodeURIComponent;

// Web share intents for each social network.
export function shareTargetUrl(
  channel: Exclude<ShareChannel, "native" | "copy">,
  content: ShareContent,
): string {
  const url = withShareTracking(content.url, channel, content.campaign);
  const message = `${content.text}\n${url}`;
  switch (channel) {
    case "whatsapp":
      return `https://wa.me/?text=${encode(message)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${encode(content.text)}&url=${encode(url)}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encode(url)}`;
    case "telegram":
      return `https://t.me/share/url?url=${encode(url)}&text=${encode(content.text)}`;
    case "email":
      return `mailto:?subject=${encode(content.title)}&body=${encode(message)}`;
  }
}

// Clipboard with a fallback for browsers/contexts without the async API
// (older Safari, non-HTTPS origins).
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy approach.
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}
