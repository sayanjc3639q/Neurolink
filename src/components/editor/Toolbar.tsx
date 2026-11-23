import React from 'react';
import { Editor } from '@tiptap/react';

interface ToolbarProps {
  editor: Editor | null;
  onOpenWikiPicker?: () => void;
}

export function Toolbar({ editor, onOpenWikiPicker }: ToolbarProps) {
  if (!editor) return null;

  const setExternalLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-rule bg-paper p-1 flex flex-wrap items-center gap-1 text-xs select-none sticky top-12 md:top-0 z-20 shadow-sm">
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 font-semibold transition-colors ${
          editor.isActive('bold') ? 'bg-margin text-ink' : 'text-pencil hover:text-ink'
        }`}
        title="Bold (Ctrl+B)"
      >
        B
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 italic transition-colors ${
          editor.isActive('italic') ? 'bg-margin text-ink' : 'text-pencil hover:text-ink'
        }`}
        title="Italic (Ctrl+I)"
      >
        I
      </button>

      {/* Highlight (H on marker swatch) */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`px-2 py-1 transition-colors ${
          editor.isActive('highlight') ? 'ring-1 ring-ink' : ''
        }`}
        title="Highlight (Ctrl+Shift+H)"
      >
        <span className="bg-marker text-marker-text px-1 font-semibold">H</span>
      </button>

      <div className="w-[1px] h-4 bg-rule mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 font-serif font-semibold transition-colors ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-margin text-ink'
            : 'text-pencil hover:text-ink'
        }`}
        title="Section Heading H2"
      >
        H2
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2 py-1 font-serif font-semibold transition-colors ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-margin text-ink'
            : 'text-pencil hover:text-ink'
        }`}
        title="Sub-heading H3"
      >
        H3
      </button>

      <div className="w-[1px] h-4 bg-rule mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 transition-colors ${
          editor.isActive('bulletList') ? 'bg-margin text-ink' : 'text-pencil hover:text-ink'
        }`}
        title="Bullet list"
      >
        List
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 transition-colors ${
          editor.isActive('orderedList') ? 'bg-margin text-ink' : 'text-pencil hover:text-ink'
        }`}
        title="Numbered list"
      >
        Numbered
      </button>

      {/* Blockquote */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-2 py-1 transition-colors ${
          editor.isActive('blockquote') ? 'bg-margin text-ink' : 'text-pencil hover:text-ink'
        }`}
        title="Blockquote"
      >
        Quote
      </button>

      {/* Code Block */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-2 py-1 font-mono transition-colors ${
          editor.isActive('codeBlock') ? 'bg-margin text-ink' : 'text-pencil hover:text-ink'
        }`}
        title="Code block"
      >
        Code
      </button>

      <div className="w-[1px] h-4 bg-rule mx-1" />

      {/* Link */}
      <button
        type="button"
        onClick={setExternalLink}
        className={`px-2 py-1 transition-colors ${
          editor.isActive('link') ? 'bg-margin text-ink' : 'text-pencil hover:text-ink'
        }`}
        title="External link (Ctrl+K)"
      >
        Link
      </button>

      {/* Topic Link */}
      <button
        type="button"
        onClick={onOpenWikiPicker}
        className="px-2 py-1 text-biro font-medium hover:bg-margin transition-colors"
        title="Insert topic link ([[)"
      >
        Topic link
      </button>

      <div className="w-[1px] h-4 bg-rule mx-1" />

      {/* Undo / Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="px-2 py-1 text-pencil hover:text-ink disabled:opacity-30"
        title="Undo"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="px-2 py-1 text-pencil hover:text-ink disabled:opacity-30"
        title="Redo"
      >
        Redo
      </button>
    </div>
  );
}
