import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { topicExistsLocally, getCachedTopicSummary } from '../lib/searchIndex';
import { useAuth } from '../hooks/useAuth';

interface WikiLinkProps {
  slug: string;
  label: string;
  onLinkFollow?: (slug: string, label: string) => void;
}

export function WikiLink({ slug, label, onLinkFollow }: WikiLinkProps) {
  const exists = topicExistsLocally(slug);
  const { isOwner } = useAuth();
  const navigate = useNavigate();

  const [showPreview, setShowPreview] = useState(false);
  const [previewPos, setPreviewPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const summaryData = exists ? getCachedTopicSummary(slug) : null;

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if touch device
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setPreviewPos({
      top: rect.bottom + window.scrollY + 6,
      left: Math.max(16, rect.left + window.scrollX),
    });

    hoverTimer.current = setTimeout(() => {
      setShowPreview(true);
    }, 400); // 400ms delay as per brief
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setShowPreview(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!exists) {
      e.preventDefault();
      if (isOwner) {
        navigate(`/new?title=${encodeURIComponent(label)}`);
      }
      return;
    }
    if (onLinkFollow) {
      onLinkFollow(slug, label);
    }
  };

  if (!exists) {
    return (
      <span
        onClick={handleClick}
        title={isOwner ? "No page yet. Click to create." : "No page yet."}
        className="wiki-link-red select-none"
      >
        {label}
      </span>
    );
  }

  return (
    <>
      <Link
        to={`/t/${slug}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="wiki-link"
      >
        {label}
      </Link>

      {showPreview && summaryData && (
        <div
          style={{ top: `${previewPos.top}px`, left: `${previewPos.left}px` }}
          className="fixed z-50 bg-paper border border-rule shadow-sm p-3 max-w-[320px] pointer-events-none rounded text-left font-sans"
        >
          <div className="font-serif font-semibold text-sm text-ink mb-1">
            {summaryData.title}
          </div>
          {summaryData.summary ? (
            <p className="text-xs text-pencil line-clamp-3 leading-relaxed">
              {summaryData.summary}
            </p>
          ) : (
            <p className="text-xs text-pencil italic">No summary available.</p>
          )}
        </div>
      )}
    </>
  );
}
