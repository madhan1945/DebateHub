'use client';
import { useState, useEffect } from 'react';
import Link from '@/components/navigation/Link';
import { useRouter } from '@/lib/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../../../lib/auth';
import { authAPI } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PASSWORD_RULES = [
  { label: 'At least 6 characters', test: v => v.length >= 6 },
  { label: 'One uppercase letter', test: v => /[A-Z]/.test(v) },
  { label: 'One number',           test: v => /\d/.test(v) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [form, setForm]     = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed]   = useState(false);

  useEffect(() => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCallback });
      window.google?.accounts.id.renderButton(
        document.getElementById('google-register-btn'),
        { theme: 'outline', size: 'large', width: '100%', text: 'signup_with' }
      );
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleGoogleCallback = async ({ credential }) => {
    try {
      setLoading(true);
      const { data } = await authAPI.googleAuth(credential);
      login(data.token, data.user);
      toast.success(`Welcome to DebateHub, ${data.user.username}! 🎉`);
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Only letters, numbers, and underscores';

    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';

    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';

    if (!agreed) e.agreed = 'You must agree to the terms';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authAPI.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      login(data.token, data.user);
      toast.success(`Account created! Welcome, ${data.user.username} 🎉`);
      router.push('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      if (msg.toLowerCase().includes('username')) setErrors(e => ({ ...e, username: msg }));
      if (msg.toLowerCase().includes('email'))    setErrors(e => ({ ...e, email: msg }));
    } finally {
      setLoading(false);
    }
  };

  const passStrength = PASSWORD_RULES.filter(r => r.test(form.password)).length;
  const strengthColor = ['var(--accent)', 'var(--accent-amber)', 'var(--accent-green)'][passStrength - 1] || 'var(--border)';
  const strengthLabel = ['Weak', 'Fair', 'Strong'][passStrength - 1] || '';

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.75rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to home
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: '#1a1422', marginBottom: '0.5rem' }}>
          Create your account
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Free forever. No credit card needed.
        </p>
      </div>

      {/* Google */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div id="google-register-btn" style={{ minHeight: 44 }} />
        {!process.env.VITE_GOOGLE_CLIENT_ID && (
          <button
            type="button"
            onClick={() => toast.error('Add VITE_GOOGLE_CLIENT_ID to .env.local')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.7rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.9375rem', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        )}
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or sign up with email</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Username"
          name="username"
          placeholder="your_username"
          value={form.username}
          onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setErrors(er => ({ ...er, username: '' })); }}
          error={errors.username}
          hint="Letters, numbers, and underscores only"
          autoComplete="username"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          }
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
          error={errors.email}
          autoComplete="email"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          }
        />

        <div>
          <Input
            label="Password"
            name="password"
            type={showPass ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={form.password}
            onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })); }}
            error={errors.password}
            autoComplete="new-password"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            }
          />
          {/* Strength bar */}
          {form.password && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '0.35rem' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < passStrength ? strengthColor : 'var(--border)', transition: 'background 0.3s' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {PASSWORD_RULES.map(({ label, test }) => (
                  <span key={label} style={{ fontSize: '0.75rem', color: test(form.password) ? 'var(--accent-green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {test(form.password) ? '✓' : '○'} {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
          name="confirm"
          type={showPass ? 'text' : 'password'}
          placeholder="Repeat your password"
          value={form.confirm}
          onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setErrors(er => ({ ...er, confirm: '' })); }}
          error={errors.confirm}
          autoComplete="new-password"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          }
        />

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.8625rem', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '0.25rem' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => { setAgreed(e.target.checked); setErrors(er => ({ ...er, agreed: '' })); }}
            style={{ accentColor: 'var(--brand)', marginTop: 2, flexShrink: 0 }}
          />
          <span>
            I agree to the{' '}
            <Link href="/terms" style={{ color: 'var(--brand)', textDecoration: 'none' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: 'var(--brand)', textDecoration: 'none' }}>Privacy Policy</Link>
          </span>
        </label>
        {errors.agreed && <span style={{ fontSize: '0.8125rem', color: 'var(--accent)' }}>{errors.agreed}</span>}

        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '0.25rem' }}>
          Create account
        </Button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link href="/auth/login" style={{ color: 'var(--brand)', fontWeight: 500, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
