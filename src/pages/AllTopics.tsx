import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopicsAlphabetical } from '../lib/topicsApi';
import { Topic } from '../lib/types';

export default function AllTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string>('');

  useEffect(() => {
    getTopicsAlphabetical(100)
      .then((res) => setTopics(res.topics))
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  // Collect all unique tags
  const allTags = Array.from(new Set(topics.flatMap((t) => t.tags || []))).sort();

  // Filter topics
  const filteredTopics = activeTag
    ? topics.filter((t) => (t.tags || []).includes(activeTag))
    : topics;

  // Group topics alphabetically
  const grouped: Record<string, Topic[]> = {};
  filteredTopics.forEach((t) => {
    const letter = (t.title[0] || '#').toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(t);
  });

  const sortedLetters = Object.keys(grouped).sort();

  return (
    <div className="space-y-8 font-sans">
      <header className="border-b border-rule pb-4">
        <h1 className="font-serif font-semibold text-3xl text-ink tracking-tight mb-2">
          All topics
        </h1>
        <p className="text-pencil text-sm">
          An index of all study notes arranged alphabetically.
        </p>

        {/* Tag filters as plain text row */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-pencil mt-4">
            <span className="font-semibold text-ink">Filter:</span>
            <button
              type="button"
              onClick={() => setActiveTag('')}
              className={`hover:text-ink transition-colors ${
                activeTag === '' ? 'text-ink font-semibold border-b border-ink' : ''
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
                className={`hover:text-ink transition-colors ${
                  activeTag === tag ? 'text-ink font-semibold border-b border-ink' : ''
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </header>

      {loading ? (
        <div className="space-y-4">
          <div className="h-6 bg-margin rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-margin rounded w-1/2 animate-pulse"></div>
        </div>
      ) : sortedLetters.length === 0 ? (
        <p className="text-pencil text-sm italic">No topics found matching your criteria.</p>
      ) : (
        <div className="space-y-8">
          {sortedLetters.map((letter) => (
            <div key={letter} className="space-y-2">
              <h2 className="font-serif font-semibold text-2xl text-ink border-b border-rule pb-1">
                {letter}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pt-2">
                {grouped[letter].map((topic) => (
                  <div key={topic.slug} className="flex flex-col py-1">
                    <Link
                      to={`/t/${topic.slug}`}
                      className="font-serif text-base text-ink hover:text-biro transition-colors"
                    >
                      {topic.title}
                    </Link>
                    {topic.summary && (
                      <span className="text-xs text-pencil truncate font-serif italic">
                        {topic.summary}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
