import { Editor } from '@tiptap/react';

interface ToolbarProps {
  editor: Editor | null;
  onOpenWikiPicker?: () => void;
  onInsertMermaid?: () => void;
  onInsertImage?: () => void;
}

export function Toolbar({ editor, onOpenWikiPicker, onInsertMermaid, onInsertImage }: ToolbarProps) {
  if (!editor) return null;

  const activeStyle = 'bg-ink text-paper ring-1 ring-ink font-bold';
  const inactiveStyle = 'text-pencil hover:text-ink hover:bg-margin';

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
    <div className="border border-rule bg-paper p-1 flex flex-wrap items-center gap-1 text-xs select-none shadow-sm">
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 font-semibold transition-colors ${
          editor.isActive('bold') ? activeStyle : inactiveStyle
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
          editor.isActive('italic') ? activeStyle : inactiveStyle
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
          editor.isActive('highlight')
            ? 'ring-2 ring-ink bg-marker text-marker-text font-bold shadow-xs'
            : inactiveStyle
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
          editor.isActive('heading', { level: 2 }) ? activeStyle : inactiveStyle
        }`}
        title="Section Heading H2"
      >
        H2
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2 py-1 font-serif font-semibold transition-colors ${
          editor.isActive('heading', { level: 3 }) ? activeStyle : inactiveStyle
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
          editor.isActive('bulletList') ? activeStyle : inactiveStyle
        }`}
        title="Bullet list"
      >
        List
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 transition-colors ${
          editor.isActive('orderedList') ? activeStyle : inactiveStyle
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
          editor.isActive('blockquote') ? activeStyle : inactiveStyle
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
          editor.isActive('codeBlock') ? activeStyle : inactiveStyle
        }`}
        title="Code block"
      >
        Code
      </button>

      {/* Diagram (Mermaid) */}
      <button
        type="button"
        onClick={onInsertMermaid}
        className="px-2 py-1 font-sans text-pencil hover:text-ink hover:bg-margin transition-colors"
        title="Insert Mermaid diagram (flowchart, sequence, architecture)"
      >
        Diagram
      </button>

      {/* Image */}
      <button
        type="button"
        onClick={onInsertImage}
        className="px-2 py-1 font-sans text-pencil hover:text-ink hover:bg-margin transition-colors"
        title="Insert image by URL"
      >
        Image
      </button>

      {/* Table */}
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        className={`px-2 py-1 font-sans transition-colors ${
          editor.isActive('table') ? activeStyle : inactiveStyle
        }`}
        title="Insert 3x3 table"
      >
        Table
      </button>

      {editor.isActive('table') && (
        <div className="flex items-center gap-1 border-l border-rule pl-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-1.5 py-0.5 text-[11px] text-pencil hover:text-ink hover:bg-margin"
            title="Add column after"
          >
            +Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-1.5 py-0.5 text-[11px] text-pencil hover:text-ink hover:bg-margin"
            title="Add row after"
          >
            +Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-1.5 py-0.5 text-[11px] text-redline hover:bg-margin"
            title="Delete column"
          >
            -Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-1.5 py-0.5 text-[11px] text-redline hover:bg-margin"
            title="Delete row"
          >
            -Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-1.5 py-0.5 text-[11px] text-redline hover:bg-margin font-semibold"
            title="Delete table"
          >
            Del Tab
          </button>
        </div>
      )}

      <div className="w-[1px] h-4 bg-rule mx-1" />

      {/* Link */}
      <button
        type="button"
        onClick={setExternalLink}
        className={`px-2 py-1 transition-colors ${
          editor.isActive('link') ? activeStyle : inactiveStyle
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
