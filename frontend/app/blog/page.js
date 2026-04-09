import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function BlogPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '0.4rem 1rem', background: 'var(--brand-light)', color: 'var(--brand)', borderRadius: 999, fontWeight: 600, fontSize: '0.875rem', marginBottom: '1.5rem' }}>Coming Soon</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>The DebateHub Blog</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 3rem' }}>
          Deep dives into logic, philosophy, platform engineering, and community highlights.
        </p>
        <div style={{ height: 2, background: 'var(--bg-elevated)', maxWidth: 200, margin: '0 auto' }} />
      </div>
      <Footer />
    </div>
  );
}
