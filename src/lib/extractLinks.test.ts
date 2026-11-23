import { describe, it, expect } from 'vitest';
import { titleToSlug, isValidSlug } from './slug';
import { extractLinksAndMetadata } from './extractLinks';

describe('slug utility', () => {
  it('converts titles to lowercase hyphenated slugs', () => {
    expect(titleToSlug('Binary Search Tree')).toBe('binary-search-tree');
    expect(titleToSlug('  Big-O Notation & Complexity!  ')).toBe('big-o-notation-and-complexity');
    expect(titleToSlug('C++ Primer')).toBe('c-primer');
  });

  it('validates slugs correctly', () => {
    expect(isValidSlug('binary-search')).toBe(true);
    expect(isValidSlug('data-structures-101')).toBe(true);
    expect(isValidSlug('Invalid Slug')).toBe(false);
    expect(isValidSlug('-bad-')).toBe(false);
  });
});

describe('extractLinksAndMetadata', () => {
  it('extracts outgoing wikiLink nodes and marks', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Introduction' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Check out ' },
            {
              type: 'wikiLink',
              attrs: { slug: 'binary-search', label: 'Binary Search' },
            },
            { type: 'text', text: ' and ' },
            {
              type: 'text',
              text: 'Big-O',
              marks: [{ type: 'wikiLink', attrs: { slug: 'big-o', label: 'Big-O' } }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Complexity Analysis' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Introduction' }], // Duplicate title test
        },
      ],
    };

    const result = extractLinksAndMetadata(doc);

    expect(result.outgoingLinks).toContain('binary-search');
    expect(result.outgoingLinks).toContain('big-o');
    expect(result.outgoingLinks.length).toBe(2);

    expect(result.headings).toEqual([
      { id: 'introduction', level: 2, text: 'Introduction' },
      { id: 'complexity-analysis', level: 3, text: 'Complexity Analysis' },
      { id: 'introduction-1', level: 2, text: 'Introduction' },
    ]);

    expect(result.contentText).toContain('Check out and Big-O');
  });
});
