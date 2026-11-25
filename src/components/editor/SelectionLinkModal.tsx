import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { getAllIndexedTopics } from '../../lib/searchIndex';
import { titleToSlug } from '../../lib/slug';

interface SelectionLinkModalProps {
  editor: Editor | null;
}

export function SelectionLinkModal({ editor }: SelectionLinkModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [mode, setMode] = useState<'menu' | 'neurolink' | 'external'>('menu');
  const [topicSearch, setTopicSearch] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        // No selection
        if (isOpen) {
          // Keep open if user is currently typing in the modal input
          return;
        }
        setIsOpen(false);
        return;
      }

      const text = editor.state.doc.textBetween(from, to, ' ').trim();
      if (!text) {
        setIsOpen(false);
        return;
      }

      // Calculate coordinates above the selected text
      const view = editor.view;
      const startCoord = view.coordsAtPos(from);
      const endCoord = view.coordsAtPos(to);

      const top = Math.max(10, startCoord.top + window.scrollY - 46);
      const left = Math.max(10, (startCoord.left + endCoord.left) / 2 + window.scrollX - 80);

      setSelectedText(text);
      setTopicSearch(text);
      setPosition({ top, left });
      setIsOpen(true);
      setMode('menu');
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setMode('menu');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen || !editor) return null;

  const allTopics = getAllIndexedTopics();
  const filteredTopics = allTopics.filter((t) =>
    t.title.toLowerCase().includes(topicSearch.toLowerCase().trim())
  );

  const handleLinkToTopic = (slug: string, label: string) => {
    editor
      .chain()
      .focus()
      .setWikiLink({
        slug,
        label: selectedText || label,
      })
      .run();
    setIsOpen(false);
  };

  const handleApplyExternalLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl.trim()) return;
    let url = externalUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
    setIsOpen(false);
  };

  return (
    <div
      ref={modalRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 50,
      }}
      className="bg-paper border border-rule shadow-lg p-2 font-sans text-xs min-w-[220px] max-w-[320px] animate-in fade-in duration-100"
    >
      {mode === 'menu' && (
        <div className="flex flex-col space-y-1.5">
          <div className="text-[11px] text-pencil uppercase tracking-wider font-semibold border-b border-rule pb-1 flex justify-between items-center">
            <span>Link &ldquo;{selectedText.slice(0, 18)}{selectedText.length > 18 ? '...' : ''}&rdquo;</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-pencil hover:text-ink font-bold text-xs"
            >
              &times;
            </button>
          </div>
          <div className="flex gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setMode('neurolink')}
              className="flex-1 bg-margin hover:bg-margin/80 text-biro border border-rule py-1 px-2 font-medium text-center transition-colors"
            >
              Neurolink Topic
            </button>
            <button
              type="button"
              onClick={() => setMode('external')}
              className="flex-1 bg-margin hover:bg-margin/80 text-ink border border-rule py-1 px-2 font-medium text-center transition-colors"
            >
              External URL
            </button>
          </div>
        </div>
      )}

      {mode === 'neurolink' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-rule pb-1 text-[11px] text-pencil">
            <span className="font-semibold text-biro">Link to Neurolink Topic</span>
            <button
              type="button"
              onClick={() => setMode('menu')}
              className="hover:text-ink text-[10px] underline"
            >
              Back
            </button>
          </div>
          <input
            type="text"
            value={topicSearch}
            onChange={(e) => setTopicSearch(e.target.value)}
            placeholder="Search topic title..."
            className="w-full p-1.5 text-xs bg-margin border border-rule text-ink focus:outline-none"
            autoFocus
          />
          <div className="max-h-36 overflow-y-auto space-y-1">
            {filteredTopics.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => handleLinkToTopic(t.slug, t.title)}
                className="w-full text-left p-1 text-[11px] text-pencil hover:text-ink hover:bg-margin truncate block"
              >
                {t.title}
              </button>
            ))}
            {topicSearch.trim() && (
              <button
                type="button"
                onClick={() =>
                  handleLinkToTopic(titleToSlug(topicSearch.trim()), topicSearch.trim())
                }
                className="w-full text-left p-1 text-[11px] text-redline hover:bg-margin italic block"
              >
                Create &ldquo;{topicSearch.trim()}&rdquo; (red link)
              </button>
            )}
          </div>
        </div>
      )}

      {mode === 'external' && (
        <form onSubmit={handleApplyExternalLink} className="space-y-2">
          <div className="flex items-center justify-between border-b border-rule pb-1 text-[11px] text-pencil">
            <span className="font-semibold text-ink">External Web Link</span>
            <button
              type="button"
              onClick={() => setMode('menu')}
              className="hover:text-ink text-[10px] underline"
            >
              Back
            </button>
          </div>
          <input
            type="text"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://..."
            className="w-full p-1.5 text-xs bg-margin border border-rule text-ink focus:outline-none"
            autoFocus
          />
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-pencil hover:text-ink px-2 py-0.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-ink text-paper text-[11px] font-medium px-2.5 py-0.5 hover:opacity-90"
            >
              Apply
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
