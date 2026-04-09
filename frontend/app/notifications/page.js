'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import { notificationAPI } from '../../lib/api';
import { useAuth } from '../../lib/auth';

const TYPE_ICON = { vote: '▲', reply: '↩', debate_closed: '🔒', new_argument: '💬', new_debate: '🗣️', mention: '@' };

export default function NotificationsPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    notificationAPI.getAll({ limit: 50 })
      .then(({ data }) => { setNotifications(data.notifications); notificationAPI.markAllRead(); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleClear = async () => {
    await notificationAPI.clearAll();
    setNotifications([]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--text-primary)' }}>
            Notifications
          </h1>
          {notifications.length > 0 && (
            <Button variant="secondary" size="sm" onClick={handleClear}>Clear all</Button>
          )}
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shimmer" style={{ height: 72, margin: '1px 0' }} />
            ))
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>All caught up!</h3>
              <p style={{ fontSize: '0.9rem' }}>No notifications yet. Start debating to get activity here.</p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <Link key={n._id} href={n.link || '/debates'}
                style={{
                  display: 'flex', gap: '1rem', padding: '1rem 1.25rem',
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                  textDecoration: 'none',
                  background: n.isRead ? 'transparent' : 'var(--brand-light)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--brand-light)'}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                  {TYPE_ICON[n.type] || '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0, marginBottom: '0.25rem' }}>
                    {n.sender && <strong>{n.sender.username} </strong>}
                    {n.message}
                  </p>
                  {n.debate && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginBottom: '0.2rem' }}>
                      in: {n.debate.title?.slice(0, 60)}...
                    </p>
                  )}
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0 }}>
                    {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0, marginTop: 6 }} />
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
