'use client';
import Link from 'next/link';
import { CountdownDisplay } from '../../lib/useCountdown';

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

export default function DebateCard({ debate }) {
  const total = (debate.supportCount || 0) + (debate.opposeCount || 0);
  const supportPct = total > 0 ? Math.round((debate.supportCount / total) * 100) : 50;
  const opposePct  = 100 - supportPct;
  const catStyle   = CATEGORY_COLORS[debate.category] || CATEGORY_COLORS.Other;
  const isClosed   = debate.status === 'closed';

  return (
    <Link href={`/debates/${debate._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        className="card-hover-lift animate-fade-in"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.375rem',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.6rem', borderRadius: 999, background: catStyle.bg, color: catStyle.color }}>
              {debate.category}
            </span>
            {isClosed ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.6rem', borderRadius: 999, background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                Closed
              </span>
            ) : (
              <CountdownDisplay endTime={debate.endTime} />
            )}
          </div>

          {/* Winner badge */}
          {isClosed && debate.winner && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 999, flexShrink: 0,
              background: debate.winner === 'support' ? 'rgba(13,188,122,0.12)' : debate.winner === 'oppose' ? 'rgba(240,80,110,0.1)' : 'var(--bg-subtle)',
              color: debate.winner === 'support' ? 'var(--accent-green)' : debate.winner === 'oppose' ? 'var(--accent)' : 'var(--text-muted)',
            }}>
              {debate.winner === 'tie' ? 'Tie' : `${debate.winner.charAt(0).toUpperCase() + debate.winner.slice(1)} won`}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.45, margin: 0, flex: 1 }}>
          {debate.title}
        </h3>

        {/* Vote bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--accent-green)' }}>✓ Support {supportPct}%</span>
            <span style={{ color: 'var(--accent)' }}>{opposePct}% Oppose ✗</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${supportPct}%`, background: 'linear-gradient(90deg, var(--accent-green), var(--brand))', borderRadius: 3, transition: 'width 0.6s ease' }} />
          </div>
        </div>

        {/* Footer meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <img
              src={debate.creator?.avatar || `https://ui-avatars.com/api/?name=${debate.creator?.username}&background=random&length=1&color=fff&size=24&bold=true`}
              alt={debate.creator?.username}
              style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
            />
            <span>{debate.creator?.username}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <span title="Arguments">💬 {debate.totalArguments || 0}</span>
            <span title="Votes">▲ {debate.totalVotes || 0}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
