import { TopicHeading } from './types';
import { titleToSlug } from './slug';

interface ProseMirrorNode {
  type: string;
  text?: string;
  attrs?: Record<string, any>;
  content?: ProseMirrorNode[];
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

/**
 * Parses Tiptap ProseMirror document JSON structure to extract:
 * 1. Outgoing wiki-link slugs (deduplicated)
 * 2. Headings (level 2 and 3) with stable IDs
 * 3. Plain text for search indexing
 */
export function extractLinksAndMetadata(contentJson: string | object): {
  outgoingLinks: string[];
  headings: TopicHeading[];
  contentText: string;
} {
  let doc: ProseMirrorNode;
  try {
    doc = typeof contentJson === 'string' ? JSON.parse(contentJson) : contentJson;
  } catch {
    return { outgoingLinks: [], headings: [], contentText: '' };
  }

  const outgoingLinksSet = new Set<string>();
  const headings: TopicHeading[] = [];
  const textPieces: string[] = [];
  const headingIdCounts = new Map<string, number>();

  function traverse(node: ProseMirrorNode) {
    if (!node) return;

    // 1. Check for custom wikiLink node or marks
    if (node.type === 'wikiLink' && node.attrs?.slug) {
      outgoingLinksSet.add(node.attrs.slug);
    }
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === 'wikiLink' && mark.attrs?.slug) {
          outgoingLinksSet.add(mark.attrs.slug);
        }
      }
    }

    // 2. Check for Headings H2 and H3
    if (node.type === 'heading' && (node.attrs?.level === 2 || node.attrs?.level === 3)) {
      const headingText = extractText(node).trim();
      if (headingText) {
        let baseId = titleToSlug(headingText) || 'heading';
        let uniqueId = baseId;
        const count = headingIdCounts.get(baseId) || 0;
        if (count > 0) {
          uniqueId = `${baseId}-${count}`;
        }
        headingIdCounts.set(baseId, count + 1);

        headings.push({
          id: uniqueId,
          level: node.attrs.level as 2 | 3,
          text: headingText,
        });
      }
    }

    // 3. Accumulate text and detect raw [[topic]] slugs
    if (node.text) {
      textPieces.push(node.text);
      const rawMatches = node.text.matchAll(/\[\[(.*?)\]\]/g);
      for (const m of rawMatches) {
        const title = m[1]?.trim();
        if (title) {
          const s = titleToSlug(title);
          if (s) outgoingLinksSet.add(s);
        }
      }
    }

    // Recurse children
    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        traverse(child);
      }
    }
  }

  function extractText(node: ProseMirrorNode): string {
    if (node.text) return node.text;
    if (!node.content) return '';
    return node.content.map(extractText).join('');
  }

  traverse(doc);

  return {
    outgoingLinks: Array.from(outgoingLinksSet),
    headings,
    contentText: textPieces.join(' ').replace(/\s+/g, ' ').trim(),
  };
}
