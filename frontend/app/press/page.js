import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function PressPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Press & Media</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 3rem' }}>
          Media assets, brand guidelines, and press releases.
        </p>
        
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'var(--bg-surface)', border: '1px dotted var(--border-strong)', padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗞️</div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>For media inquiries</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Reach out to <strong>press@debatehub.co</strong>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
