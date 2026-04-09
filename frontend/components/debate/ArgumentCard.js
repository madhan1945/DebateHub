'use client';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { argumentAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ArgumentCard({ argument: initialArg, debateStatus, onReply }) {
  const { user } = useAuth();
  const [arg, setArg]             = useState(initialArg);
  const [myVote, setMyVote]       = useState(null);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies]     = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [voting, setVoting]       = useState(false);

  const isOwn    = user?._id === arg.author?._id;
  const isClosed = debateStatus === 'closed';

  const handleVote = async (voteType) => {
    if (!user) return toast.error('Sign in to vote.');
    if (isOwn)   return toast.error('Cannot vote on your own argument.');
    if (isClosed) return toast.error('Debate is closed.');
    if (voting)  return;

    // Haptic Feedback Setting
    if (user.settings?.hapticFeedback && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    // Incognito Voting Logic Visuals
    if (user.settings?.incognitoVote) {
      toast.success('Vote cast invisibly', { icon: '🕵️' });
    }

    setVoting(true);
    try {
      const { data } = await argumentAPI.vote(arg._id, voteType);
      setArg(prev => ({ ...prev, upvotes: data.upvotes, downvotes: data.downvotes, score: data.score }));
      setMyVote(prev => {
        if (data.action === 'removed') return null;
        return voteType;
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Vote failed.');
    } finally {
      setVoting(false);
    }
  };

  const loadReplies = async () => {
    if (showReplies) { setShowReplies(false); return; }
    setLoadingReplies(true);
    try {
      const { data } = await argumentAPI.getReplies(arg._id);
      setReplies(data.replies);
      setShowReplies(true);
    } catch {
      toast.error('Could not load replies.');
    } finally {
      setLoadingReplies(false);
    }
  };

  const sideColor = arg.side === 'support' ? 'var(--accent-green)' : 'var(--accent)';
  const sideBg    = arg.side === 'support' ? 'rgba(13,188,122,0.08)' : 'rgba(240,80,110,0.08)';
  const indentPx  = arg.depth * 20;

  return (
    <div 
      className="animate-fade-in" 
      style={{ 
        marginLeft: indentPx, 
        borderLeft: arg.depth > 0 ? `2px solid var(--border)` : 'none', 
        paddingLeft: arg.depth > 0 ? '1rem' : 0,
        animationDelay: `${arg.depth * 0.1}s`,
        animationFillMode: 'both' // Ensures it stays invisible before the delay
      }}
    >
      <div
        className="argument-panel"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderLeft: `3px solid ${sideColor}`,
          borderRadius: 'var(--radius-md)',
          padding: '1.125rem',
          marginBottom: '0.75rem',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateX(2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={arg.author?.avatar || `https://ui-avatars.com/api/?name=${arg.author?.username}&background=random&length=1&color=fff&size=32&bold=true`}
              alt={arg.author?.username}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{arg.author?.username}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                ⚡ {arg.author?.reputationPoints || 0}
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 999, background: sideBg, color: sideColor }}>
            {arg.side === 'support' ? '✓ Support' : '✗ Oppose'}
          </span>
        </div>

        {/* Content */}
        {arg.isDeleted ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>[deleted]</p>
        ) : arg.isFlagged && !user?.settings?.hardcoreToxicity ? (
          <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px dashed var(--accent)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
             🛡️ This argument was flagged by safety protocols.<br/>(Turn on <b>Ruthless Toxicity Mode</b> in Settings to view).
          </div>
        ) : (
          <p style={{ color: arg.isFlagged ? 'var(--accent)' : 'var(--text-primary)', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
            {arg.isFlagged && <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>[⚠️ TOXIC WARNING FLAG BYPASSED]</span>}
            {arg.content}
          </p>
        )}

        {/* Reference links */}
        {arg.referenceLinks?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {arg.referenceLinks.map((ref, i) => (
              <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.78rem', color: 'var(--brand)', background: 'var(--brand-light)', padding: '0.15rem 0.5rem', borderRadius: 6, textDecoration: 'none' }}>
                🔗 {ref.label || 'Reference'}
              </a>
            ))}
          </div>
        )}

        {/* Action row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Upvote */}
          <button
            className="vote-btn"
            onClick={() => handleVote('upvote')}
            disabled={voting || isOwn || isClosed}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.3rem 0.625rem', borderRadius: 8,
              border: `1px solid ${myVote === 'upvote' ? 'var(--accent-green)' : 'var(--border)'}`,
              background: myVote === 'upvote' ? 'rgba(13,188,122,0.1)' : 'transparent',
              color: myVote === 'upvote' ? 'var(--accent-green)' : 'var(--text-secondary)',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              opacity: (isOwn || isClosed) ? 0.4 : 1,
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'scale(1)')}
          >
            ▲ {arg.upvotes || 0}
          </button>

          {/* Downvote */}
          <button
            className="vote-btn"
            onClick={() => handleVote('downvote')}
            disabled={voting || isOwn || isClosed}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.3rem 0.625rem', borderRadius: 8,
              border: `1px solid ${myVote === 'downvote' ? 'var(--accent)' : 'var(--border)'}`,
              background: myVote === 'downvote' ? 'rgba(240,80,110,0.08)' : 'transparent',
              color: myVote === 'downvote' ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              opacity: (isOwn || isClosed) ? 0.4 : 1,
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'scale(1)')}
          >
            ▼ {arg.downvotes || 0}
          </button>

          {/* Score */}
          <span style={{ fontSize: '0.8rem', color: (arg.score || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent)', fontWeight: 600 }}>
            {(arg.score || 0) >= 0 ? '+' : ''}{arg.score || 0}
          </span>

          {/* Divider */}
          <div style={{ flex: 1 }} />

          {/* Replies toggle */}
          {arg.replyCount > 0 && (
            <button
              onClick={loadReplies}
              disabled={loadingReplies}
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              💬 {arg.replyCount} {showReplies ? '▲' : '▼'}
            </button>
          )}

          {/* Reply button */}
          {!isClosed && user && arg.depth < 3 && (
            <button
              onClick={() => onReply && onReply(arg)}
              style={{ fontSize: '0.8rem', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              ↩ Reply
            </button>
          )}

          {/* Timestamp */}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {new Date(arg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && replies.map(reply => (
        <ArgumentCard key={reply._id} argument={reply} debateStatus={debateStatus} onReply={onReply} />
      ))}
    </div>
  );
}
