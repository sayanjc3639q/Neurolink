import { useState, useEffect } from 'react';
import { TopicHeading } from '../lib/types';

interface TableOfContentsProps {
  headings: TopicHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '0px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="flex flex-col mb-8">
      <div className="text-pencil text-xs font-sans uppercase tracking-wider mb-2 select-none">
        On this page
      </div>
      <nav className="space-y-1">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`block text-xs py-1 transition-colors ${
                h.level === 3 ? 'pl-3' : 'pl-0'
              } ${
                isActive
                  ? 'text-ink font-semibold border-l-2 border-biro pl-2 -ml-2.5'
                  : 'text-pencil hover:text-ink'
              }`}
            >
              {h.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
