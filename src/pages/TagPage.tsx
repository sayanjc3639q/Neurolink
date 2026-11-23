import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTopicsByTag } from '../lib/topicsApi';
import { Topic } from '../lib/types';
import { TagChips } from '../components/TagChips';

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tag) {
      setLoading(true);
      getTopicsByTag(tag)
        .then((data) => setTopics(data))
        .catch((err) => console.warn(err))
        .finally(() => setLoading(false));
    }
  }, [tag]);

  return (
    <div className="space-y-6 font-sans">
      <header className="border-b border-rule pb-4">
        <h1 className="font-serif font-semibold text-3xl text-ink tracking-tight mb-2">
          Tag: {tag}
        </h1>
        <p className="text-pencil text-sm">
          {topics.length} topic{topics.length === 1 ? '' : 's'} filed under this concept.
        </p>
      </header>

      {loading ? (
        <div className="space-y-4">
          <div className="h-6 bg-margin rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-margin rounded w-2/3 animate-pulse"></div>
        </div>
      ) : topics.length === 0 ? (
        <p className="text-pencil text-sm italic">No topics currently found with this tag.</p>
      ) : (
        <div className="space-y-6">
          {topics.map((t) => (
            <article key={t.slug} className="group">
              <Link
                to={`/t/${t.slug}`}
                className="font-serif font-semibold text-lg text-ink hover:text-biro block transition-colors"
              >
                {t.title}
              </Link>
              {t.summary && (
                <p className="font-serif italic text-sm text-pencil mt-1 line-clamp-2">
                  {t.summary}
                </p>
              )}
              {t.tags && t.tags.length > 0 && <TagChips tags={t.tags} />}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
