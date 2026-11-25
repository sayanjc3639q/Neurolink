import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import ImageExtension from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';

import { Toolbar } from './Toolbar';
import { WikiLinkExtension } from './WikiLinkNode';
import { WikiLinkSuggestionExtension } from './WikiLinkSuggestion';
import { SelectionLinkModal } from './SelectionLinkModal';
import { MermaidDiagram } from '../MermaidDiagram';
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
    topicType?: 'note' | 'comparison' | 'review' | 'blog';
    ignorePrefixSorting?: boolean;
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
  const [topicType, setTopicType] = useState<'note' | 'comparison' | 'review' | 'blog'>(
    initialTopic?.topicType || 'note'
  );
  const [ignorePrefixSorting, setIgnorePrefixSorting] = useState<boolean>(
    initialTopic?.ignorePrefixSorting ?? false
  );
  const [summary, setSummary] = useState(initialTopic?.summary || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialTopic?.tags || []);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'draft'>('saved');
  const [lastDraftTime, setLastDraftTime] = useState<string>('');
  const [showWikiModal, setShowWikiModal] = useState(false);
  const [showDiagramModal, setShowDiagramModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [diagramPreviewCode, setDiagramPreviewCode] = useState(`graph TD
    Client[Client / Browser] -->|HTTP / TLS| CDN[Edge CDN / Proxy]
    CDN -->|Route| AppServer[App Server]
    AppServer -->|Cache| Redis[(Redis Cache)]
    AppServer -->|Query| DB[(Primary Database)]
`);
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
        codeBlock: false,
      }),
      Highlight.configure({ multicolor: false }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-biro underline underline-offset-2',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your notes here... (type [[ to insert a link to another topic, or use Diagram in toolbar)',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ImageExtension.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto border border-rule rounded my-4 mx-auto block',
        },
      }),
      WikiLinkExtension,
      WikiLinkSuggestionExtension,
    ],
    content: initialTopic?.content ? JSON.parse(initialTopic.content) : '',
    editorProps: {
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (text && /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(text.trim())) {
          event.preventDefault();
          const schema = view.state.schema;
          const node = schema.nodes.image.create({ src: text.trim() });
          const transaction = view.state.tr.replaceSelectionWith(node);
          view.dispatch(transaction);
          return true;
        }
        return false;
      },
    },
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
        topicType,
        ignorePrefixSorting,
        ...(initialTopic?.authorUid ? { authorUid: initialTopic.authorUid } : {}),
        ...(initialTopic?.authorEmail ? { authorEmail: initialTopic.authorEmail } : {}),
      });

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

  const insertDiagram = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'codeBlock',
        attrs: { language: 'mermaid' },
        content: [{ type: 'text', text: diagramPreviewCode.trim() }],
      })
      .run();
    setShowDiagramModal(false);
    setSaveStatus('unsaved');
  };

  const insertImageFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim() || !editor) return;
    editor
      .chain()
      .focus()
      .setImage({
        src: imageUrl.trim(),
        alt: imageCaption.trim() || 'Illustration',
        title: imageCaption.trim() || undefined,
      })
      .run();
    setImageUrl('');
    setImageCaption('');
    setShowImageModal(false);
    setSaveStatus('unsaved');
  };

  const applyTemplate = (type: 'comparison' | 'review' | 'blog') => {
    if (!editor) return;
    if (editor.getText().trim() && !window.confirm('Apply template? This will append structure to your editor.')) {
      return;
    }

    setTopicType(type);

    if (type === 'comparison') {
      editor
        .chain()
        .focus()
        .insertContent(`
<h2>Overview & Objectives</h2>
<p>Briefly describe the two technologies being compared and the architectural goals.</p>
<h2>Feature Matrix</h2>
<table>
  <thead>
    <tr>
      <th>Dimension</th>
      <th>Technology A</th>
      <th>Technology B</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Architecture</td>
      <td>Monolithic / Single-threaded</td>
      <td>Distributed / Multi-threaded</td>
    </tr>
    <tr>
      <td>Performance & Latency</td>
      <td>Sub-millisecond memory-first</td>
      <td>High-throughput batched IO</td>
    </tr>
    <tr>
      <td>Operational Complexity</td>
      <td>Minimal setup, local config</td>
      <td>Cluster management required</td>
    </tr>
  </tbody>
</table>
<h2>Trade-offs & Decision Guide</h2>
<p>When to select Technology A vs Technology B.</p>
`)
        .run();
    } else if (type === 'review') {
      editor
        .chain()
        .focus()
        .insertContent(`
<h2>Technology Stack Overview</h2>
<p>A technical assessment of the combined stack and design patterns.</p>
<h2>Integration Strengths</h2>
<ul>
  <li>Smooth interoperability and shared protocol support</li>
  <li>Unified developer experience and tooling</li>
</ul>
<h2>Pain Points & Friction</h2>
<ul>
  <li>Complex serialization boundaries</li>
  <li>Versioning and deployment coordination</li>
</ul>
<h2>Verdict & Recommendation</h2>
<p>Summary of long-term maintainability and performance observations.</p>
`)
        .run();
    } else if (type === 'blog') {
      editor
        .chain()
        .focus()
        .insertContent(`
<h2>The Problem Space</h2>
<p>Describe the technical challenge or historical context that necessitated this solution.</p>
<h2>Architectural Deep Dive</h2>
<p>Walk through the internal mechanics, memory model, and execution flow.</p>
<h2>Practical Takeaways</h2>
<p>Summarize critical lessons learned, key benchmarks, and actionable insights.</p>
`)
        .run();
    }
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
        {/* Document Type Selector & Quick Templates */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-rule/50 text-xs text-pencil">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-ink">Topic Type:</span>
            <select
              value={topicType}
              onChange={(e) => setTopicType(e.target.value as any)}
              className="bg-margin border border-rule px-2 py-0.5 text-xs text-ink focus:outline-none"
            >
              <option value="note">Study Note (Standard)</option>
              <option value="comparison">Technology Comparison</option>
              <option value="review">Technology Review</option>
              <option value="blog">Technical Blog / Essay</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px]">
            <span className="text-pencil select-none">Templates:</span>
            <button
              type="button"
              onClick={() => applyTemplate('comparison')}
              className="hover:text-biro underline"
            >
              Comparison
            </button>
            <span className="text-rule">|</span>
            <button
              type="button"
              onClick={() => applyTemplate('review')}
              className="hover:text-biro underline"
            >
              Review
            </button>
            <span className="text-rule">|</span>
            <button
              type="button"
              onClick={() => applyTemplate('blog')}
              className="hover:text-biro underline"
            >
              Blog
            </button>
          </div>
        </div>

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
        
        {/* Categorization & Slug Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-pencil">
          <div className="flex items-center space-x-2">
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

          {/* Checkbox: Ignore leading non-alphanumeric symbols rule */}
          <label className="inline-flex items-center space-x-1.5 cursor-pointer text-pencil hover:text-ink select-none">
            <input
              type="checkbox"
              checked={!ignorePrefixSorting}
              onChange={(e) => {
                setIgnorePrefixSorting(!e.target.checked);
                setSaveStatus('unsaved');
              }}
              className="accent-ink rounded"
            />
            <span title="If checked, titles starting with symbols like _ or # are categorized under the letter immediately following">
              Categorize by immediate letter if title begins with symbol
            </span>
          </label>
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

      {/* Toolbar with Diagram Support */}
      <div className="mb-4">
        <Toolbar
          editor={editor}
          onOpenWikiPicker={() => setShowWikiModal(true)}
          onInsertMermaid={() => setShowDiagramModal(true)}
          onInsertImage={() => setShowImageModal(true)}
        />
      </div>

      {/* Editor Content Area */}
      <div className="min-h-[300px] border border-rule bg-paper p-4 prose-wiki relative">
        <EditorContent editor={editor} />
        <SelectionLinkModal editor={editor} />
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

      {/* Image Insert Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="w-full max-w-md bg-paper border border-rule shadow-lg p-5 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-rule pb-2 mb-3">
              <span className="font-serif font-semibold text-base text-ink">
                Insert Image by URL
              </span>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-xs text-pencil hover:text-ink"
              >
                &times; Close
              </button>
            </div>

            <form onSubmit={insertImageFromModal} className="space-y-3">
              <div>
                <label className="block text-xs text-pencil mb-1">Image Address URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/diagram.png"
                  required
                  autoFocus
                  className="w-full text-xs p-2 bg-margin border border-rule text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-pencil mb-1">Caption / Alt Text (Optional)</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Figure 1: Architecture diagram"
                  className="w-full text-xs p-2 bg-margin border border-rule text-ink focus:outline-none"
                />
              </div>

              {imageUrl.trim() && (
                <div>
                  <div className="text-[11px] text-pencil mb-1">Preview:</div>
                  <div className="border border-rule p-2 max-h-40 overflow-hidden flex items-center justify-center bg-paper">
                    <img
                      src={imageUrl.trim()}
                      alt="Preview"
                      className="max-h-36 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 text-right space-x-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="text-xs text-pencil hover:text-ink px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-ink text-paper text-xs font-medium px-4 py-1.5 hover:opacity-90"
                >
                  Insert image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mermaid Diagram Insert Modal */}
      {showDiagramModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20"
          onClick={() => setShowDiagramModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-paper border border-rule shadow-lg p-5 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-rule pb-2 mb-3">
              <span className="font-serif font-semibold text-base text-ink">
                Insert Mermaid diagram
              </span>
              <button
                type="button"
                onClick={() => setShowDiagramModal(false)}
                className="text-xs text-pencil hover:text-ink"
              >
                &times; Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-pencil">Diagram code:</label>
                  <div className="flex gap-2 text-[11px] text-biro">
                    <button
                      type="button"
                      onClick={() =>
                        setDiagramPreviewCode(`graph TD
    Client[Client / Browser] -->|HTTP / TLS| CDN[Edge CDN / Proxy]
    CDN -->|Route| AppServer[App Server]
    AppServer -->|Cache| Redis[(Redis Cache)]
    AppServer -->|Query| DB[(Primary Database)]
`)
                      }
                      className="hover:underline"
                    >
                      Architecture
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDiagramPreviewCode(`sequenceDiagram
    autonumber
    Client->>Server: POST /login (credentials)
    Server-->>Client: 200 OK (JWT Session)
    Client->>Server: GET /api/data (Bearer Token)
    Server-->>Client: 200 OK (Protected JSON)
`)
                      }
                      className="hover:underline"
                    >
                      Sequence
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDiagramPreviewCode(`flowchart LR
    A[Start] --> B{Is input valid?}
    B -- Yes --> C[Process Data]
    B -- No --> D[Return 400 Bad Request]
    C --> E[Done]
`)
                      }
                      className="hover:underline"
                    >
                      Flowchart
                    </button>
                  </div>
                </div>
                <textarea
                  value={diagramPreviewCode}
                  onChange={(e) => setDiagramPreviewCode(e.target.value)}
                  rows={9}
                  className="w-full font-mono text-xs p-2 bg-margin border border-rule text-ink focus:outline-none"
                  placeholder="Enter Mermaid diagram code..."
                />
              </div>

              <div>
                <div className="text-xs text-pencil mb-1">Live preview:</div>
                <div className="border border-rule bg-paper p-2 max-h-56 overflow-auto">
                  <MermaidDiagram code={diagramPreviewCode} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-rule flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDiagramModal(false)}
                className="text-xs text-pencil hover:text-ink px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertDiagram}
                className="bg-ink text-paper text-xs font-medium px-4 py-1.5 hover:opacity-90"
              >
                Insert diagram into note
              </button>
            </div>
          </div>
        </div>
      )}

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
