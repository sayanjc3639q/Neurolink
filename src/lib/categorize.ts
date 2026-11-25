/**
 * Determines the category letter/character for a topic title.
 * If ignoreLeadingNonAlpha is true (or not specified as false),
 * any leading non-alphanumeric symbols (e.g. "_", "#", "@", "[", "$")
 * are bypassed, and the topic is categorized under the letter that immediately follows.
 * e.g.:
 *   "_init_" -> "I"
 *   "#hash"  -> "H"
 *   "123"    -> "1"
 *   "Arrays" -> "A"
 */
export function getCategoryLetter(title: string, ignoreLeadingNonAlpha = true): string {
  if (!title) return '#';
  const trimmed = title.trim();
  if (!trimmed) return '#';

  if (!ignoreLeadingNonAlpha) {
    // Standard first character
    const char = trimmed[0].toUpperCase();
    return /[A-Z0-9]/.test(char) ? char : '#';
  }

  // Find the first alphanumeric character
  const match = trimmed.match(/[a-zA-Z0-9]/);
  if (match) {
    return match[0].toUpperCase();
  }

  return '#';
}
