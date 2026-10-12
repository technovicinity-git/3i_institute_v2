import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Minimal, safe Markdown for admin-written pages. Supports `#`/`##`/`###`
 * headings, paragraphs, `-` and `1.` lists, `---` rules, **bold**, *italic*
 * and [links](url). Output is plain React elements, so no HTML is injected.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;

function safeHref(href: string): string | null {
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  return null;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const href = safeHref(link[2]!);
      if (!href) return link[1];
      return href.startsWith("/") ? (
        <Link key={key} href={href} className="text-[#22A146] underline">
          {link[1]}
        </Link>
      ) : (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#22A146] underline"
        >
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

type Block =
  | { type: "h1" | "h2" | "h3" | "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "hr" };

function parse(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) {
      blocks.push({ type: "p", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  for (const raw of source.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);

    if (!line) {
      flush();
    } else if (/^(-{3,}|\*{3,})$/.test(line)) {
      flush();
      blocks.push({ type: "hr" });
    } else if (heading) {
      flush();
      const level = heading[1]!.length as 1 | 2 | 3;
      blocks.push({ type: `h${level}`, text: heading[2]! });
    } else if (bullet || numbered) {
      flush();
      const type = bullet ? "ul" : "ol";
      const text = (bullet ?? numbered)![1]!;
      const last = blocks[blocks.length - 1];
      if (last && last.type === type) last.items.push(text);
      else blocks.push({ type, items: [text] });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

export function Markdown({ source }: { source: string }) {
  return (
    <div className="space-y-4 text-[15px] leading-7 text-[#334155]">
      {parse(source).map((block, i) => {
        const key = `b${i}`;
        switch (block.type) {
          case "h1":
            return (
              <h2 key={key} className="font-serif text-2xl text-[#0C1F33] pt-4">
                {renderInline(block.text, key)}
              </h2>
            );
          case "h2":
            return (
              <h3 key={key} className="font-serif text-xl text-[#0C1F33] pt-3">
                {renderInline(block.text, key)}
              </h3>
            );
          case "h3":
            return (
              <h4 key={key} className="font-semibold text-[#0C1F33] pt-2">
                {renderInline(block.text, key)}
              </h4>
            );
          case "ul":
          case "ol": {
            const List = block.type;
            return (
              <List
                key={key}
                className={`pl-6 space-y-1.5 ${block.type === "ul" ? "list-disc" : "list-decimal"}`}
              >
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </List>
            );
          }
          case "hr":
            return <hr key={key} className="border-[#E3E8EF]" />;
          default:
            return <p key={key}>{renderInline(block.text, key)}</p>;
        }
      })}
    </div>
  );
}
