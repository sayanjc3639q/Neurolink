import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Layout } from './components/Layout';
import { SearchPalette } from './components/SearchPalette';
import Home from './pages/Home';
import TopicPage from './pages/TopicPage';
import AllTopics from './pages/AllTopics';
import RecentChanges from './pages/RecentChanges';
import TagPage from './pages/TagPage';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { getOrInitSearchIndex } from './lib/searchIndex';

// Code-splitting lazy-loaded editor routes so readers don't download Tiptap bundle
const NewTopicPage = lazy(() => import('./pages/NewTopicPage'));
const EditTopicPage = lazy(() => import('./pages/EditTopicPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function App() {
  const [rightMargin, setRightMargin] = useState<React.ReactNode>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Initialize search index in background
  useEffect(() => {
    getOrInitSearchIndex();
  }, []);

  // Global keyboard shortcut for search (Ctrl+K, Cmd+K, "/")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        !document.activeElement?.classList.contains('ProseMirror')
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Layout rightMargin={rightMargin} onOpenSearch={() => setIsSearchOpen(true)}>
        <Routes>
          <Route path="/" element={<Home onOpenSearch={() => setIsSearchOpen(true)} />} />
          <Route path="/t/:slug" element={<TopicPage setRightMargin={setRightMargin} />} />
          <Route
            path="/new"
            element={
              <Suspense fallback={<div className="p-8 text-pencil text-sm">Loading editor...</div>}>
                <NewTopicPage />
              </Suspense>
            }
          />
          <Route
            path="/t/:slug/edit"
            element={
              <Suspense fallback={<div className="p-8 text-pencil text-sm">Loading editor...</div>}>
                <EditTopicPage />
              </Suspense>
            }
          />
          <Route path="/topics" element={<AllTopics />} />
          <Route path="/recent" element={<RecentChanges />} />
          <Route path="/tag/:tag" element={<TagPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>

      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </QueryClientProvider>
  );
}
