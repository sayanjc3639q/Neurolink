import { Timestamp } from 'firebase/firestore';

export interface TopicHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

export type TopicType = 'note' | 'comparison' | 'review' | 'blog';

export interface Topic {
  slug: string;              // == doc id
  title: string;
  titleLower: string;        // for prefix queries / sorting
  summary: string;           // 1–2 sentence description, max 280 chars
  content: string;           // Tiptap JSON, stored as a JSON string
  contentText: string;       // plain-text version (for search indexing)
  headings: TopicHeading[];
  outgoingLinks: string[];   // slugs this topic links to (max ~200)
  tags: string[];            // lowercase
  topicType?: TopicType;     // 'note' (default), 'comparison', 'review', or 'blog'
  ignorePrefixSorting?: boolean; // If false (default), skip leading non-alphanumeric chars for A-Z grouping
  authorUid?: string;        // UID of creator/author
  authorEmail?: string;      // Email of author
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WriterRecord {
  uid: string;
  email: string;
  addedAt: Timestamp | number;
  addedBy: string;
}

export interface SearchIndexDoc {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  contentText: string; // Truncated to 5,000 chars
  updatedAt: number;   // Epoch ms for cache checking
}

export interface MetaSearchIndexVersion {
  version: number;
  updatedAt: Timestamp;
}

export interface TrailStep {
  slug: string;
  title: string;
  timestamp: number;
}
