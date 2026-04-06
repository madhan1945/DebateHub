'use client';
import './globals.css';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../lib/auth';

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('dh_theme') || 'dark';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('dh_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>DebateHub — Debate. Discuss. Decide.</title>
        <meta name="description" content="The platform for structured debates, powerful arguments, and real-time discussion." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('dh_theme') || 'dark';
                document.documentElement.classList.toggle('dark', t === 'dark');
              } catch(e){}
            `,
          }}
        />
      </body>
    </html>
  );
}

import { createContext, useContext } from 'react';
export const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);
