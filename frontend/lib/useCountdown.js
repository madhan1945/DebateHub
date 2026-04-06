'use client';
import { useState, useEffect } from 'react';

export function useCountdown(endTime) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return false;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ d, h, m, s, diff });
      return true;
    };

    if (!calc()) return;
    const interval = setInterval(() => { if (!calc()) clearInterval(interval); }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return { timeLeft, isExpired };
}

export function CountdownDisplay({ endTime, className = '' }) {
  const { timeLeft, isExpired } = useCountdown(endTime);

  if (isExpired) {
    return (
      <span className={className} style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        Debate closed
      </span>
    );
  }
  if (!timeLeft) return null;

  const urgent = timeLeft.diff < 2 * 60 * 60 * 1000; // < 2 hours

  const parts = timeLeft.d > 0
    ? [{ v: timeLeft.d, l: 'd' }, { v: timeLeft.h, l: 'h' }, { v: timeLeft.m, l: 'm' }]
    : timeLeft.h > 0
    ? [{ v: timeLeft.h, l: 'h' }, { v: timeLeft.m, l: 'm' }, { v: timeLeft.s, l: 's' }]
    : [{ v: timeLeft.m, l: 'm' }, { v: timeLeft.s, l: 's' }];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: '0.8125rem',
        fontFamily: 'var(--font-mono)',
        color: urgent ? 'var(--accent)' : 'var(--text-secondary)',
        fontWeight: 500,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      {parts.map(({ v, l }) => `${String(v).padStart(2, '0')}${l}`).join(' ')}
    </span>
  );
}
