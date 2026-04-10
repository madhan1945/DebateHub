'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import ArgumentCard from '../../../components/debate/ArgumentCard';
import ArgumentForm from '../../../components/debate/ArgumentForm';
import LiveChat from '../../../components/chat/LiveChat';
import Button from '../../../components/ui/Button';
import { CountdownDisplay } from '../../../lib/useCountdown';
import { debateAPI, argumentAPI, userAPI } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { useSocket } from '../../../lib/useSocket';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'top',    label: '⭐ Top' },
  { value: 'newest', label: '🕐 Newest' },
  { value: 'oldest', label: '📜 Oldest' },
  { value: 'hot',    label: '🔥 Hot' },
];

export default function DebatePage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { user } = useAuth();

  const [debate, setDebate]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [supportArgs, setSupportArgs] = useState([]);
  const [opposeArgs,  setOpposeArgs]  = useState([]);
  const [loadingArgs, setLoadingArgs] = useState(false);
  const [sort, setSort]               = useState('top');
  const [replyTarget, setReplyTarget] = useState(null);
  const [activeTab, setActiveTab]     = useState('both');
  const [bookmarked, setBookmarked]   = useState(false);

  // Auto-Destruct Mechanics
  const [autoDestructTimer, setAutoDestructTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // Socket: listen for live argument updates and vote updates
  const { emit } = useSocket(id, {
    new_argument_live: useCallback((arg) => {
      if (arg.side === 'support') setSupportArgs(prev => [arg, ...prev]);
      else                        setOpposeArgs(prev  => [arg, ...prev]);
    }, []),
    argument_vote_updated: useCallback(({ argumentId, upvotes, downvotes, score }) => {
      const update = (args) => args.map(a => a._id === argumentId ? { ...a, upvotes, downvotes, score } : a);
      setSupportArgs(prev => update(prev));
      setOpposeArgs(prev  => update(prev));
    }, []),
  });

  const fetchDebate = useCallback(async () => {
    try {
      const { data } = await debateAPI.getOne(id);
      setDebate(data.debate);
    } catch {
      toast.error('Debate not found.');
      router.push('/debates');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const fetchArguments = useCallback(async () => {
    if (!id) return;
    setLoadingArgs(true);
    try {
      const [supRes, oppRes] = await Promise.all([
        argumentAPI.getAll(id, { side: 'support', sort, limit: 50 }),
        argumentAPI.getAll(id, { side: 'oppose',  sort, limit: 50 }),
      ]);
      setSupportArgs(supRes.data.arguments);
      setOpposeArgs(oppRes.data.arguments);
    } catch {
      toast.error('Failed to load arguments.');
    } finally {
      setLoadingArgs(false);
    }
  }, [id, sort]);

  useEffect(() => { fetchDebate(); }, [fetchDebate]);
  useEffect(() => { if (debate) fetchArguments(); }, [debate, fetchArguments]);

  useEffect(() => {
    let cancelled = false;

    if (!user || !id) {
      setBookmarked(false);
      return undefined;
    }

    const loadBookmarkState = async () => {
      try {
        const { data } = await userAPI.getBookmarks();
        if (!cancelled) {
          setBookmarked(data.debates.some((savedDebate) => savedDebate._id === id));
        }
      } catch {
        if (!cancelled) setBookmarked(false);
      }
    };

    loadBookmarkState();

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  // Handle AI Auto-Destruct Triggers
  useEffect(() => {
    if (!user?.settings?.autoDestruct || debate?.status === 'closed') return;
    const totalCurrentArgs = supportArgs.length + opposeArgs.length;
    if (totalCurrentArgs > 0) {
      setTimerActive(true);
      setAutoDestructTimer(60);
    }
  }, [supportArgs.length, opposeArgs.length, user?.settings?.autoDestruct, debate?.status]);

  useEffect(() => {
    let interval;
    if (timerActive && autoDestructTimer > 0) {
      interval = setInterval(() => setAutoDestructTimer(prev => prev - 1), 1000);
    } else if (timerActive && autoDestructTimer === 0) {
      setTimerActive(false);
      toast('AI auto-destruct timer expired. No automatic rebuttal was posted.', {
        icon: '🤖',
        style: { background: 'var(--accent)', color: '#fff' },
        duration: 4000,
      });
    }
    return () => clearInterval(interval);
  }, [timerActive, autoDestructTimer, supportArgs.length, opposeArgs.length]);

  const handleNewArgument = (newArg) => {
    if (newArg.parentArgument) { fetchArguments(); return; }
    if (newArg.side === 'support') setSupportArgs(prev => [newArg, ...prev]);
    else                           setOpposeArgs(prev  => [newArg, ...prev]);
    setDebate(prev => ({
      ...prev,
      totalArguments: (prev.totalArguments || 0) + 1,
      supportCount: newArg.side === 'support' ? (prev.supportCount || 0) + 1 : prev.supportCount,
      opposeCount:  newArg.side === 'oppose'  ? (prev.opposeCount  || 0) + 1 : prev.opposeCount,
    }));
    setReplyTarget(null);
    // Broadcast to other users in the room
    emit('argument_posted', { debateId: id, argument: newArg });
  };

  const handleBookmark = async () => {
    if (!user) return toast.error('Sign in to bookmark.');
    try {
      const { data } = await userAPI.toggleBookmark(id);
      setBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? 'Debate bookmarked!' : 'Bookmark removed.');
    } catch {
      toast.error('Failed to bookmark.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Navbar />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div className="shimmer" style={{ height: 220, borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[0,1].map(i => <div key={i} className="shimmer" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!debate) return null;

  const total      = (debate.supportCount || 0) + (debate.opposeCount || 0);
  const supportPct = total > 0 ? Math.round((debate.supportCount / total) * 100) : 50;
  const opposePct  = 100 - supportPct;
  const isClosed   = debate.status === 'closed';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />

      {debate.bannerImage && (
        <div style={{ height: 200, overflow: 'hidden', background: 'var(--bg-subtle)' }}>
          <img src={debate.bannerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Debate header */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.25rem,3vw,2rem)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.78rem', fontWeight: 500, padding: '0.2rem 0.625rem', borderRadius: 999, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {debate.category}
            </span>
            {isClosed
              ? <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.625rem', borderRadius: 999, background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>Closed</span>
              : <CountdownDisplay endTime={debate.endTime} />
            }
            {debate.winner && (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: 999, background: debate.winner === 'support' ? 'rgba(13,188,122,0.12)' : debate.winner === 'oppose' ? 'rgba(240,80,110,0.1)' : 'var(--bg-subtle)', color: debate.winner === 'support' ? 'var(--accent-green)' : debate.winner === 'oppose' ? 'var(--accent)' : 'var(--text-muted)' }}>
                🏆 {debate.winner === 'tie' ? 'Tied' : `${debate.winner.charAt(0).toUpperCase() + debate.winner.slice(1)} won`}
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.75rem' }}>
            {debate.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '1.25rem' }}>
            {debate.description}
          </p>

          {debate.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {debate.tags.map(t => (
                <span key={t} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 999, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Vote bar */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--accent-green)' }}>✓ Support — {debate.supportCount || 0} ({supportPct}%)</span>
              <span style={{ color: 'var(--accent)' }}>({opposePct}%) {debate.opposeCount || 0} — Oppose ✗</span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: 'var(--bg-subtle)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${supportPct}%`, background: 'var(--accent-green)', transition: 'width 0.6s ease' }} />
              <div style={{ flex: 1, background: 'var(--accent)' }} />
            </div>
          </div>

          {user?.settings?.autoDestruct && timerActive && (
            <div style={{ padding: '0.75rem', background: 'rgba(240,80,110,0.1)', border: '1px solid var(--accent)', borderRadius: 8, marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem' }}>🤖 AI Auto-Destruct Armed (Idle opponent tracking)</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 'bold' }}>00:{autoDestructTimer.toString().padStart(2, '0')}</span>
            </div>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <img src={debate.creator?.avatar || `https://ui-avatars.com/api/?name=${debate.creator?.username}&background=random&length=1&color=fff&size=32&bold=true`} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              <span>by <strong style={{ color: 'var(--text-secondary)' }}>{debate.creator?.username}</strong></span>
              <span>· 💬 {debate.totalArguments || 0}</span>
              <span>· ▲ {debate.totalVotes || 0}</span>
              <span>· 👁 {debate.viewCount || 0}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" size="sm" onClick={handleBookmark}>{bookmarked ? '🔖 Saved' : '🔖 Save'}</Button>
              <Button variant="secondary" size="sm" onClick={handleShare}>🔗 Share</Button>
              {!isClosed && user && (
                <Button variant="primary" size="sm" onClick={() => document.getElementById('arg-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  + Argue
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main layout: arguments + chat */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Arguments section */}
          <div>
            {/* Mobile tab selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[['both','Both sides'],['support','✓ Support'],['oppose','✗ Oppose']].map(([v,l]) => (
                <button key={v} onClick={() => setActiveTab(v)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', border: 'none', background: activeTab === v ? 'var(--brand)' : 'var(--bg-elevated)', color: activeTab === v ? '#fff' : 'var(--text-secondary)' }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {SORT_OPTIONS.map(({ value, label }) => (
                  <button key={value} onClick={() => setSort(value)}
                    style={{ padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', border: '1px solid', borderColor: sort === value ? 'var(--brand)' : 'var(--border)', background: sort === value ? 'var(--brand-light)' : 'transparent', color: sort === value ? 'var(--brand)' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Two-column arguments */}
            <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'both' ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
              {(activeTab === 'both' || activeTab === 'support') && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(13,188,122,0.08)', border: '1px solid rgba(13,188,122,0.2)' }}>
                    <span>✓</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '0.9375rem' }}>Supporting</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 600 }}>{supportArgs.length}</span>
                  </div>
                  {loadingArgs ? Array.from({length:2}).map((_,i) => <div key={i} className="shimmer" style={{ height: 130, borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }} />)
                    : supportArgs.length === 0
                    ? <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>No support arguments yet.</div>
                    : supportArgs.map(arg => <ArgumentCard key={arg._id} argument={arg} debateStatus={debate.status} onReply={a => setReplyTarget(prev => prev?._id === a._id ? null : a)} />)
                  }
                  {replyTarget?.side === 'support' && (
                    <ArgumentForm debateId={id} parentArgument={replyTarget} onSuccess={handleNewArgument} onCancel={() => setReplyTarget(null)} />
                  )}
                </div>
              )}

              {(activeTab === 'both' || activeTab === 'oppose') && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(240,80,110,0.08)', border: '1px solid rgba(240,80,110,0.2)' }}>
                    <span>✗</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.9375rem' }}>Opposing</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>{opposeArgs.length}</span>
                  </div>
                  {loadingArgs ? Array.from({length:2}).map((_,i) => <div key={i} className="shimmer" style={{ height: 130, borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }} />)
                    : opposeArgs.length === 0
                    ? <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>No oppose arguments yet.</div>
                    : opposeArgs.map(arg => <ArgumentCard key={arg._id} argument={arg} debateStatus={debate.status} onReply={a => setReplyTarget(prev => prev?._id === a._id ? null : a)} />)
                  }
                  {replyTarget?.side === 'oppose' && (
                    <ArgumentForm debateId={id} parentArgument={replyTarget} onSuccess={handleNewArgument} onCancel={() => setReplyTarget(null)} />
                  )}
                </div>
              )}
            </div>

            {/* Post argument form */}
            {!isClosed && user && (
              <div id="arg-form" style={{ marginTop: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '1rem' }}>Add your argument</h3>
                <ArgumentForm debateId={id} onSuccess={handleNewArgument} />
              </div>
            )}

            {!user && !isClosed && (
              <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Sign in to post arguments and vote.</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <Button variant="secondary" size="md" onClick={() => router.push('/auth/login')}>Sign in</Button>
                  <Button variant="primary"   size="md" onClick={() => router.push('/auth/register')}>Join free</Button>
                </div>
              </div>
            )}
          </div>

          {/* Live Chat sidebar */}
          <div style={{ position: 'sticky', top: 80 }}>
            <LiveChat debateId={id} debateStatus={debate.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
