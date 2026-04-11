'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../../components/layout/Navbar';
import DebateCard from '../../components/debate/DebateCard';
import Button from '../../components/ui/Button';
import { debateAPI } from '../../lib/api';
import { useRouter } from '@/lib/navigation';
import { useAuth } from '../../lib/auth';

const CATEGORIES = ['All','Technology','Education','Environment','Business','Politics','Science','Health','Society','Culture','Sports','Other'];
const SORTS = [
  { value: 'newest',       label: '🕐 Newest' },
  { value: 'popular',      label: '🔥 Popular' },
  { value: 'trending',     label: '📈 Trending' },
  { value: 'closing_soon', label: '⏱ Closing soon' },
];

export default function DebatesPage() {
  const router   = useRouter();
  const { user } = useAuth();

  const [debates, setDebates]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]     = useState(false);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory]   = useState('All');
  const [sort, setSort]           = useState('newest');
  const [status, setStatus]       = useState('all');
  const loaderRef = useRef(null);

  const fetchDebates = useCallback(async (pageNum = 1, replace = true) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = { page: pageNum, limit: 12, sort };
      if (category !== 'All') params.category = category;
      if (status !== 'all')   params.status    = status;
      if (search)             params.search    = search;

      const { data } = await debateAPI.getAll(params);
      setDebates(prev => replace ? data.debates : [...prev, ...data.debates]);
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch {
      // silently fail — user sees empty state
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, sort, status, search]);

  useEffect(() => { fetchDebates(1, true); }, [fetchDebates]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore) {
        fetchDebates(page + 1, false);
      }
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, page, fetchDebates]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />

      {/* Page header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '2rem 1.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                All Debates
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Browse, filter, and join the conversation.
              </p>
            </div>
            {user && (
              <Button variant="primary" size="md" onClick={() => router.push('/debates/create')}>
                + Create debate
              </Button>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search debates..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="input-base"
                style={{ paddingLeft: '2.5rem', height: 40 }}
              />
            </div>
            <Button type="submit" variant="secondary" size="md">Search</Button>
            {search && <Button type="button" variant="ghost" size="md" onClick={() => { setSearch(''); setSearchInput(''); }}>✕</Button>}
          </form>

          {/* Filters row */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status tabs */}
            {[['active', 'Live'], ['closed', 'Closed'], ['all', 'All']].map(([v, l]) => (
              <button key={v} onClick={() => setStatus(v)}
                style={{
                  padding: '0.35rem 0.875rem', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: status === v ? 'var(--brand)' : 'var(--bg-elevated)',
                  color: status === v ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}>
                {l}
              </button>
            ))}

            <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 0.25rem' }} />

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', padding: '0.35rem 0.75rem', cursor: 'pointer',
              }}
            >
              {SORTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{
                  padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
                  border: '1px solid',
                  borderColor: category === c ? 'var(--brand)' : 'var(--border)',
                  background: category === c ? 'var(--brand-light)' : 'transparent',
                  color: category === c ? 'var(--brand)' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Debates grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer" style={{ height: 220, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : debates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗣️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              No debates found
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {search ? `No results for "${search}"` : 'Be the first to start one!'}
            </p>
            {user && <Button variant="primary" size="md" onClick={() => router.push('/debates/create')}>Create a debate</Button>}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
              {debates.map(debate => <DebateCard key={debate._id} debate={debate} />)}
            </div>

            {/* Infinite scroll loader */}
            <div ref={loaderRef} style={{ display: 'flex', justifyContent: 'center', padding: '2rem', height: 60 }}>
              {loadingMore && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <svg className="animate-spin" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Loading more...
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
