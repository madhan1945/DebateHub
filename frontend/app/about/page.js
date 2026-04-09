import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>About DebateHub</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 3rem' }}>
          We are on a mission to organize the world's arguments and make debate accessible, structured, and conclusive.
        </p>
        <div style={{ maxWidth: 800, margin: '0 auto', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <p>Founded with the belief that echo chambers break society apart, DebateHub leverages robust UI structures to enforce logical parrying over emotional shouting.</p>
          <p>Our platform enforces constraints that breed critical thinking. From live voting metrics that penalize logical fallacies, to Anthropic's Claude maintaining a strict baseline against toxicity, we ensure that the best arguments rise to the surface.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
