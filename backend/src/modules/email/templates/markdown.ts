import { Marked, type Tokens } from "marked";
import { env } from "#/config/env";
import {
  colors,
  escapeHtml,
  serifStack,
  type EmailBlock,
} from "#/modules/email/templates/components";

// Turns Markdown written in the admin editor (headings, bold, italic, lists,
// links, dividers) into email-safe HTML with inline styles. Raw HTML in the
// Markdown is escaped, never passed through, and links are limited to safe
// schemes, so the output can't carry scripts or break the layout.

const SAFE_LINK = /^(https?:|mailto:|tel:)/i;

const headingStyles: Record<number, string> = {
  1: "font-size:24px;line-height:32px;",
  2: "font-size:20px;line-height:28px;",
  3: "font-size:17px;line-height:24px;",
};

function safeHref(href: string): string | null {
  const value = href.trim();
  // Site-relative links (e.g. "/help") point at the web app.
  if (value.startsWith("/") && !value.startsWith("//")) {
    return `${env.FRONTEND_URL.replace(/\/$/, "")}${value}`;
  }
  return SAFE_LINK.test(value) ? value : null;
}

const paragraphHtml = (inner: string) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:${colors.text};">${inner}</p>\n`;

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html({ text, block }) {
      const escaped = escapeHtml(text.trim());
      return block ? paragraphHtml(escaped) : escaped;
    },
    heading({ tokens, depth }) {
      const size = headingStyles[depth] ?? headingStyles[3];
      return `<h${depth} style="margin:0 0 16px;font-family:${serifStack};${size}font-weight:500;color:${colors.navy};">${this.parser.parseInline(tokens)}</h${depth}>\n`;
    },
    paragraph({ tokens }) {
      return paragraphHtml(this.parser.parseInline(tokens));
    },
    strong({ tokens }) {
      return `<strong style="font-weight:600;">${this.parser.parseInline(tokens)}</strong>`;
    },
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      const url = safeHref(href);
      if (!url) return text;
      return `<a href="${escapeHtml(url)}" target="_blank" style="color:${colors.navy};text-decoration:underline;">${text}</a>`;
    },
    image({ text }) {
      // The editor has no images; show alt text rather than load remote files.
      return escapeHtml(text);
    },
    list(token: Tokens.List) {
      const tag = token.ordered ? "ol" : "ul";
      const start =
        token.ordered && token.start !== 1 && token.start !== ""
          ? ` start="${Number(token.start)}"`
          : "";
      const items = token.items.map((item) => this.listitem(item)).join("");
      return `<${tag}${start} style="margin:0 0 16px;padding-left:24px;font-size:15px;line-height:24px;color:${colors.text};">\n${items}</${tag}>\n`;
    },
    listitem(item: Tokens.ListItem) {
      // Strip paragraph margins inside list items so lists stay compact.
      const body = this.parser
        .parse(item.tokens)
        .replace(/margin:0 0 16px;/g, "margin:0;");
      return `<li style="margin:0 0 6px;">${body}</li>\n`;
    },
    hr() {
      return `<hr style="margin:24px 0;border:0;border-top:1px solid ${colors.border};">\n`;
    },
  },
});

// Plain-text version: the Markdown minus its formatting syntax.
function toPlainText(markdown: string): string {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1$2")
    .replace(
      /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g,
      (_match, label, href) => {
        const url = safeHref(href);
        return url && url !== label ? `${label} (${url})` : label;
      },
    )
    .replace(/^\s*(---|\*\*\*|___)\s*$/gm, "—")
    .replace(/\\([\\`*_{}[\]()#+\-.!>])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function markdownBlock(markdown: string): EmailBlock {
  return {
    html: marked.parse(markdown, { async: false }),
    text: toPlainText(markdown),
  };
}

// First words of the message for the inbox preview line.
export function markdownPreheader(markdown: string, max = 120): string {
  const text = toPlainText(markdown).replace(/\s+/g, " ");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
