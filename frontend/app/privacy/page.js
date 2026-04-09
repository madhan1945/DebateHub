import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* Hero */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--bg-elevated)', borderRadius: 999, border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Last Updated: October 2026</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Privacy Policy</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>We believe in transparency. Here is how DebateHub handles your personal data.</p>
      </div>

      <div style={{ maxWidth: 800, margin: '4rem auto', padding: '0 1.5rem', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1, width: '100%' }}>
        <div style={{ paddingLeft: '1.5rem', borderLeft: '4px solid var(--brand)', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1. Data Collection</h2>
          <p>We collect metadata related to your debates, arguments, and reputation scores. Your passwords are encrypted utilizing standard bcrypt hash rounds. No plaintext passwords are ever stored.</p>
        </div>
        
        <div style={{ paddingLeft: '1.5rem', borderLeft: '4px solid var(--brand)', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. Uses of Data</h2>
          <p>Your arguments, once posted, become part of a public forum visible to the community. We strictly use your account database footprint to administer debate moderation, reputation leaderboards, and personalized analytics charts on your dashboard.</p>
        </div>
        
        <div style={{ paddingLeft: '1.5rem', borderLeft: '4px solid var(--brand)', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>3. AI Processing</h2>
          <p>Arguments you post may be sent securely to Anthropic's Claude API for toxicity screening and thread summarizing purposes. None of your PII (personally identifiable information like email or IP) is transmitted to third-party LLMs.</p>
        </div>
        
        <div style={{ paddingLeft: '1.5rem', borderLeft: '4px solid var(--brand)' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>4. Subscriptions</h2>
          <p>All subscription payments are routed through mock checkout gateways (Stripe, UPI, PayPal) on this build, ensuring no actual financial data is processed or retained whatsoever.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
