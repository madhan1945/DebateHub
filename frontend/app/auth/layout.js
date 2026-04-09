'use client';
import { useState, useEffect } from 'react';

const ALL_QUOTES = [
  { quote: 'The best platform I\'ve found for actually changing your mind on something.', name: 'Priya K.', role: 'Philosophy student' },
  { quote: 'I learned more from one good debate here than a semester of lectures.', name: 'Marcus T.', role: 'Law grad student' },
  { quote: 'This app finally makes looking at different perspectives satisfying.', name: 'Sarah M.', role: 'Product Manager' },
  { quote: 'The toxicity filters are brilliant. Real debate, zero trolling.', name: 'James L.', role: 'Journalist' },
  { quote: 'It is almost like playing a competitive sport, but for your brain.', name: 'Derek W.', role: 'Economist' },
  { quote: 'The reputation system makes sure the best arguments bubble to the top immediately.', name: 'Anita R.', role: 'Political Analyst' },
];

export default function AuthLayout({ children }) {
  const [randomQuotes, setRandomQuotes] = useState([]);

  useEffect(() => {
    // Pick 2 random quotes
    const shuffled = [...ALL_QUOTES].sort(() => 0.5 - Math.random());
    setRandomQuotes(shuffled.slice(0, 2));
  }, []);

  if (!randomQuotes.length) return null; // Avoid hydration mismatch

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'var(--bg-base)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background blobs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'var(--brand)', top: -200, right: -100, filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: '#9b5de5', bottom: -150, left: -100, filter: 'blur(100px)', opacity: 0.07, pointerEvents: 'none' }} />

      {/* Left panel — decorative, hidden on mobile */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px', opacity: 0.5,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '3rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px var(--brand-glow)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text-primary)' }}>DebateHub</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '1.25rem' }}>
            Where the best<br />
            <em className="text-gradient" style={{ fontStyle: 'italic' }}>argument wins.</em>
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem', maxWidth: 380, marginBottom: '3rem' }}>
            Join thousands of thinkers, debaters, and curious minds making sense of the world's hardest questions — one argument at a time.
          </p>

          {/* Social proof testimonials */}
          {randomQuotes.map(({ quote, name, role }) => (
            <div key={name} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1rem', transition: 'all 0.3s ease-in' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                "{quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
                  {name[0]}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — auth form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
