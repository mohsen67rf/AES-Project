// src/shared/components/ThemeToggle/ThemeToggle.tsx

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
      aria-label="تغییر تم"
    >
      {/* دایره‌ی چراغ */}
      <div className="relative w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-300">
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${
            isDark ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-300">
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}