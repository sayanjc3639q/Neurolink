import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../hooks/useAuth';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPalette({ isOpen, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, isSearching } = useSearch(query);
  const { isOwner } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const maxIndex = results.length > 0 ? results.length - 1 : (isOwner && query.trim() ? 0 : -1);
      if (maxIndex >= 0) {
        setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const maxIndex = results.length > 0 ? results.length - 1 : (isOwner && query.trim() ? 0 : -1);
      if (maxIndex >= 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        navigate(`/t/${results[selectedIndex].id}`);
        onClose();
      } else if (isOwner && query.trim()) {
        navigate(`/new?title=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  };

  const highlightMatches = (text: string, q: string) => {
    if (!q.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="highlight-marker">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-ink/10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[66ch] bg-paper border border-rule shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-120"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input field */}
        <div className="border-b border-rule px-4 py-3 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, tags, or text..."
            className="w-full bg-transparent text-ink placeholder:text-pencil font-sans text-lg focus:outline-none"
          />
          {isSearching && (
            <span className="text-xs text-pencil animate-pulse select-none">Searching...</span>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto">
          {results.length > 0 ? (
            <div className="divide-y divide-rule/40">
              {results.map((res: any, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={res.id}
                    onClick={() => {
                      navigate(`/t/${res.id}`);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-margin border-l-2 border-biro -ml-[2px] pl-[18px]'
                        : 'hover:bg-margin/50'
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-0.5">
                      <span className="font-serif font-semibold text-base text-ink">
                        {highlightMatches(res.title, query)}
                      </span>
                      {res.tags && res.tags.length > 0 && (
                        <span className="text-xs text-pencil ml-2 truncate">
                          {res.tags.join('  ')}
                        </span>
                      )}
                    </div>
                    {res.summary && (
                      <p className="text-xs text-pencil line-clamp-1 leading-relaxed">
                        {highlightMatches(res.summary, query)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="p-4">
              <p className="text-sm text-pencil mb-2">No matching topics found.</p>
              {isOwner && (
                <div
                  onClick={() => {
                    navigate(`/new?title=${encodeURIComponent(query.trim())}`);
                    onClose();
                  }}
                  className="cursor-pointer text-sm text-ink hover:text-biro border-l-2 border-biro pl-3 py-1 bg-margin"
                >
                  Create &ldquo;{query.trim()}&rdquo;
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-xs text-pencil">
              Type to search by title, tag, or content...
            </div>
          )}
        </div>

        {/* Keyboard hint footer */}
        <div className="border-t border-rule px-4 py-2 bg-margin flex items-center justify-between text-[11px] text-pencil select-none font-sans">
          <span>Enter opens, Esc closes</span>
          <span>&uarr; &darr; to navigate</span>
        </div>
      </div>
    </div>
  );
}
