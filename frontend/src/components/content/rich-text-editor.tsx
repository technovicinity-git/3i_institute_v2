"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Check,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Redo2,
  Undo2,
  X,
} from "lucide-react";

/**
 * WYSIWYG editor that reads and writes Markdown. Only formatting that the
 * public site and the mobile app can render is offered: headings 1–3, bold,
 * italic, bullet/numbered lists, links and dividers.
 */
export function RichTextEditor({
  value,
  onChange,
  onReady,
  placeholder = "Start writing…",
}: {
  value: string;
  onChange: (markdown: string) => void;
  /** Called once with the editor's normalised Markdown for `value`. */
  onReady?: (markdown: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    // Next.js renders on the server first; let the editor mount on the client.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        blockquote: false,
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
        hardBreak: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto", "tel"],
        },
      }),
      Markdown,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: "rich-text-content min-h-[420px] p-6 focus:outline-none",
      },
    },
    onCreate: ({ editor }) => onReady?.(editor.getMarkdown()),
    onUpdate: ({ editor }) => onChange(editor.getMarkdown()),
  });

  return (
    <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#12304E]/15">
      {editor ? (
        <Toolbar editor={editor} />
      ) : (
        <div className="h-[49px] border-b border-[#E3E8EF] bg-[#F8FAFC]" />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

type BlockType = "paragraph" | "h1" | "h2" | "h3";

function Toolbar({ editor }: { editor: Editor }) {
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  // Re-render the toolbar when the selection or formatting changes.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: (e.isActive("heading", { level: 1 })
        ? "h1"
        : e.isActive("heading", { level: 2 })
          ? "h2"
          : e.isActive("heading", { level: 3 })
            ? "h3"
            : "paragraph") as BlockType,
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      link: e.isActive("link"),
      href: (e.getAttributes("link").href as string | undefined) ?? "",
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setBlock = (block: BlockType) => {
    const chain = editor.chain().focus();
    if (block === "paragraph") chain.setParagraph().run();
    else chain.setHeading({ level: Number(block[1]) as 1 | 2 | 3 }).run();
  };

  const applyLink = () => {
    const url = (linkUrl ?? "").trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!url) chain.unsetLink().run();
    else {
      const href = /^(https?:\/\/|mailto:|tel:|\/)/i.test(url)
        ? url
        : `https://${url}`;
      chain.setLink({ href }).run();
    }
    setLinkUrl(null);
  };

  return (
    <div className="border-b border-[#E3E8EF] bg-[#F8FAFC]">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5">
        <ToolButton
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!state.canUndo}
        >
          <Undo2 className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!state.canRedo}
        >
          <Redo2 className="w-4 h-4" />
        </ToolButton>
        <Divider />
        <select
          aria-label="Text style"
          value={state.block}
          onChange={(e) => setBlock(e.target.value as BlockType)}
          className="h-8 rounded-md border border-[#E3E8EF] bg-white px-2 text-sm text-[#0C1F33] focus:outline-none"
        >
          <option value="paragraph">Normal text</option>
          <option value="h1">Heading</option>
          <option value="h2">Subheading</option>
          <option value="h3">Small heading</option>
        </select>
        <Divider />
        <ToolButton
          label="Bold"
          active={state.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          label="Italic"
          active={state.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </ToolButton>
        <Divider />
        <ToolButton
          label="Bulleted list"
          active={state.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          label="Numbered list"
          active={state.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolButton>
        <Divider />
        <ToolButton
          label={state.link ? "Edit link" : "Add link"}
          active={state.link || linkUrl !== null}
          onClick={() => setLinkUrl(state.href)}
        >
          <Link2 className="w-4 h-4" />
        </ToolButton>
        {state.link && (
          <ToolButton
            label="Remove link"
            onClick={() =>
              editor.chain().focus().extendMarkRange("link").unsetLink().run()
            }
          >
            <Link2Off className="w-4 h-4" />
          </ToolButton>
        )}
        <ToolButton
          label="Divider line"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="w-4 h-4" />
        </ToolButton>
      </div>

      {linkUrl !== null && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyLink();
          }}
          className="flex items-center gap-2 border-t border-[#E3E8EF] px-3 py-2"
        >
          <Link2 className="w-4 h-4 text-[#64748B] shrink-0" />
          <input
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setLinkUrl(null);
            }}
            placeholder="Paste a link, e.g. https://example.com or /help"
            className="flex-1 h-8 rounded-md border border-[#E3E8EF] bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#12304E]/20"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 h-8 px-3 rounded-md bg-[#12304E] text-white text-sm font-semibold"
          >
            <Check className="w-4 h-4" />
            Apply
          </button>
          <button
            type="button"
            onClick={() => setLinkUrl(null)}
            aria-label="Cancel"
            className="h-8 w-8 flex items-center justify-center rounded-md text-[#64748B] hover:bg-white"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

function ToolButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the editor's selection when clicking toolbar buttons.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors disabled:opacity-30 ${
        active
          ? "bg-[#12304E] text-white"
          : "text-[#334155] hover:bg-white hover:text-[#0C1F33]"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-[#E3E8EF]" aria-hidden />;
}
