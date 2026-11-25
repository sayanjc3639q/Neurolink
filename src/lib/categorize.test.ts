import { describe, it, expect } from 'vitest';
import { getCategoryLetter } from './categorize';

describe('getCategoryLetter', () => {
  it('categorizes regular titles by their first letter', () => {
    expect(getCategoryLetter('Binary Search')).toBe('B');
    expect(getCategoryLetter('arrays')).toBe('A');
    expect(getCategoryLetter('3Sum')).toBe('3');
  });

  it('categorizes titles starting with non-alphanumerics under the immediately following letter', () => {
    expect(getCategoryLetter('__init__')).toBe('I');
    expect(getCategoryLetter('#hashtag')).toBe('H');
    expect(getCategoryLetter('@decorator')).toBe('D');
    expect(getCategoryLetter('[RFC] Proposal')).toBe('R');
    expect(getCategoryLetter('$dollar')).toBe('D');
  });

  it('respects the flag when editor opts out of skipping prefix', () => {
    expect(getCategoryLetter('__init__', false)).toBe('#');
    expect(getCategoryLetter('#hashtag', false)).toBe('#');
    expect(getCategoryLetter('@decorator', false)).toBe('#');
  });
});
