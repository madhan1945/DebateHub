'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import { notificationAPI } from '../../lib/api';

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen]       = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return;
    notificationAPI.getUnreadCount()
      .then(({ data }) => setUnread(data.count))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen(o => !o);
    if (!open && user) {
      setLoading(true);
      try {
        const { data } = await notificationAPI.getAll({ limit: 15 });
        setNotifications(data.notifications);
        setUnread(0);
        await notificationAPI.markAllRead();
      } catch {} finally { setLoading(false); }
    }
  };

  if (!user) return null;

  const typeIcon = (type) => ({ vote: '▲', reply: '↩', debate_closed: '🔒', new_argument: '💬', new_debate: '🗣️', mention: '@' }[type] || '🔔');

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        style={{
          width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--border)',
          background: 'var(--bg-elevated)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', position: 'relative', transition: 'all 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--accent)', color: '#fff',
            fontSize: '0.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-base)',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 340, maxHeight: 480, overflowY: 'auto',
          background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 200,
        }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Notifications</span>
            {notifications.length > 0 && (
              <button onClick={() => { notificationAPI.clearAll(); setNotifications([]); }}
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Clear all
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
              No notifications yet
            </div>
          ) : (
            notifications.map(n => (
              <Link key={n._id} href={n.link || '/debates'}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', gap: '0.75rem', padding: '0.875rem 1rem',
                  borderBottom: '1px solid var(--border)', textDecoration: 'none',
                  background: n.isRead ? 'transparent' : 'var(--brand-light)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--brand-light)'}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                  {typeIcon(n.type)}
                </div>
                <div>
                  <p style={{ fontSize: '0.8375rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>{n.message}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                    {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </Link>
            ))
          )}
          <div style={{ padding: '0.625rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
            <Link href="/notifications" onClick={() => setOpen(false)}
              style={{ fontSize: '0.8125rem', color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
