'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { debateAPI } from '../lib/api';
import api from '../lib/api';
import { CountdownDisplay } from '../lib/useCountdown';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Structured Debates',
    desc: 'Every debate has a clear Support and Oppose side. Arguments are organised, ranked, and easy to follow.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    title: 'Live Voting & Ranking',
    desc: 'Arguments rise and fall on merit. The crowd votes on the strongest points — no echo chambers.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
      </svg>
    ),
    title: 'Real-Time Chat',
    desc: 'Debate rooms have live chat powered by Socket.IO. Watch arguments update in real-time as you discuss.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Reputation System',
    desc: 'Build your rep through quality arguments and winning debates. Rise through the leaderboard.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
    title: 'AI-Powered Features',
    desc: 'AI summarises long threads, generates debate topics, and flags toxic content automatically.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    title: 'Discover & Follow',
    desc: 'Follow topics you care about. Get notified when new debates in your categories go live.',
  },
];

function AnimatedCounter({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref     = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!value) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          let i = 0;
          const timer = setInterval(() => {
            i++;
            setCount(Math.round((value * i) / steps));
            if (i >= steps) clearInterval(timer);
          }, 20);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const fmt = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000)    return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return <span ref={ref}>{fmt(count)}{suffix}</span>;
}

const CATEGORY_COLORS = {
  Technology:  { bg: 'rgba(86,103,240,0.1)',  color: 'var(--brand)' },
  Education:   { bg: 'rgba(13,188,122,0.1)',  color: 'var(--accent-green)' },
  Environment: { bg: 'rgba(13,188,122,0.12)', color: '#0a9960' },
  Business:    { bg: 'rgba(245,166,35,0.12)', color: 'var(--accent-amber)' },
  Politics:    { bg: 'rgba(240,80,110,0.1)',  color: 'var(--accent)' },
  Science:     { bg: 'rgba(86,103,240,0.1)',  color: '#7a91ff' },
  Health:      { bg: 'rgba(13,188,122,0.1)',  color: 'var(--accent-green)' },
  Society:     { bg: 'rgba(155,93,229,0.1)',  color: '#9b5de5' },
  Culture:     { bg: 'rgba(245,166,35,0.1)',  color: 'var(--accent-amber)' },
  Sports:      { bg: 'rgba(240,80,110,0.1)',  color: 'var(--accent)' },
  Other:       { bg: 'var(--bg-subtle)',       color: 'var(--text-secondary)' },
};

