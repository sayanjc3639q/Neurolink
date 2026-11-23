import slugifyFn from 'slugify';

/**
 * Converts a topic title to a clean URL-safe slug.
 * E.g., "Binary Search Tree!" -> "binary-search-tree"
 */
export function titleToSlug(title: string): string {
  if (!title) return '';
  return slugifyFn(title, {
    lower: true,
    strict: true,
    trim: true,
  });
}

/**
 * Validates whether a slug is safe and non-empty.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
