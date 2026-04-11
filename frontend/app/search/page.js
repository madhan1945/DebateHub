'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from '@/lib/navigation';
import Navbar from '../../components/layout/Navbar';
import DebateCard from '../../components/debate/DebateCard';
import { searchAPI } from '../../lib/api';
import { useAuth } from '../../lib/auth';

const CATEGORIES = ['All','Technology','Education','Environment','Business','Politics','Science','Health','Society','Culture','Sports','Other'];
const SORTS = [
  { value: 'relevance', label: '⭐ Relevance' },
  { value: 'popular',   label: '🔥 Popular' },
  { value: 'newest',    label: '🕐 Newest' },
  { value: 'closing',   label: '⏱ Closing' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [query, setQuery]       = useState(searchParams.get('q') || '');
  const [input, setInput]       = useState(searchParams.get('q') || '');
  const [results, setResults]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [category, setCategory] = useState('All');
  const [sort, setSort]         = useState('relevance');
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug]   = useState(false);
  const sugTimer = useRef(null);
  const inputRef = useRef(null);

  const doSearch = useCallback(async (q, cat, s) => {
    if (!q || q.trim().length < 2) { setResults([]); setTotal(0); return; }
    setLoading(true);
    try {
      const { data } = await searchAPI.search({
        q: q.trim(), category: cat !== 'All' ? cat : undefined, sort: s, limit: 20,
      });
      setResults(data.results);
      setTotal(data.total);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (query) doSearch(query, category, sort); }, [query, category, sort, doSearch]);

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInput(v);
    clearTimeout(sugTimer.current);
    if (v.trim().length >= 2) {
      sugTimer.current = setTimeout(async () => {
        try {
          const { data } = await searchAPI.getSuggestions(v.trim());
          setSuggestions(data.suggestions);
          setShowSug(true);
        } catch {}
      }, 300);
    } else {
      setSuggestions([]);
      setShowSug(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setShowSug(false);
    setQuery(input.trim());
    router.push(`/search?q=${encodeURIComponent(input.trim())}`, { scroll: false });
  };

  const handleSuggestion = (s) => {
    setInput(s.title);
    setQuery(s.title);
    setShowSug(false);
    router.push(`/search?q=${encodeURIComponent(s.title)}`, { scroll: false });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />

      {/* Search header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '1.25rem', textAlign: 'center' }}>
            Search debates
          </h1>

          {/* Search input with suggestions */}
          <div style={{ position: 'relative' }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for a debate topic..."
                    value={input}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setShowSug(true)}
                    onBlur={() => setTimeout(() => setShowSug(false), 150)}
                    className="input-base"
                    style={{ paddingLeft: '2.75rem', height: 52, fontSize: '1rem' }}
                    autoComplete="off"
                  />
                </div>
                <button type="submit" style={{ padding: '0 1.5rem', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', height: 52, flexShrink: 0, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.target.style.background = 'var(--brand-dark)'}
                  onMouseLeave={e => e.target.style.background = 'var(--brand)'}>
                  Search
                </button>
              </div>
            </form>

            {/* Suggestions dropdown */}
            {showSug && suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 60, background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 50, overflow: 'hidden', marginTop: 4 }}>
                {suggestions.map(s => (
                  <button key={s._id} onMouseDown={() => handleSuggestion(s)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', flex: 1 }}>{s.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results area */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {query && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
                {loading ? 'Searching...' : `${total} result${total !== 1 ? 's' : ''} for "${query}"`}
              </span>
              <div style={{ flex: 1 }} />
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', padding: '0.35rem 0.75rem', cursor: 'pointer' }}>
                {SORTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            {/* Category pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', border: '1px solid', borderColor: category === c ? 'var(--brand)' : 'var(--border)', background: category === c ? 'var(--brand-light)' : 'transparent', color: category === c ? 'var(--brand)' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                  {c}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {[0,1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />)}
              </div>
            ) : results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No results found</h3>
                <p>Try different keywords or browse all debates.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {results.map(d => <DebateCard key={d._id} debate={d} />)}
              </div>
            )}
          </>
        )}

        {!query && (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Search any topic</h3>
            <p style={{ maxWidth: 400, margin: '0 auto' }}>Find debates on AI, climate, education, politics, and more. Type at least 2 characters to get suggestions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
