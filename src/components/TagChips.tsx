import { Link } from 'react-router-dom';

interface TagChipsProps {
  tags: string[];
}

export function TagChips({ tags }: TagChipsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-sans my-3">
      {tags.map((tag) => (
        <Link
          key={tag}
          to={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
          className="text-pencil hover:text-ink border-b border-rule py-0.5 transition-colors"
        >
          {tag.toLowerCase()}
        </Link>
      ))}
    </div>
  );
}
