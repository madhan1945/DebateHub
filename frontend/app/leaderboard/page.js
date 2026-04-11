'use client';
import { useState, useEffect } from 'react';
import Link from '@/components/navigation/Link';
import Navbar from '../../components/layout/Navbar';
import { userAPI } from '../../lib/api';

const SORTS = [
  { value: 'reputation', label: '⚡ Reputation' },
  { value: 'votes',      label: '▲ Votes' },
  { value: 'debates',    label: '🗣️ Debates' },
  { value: 'wins',       label: '🏆 Wins' },
];

const RANK_STYLES = [
  { bg: 'rgba(255,215,0,0.15)',  border: 'rgba(255,215,0,0.4)',  color: '#b8960c', label: '🥇' },
  { bg: 'rgba(192,192,192,0.15)', border: 'rgba(192,192,192,0.4)', color: '#6b7280', label: '🥈' },
  { bg: 'rgba(205,127,50,0.15)', border: 'rgba(205,127,50,0.4)', color: '#92400e', label: '🥉' },
];

export default function LeaderboardPage() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort]     = useState('reputation');

  useEffect(() => {
    setLoading(true);
    userAPI.getLeaderboard({ sort, limit: 50 })
      .then(({ data }) => setUsers(data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sort]);

  const getStatValue = (user) => {
    switch (sort) {
      case 'votes':   return `${user.totalVotesReceived} votes`;
      case 'debates': return `${user.debatesParticipated} debates`;
      case 'wins':    return `${user.debateWins} wins`;
      default:        return `${user.reputationPoints} rep`;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div className="badge badge-amber" style={{ marginBottom: '0.75rem' }}>🏆 Hall of Fame</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Top Debaters
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Ranked by community recognition and debate performance.
        </p>

        {/* Sort tabs */}
        <div style={{ display: 'inline-flex', gap: '0.375rem', marginTop: '1.25rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
          {SORTS.map(({ value, label }) => (
            <button key={value} onClick={() => setSort(value)}
              style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', border: 'none', background: sort === value ? 'var(--brand)' : 'transparent', color: sort === value ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Top 3 podium */}
        {!loading && users.length >= 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: '1rem', marginBottom: '2rem', alignItems: 'end' }}>
            {[users[1], users[0], users[2]].map((u, i) => {
              const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
              const style = RANK_STYLES[actualRank - 1];
              return (
                <Link key={u._id} href={`/profile/${u.username}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: style.bg, border: `1px solid ${style.border}`,
                    borderRadius: 'var(--radius-lg)', padding: '1.25rem 1rem',
                    textAlign: 'center', transition: 'transform 0.2s',
                    ...(actualRank === 1 ? { paddingTop: '1.75rem', paddingBottom: '1.75rem' } : {}),
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{style.label}</div>
                    <img src={u.avatar} alt={u.username} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${style.border}`, margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{u.username}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: style.color }}>{getStatValue(u)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="shimmer" style={{ height: 64, margin: '1px 0' }} />
            ))
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users yet.</div>
          ) : (
            users.map((u, i) => (
              <Link key={u._id} href={`/profile/${u.username}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem',
                  borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Rank */}
                  <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                    {i < 3 ? (
                      <span style={{ fontSize: '1.2rem' }}>{RANK_STYLES[i].label}</span>
                    ) : (
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <img src={u.avatar} alt={u.username} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{u.username}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      {u.debatesParticipated} debates · {u.argumentsPosted} arguments · {u.debateWins} wins
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--brand)', fontSize: '1rem' }}>{getStatValue(u)}</div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
