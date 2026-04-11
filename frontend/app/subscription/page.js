'use client';
import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/auth';
import { useRouter } from '@/lib/navigation';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const handleUpgrade = (tier) => {
    if (!user) return router.push('/auth/login');
    setSelectedTier(tier);
    setShowPayment(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          DebateHub Subscriptions
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>Elevate your arguments. Choose the tier that matches your intellect.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          <PriceCard 
            title="Novice (Basic)" 
            price="$0" 
            features={['Access to all public debates', 'Basic voting & commenting', 'Standard UI Theme', 'Contains occasional ads']}
            buttonText="Current Plan"
            variant="outline"
            onClick={() => toast('You are already on the free tier')}
          />
          
          <PriceCard 
            title="Sophist (Pro)" 
            price="$4.99" 
            period="/mo"
            features={['Unlimited arguments per hour', 'Access to detailed AI Thread Summaries', 'Shiny blue "Pro" checkmark', 'Ad-free reading experience']}
            buttonText="Upgrade to Pro"
            variant="primary"
            highlight={true}
            onClick={() => handleUpgrade('Pro')}
          />
          
          <PriceCard 
            title="Philosopher King 👑" 
            price="$12.99" 
            period="/mo"
            features={['Direct 1-on-1 AI debate coaching via Claude 3', 'Generate custom Debate Topics from categories', 'Gold Badge of Honor', 'Everything in the Pro tier']}
            buttonText="Ascend to King"
            variant="secondary"
            onClick={() => handleUpgrade('Philosopher King')}
          />

        </div>
      </div>

      {showPayment && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', width: '90%', maxWidth: 460, position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
            <button onClick={() => setShowPayment(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--bg-subtle)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✖</button>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Upgrade to {selectedTier}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Complete your secure payment below.</p>
            
            {/* Payment Method Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-elevated)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
              {[
                { id: 'card', label: '💳 Card' },
                { id: 'razorpay', label: '⚡ Razorpay' },
                { id: 'paypal', label: '🌐 PayPal' }
              ].map(method => (
                <button 
                  key={method.id} 
                  onClick={() => setPaymentMethod(method.id)}
                  style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: 'var(--radius-sm)', background: paymentMethod === method.id ? 'var(--bg-surface)' : 'transparent', color: paymentMethod === method.id ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: paymentMethod === method.id ? 'var(--shadow-sm)' : 'none', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {method.label}
                </button>
              ))}
            </div>

            {/* Dynamic Payment Form */}
            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block', fontWeight: 500 }}>Card Number</label>
                  <input placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'monospace' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block', fontWeight: 500 }}>Expiry</label>
                    <input placeholder="MM/YY" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block', fontWeight: 500 }}>CVC</label>
                    <input placeholder="123" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block', fontWeight: 500 }}>Cardholder Name</label>
                  <input placeholder="John Doe" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
              </div>
            )}

            {paymentMethod === 'razorpay' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', padding: '0.5rem 0' }}>
                 <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #2b5fe7' }}>
                   <div style={{ color: '#2b5fe7', fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <span>Razorpay Secure</span>
                     <span style={{ fontSize: '0.8rem', background: '#2b5fe7', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>TEST</span>
                   </div>
                   <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block', fontWeight: 500 }}>Mobile Number</label>
                   <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                     <div style={{ padding: '0.75rem', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>+91</div>
                     <input placeholder="9876543210" style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }} />
                   </div>
                   
                   <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block', fontWeight: 500 }}>Email Address</label>
                   <input placeholder="you@example.com" type="email" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }} />
                 </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', padding: '1rem 0' }}>
                 <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                   <span style={{ fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 800, color: '#003087' }}>Pay</span><span style={{ fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 800, color: '#009cde' }}>Pal</span>
                 </div>
                 <div>
                   <input placeholder="Email or mobile number" type="email" style={{ width: '100%', padding: '0.85rem', background: '#fff', border: '1px solid #999', borderRadius: '4px', color: '#333', outline: 'none', fontSize: '1rem' }} />
                 </div>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You will be securely redirected to authenticate and complete your purchase.</p>
              </div>
            )}

            <Button variant="primary" style={{ width: '100%', background: paymentMethod === 'razorpay' ? '#2b5fe7' : paymentMethod === 'paypal' ? '#0070ba' : 'var(--brand)' }} size="lg" loading={paymentProcessing} onClick={() => {
              setPaymentProcessing(true);
              setTimeout(() => {
                setPaymentProcessing(false);
                setShowPayment(false);
                toast.success(paymentMethod === 'card' 
                  ? `Payment standard successful! Upgraded to ${selectedTier}.` 
                  : `Redirecting to ${paymentMethod === 'razorpay' ? 'Razorpay' : 'PayPal'} gateway simulation... Success!`, 
                { duration: 5000 });
              }, 2000);
            }}>
              {paymentMethod === 'razorpay' ? `Proceed with Razorpay` : paymentMethod === 'paypal' ? `Proceed to PayPal` : `Pay Now`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PriceCard({ title, price, period = '', features, buttonText, variant, highlight = false, onClick }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: highlight ? '2px solid var(--brand)' : '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', transform: highlight ? 'translateY(-8px)' : 'none', boxShadow: highlight ? '0 12px 30px rgba(99,102,241,0.15)' : 'none' }}>
      {highlight && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--brand)', color: '#fff', padding: '0.2rem 1rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>MOST POPULAR</div>}
      <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>{title}</h3>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{price}</span>
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{period}</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--brand)' }}>✓</span> {f}
          </li>
        ))}
      </ul>
      <Button variant={variant} size="lg" onClick={onClick} style={{ width: '100%' }}>{buttonText}</Button>
    </div>
  );
}
