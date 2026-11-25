import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTopic } from '../hooks/useTopic';
import { useBacklinks } from '../hooks/useBacklinks';
import { useAuth } from '../hooks/useAuth';
import { TopicView } from '../components/TopicView';
import { TableOfContents } from '../components/TableOfContents';
import { BacklinksPanel } from '../components/BacklinksPanel';
import { TagChips } from '../components/TagChips';
import { useTrailManager } from '../components/Trail';

export default function TopicPage({ setRightMargin }: { setRightMargin: (node: React.ReactNode) => void }) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isOwner } = useAuth();
  const { data: topic, isLoading, error } = useTopic(slug);
  const { data: backlinks = [], isLoading: loadingBacklinks } = useBacklinks(slug);
  const { recordStep } = useTrailManager();

  // Record into Trail and Reading history
  useEffect(() => {
    if (topic && slug) {
      recordStep(slug, topic.title);

      try {
        const savedHistory = localStorage.getItem('neurolink_reading_history');
        const history = savedHistory ? JSON.parse(savedHistory) : [];
        const updatedHistory = [
          { slug, title: topic.title },
          ...history.filter((h: any) => h.slug !== slug),
        ].slice(0, 10);
        localStorage.setItem('neurolink_reading_history', JSON.stringify(updatedHistory));
      } catch {}
    }
  }, [topic, slug]);

  // Mount right margin elements (TOC + Backlinks + Owner Edit button)
  useEffect(() => {
    if (topic) {
      setRightMargin(
        <div className="space-y-8 font-sans">
          <TableOfContents headings={topic.headings || []} />
          <BacklinksPanel backlinks={backlinks} loading={loadingBacklinks} />
          {isOwner && (
            <div className="pt-4 border-t border-rule">
              <Link
                to={`/t/${slug}/edit`}
                className="text-xs text-pencil hover:text-ink transition-colors block py-1"
              >
                Edit this topic
              </Link>
            </div>
          )}
        </div>
      );
    } else {
      setRightMargin(null);
    }
    return () => setRightMargin(null);
  }, [topic, backlinks, loadingBacklinks, isOwner, slug, setRightMargin]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-margin rounded w-2/3"></div>
        <div className="h-5 bg-margin rounded w-full"></div>
        <div className="h-4 bg-margin rounded w-1/4"></div>
        <div className="space-y-3 pt-6">
          <div className="h-4 bg-margin rounded w-full"></div>
          <div className="h-4 bg-margin rounded w-5/6"></div>
          <div className="h-4 bg-margin rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="py-12 font-sans">
        <h1 className="font-serif font-semibold text-2xl text-ink mb-3">Topic not found</h1>
        <p className="text-pencil text-sm mb-6">
          There is currently no note at this location (<code>/t/{slug}</code>).
        </p>
        {isOwner ? (
          <Link
            to={`/new?title=${encodeURIComponent(slug || '')}`}
            className="bg-ink text-paper text-sm px-4 py-2 hover:opacity-90 inline-block"
          >
            Create this topic
          </Link>
        ) : (
          <Link to="/" className="text-biro hover:underline text-sm">
            Return to Home
          </Link>
        )}
      </div>
    );
  }

  const updatedDateStr = topic.updatedAt?.toDate
    ? topic.updatedAt.toDate().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="border-b border-rule pb-6">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-ink tracking-tight">
              {topic.title}
            </h1>
            {topic.topicType && topic.topicType !== 'note' && (
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 bg-margin border border-rule text-pencil rounded">
                {topic.topicType === 'comparison'
                  ? 'Comparison'
                  : topic.topicType === 'review'
                  ? 'Review'
                  : 'Technical Blog'}
              </span>
            )}
          </div>
          {isOwner && (
            <Link
              to={`/t/${slug}/edit`}
              className="text-xs text-pencil hover:text-ink font-sans underline"
            >
              Edit
            </Link>
          )}
        </div>

        {topic.summary && (
          <p className="font-serif italic text-lg text-pencil leading-relaxed mt-2 mb-3">
            {topic.summary}
          </p>
        )}

        <TagChips tags={topic.tags || []} />

        {updatedDateStr && (
          <div className="text-xs text-pencil font-sans mt-3">
            Updated {updatedDateStr}
          </div>
        )}
      </header>

      {/* Mobile disclosures (<1100px) */}
      <div className="lg:hidden space-y-4 font-sans text-xs border border-rule p-3 bg-margin">
        {topic.headings && topic.headings.length > 0 && (
          <details className="cursor-pointer">
            <summary className="font-semibold text-ink uppercase tracking-wider mb-2">
              On this page
            </summary>
            <div className="pl-2 pt-2 border-l border-rule space-y-1">
              {topic.headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className={`block text-pencil hover:text-ink ${h.level === 3 ? 'pl-3' : ''}`}
                >
                  {h.text}
                </a>
              ))}
            </div>
          </details>
        )}

        <details className="cursor-pointer">
          <summary className="font-semibold text-ink uppercase tracking-wider mb-2">
            Linked from ({backlinks.length})
          </summary>
          <div className="pl-2 pt-2 border-l border-rule space-y-1">
            {backlinks.length === 0 ? (
              <p className="text-pencil italic">No topics link here yet.</p>
            ) : (
              backlinks.map((b) => (
                <Link
                  key={b.slug}
                  to={`/t/${b.slug}`}
                  className="block text-pencil hover:text-ink truncate"
                >
                  {b.title}
                </Link>
              ))
            )}
          </div>
        </details>
      </div>

      {/* Main Rich Text Content */}
      <TopicView
        contentJson={topic.content}
        onLinkFollow={(linkSlug, linkTitle) => {
          recordStep(linkSlug, linkTitle);
        }}
      />
    </div>
  );
}
