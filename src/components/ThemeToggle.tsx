import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    setIsDark(isCurrentlyDark);
  }, []);

  const toggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('neurolink-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('neurolink-theme', 'light');
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-pencil hover:text-ink text-sm font-sans transition-colors py-1 focus:outline-none"
    >
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
