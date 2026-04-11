'use client';
import './globals.css';
import { createContext, useContext, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../lib/auth';

export const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.title = 'DebateHub - Debate. Discuss. Decide.';
    const saved = localStorage.getItem('dh_theme') || 'dark';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('dh_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <AuthProvider>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
          },
          success: { iconTheme: { primary: '#0dbc7a', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#f0506e', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
