import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';

export default function CareersPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Join the Team</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 3rem' }}>
          Help us build the most intellectually rigorous platform on the internet.
        </p>
        
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'left' }}>Open Positions</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', transition: 'box-shadow 0.2s', cursor: 'pointer' }}>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Senior Prompt Engineer</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Remote (Global) · Specializing in Anthropic / OpenAI integration</p>
            </div>
            <Button variant="outline" size="sm">Apply</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
