'use client';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { argumentAPI } from '../../lib/api';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export default function ArgumentForm({ debateId, defaultSide, parentArgument, onSuccess, onCancel }) {
  const { user } = useAuth();
  const isReply  = !!parentArgument;

  const [form, setForm] = useState({
    content: '',
    side: defaultSide || 'support',
    refUrl: '',
    refLabel: '',
  });
  const [loading, setLoading] = useState(false);
  const charCount = form.content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return toast.error('Write your argument first.');
    if (form.content.trim().length < 10) return toast.error('Argument too short (min 10 chars).');

    const payload = {
      content:  form.content.trim(),
      side:     isReply ? parentArgument.side : form.side,
      parentArgumentId: parentArgument?._id || null,
      referenceLinks: form.refUrl.trim()
        ? [{ url: form.refUrl.trim(), label: form.refLabel.trim() || form.refUrl }]
        : [],
    };

    setLoading(true);
    try {
      const { data } = await argumentAPI.create(debateId, payload);
      setForm({ content: '', side: defaultSide || 'support', refUrl: '', refLabel: '' });
      toast.success(isReply ? 'Reply posted!' : 'Argument posted!');
      onSuccess?.(data.argument);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post argument.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {isReply && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Replying to <strong style={{ color: 'var(--text-primary)' }}>{parentArgument.author?.username}</strong>
          </span>
          {onCancel && (
            <button type="button" onClick={onCancel}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
              ✕ Cancel
            </button>
          )}
        </div>
      )}

      {/* Side selector — only for top-level */}
      {!isReply && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['support', 'oppose'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setForm(f => ({ ...f, side: s }))}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)',
                border: `2px solid ${form.side === s ? (s === 'support' ? 'var(--accent-green)' : 'var(--accent)') : 'var(--border)'}`,
                background: form.side === s
                  ? (s === 'support' ? 'rgba(13,188,122,0.1)' : 'rgba(240,80,110,0.08)')
                  : 'transparent',
                color: form.side === s
                  ? (s === 'support' ? 'var(--accent-green)' : 'var(--accent)')
                  : 'var(--text-secondary)',
                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {s === 'support' ? '✓ I support this' : '✗ I oppose this'}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          placeholder={isReply ? 'Write your reply...' : 'Make your case. Be clear, factual, and persuasive.'}
          rows={isReply ? 3 : 5}
          maxLength={3000}
          style={{
            width: '100%', resize: 'vertical',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.9375rem',
            fontFamily: 'var(--font-body)',
            padding: '0.75rem 1rem',
            lineHeight: 1.6,
            transition: 'border-color 0.2s, box-shadow 0.2s',
            outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-glow)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
        />
        <span style={{ position: 'absolute', bottom: 10, right: 12, fontSize: '0.75rem', color: charCount > 2800 ? 'var(--accent)' : 'var(--text-muted)' }}>
          {charCount}/3000
        </span>
      </div>

      {/* Optional reference link */}
      <details style={{ fontSize: '0.85rem' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', userSelect: 'none' }}>
          + Add reference link (optional)
        </summary>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="url"
            placeholder="https://..."
            value={form.refUrl}
            onChange={e => setForm(f => ({ ...f, refUrl: e.target.value }))}
            className="input-base"
            style={{ flex: 2, minWidth: 160, fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
          />
          <input
            type="text"
            placeholder="Label (optional)"
            value={form.refLabel}
            onChange={e => setForm(f => ({ ...f, refLabel: e.target.value }))}
            className="input-base"
            style={{ flex: 1, minWidth: 120, fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
          />
        </div>
      </details>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" variant="primary" size="sm" loading={loading}>
          {isReply ? 'Post reply' : 'Post argument'}
        </Button>
      </div>
    </form>
  );
}
