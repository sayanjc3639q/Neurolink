import { useState, useEffect, useTransition } from 'react';
import { getOrInitSearchIndex } from '../lib/searchIndex';
import { SearchIndexDoc } from '../lib/types';
import MiniSearch, { SearchResult } from 'minisearch';

export function useSearch(queryText: string) {
  const [index, setIndex] = useState<MiniSearch<SearchIndexDoc> | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    getOrInitSearchIndex().then((ms) => {
      if (active) setIndex(ms);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!index || !queryText.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(() => {
        const searchResults = index.search(queryText.trim(), {
          prefix: true,
          fuzzy: 0.2,
          boost: { title: 3, tags: 2, summary: 1.5, contentText: 1 },
        });
        setResults(searchResults.slice(0, 8));
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [queryText, index]);

  return {
    results,
    isSearching: isPending,
    isReady: Boolean(index),
  };
}
