'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../lib/api';

import Footer from '../../components/layout/Footer';

export default function SettingsPage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  
  const [toggles, setToggles] = useState({
    autoDestruct: user?.settings?.autoDestruct || false,
    hardcoreToxicity: user?.settings?.hardcoreToxicity || false,
    incognitoVote: user?.settings?.incognitoVote || false,
    hapticFeedback: user?.settings?.hapticFeedback ?? true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user?.settings) return;
    setToggles({
      autoDestruct: user.settings.autoDestruct || false,
      hardcoreToxicity: user.settings.hardcoreToxicity || false,
      incognitoVote: user.settings.incognitoVote || false,
      hapticFeedback: user.settings.hapticFeedback ?? true,
    });
  }, [user]);

  const handleToggle = async (key) => {
    const newVal = !toggles[key];
    const newToggles = { ...toggles, [key]: newVal };
    setToggles(newToggles);
    
    try {
      await authAPI.updateProfile({ settings: newToggles });
      updateUser({ settings: newToggles });
      toast.success(`${key} ${newVal ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to save setting');
      // Revert optimism
      setToggles(toggles);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1.5rem', flex: 1, width: '100%' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>
          Settings
        </h1>

        {/* Crazy Functionalities */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Debate Modifiers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            <SettingCard 
              title="⏳ AI Auto-Destruct Rebuttals" 
              desc="If your opponent doesn't reply in 60 seconds, Claude automatically rebuts them on your behalf. (Warning: high chaos)."
              isActive={toggles.autoDestruct}
              onToggle={() => handleToggle('autoDestruct')}
            />
            
            <SettingCard 
              title="🔥 Ruthless Toxicity Mode" 
              desc="Disables the AI toxicity shield for your view. Prepare to see the raw, unedited wrath of the internet."
              isActive={toggles.hardcoreToxicity}
              onToggle={() => handleToggle('hardcoreToxicity')}
            />

            <SettingCard 
              title="🕵️ Incognito Voting" 
              desc="Never log your votes publicly on your profile. Keep your biases completely hidden from the opponent."
              isActive={toggles.incognitoVote}
              onToggle={() => handleToggle('incognitoVote')}
            />

            <SettingCard 
              title="📳 Enhanced Haptic Feedback" 
              desc="Vibrates your device violently whenever someone downvotes your argument."
              isActive={toggles.hapticFeedback}
              onToggle={() => handleToggle('hapticFeedback')}
            />

          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

function SettingCard({ title, desc, isActive, onToggle }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: `1px solid ${isActive ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '1.5rem', transition: 'all 0.2s', boxShadow: isActive ? '0 4px 20px rgba(99, 102, 241, 0.1)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
        <button onClick={onToggle} style={{ width: 44, height: 24, background: isActive ? 'var(--accent-green)' : 'var(--bg-subtle)', borderRadius: 999, border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
          <div style={{ position: 'absolute', top: 2, left: isActive ? 22 : 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
        </button>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
