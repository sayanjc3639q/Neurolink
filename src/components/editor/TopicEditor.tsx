import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

import { Toolbar } from './Toolbar';
import { WikiLinkExtension } from './WikiLinkNode';
import { WikiLinkSuggestionExtension } from './WikiLinkSuggestion';
import { titleToSlug, isValidSlug } from '../../lib/slug';
import { extractLinksAndMetadata } from '../../lib/extractLinks';
import { getAllIndexedTopics } from '../../lib/searchIndex';
import { Topic } from '../../lib/types';

const lowlight = createLowlight(common);

interface TopicEditorProps {
  initialTopic?: Topic | null;
  initialTitle?: string;
  onSave: (topicData: {
    slug: string;
    title: string;
    summary: string;
    content: string;
    contentText: string;
    headings: any[];
    outgoingLinks: string[];
    tags: string[];
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onDiscard: () => void;
  isSaving: boolean;
}

export function TopicEditor({
  initialTopic,
  initialTitle = '',
  onSave,
  onDelete,
  onDiscard,
  isSaving,
}: TopicEditorProps) {
  const isEditing = Boolean(initialTopic);
  const [title, setTitle] = useState(initialTopic?.title || initialTitle);
  const [slug, setSlug] = useState(initialTopic?.slug || titleToSlug(initialTitle));
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [summary, setSummary] = useState(initialTopic?.summary || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialTopic?.tags || []);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'draft'>('saved');
  const [lastDraftTime, setLastDraftTime] = useState<string>('');
  const [showWikiModal, setShowWikiModal] = useState(false);
  const [wikiSearch, setWikiSearch] = useState('');

  const localStorageKey = `neurolink_draft_${slug || 'new'}`;

  // Handle auto slug on new topic creation
  useEffect(() => {
    if (!isEditing && !isSlugManual) {
      setSlug(titleToSlug(title));
    }
  }, [title, isEditing, isSlugManual]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false, // Replaced by CodeBlockLowlight
      }),
      Highlight.configure({ multicolor: false }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-biro underline underline-offset-2',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your notes here... (type [[ to insert a link to another topic)',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      WikiLinkExtension,
      WikiLinkSuggestionExtension,
    ],
    content: initialTopic?.content ? JSON.parse(initialTopic.content) : '',
    onUpdate: () => {
      setSaveStatus('unsaved');
    },
  });

  // Check for local draft on mount
  useEffect(() => {
    if (!editor) return;
    const draft = localStorage.getItem(localStorageKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (
          parsed.content &&
          window.confirm('A draft saved on this device was found. Restore it?')
        ) {
          editor.commands.setContent(parsed.content);
          if (parsed.summary) setSummary(parsed.summary);
          if (parsed.tags) setTags(parsed.tags);
          if (parsed.title) setTitle(parsed.title);
        }
      } catch {}
    }
  }, [editor, localStorageKey]);

  // Autosave draft every 5 seconds
  useEffect(() => {
    if (!editor) return;
    const interval = setInterval(() => {
      if (saveStatus === 'unsaved') {
        const currentContent = editor.getJSON();
        const draftData = {
          title,
          summary,
          tags,
          content: currentContent,
          updatedAt: Date.now(),
        };
        localStorage.setItem(localStorageKey, JSON.stringify(draftData));
        setSaveStatus('draft');
        setLastDraftTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [editor, saveStatus, title, summary, tags, localStorageKey]);

  // Warn on navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  // Tag addition
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (val && !tags.includes(val) && tags.length < 20) {
        setTags([...tags, val]);
        setTagInput('');
        setSaveStatus('unsaved');
      }
    }
  };

  const removeTag = (tToRemove: string) => {
    setTags(tags.filter((t) => t !== tToRemove));
    setSaveStatus('unsaved');
  };

  const handleManualSave = async () => {
    if (!title.trim()) {
      alert('Topic title is required.');
      return;
    }
    if (!slug.trim() || !isValidSlug(slug)) {
      alert('A valid URL slug is required.');
      return;
    }
    if (!editor) return;

    setSaveStatus('saving');
    const contentJson = JSON.stringify(editor.getJSON());
    const { outgoingLinks, headings, contentText } = extractLinksAndMetadata(editor.getJSON());

    try {
      await onSave({
        slug,
        title: title.trim(),
        summary: summary.trim(),
        content: contentJson,
        contentText,
        headings,
        outgoingLinks,
        tags,
      });

      // Clear draft on successful explicit save
      localStorage.removeItem(localStorageKey);
      setSaveStatus('saved');
    } catch (err: any) {
      alert(`Couldn't save: ${err.message || 'Unknown error'}`);
      setSaveStatus('unsaved');
    }
  };

  const insertWikiLinkFromModal = (targetSlug: string, targetTitle: string) => {
    if (!editor) return;
    editor.chain().focus().setWikiLink({ slug: targetSlug, label: targetTitle }).run();
    setShowWikiModal(false);
    setWikiSearch('');
  };

  const allTopics = getAllIndexedTopics();
  const filteredWikiTopics = allTopics.filter((t) =>
    t.title.toLowerCase().includes(wikiSearch.toLowerCase().trim())
  );

  return (
    <div className="relative border-l-2 border-ink pl-4 sm:pl-6 -ml-4 sm:-ml-6 py-2">
      {/* Editing indication label */}
      <div className="flex items-center justify-between pb-4 border-b border-rule mb-6 text-xs text-pencil">
        <span className="font-semibold text-ink uppercase tracking-wider">
          {isEditing ? 'Editing topic' : 'New topic'}
        </span>
        <div className="flex items-center space-x-3">
          {saveStatus === 'saving' && <span>Saving...</span>}
          {saveStatus === 'draft' && (
            <span>Draft saved at {lastDraftTime || 'recently'}</span>
          )}
          {saveStatus === 'unsaved' && <span className="text-pencil font-medium">Unsaved changes</span>}
          {saveStatus === 'saved' && <span className="text-ink">All changes saved</span>}
        </div>
      </div>

      {/* Title Field */}
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaveStatus('unsaved');
          }}
          placeholder="Topic title..."
          maxLength={150}
          className="w-full font-serif font-semibold text-2xl sm:text-3xl text-ink bg-transparent border-b border-rule pb-2 placeholder:text-pencil focus:outline-none"
        />
        <div className="flex items-center space-x-2 mt-2 text-xs text-pencil">
          <span>Slug: /t/</span>
          {isEditing ? (
            <span className="font-mono text-ink">{slug}</span>
          ) : (
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setIsSlugManual(true);
                setSaveStatus('unsaved');
              }}
              placeholder="topic-slug"
              className="font-mono bg-margin px-1.5 py-0.5 border border-rule text-ink text-xs focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* Summary Field */}
      <div className="mb-4">
        <label className="block text-xs font-sans text-pencil mb-1">
          Summary (max 280 characters)
        </label>
        <textarea
          value={summary}
          onChange={(e) => {
            setSummary(e.target.value);
            setSaveStatus('unsaved');
          }}
          maxLength={280}
          rows={2}
          placeholder="1–2 sentence overview..."
          className="w-full bg-paper border border-rule p-2.5 text-sm font-serif italic text-ink placeholder:text-pencil focus:outline-none"
        />
        <div className="text-right text-[11px] text-pencil">{summary.length} / 280</div>
      </div>

      {/* Tags Input */}
      <div className="mb-6">
        <label className="block text-xs font-sans text-pencil mb-1">Tags (press Enter or comma)</label>
        <div className="flex flex-wrap items-center gap-2 border border-rule p-2 bg-paper">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center text-xs text-pencil border-b border-rule py-0.5"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="ml-1.5 text-pencil hover:text-ink focus:outline-none"
              >
                &times;
              </button>
            </span>
          ))}
          {tags.length < 20 && (
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? 'e.g. algorithms, searching' : 'add tag...'}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-ink placeholder:text-pencil focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4">
        <Toolbar editor={editor} onOpenWikiPicker={() => setShowWikiModal(true)} />
      </div>

      {/* Editor Content Area */}
      <div className="min-h-[300px] border border-rule bg-paper p-4 prose-wiki">
        <EditorContent editor={editor} />
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-4 border-t border-rule flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleManualSave}
            disabled={isSaving}
            className="bg-ink text-paper text-sm font-sans font-medium px-4 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSaving ? 'Saving topic...' : 'Save topic'}
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="text-sm font-sans text-pencil hover:text-ink px-2 py-1 transition-colors"
          >
            Discard changes
          </button>
        </div>

        {isEditing && onDelete && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${title}"? Links to it will become red links.`)) {
                onDelete();
              }
            }}
            className="text-sm font-sans text-redline hover:underline px-2 py-1 transition-colors"
          >
            Delete topic
          </button>
        )}
      </div>

      {/* Topic Link Picker Modal */}
      {showWikiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20"
          onClick={() => setShowWikiModal(false)}
        >
          <div
            className="w-full max-w-sm bg-paper border border-rule shadow-lg p-4 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-serif font-semibold text-base mb-2 text-ink">
              Insert topic link
            </div>
            <input
              type="text"
              value={wikiSearch}
              onChange={(e) => setWikiSearch(e.target.value)}
              placeholder="Search or enter new topic title..."
              className="w-full border border-rule p-2 text-sm bg-paper text-ink mb-3 focus:outline-none"
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredWikiTopics.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => insertWikiLinkFromModal(t.slug, t.title)}
                  className="w-full text-left p-1.5 text-xs text-pencil hover:text-ink hover:bg-margin truncate block"
                >
                  {t.title}
                </button>
              ))}
              {wikiSearch.trim() && (
                <button
                  type="button"
                  onClick={() =>
                    insertWikiLinkFromModal(
                      titleToSlug(wikiSearch.trim()),
                      wikiSearch.trim()
                    )
                  }
                  className="w-full text-left p-1.5 text-xs text-redline hover:bg-margin italic block"
                >
                  Create &ldquo;{wikiSearch.trim()}&rdquo; (red link)
                </button>
              )}
            </div>
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={() => setShowWikiModal(false)}
                className="text-xs text-pencil hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
