'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../lib/auth';
import { useSocket } from '../../lib/useSocket';

export default function LiveChat({ debateId, debateStatus }) {
  const { user }    = useAuth();
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [participants, setParticipants] = useState([]);
  const [typingUsers, setTypingUsers]   = useState([]);
  const [sending, setSending]     = useState(false);
  const [isOpen, setIsOpen]       = useState(true);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const typingTimer = useRef(null);

  const handlers = {
    chat_history:        useCallback((history) => setMessages(history), []),
    new_message:         useCallback((msg) => setMessages(prev => [...prev, msg]), []),
    user_joined:         useCallback((data) => setMessages(prev => [...prev, { _id: Date.now(), type: 'join',  message: data.message, createdAt: new Date() }]), []),
    user_left:           useCallback((data) => setMessages(prev => [...prev, { _id: Date.now(), type: 'leave', message: data.message, createdAt: new Date() }]), []),
    participants_update: useCallback((data) => setParticipants(data.participants), []),
    user_typing:         useCallback(({ username }) => {
      setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username]);
      setTimeout(() => setTypingUsers(prev => prev.filter(u => u !== username)), 3000);
    }, []),
    user_stopped_typing: useCallback(({ username }) => {
      setTypingUsers(prev => prev.filter(u => u !== username));
    }, []),
  };

  const { emit } = useSocket(debateId, handlers);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending || !user) return;
    setSending(true);
    emit('send_message', { debateId, message: input.trim() });
    setInput('');
    setSending(false);
    emit('typing_stop', { debateId });
    clearTimeout(typingTimer.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    emit('typing_start', { debateId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emit('typing_stop', { debateId }), 1500);
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      height: isOpen ? 520 : 52,
      transition: 'height 0.3s ease',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={() => setIsOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1.125rem',
          borderBottom: isOpen ? '1px solid var(--border)' : 'none',
          cursor: 'pointer', flexShrink: 0,
          background: 'var(--bg-elevated)',
          borderRadius: isOpen ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Live Chat</span>
          {participants.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>· {participants.length} online</span>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Online participants strip */}
      {isOpen && participants.length > 0 && (
        <div style={{ display: 'flex', gap: '0.35rem', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', flexShrink: 0 }}>
          {participants.slice(0, 8).map(p => (
            <div key={p.userId} title={p.username}
              style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', border: '2px solid var(--bg-surface)' }}>
              {p.username[0].toUpperCase()}
            </div>
          ))}
          {participants.length > 8 && (
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              +{participants.length - 8}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {isOpen && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', margin: 'auto' }}>
              No messages yet. Start the conversation!
            </div>
          )}
          {messages.map((msg, i) => {
            if (msg.type === 'join' || msg.type === 'leave') {
              return null; // Suppressed system spam
            }
            const isOwn = msg.user?._id?.toString() === user?._id?.toString();
            return (
              <div key={msg._id || i} style={{ display: 'flex', gap: '0.5rem', flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                {!isOwn && (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {msg.user?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div style={{ maxWidth: '75%' }}>
                  {!isOwn && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem', paddingLeft: '0.5rem' }}>
                      {msg.user?.username}
                    </div>
                  )}
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: isOwn ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background: isOwn ? 'var(--brand)' : 'var(--bg-elevated)',
                    color: isOwn ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}>
                    {msg.message}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', textAlign: isOwn ? 'right' : 'left', paddingLeft: isOwn ? 0 : '0.5rem' }}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      {isOpen && (
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {!user ? (
            <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <a href="/auth/login" style={{ color: 'var(--brand)' }}>Sign in</a> to join the chat
            </p>
          ) : debateStatus === 'closed' ? (
            <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Debate closed — chat disabled</p>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Say something..."
                value={input}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                maxLength={500}
                style={{
                  flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)', fontSize: '0.875rem', padding: '0.5rem 0.875rem',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                style={{
                  width: 38, height: 38, borderRadius: 'var(--radius-md)', border: 'none',
                  background: input.trim() ? 'var(--brand)' : 'var(--bg-subtle)',
                  color: input.trim() ? '#fff' : 'var(--text-muted)',
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