export default function HomePage() {
  const router = useRouter();
  const [trending, setTrending] = useState([]);
  const [stats, setStats]       = useState({ debates: 0, arguments: 0, votes: 0, users: 0 });
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    // Fetch real trending debates
    debateAPI.getTrending()
      .then(({ data }) => setTrending(data.debates || []))
      .catch(() => {})
      .finally(() => setLoadingTrending(false));

    // Fetch real platform stats
    api.get('/stats')
      .then(({ data }) => {
        if (data.success) setStats(data.stats);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(5rem, 12vw, 10rem) 1.5rem clamp(4rem, 8vw, 7rem)', textAlign: 'center' }}>
        <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.4, zIndex: 0 }} />
        <div className="blob" style={{ width: 600, height: 600, background: 'var(--brand)', top: -200, left: '50%', transform: 'translateX(-60%)', opacity: 0.12 }} />
        <div className="blob" style={{ width: 400, height: 400, background: '#9b5de5', top: -100, right: '10%', opacity: 0.08 }} />
        <div className="blob" style={{ width: 300, height: 300, background: 'var(--accent)', bottom: -100, left: '5%', opacity: 0.07 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--brand-light)', border: '1px solid rgba(86,103,240,0.2)', borderRadius: 999, padding: '0.3rem 1rem', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--brand)', marginBottom: '2rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block', boxShadow: '0 0 8px var(--brand)' }} />
            {stats.debates > 0 ? `${stats.debates} live debates happening now` : 'Live debates happening now'}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem, 6vw, 4.5rem)', lineHeight: 1.1, fontWeight: 400, color: 'var(--text-primary)', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Where the best{' '}
            <em className="text-gradient" style={{ fontStyle: 'italic' }}>argument</em>
            <br />wins.
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            DebateHub is the platform for structured debates, powerful arguments, and real-time discussion. Join thousands of thinkers making sense of the world's hardest questions.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="xl" onClick={() => router.push('/auth/register')}>
              Start debating free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Button>
            <Button variant="secondary" size="xl" onClick={() => router.push('/debates')}>
              Browse debates
            </Button>
          </div>
          <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No credit card · Free forever
          </p>
        </div>
      </section>

      {/* ── REAL STATS BAR ── */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          {[
            { value: stats.debates,   label: 'Debates created',    suffix: '+' },
            { value: stats.arguments, label: 'Arguments posted',   suffix: '+' },
            { value: stats.votes,     label: 'Votes cast',         suffix: '+' },
            { value: stats.users,     label: 'Community members',  suffix: '+' },
          ].map(({ value, label, suffix }) => (
            <div key={label}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--brand)', lineHeight: 1 }}>
                {value > 0
                  ? <AnimatedCounter value={value} suffix={suffix} />
                  : <span style={{ color: 'var(--border-strong)' }}>—</span>
                }
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REAL TRENDING DEBATES ── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="badge badge-red" style={{ marginBottom: '0.75rem' }}>🔥 Trending now</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', fontWeight: 400, color: 'var(--text-primary)' }}>
                Hot debates this week
              </h2>
            </div>
            <Link href="/debates" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--brand)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>

          {loadingTrending ? (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {[0,1,2].map(i => <div key={i} className="shimmer" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : trending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <p>No debates yet. <Link href="/debates/create" style={{ color: 'var(--brand)' }}>Create the first one →</Link></p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {trending.map((debate, i) => {
                const total      = (debate.supportCount || 0) + (debate.opposeCount || 0);
                const supportPct = total > 0 ? Math.round((debate.supportCount / total) * 100) : 50;
                const opposePct  = 100 - supportPct;
                const catStyle   = CATEGORY_COLORS[debate.category] || CATEGORY_COLORS.Other;

                return (
                  <Link key={debate._id} href={`/debates/${debate._id}`} style={{ textDecoration: 'none' }}>
                    <div
                      className="card"
                      style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--border-strong)', minWidth: 36, textAlign: 'center', lineHeight: 1 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.6rem', borderRadius: 999, background: catStyle.bg, color: catStyle.color }}>
                            {debate.category}
                          </span>
                          <CountdownDisplay endTime={debate.endTime} />
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                          {debate.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-green)' }}>{supportPct}%</span>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${supportPct}%`, background: 'linear-gradient(90deg, var(--accent-green), var(--brand))', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)' }}>{opposePct}%</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)' }}>{debate.totalArguments || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>arguments</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>👁 {debate.viewCount || 0}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 1.5rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge badge-brand" style={{ marginBottom: '1rem' }}>✦ Platform features</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 3vw, 2.5rem)', fontWeight: 400, color: 'var(--text-primary)' }}>
              Everything a great debate needs
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title}
                style={{ padding: '1.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', transition: 'border-color 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: 'clamp(5rem, 10vw, 9rem) 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="blob" style={{ width: 500, height: 500, background: 'var(--brand)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.08 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Ready to make your{' '}
            <em className="text-gradient" style={{ fontStyle: 'italic' }}>case?</em>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
            Join DebateHub and start building your reputation one argument at a time.
          </p>
          <Button variant="primary" size="xl" onClick={() => router.push('/auth/register')}>
            Create your free account →
          </Button>
          <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already a member?{' '}
            <Link href="/auth/login" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '3rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>DebateHub</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>The platform where the best argument wins.</p>
            </div>
            {[
              { heading: 'Platform', links: [['Browse Debates', '/debates'], ['Create Debate', '/debates/create'], ['Leaderboard', '/leaderboard'], ['Discover', '/discover']] },
              { heading: 'Company',  links: [['About', '#'], ['Blog', '#'], ['Careers', '#'], ['Press', '#']] },
              { heading: 'Support',  links: [['Help Centre', '#'], ['Community Guidelines', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#']] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>{heading}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                        onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                      >{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>© {new Date().getFullYear()} DebateHub. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['Twitter', 'GitHub', 'Discord'].map(s => (
                <a key={s} href="#" style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = 'var(--brand)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
