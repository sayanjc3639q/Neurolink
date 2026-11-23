import { Link } from 'react-router-dom';
import { Topic } from '../lib/types';

interface BacklinksPanelProps {
  backlinks: Topic[];
  loading?: boolean;
}

export function BacklinksPanel({ backlinks, loading }: BacklinksPanelProps) {
  return (
    <div className="flex flex-col">
      <div className="text-pencil text-xs font-sans uppercase tracking-wider mb-2 select-none">
        Linked from
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-4 bg-paper rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-paper rounded animate-pulse w-1/2"></div>
        </div>
      ) : backlinks.length === 0 ? (
        <p className="text-xs text-pencil italic">No topics link here yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {backlinks.map((b) => (
            <li key={b.slug}>
              <Link
                to={`/t/${b.slug}`}
                className="text-xs text-pencil hover:text-ink block truncate transition-colors"
                title={b.title}
              >
                {b.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
