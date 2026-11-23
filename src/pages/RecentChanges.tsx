import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecentChanges } from '../lib/topicsApi';
import { Topic } from '../lib/types';
import { TagChips } from '../components/TagChips';

export default function RecentChanges() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentChanges(30)
      .then((data) => setTopics(data))
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <header className="border-b border-rule pb-4">
        <h1 className="font-serif font-semibold text-3xl text-ink tracking-tight mb-2">
          Recent changes
        </h1>
        <p className="text-pencil text-sm">
          Latest additions and edits to study notes.
        </p>
      </header>

      {loading ? (
        <div className="space-y-4">
          <div className="h-6 bg-margin rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-margin rounded w-2/3 animate-pulse"></div>
        </div>
      ) : topics.length === 0 ? (
        <p className="text-pencil text-sm italic">No recent edits recorded.</p>
      ) : (
        <div className="space-y-6">
          {topics.map((t) => {
            const dateStr = t.updatedAt?.toDate
              ? t.updatedAt.toDate().toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '';

            return (
              <article key={t.slug} className="border-b border-rule/50 pb-4">
                <div className="flex items-baseline justify-between">
                  <Link
                    to={`/t/${t.slug}`}
                    className="font-serif font-semibold text-lg text-ink hover:text-biro transition-colors"
                  >
                    {t.title}
                  </Link>
                  <span className="text-xs text-pencil font-sans">{dateStr}</span>
                </div>
                {t.summary && (
                  <p className="font-serif italic text-sm text-pencil mt-1 line-clamp-2">
                    {t.summary}
                  </p>
                )}
                {t.tags && t.tags.length > 0 && <TagChips tags={t.tags} />}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
