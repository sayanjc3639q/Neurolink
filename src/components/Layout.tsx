import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { TrailRail, MobileTrail, useTrailManager } from './Trail';
import { getAllIndexedTopics } from '../lib/searchIndex';

interface LayoutProps {
  children: React.ReactNode;
  rightMargin?: React.ReactNode;
  onOpenSearch: () => void;
}

export function Layout({ children, rightMargin, onOpenSearch }: LayoutProps) {
  const { user, isOwner, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { trail, clearTrail } = useTrailManager();

  const currentSlugMatch = location.pathname.match(/^\/t\/([^\/]+)/);
  const currentSlug = currentSlugMatch ? currentSlugMatch[1] : undefined;

  const handleRandomTopic = () => {
    const topics = getAllIndexedTopics();
    if (topics.length > 0) {
      const random = topics[Math.floor(Math.random() * topics.length)];
      navigate(`/t/${random.slug}`);
    } else {
      navigate('/topics');
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      {/* Mobile Top Navbar (<700px) */}
      <header className="md:hidden border-b border-rule bg-paper px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="font-serif font-semibold text-lg text-ink">
          Neurolink
        </Link>
        <div className="flex items-center space-x-3 text-sm">
          <button
            type="button"
            onClick={onOpenSearch}
            className="text-pencil hover:text-ink py-1 px-2 border border-rule text-xs"
          >
            Search
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Trail Strip */}
      <div className="md:hidden">
        <MobileTrail currentSlug={currentSlug} trail={trail} />
      </div>

      {/* Main 3-column layout */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto justify-between">
        {/* Left Rail (Desktop >= 1100px, tablet collapse) */}
        <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-rule bg-margin min-h-screen p-5 sticky top-0 h-screen overflow-y-auto">
          {/* Brand */}
          <Link to="/" className="font-serif font-semibold text-xl text-ink tracking-tight mb-6">
            Neurolink
          </Link>

          {/* Quick Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full text-left bg-paper border border-rule px-3 py-1.5 text-xs text-pencil hover:text-ink flex items-center justify-between mb-6 focus:outline-none"
          >
            <span>Search notes</span>
            <kbd className="font-mono text-[10px] text-pencil">Ctrl K</kbd>
          </button>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-2 text-sm">
            <Link to="/topics" className="text-pencil hover:text-ink py-0.5 transition-colors">
              All topics
            </Link>
            <Link to="/recent" className="text-pencil hover:text-ink py-0.5 transition-colors">
              Recent changes
            </Link>
            <button
              type="button"
              onClick={handleRandomTopic}
              className="text-left text-pencil hover:text-ink py-0.5 transition-colors"
            >
              Random topic
            </button>
            {isOwner && (
              <Link
                to="/new"
                className="text-ink font-medium hover:text-biro py-0.5 transition-colors"
              >
                + New topic
              </Link>
            )}
          </nav>

          {/* The Trail */}
          <div className="flex-1">
            <TrailRail currentSlug={currentSlug} trail={trail} onClear={clearTrail} />
          </div>

          {/* Rail Footer */}
          <div className="pt-6 border-t border-rule mt-auto flex flex-col space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              {user ? (
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-pencil hover:text-ink"
                >
                  Sign out
                </button>
              ) : (
                <Link to="/login" className="text-pencil hover:text-ink">
                  Sign in
                </Link>
              )}
            </div>
            {isOwner && <div className="text-[11px] text-pencil">Owner session</div>}
          </div>
        </aside>

        {/* Center Article Content */}
        <main className="flex-1 min-w-0 px-5 sm:px-8 py-8 md:py-12 flex justify-start">
          <div className="w-full max-w-[66ch]">{children}</div>
        </main>

        {/* Right Margin (Desktop >= 1100px) */}
        <aside className="hidden lg:block w-[260px] shrink-0 border-l border-rule bg-margin min-h-screen p-5 sticky top-0 h-screen overflow-y-auto">
          {rightMargin || (
            <div className="text-xs text-pencil font-sans">
              No additional notes for this view.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
