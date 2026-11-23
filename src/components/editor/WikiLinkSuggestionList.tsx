import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface SuggestionItem {
  slug: string;
  title: string;
  isCreate?: boolean;
}

interface WikiLinkSuggestionListProps {
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
}

export const WikiLinkSuggestionList = forwardRef<any, WikiLinkSuggestionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
          return true;
        }
        if (event.key === 'Enter') {
          if (items[selectedIndex]) {
            command(items[selectedIndex]);
            return true;
          }
        }
        return false;
      },
    }));

    if (items.length === 0) return null;

    return (
      <div className="z-50 min-w-[220px] max-w-[320px] bg-paper border border-rule shadow-md overflow-hidden text-sm font-sans">
        <div className="px-3 py-1.5 text-[11px] text-pencil uppercase tracking-wider border-b border-rule bg-margin">
          Link to topic
        </div>
        <div className="max-h-48 overflow-y-auto">
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => command(item)}
                className={`w-full text-left px-3 py-1.5 text-xs truncate transition-colors block ${
                  isSelected
                    ? 'bg-margin border-l-2 border-biro pl-2 font-medium text-ink'
                    : 'text-pencil hover:text-ink'
                }`}
              >
                {item.isCreate ? (
                  <span className="text-redline italic">Create &ldquo;{item.title}&rdquo;</span>
                ) : (
                  <span>{item.title}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

WikiLinkSuggestionList.displayName = 'WikiLinkSuggestionList';
