// src/shared/context/ThemeContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'cyber';

export interface ThemeOption {
  id: Theme;
  nameFa: string;
  nameEn: string;
  icon: string;
  badgeColor: string;
  descriptionFa: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark',
    nameFa: 'دارک سافت (پیش‌فرض)',
    nameEn: 'Dark Soft UI',
    icon: '🌙',
    badgeColor: 'bg-[#1A264F] text-[#00D2FF]',
    descriptionFa: 'تم مدرن دارک سافت سرمه‌ای با اکسنت سایان و گلد',
  },
  {
    id: 'light',
    nameFa: 'روز',
    nameEn: 'Light',
    icon: '☀️',
    badgeColor: 'bg-amber-500 text-white',
    descriptionFa: 'تم روشن استاندارد با کنتراست بالا',
  },
  {
    id: 'cyber',
    nameFa: 'سایبر نئون',
    nameEn: 'Cyber Neon',
    icon: '⚡',
    badgeColor: 'bg-cyan-500 text-slate-950 font-bold',
    descriptionFa: 'تم پررنگ نئونی معدن',
  },
];

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  isCyber: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('aes_theme');
    if (saved === 'cyber' || saved === 'dark' || saved === 'light') {
      return saved as Theme;
    }
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('aes_theme', theme);
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-cyber', 'theme-light');

    if (theme === 'cyber') {
      root.classList.add('dark', 'theme-cyber');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('theme-light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'cyber';
      return 'light';
    });
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        isDark: theme === 'dark' || theme === 'cyber', 
        isCyber: theme === 'cyber', 
        toggleTheme, 
        setTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      isDark: true,
      isCyber: false,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
};

