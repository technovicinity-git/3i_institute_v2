import { env } from "#/config/env";
import {
  colors,
  escapeHtml,
  fontStack,
  serifStack,
  type EmailBlock,
} from "#/modules/email/templates/components";

export interface RenderedEmail {
  html: string;
  text: string;
}

interface LayoutInput {
  // Inbox preview line shown after the subject; not visible in the body.
  preheader: string;
  blocks: EmailBlock[];
  // Footer line; defaults to "This is an automated message from …".
  footerNote?: string;
}

const BRAND_NAME = "3i International Islamic Institute";

// Wraps body blocks in the shared branded shell: table-based layout with
// inline styles, which is what renders consistently across Gmail, Outlook
// and Apple Mail.
export function renderLayout({
  preheader,
  blocks,
  footerNote = `This is an automated message from ${BRAND_NAME}.`,
}: LayoutInput): RenderedEmail {
  const year = new Date().getFullYear();
  const siteUrl = env.FRONTEND_URL;
  const body = blocks.map((block) => block.html).join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(BRAND_NAME)}</title>
</head>
<body style="margin:0;padding:0;background:${colors.page};font-family:${fontStack};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${colors.page};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr>
          <td style="padding:20px 32px;background:${colors.navy};border-radius:12px 12px 0 0;">
            <a href="${escapeHtml(siteUrl)}" target="_blank" style="font-family:${serifStack};font-size:22px;line-height:28px;color:${colors.white};text-decoration:none;">
              <span style="color:${colors.gold};">3i</span> Institute
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;background:${colors.white};border:1px solid ${colors.border};border-top:0;border-radius:0 0 12px 12px;font-family:${fontStack};">
${body}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;text-align:center;font-family:${fontStack};">
            <p style="margin:0 0 6px;font-size:12px;line-height:18px;color:${colors.muted};">${escapeHtml(footerNote)}</p>
            <p style="margin:0;font-size:12px;line-height:18px;color:${colors.muted};">© ${year} 3i Institute · <a href="${escapeHtml(siteUrl)}" target="_blank" style="color:${colors.muted};">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    ...blocks.map((block) => block.text).filter(Boolean),
    "—",
    footerNote,
    siteUrl,
  ].join("\n\n");

  return { html, text };
}
