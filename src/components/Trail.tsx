import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrailStep } from '../lib/types';

const TRAIL_STORAGE_KEY = 'neurolink_reading_trail';
const MAX_TRAIL_STEPS = 8;

export function useTrailManager() {
  const [trail, setTrail] = useState<TrailStep[]>(() => {
    try {
      const saved = sessionStorage.getItem(TRAIL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recordStep = (slug: string, title: string, isNewThread = false) => {
    setTrail((prev) => {
      let updated: TrailStep[];
      if (isNewThread) {
        updated = [{ slug, title, timestamp: Date.now() }];
      } else {
        // Remove prior duplicate to bring to end
        const filtered = prev.filter((s) => s.slug !== slug);
        updated = [...filtered, { slug, title, timestamp: Date.now() }].slice(-MAX_TRAIL_STEPS);
      }
      try {
        sessionStorage.setItem(TRAIL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearTrail = () => {
    setTrail([]);
    sessionStorage.removeItem(TRAIL_STORAGE_KEY);
  };

  return { trail, recordStep, clearTrail };
}

export function TrailRail({
  currentSlug,
  trail,
  onClear,
}: {
  currentSlug?: string;
  trail: TrailStep[];
  onClear: () => void;
}) {
  if (trail.length === 0) return null;

  return (
    <div className="mt-8 flex flex-col">
      <div className="text-pencil text-xs font-sans uppercase tracking-wider mb-2 select-none">
        Trail
      </div>
      <div className="space-y-1">
        {trail.map((step) => {
          const isCurrent = step.slug === currentSlug;
          return (
            <div
              key={step.slug}
              className={`transition-all duration-180 ease-out flex items-center ${
                isCurrent ? 'font-medium' : ''
              }`}
            >
              <Link
                to={`/t/${step.slug}`}
                className={`text-sm block py-0.5 truncate w-full ${
                  isCurrent
                    ? 'text-ink border-l-2 border-biro pl-2 -ml-2.5 font-semibold'
                    : 'text-pencil hover:text-ink pl-0'
                }`}
                title={step.title}
              >
                {step.title}
              </Link>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 text-xs text-pencil hover:text-ink text-left self-start py-0.5 transition-colors"
      >
        Clear
      </button>
    </div>
  );
}

export function MobileTrail({
  currentSlug,
  trail,
}: {
  currentSlug?: string;
  trail: TrailStep[];
}) {
  if (trail.length <= 1) return null;

  return (
    <div className="border-b border-rule bg-margin px-4 py-1.5 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center space-x-2 text-xs">
      <span className="text-pencil select-none">Trail:</span>
      {trail.map((step, idx) => {
        const isCurrent = step.slug === currentSlug;
        return (
          <React.Fragment key={step.slug}>
            <Link
              to={`/t/${step.slug}`}
              className={`${
                isCurrent ? 'text-ink font-semibold underline' : 'text-pencil hover:text-ink'
              }`}
            >
              {step.title}
            </Link>
            {idx < trail.length - 1 && <span className="text-pencil select-none">/</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
