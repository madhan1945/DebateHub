import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function GuidelinesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* Hero */}
      <div style={{ background: 'var(--brand-dark, var(--brand))', color: '#fff', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '1rem' }}>Community Guidelines</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: 600, margin: '0 auto' }}>To keep DebateHub a sanctuary for rigorous logic, we enforce a few essential rules of engagement.</p>
      </div>

      <div style={{ maxWidth: 800, margin: '4rem auto', padding: '0 1.5rem', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1, width: '100%' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(86,103,240,0.1)', color: 'var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Be Respectful</h2>
              <p>Debate the argument, not the person. Ad hominem attacks, name-calling, and harassment are strictly prohibited and will be caught by our AI moderation systems.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(86,103,240,0.1)', color: 'var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Back Up Your Claims</h2>
              <p>Good debates rely on actionable evidence. Whenever possible, link to credible sources to support your stance rather than relying purely on conjecture.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(86,103,240,0.1)', color: 'var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Argue in Good Faith</h2>
              <p>Do not intentionally use logical fallacies or derail conversations. Obvious troll behavior will result in severe reputation penalties and potential account suspension by admins.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(86,103,240,0.1)', color: 'var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0 }}>4</div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Maintain Clear Formatting</h2>
              <p>Please use clear formatting. Avoid posting unreadable walls of text; utilize paragraph breaks, bold key points, and use succinct language to ensure the community can process your arguments effectively.</p>
            </div>
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
}
