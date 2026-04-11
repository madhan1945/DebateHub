'use client';
import { useState, useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import Navbar from '../../../components/layout/Navbar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { debateAPI } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import toast from 'react-hot-toast';

const CATEGORIES = ['Technology','Education','Environment','Business','Politics','Science','Health','Society','Culture','Sports','Other'];
const DURATIONS  = [
  { label: '1 hour',   value: 1 },
  { label: '6 hours',  value: 6 },
  { label: '12 hours', value: 12 },
  { label: '1 day',    value: 24 },
  { label: '3 days',   value: 72 },
  { label: '1 week',   value: 168 },
  { label: '2 weeks',  value: 336 },
  { label: '1 month',  value: 720 },
];

export default function CreateDebatePage() {
  const router   = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    title: '', description: '', category: 'Technology',
    durationHours: 24, tagInput: '', tags: [], bannerImage: '',
  });
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login');
  }, [user, authLoading, router]);

  const addTag = () => {
    const t = form.tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!t || form.tags.includes(t) || form.tags.length >= 8) return;
    setForm(f => ({ ...f, tags: [...f.tags, t], tagInput: '' }));
  };
  const removeTag = (t) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.trim().length < 10) e.title = 'Title must be at least 10 characters.';
    if (form.title.trim().length > 200) e.title = 'Title too long (max 200 chars).';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Description must be at least 20 characters.';
    if (!form.category) e.category = 'Please select a category.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await debateAPI.create({
        title:        form.title.trim(),
        description:  form.description.trim(),
        category:     form.category,
        tags:         form.tags,
        durationHours: form.durationHours,
        bannerImage:  form.bannerImage.trim(),
      });
      toast.success('Debate created! 🎉');
      router.push(`/debates/${data.debate._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create debate.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Create a debate
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Frame a clear topic. The best debates are specific and arguable on both sides.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Title */}
          <Input
            label="Debate title *"
            name="title"
            placeholder="Should AI replace human judges in legal proceedings?"
            value={form.title}
            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: '' })); }}
            error={errors.title}
            hint={`${form.title.length}/200 — phrase it as a Yes/No or should/shouldn't question for best results`}
          />

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
              Description *
            </label>
            <textarea
              placeholder="Provide context. What's the debate about? What should arguers consider? Why does this matter?"
              value={form.description}
              onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setErrors(er => ({ ...er, description: '' })); }}
              rows={5}
              maxLength={2000}
              style={{
                width: '100%', resize: 'vertical',
                background: 'var(--bg-elevated)', border: `1px solid ${errors.description ? 'var(--accent)' : 'var(--border-strong)'}`,
                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)', fontSize: '0.9375rem', padding: '0.75rem 1rem',
                lineHeight: 1.6, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-glow)'; }}
              onBlur={e => { e.target.style.borderColor = errors.description ? 'var(--accent)' : 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
              {errors.description
                ? <span style={{ fontSize: '0.8125rem', color: 'var(--accent)' }}>{errors.description}</span>
                : <span />
              }
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{form.description.length}/2000</span>
            </div>
          </div>

          {/* Category + Duration in grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                Category *
              </label>
              <select
                value={form.category}
                onChange={e => { setForm(f => ({ ...f, category: e.target.value })); setErrors(er => ({ ...er, category: '' })); }}
                style={{
                  width: '100%', background: 'var(--bg-elevated)', border: `1px solid ${errors.category ? 'var(--accent)' : 'var(--border-strong)'}`,
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem', padding: '0.75rem 1rem', cursor: 'pointer',
                }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span style={{ fontSize: '0.8125rem', color: 'var(--accent)' }}>{errors.category}</span>}
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                Duration *
              </label>
              <select
                value={form.durationHours}
                onChange={e => setForm(f => ({ ...f, durationHours: parseInt(e.target.value) }))}
                style={{
                  width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem', padding: '0.75rem 1rem', cursor: 'pointer',
                }}
              >
                {DURATIONS.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
              Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional, max 8)</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Add a tag and press Enter or Add"
                value={form.tagInput}
                onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                className="input-base"
                style={{ flex: 1 }}
                maxLength={30}
              />
              <Button type="button" variant="secondary" size="md" onClick={addTag} disabled={!form.tagInput.trim() || form.tags.length >= 8}>
                Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.625rem' }}>
                {form.tags.map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 500, padding: '0.2rem 0.5rem 0.2rem 0.7rem', borderRadius: 999, background: 'var(--brand-light)', color: 'var(--brand)' }}>
                    #{t}
                    <button type="button" onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', lineHeight: 1, padding: '0 2px', fontSize: '0.85rem' }}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Banner image (optional) */}
          <Input
            label="Banner image URL (optional)"
            name="bannerImage"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={form.bannerImage}
            onChange={e => setForm(f => ({ ...f, bannerImage: e.target.value }))}
            hint="Paste a direct image URL for a header image on your debate"
          />

          {/* Preview close time */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            ⏱ Debate will close{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {new Date(Date.now() + form.durationHours * 3600000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </strong>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" variant="primary" size="lg" loading={submitting}>
              Launch debate 🚀
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
