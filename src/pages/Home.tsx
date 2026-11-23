import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRecentChanges } from '../lib/topicsApi';
import { getAllIndexedTopics } from '../lib/searchIndex';
import { Topic } from '../lib/types';
import { TagChips } from '../components/TagChips';

export default function Home({ onOpenSearch }: { onOpenSearch: () => void }) {
  const [recentTopics, setRecentTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Read last 5 visited topics from localStorage
  const [historyTopics, setHistoryTopics] = useState<Array<{ slug: string; title: string }>>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('neurolink_reading_history');
      if (saved) setHistoryTopics(JSON.parse(saved).slice(0, 5));
    } catch {}

    getRecentChanges(5)
      .then((data) => setRecentTopics(data))
      .catch((err) => console.warn('Could not load recent topics', err))
      .finally(() => setLoading(false));
  }, []);

  const handleRandom = () => {
    const all = getAllIndexedTopics();
    if (all.length > 0) {
      const random = all[Math.floor(Math.random() * all.length)];
      navigate(`/t/${random.slug}`);
    } else {
      navigate('/topics');
    }
  };

  return (
    <div className="space-y-12">
      {/* Search Bar Block */}
      <div>
        <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-ink tracking-tight mb-3">
          Neurolink
        </h1>
        <p className="text-pencil text-base mb-6 font-serif italic">
          A personal knowledge base of interconnected study notes.
        </p>

        <div
          onClick={onOpenSearch}
          className="w-full bg-paper border border-rule p-3 sm:p-4 text-pencil cursor-pointer flex items-center justify-between shadow-sm hover:border-ink transition-colors"
        >
          <span className="font-sans text-base">Search notes or topics...</span>
          <kbd className="font-mono text-xs border border-rule px-2 py-0.5 text-pencil">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Continue Reading (Last 5 Visited) */}
      {historyTopics.length > 0 && (
        <section>
          <div className="text-pencil text-xs font-sans uppercase tracking-wider mb-4 border-b border-rule pb-1">
            Continue reading
          </div>
          <div className="space-y-3">
            {historyTopics.map((item) => (
              <div key={item.slug} className="group">
                <Link
                  to={`/t/${item.slug}`}
                  className="font-serif font-semibold text-lg text-ink hover:text-biro transition-colors"
                >
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Edited */}
      <section>
        <div className="text-pencil text-xs font-sans uppercase tracking-wider mb-4 border-b border-rule pb-1">
          Recently edited
        </div>
        {loading ? (
          <div className="space-y-4">
            <div className="h-6 bg-margin rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-margin rounded w-2/3 animate-pulse"></div>
          </div>
        ) : recentTopics.length === 0 ? (
          <p className="text-pencil text-sm italic">
            No topics yet. Create your first topic to get started.
          </p>
        ) : (
          <div className="space-y-6">
            {recentTopics.map((topic) => (
              <article key={topic.slug} className="group">
                <Link
                  to={`/t/${topic.slug}`}
                  className="font-serif font-semibold text-lg text-ink hover:text-biro block transition-colors"
                >
                  {topic.title}
                </Link>
                {topic.summary && (
                  <p className="font-serif italic text-sm text-pencil mt-1 line-clamp-2">
                    {topic.summary}
                  </p>
                )}
                {topic.tags && topic.tags.length > 0 && <TagChips tags={topic.tags} />}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Navigation shortcuts */}
      <div className="pt-4 border-t border-rule flex items-center space-x-6 text-sm font-sans text-pencil">
        <Link to="/topics" className="hover:text-ink transition-colors">
          Browse all topics (A–Z)
        </Link>
        <button
          type="button"
          onClick={handleRandom}
          className="hover:text-ink transition-colors"
        >
          Random topic
        </button>
      </div>
    </div>
  );
}
