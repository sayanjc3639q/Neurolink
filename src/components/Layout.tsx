import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  BookOpen,
  Clock,
  Shuffle,
  PlusCircle,
  User,
  LogOut,
  LogIn,
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentSlugMatch = location.pathname.match(/^\/t\/([^\/]+)/);
  const currentSlug = currentSlugMatch ? currentSlugMatch[1] : undefined;

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
      {/* Mobile Top Navbar (<768px) */}
      <header className="md:hidden border-b border-rule bg-paper px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-pencil hover:text-ink hover:bg-margin border border-rule rounded-sm focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="font-serif font-semibold text-lg text-ink">
            Neurolink
          </Link>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <button
            type="button"
            onClick={onOpenSearch}
            className="text-pencil hover:text-ink py-1 px-2.5 border border-rule text-xs flex items-center space-x-1.5 rounded-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Sidebar / Drawer (Slide in from left) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="relative w-4/5 max-w-[280px] bg-paper border-r border-rule h-full flex flex-col p-5 shadow-xl z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-rule mb-5">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif font-semibold text-xl text-ink tracking-tight"
              >
                Neurolink
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-pencil hover:text-ink border border-rule rounded-sm"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full text-left bg-margin border border-rule px-3 py-2 text-xs text-pencil hover:text-ink flex items-center justify-between mb-5 focus:outline-none rounded-sm"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5" />
                <span>Search notes</span>
              </div>
              <kbd className="font-mono text-[10px] text-pencil">Ctrl K</kbd>
            </button>

            {/* Navigation Links with Icons */}
            <nav className="flex flex-col space-y-2 text-sm">
              <Link
                to="/topics"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 text-pencil hover:text-ink py-1.5 px-2 hover:bg-margin rounded-sm transition-colors"
              >
                <BookOpen className="w-4 h-4 text-pencil shrink-0" />
                <span>All topics</span>
              </Link>
              <Link
                to="/recent"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 text-pencil hover:text-ink py-1.5 px-2 hover:bg-margin rounded-sm transition-colors"
              >
                <Clock className="w-4 h-4 text-pencil shrink-0" />
                <span>Recent changes</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleRandomTopic();
                }}
                className="w-full text-left flex items-center space-x-2.5 text-pencil hover:text-ink py-1.5 px-2 hover:bg-margin rounded-sm transition-colors"
              >
                <Shuffle className="w-4 h-4 text-pencil shrink-0" />
                <span>Random topic</span>
              </button>
              {isOwner && (
                <Link
                  to="/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 text-ink font-medium hover:text-biro py-1.5 px-2 hover:bg-margin rounded-sm transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-biro shrink-0" />
                  <span>New topic</span>
                </Link>
              )}
            </nav>

            {/* Mobile Trail */}
            <div className="flex-1 mt-6 pt-4 border-t border-rule">
              <div className="text-[11px] font-mono uppercase tracking-wider text-pencil mb-2">
                Reading Trail
              </div>
              <TrailRail currentSlug={currentSlug} trail={trail} onClear={clearTrail} />
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-rule mt-auto flex flex-col space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-1 text-pencil hover:text-ink font-medium"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </Link>
                    <span className="text-pencil select-none">/</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center space-x-1 text-pencil hover:text-ink"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-1 text-pencil hover:text-ink"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign in</span>
                  </Link>
                )}
              </div>
              {isOwner && (
                <div className="text-[11px] text-pencil">Owner / Writer session</div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Trail Strip */}
      <div className="md:hidden">
        <MobileTrail currentSlug={currentSlug} trail={trail} />
      </div>

      {/* Main 3-column layout */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto justify-between">
        {/* Left Rail (Desktop >= 768px) */}
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
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search notes</span>
            </div>
            <kbd className="font-mono text-[10px] text-pencil">Ctrl K</kbd>
          </button>

          {/* Navigation Links with Icons */}
          <nav className="flex flex-col space-y-1.5 text-sm">
            <Link
              to="/topics"
              className="flex items-center space-x-2 text-pencil hover:text-ink py-1 px-1.5 hover:bg-paper/50 rounded-xs transition-colors"
            >
              <BookOpen className="w-4 h-4 text-pencil shrink-0" />
              <span>All topics</span>
            </Link>
            <Link
              to="/recent"
              className="flex items-center space-x-2 text-pencil hover:text-ink py-1 px-1.5 hover:bg-paper/50 rounded-xs transition-colors"
            >
              <Clock className="w-4 h-4 text-pencil shrink-0" />
              <span>Recent changes</span>
            </Link>
            <button
              type="button"
              onClick={handleRandomTopic}
              className="w-full text-left flex items-center space-x-2 text-pencil hover:text-ink py-1 px-1.5 hover:bg-paper/50 rounded-xs transition-colors"
            >
              <Shuffle className="w-4 h-4 text-pencil shrink-0" />
              <span>Random topic</span>
            </button>
            {isOwner && (
              <Link
                to="/new"
                className="flex items-center space-x-2 text-ink font-medium hover:text-biro py-1 px-1.5 hover:bg-paper/50 rounded-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-biro shrink-0" />
                <span>+ New topic</span>
              </Link>
            )}
          </nav>

          {/* The Trail */}
          <div className="flex-1 mt-4">
            <TrailRail currentSlug={currentSlug} trail={trail} onClear={clearTrail} />
          </div>

          {/* Rail Footer */}
          <div className="pt-6 border-t border-rule mt-auto flex flex-col space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-1 text-pencil hover:text-ink font-medium"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </Link>
                  <span className="text-pencil select-none">/</span>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="flex items-center space-x-1 text-pencil hover:text-ink"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-pencil hover:text-ink"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign in</span>
                </Link>
              )}
            </div>
            {isOwner && (
              <Link to="/profile" className="text-[11px] text-pencil hover:text-ink">
                Owner / Writer session
              </Link>
            )}
          </div>
        </aside>

        {/* Center Article Content */}
        <main className="flex-1 min-w-0 px-6 sm:px-10 py-8 md:py-12 flex justify-start">
          <div className="w-full max-w-4xl">{children}</div>
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
