// Building blocks for email bodies. Each block renders to both HTML (inline
// styles; email clients ignore <style> and most CSS) and plain text, so the
// two versions of every email always say the same thing.
//
// All text arguments are plain text and are HTML-escaped here; templates
// never write raw HTML, so user input (names, reasons) is always safe.

export interface EmailBlock {
  html: string;
  text: string;
}

export const colors = {
  navy: "#0C1F33",
  gold: "#B8912F",
  green: "#22A146",
  text: "#0C1F33",
  muted: "#64748B",
  border: "#E3E8EF",
  cream: "#FBF9F4",
  page: "#F4F1EA",
  white: "#FFFFFF",
} as const;

export const fontStack =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const serifStack = "Georgia, 'Times New Roman', serif";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Inline text: plain strings, or `bold("…")` for emphasis.
export type Inline = string | { bold: string };

export const bold = (value: string): Inline => ({ bold: value });

function inlineHtml(parts: Inline[]): string {
  return parts
    .map((part) =>
      typeof part === "string"
        ? escapeHtml(part).replace(/\n/g, "<br>")
        : `<strong style="font-weight:600;">${escapeHtml(part.bold)}</strong>`,
    )
    .join("");
}

function inlineText(parts: Inline[]): string {
  return parts
    .map((part) => (typeof part === "string" ? part : part.bold))
    .join("");
}

export function heading(value: string): EmailBlock {
  return {
    html: `<h1 style="margin:0 0 16px;font-family:${serifStack};font-size:24px;line-height:32px;font-weight:500;color:${colors.navy};">${escapeHtml(value)}</h1>`,
    text: value,
  };
}

export function paragraph(...parts: Inline[]): EmailBlock {
  return {
    html: `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:${colors.text};">${inlineHtml(parts)}</p>`,
    text: inlineText(parts),
  };
}

export function button(label: string, url: string): EmailBlock {
  const href = escapeHtml(url);
  return {
    html: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
  <tr>
    <td style="border-radius:8px;background:${colors.navy};">
      <a href="${href}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;line-height:20px;color:${colors.white};text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`,
    text: `${label}: ${url}`,
  };
}

// The raw link under a button, for clients that block buttons. Omitted from
// the text version, where the button already prints the URL.
export function linkFallback(url: string): EmailBlock {
  const href = escapeHtml(url);
  return {
    html: `<p style="margin:0 0 16px;font-size:13px;line-height:20px;color:${colors.muted};">If the button doesn't work, copy and paste this link into your browser:<br><a href="${href}" target="_blank" style="color:${colors.navy};word-break:break-all;">${href}</a></p>`,
    text: "",
  };
}

// Highlighted box, e.g. for a rejection reason.
export function callout(label: string, value: string): EmailBlock {
  return {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
  <tr>
    <td style="padding:14px 16px;background:${colors.cream};border-left:3px solid ${colors.gold};border-radius:4px;">
      <p style="margin:0 0 4px;font-size:12px;line-height:16px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${colors.muted};">${escapeHtml(label)}</p>
      <p style="margin:0;font-size:15px;line-height:22px;color:${colors.text};white-space:pre-line;">${escapeHtml(value)}</p>
    </td>
  </tr>
</table>`,
    text: `${label}:\n${value}`,
  };
}

// Small muted text, e.g. "This link expires in 30 minutes."
export function note(...parts: Inline[]): EmailBlock {
  return {
    html: `<p style="margin:0 0 16px;font-size:13px;line-height:20px;color:${colors.muted};">${inlineHtml(parts)}</p>`,
    text: inlineText(parts),
  };
}

export function signOff(): EmailBlock {
  return paragraph("Best regards,\nThe 3i Institute team");
}
