'use client';
import Link from '@/components/navigation/Link';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';

export default function ForgotPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1.5rem', width: '100%', flex: 1 }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.9rem',
              borderRadius: 999,
              background: 'var(--brand-light)',
              color: 'var(--brand)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Account Help
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Password reset
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Self-service password reset is not wired up yet in DebateHub. If you need access back, email us from your registered address and we will help you manually.
          </p>
          <a
            href="mailto:debatehub@gmail.com?subject=Password%20Reset%20Help"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              background: 'var(--brand)',
              color: '#fff',
              fontWeight: 600,
              boxShadow: 'var(--shadow-brand)',
              marginRight: '0.75rem',
            }}
          >
            Email support
          </a>
          <Link
            href="/auth/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.8rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-elevated)',
              fontWeight: 500,
            }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
