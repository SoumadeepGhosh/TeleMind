'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import {
  DARK_THEME_VARS,
  LIGHT_THEME_VARS,
  type ThemeMode,
} from '@/lib/theme-tokens';

function subscribeTheme(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('telemind-theme-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('telemind-theme-change', callback);
  };
}

function getThemeSnapshot(): ThemeMode {
  try {
    const stored = localStorage.getItem('telemind-theme');
    return stored === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function SubpageShell({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<ThemeMode>(subscribeTheme, getThemeSnapshot, () => 'dark');

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('telemind-theme', next);
    } catch {
      // Ignore storage errors
    }
    window.dispatchEvent(new Event('telemind-theme-change'));
  };

  useEffect(() => {
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', theme);
    }
  }, [theme]);

  return (
    <div
      data-theme={theme}
      style={theme === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS}
      className={`tm-landing min-h-screen flex flex-col relative overflow-x-clip ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main className="flex-1 pt-28 pb-16 px-5 sm:px-8 max-w-[1040px] mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
