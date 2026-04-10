'use client';

const FLOATING_OBJECTS = [
  {
    title: 'Support',
    note: 'Build your case with clarity.',
    top: '10%',
    left: '8%',
    rotate: '-14deg',
    tint: 'rgba(86,103,240,0.12)',
    border: 'rgba(86,103,240,0.25)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 12h10" />
        <path d="M10 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    title: 'Oppose',
    note: 'Challenge every weak premise.',
    top: '18%',
    right: '7%',
    rotate: '12deg',
    tint: 'rgba(240,80,110,0.12)',
    border: 'rgba(240,80,110,0.24)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 12H10" />
        <path d="M14 6l-6 6 6 6" />
      </svg>
    ),
  },
  {
    title: 'Rebuttal',
    note: 'Every strong idea survives pressure.',
    bottom: '21%',
    left: '10%',
    rotate: '11deg',
    tint: 'rgba(13,188,122,0.12)',
    border: 'rgba(13,188,122,0.24)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h8" />
      </svg>
    ),
  },
  {
    title: 'Signal',
    note: 'Let the best argument rise.',
    bottom: '10%',
    right: '10%',
    rotate: '-12deg',
    tint: 'rgba(155,93,229,0.12)',
    border: 'rgba(155,93,229,0.22)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 20V10" />
        <path d="M7 15l5-5 5 5" />
      </svg>
    ),
  },
];

export default function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background:
          'radial-gradient(circle at top left, rgba(86,103,240,0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(155,93,229,0.12), transparent 34%), linear-gradient(180deg, #fafafa 0%, #f5f5fb 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .auth-side-panel {
          display: none;
        }
        @media (min-width: 1024px) {
          .auth-side-panel {
            display: flex;
          }
        }
        @keyframes auth-spin {
          from { transform: rotateX(68deg) rotateZ(0deg); }
          to { transform: rotateX(68deg) rotateZ(360deg); }
        }
        @keyframes auth-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(var(--card-rotate)); }
          50% { transform: translate3d(0, -16px, 0) rotate(calc(var(--card-rotate) + 2deg)); }
        }
        @keyframes auth-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; }
          50% { transform: translate(-50%, -50%) scale(1.12); opacity: 0.9; }
        }
        @keyframes auth-tilt {
          0%, 100% { transform: rotateX(65deg) rotateZ(-8deg); }
          50% { transform: rotateX(65deg) rotateZ(8deg); }
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          opacity: 0.22,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 14% 18%, rgba(86,103,240,0.14), transparent 18%), radial-gradient(circle at 82% 78%, rgba(240,80,110,0.08), transparent 16%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="auth-side-panel"
        style={{
          width: '52%',
          borderRight: '1px solid var(--border)',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem 3.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--brand) 0%, #9b5de5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 18px 45px rgba(86,103,240,0.22)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--text-primary)' }}>DebateHub</span>
          </div>

          <div style={{ maxWidth: 520 }}>
            <p style={{ fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Structured Thought Engine
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem, 4vw, 4.25rem)', fontWeight: 400, lineHeight: 1.03, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Enter the
              <br />
              <span className="text-gradient">argument engine.</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '1rem', maxWidth: 470, marginBottom: '1.5rem' }}>
              DebateHub is where opinions get tested, sharpened, and rebuilt in public. Structured sides, live rebuttals, and arguments that have to earn attention.
            </p>
            <blockquote
              style={{
                maxWidth: 430,
                padding: '1rem 1.2rem',
                background: 'rgba(255,255,255,0.76)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', lineHeight: 1.45, color: 'var(--text-primary)' }}>
                "Enter with an opinion. Leave with a sharper one."
              </p>
            </blockquote>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            flex: 1,
            minHeight: 560,
            perspective: 1400,
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '52%',
              width: 420,
              height: 420,
              transformStyle: 'preserve-3d',
              transform: 'translate(-50%, -50%) rotateX(66deg)',
              animation: 'auth-tilt 10s ease-in-out infinite',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 320,
                height: 320,
                borderRadius: '50%',
                border: '1px solid rgba(86,103,240,0.24)',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 80px rgba(86,103,240,0.1)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 260,
                height: 260,
                borderRadius: '50%',
                border: '1px solid rgba(155,93,229,0.28)',
                transform: 'translate(-50%, -50%)',
                animation: 'auth-spin 18s linear infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 170,
                height: 170,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(86,103,240,0.9) 0%, rgba(155,93,229,0.82) 42%, rgba(86,103,240,0) 72%)',
                boxShadow: '0 0 120px rgba(86,103,240,0.28)',
                animation: 'auth-pulse 4s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 124,
                height: 124,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e9ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 26px 65px rgba(86,103,240,0.2)',
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand) 0%, #9b5de5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 14px 30px rgba(86,103,240,0.3)',
                }}
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12h6l2-3 2 6 2-3h4" />
                  <path d="M4 6h4" />
                  <path d="M16 18h4" />
                </svg>
              </div>
            </div>
          </div>

          {FLOATING_OBJECTS.map((card) => (
            <div
              key={card.title}
              style={{
                '--card-rotate': card.rotate,
                position: 'absolute',
                top: card.top,
                left: card.left,
                right: card.right,
                bottom: card.bottom,
                width: 198,
                padding: '1rem 1rem 0.95rem',
                borderRadius: 22,
                background: `linear-gradient(180deg, ${card.tint}, rgba(255,255,255,0.78))`,
                border: `1px solid ${card.border}`,
                boxShadow: '0 24px 70px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(16px)',
                transform: `rotate(${card.rotate})`,
                animation: 'auth-float 7s ease-in-out infinite',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  background: 'rgba(255,255,255,0.72)',
                  border: '1px solid var(--border)',
                  marginBottom: '0.8rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {card.icon}
              </div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.55rem' }}>
                {card.title}
              </div>
              <div style={{ fontSize: '0.98rem', lineHeight: 1.3, fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                DebateHub
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {card.note}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            ['Support', 'Organize your side'],
            ['Oppose', 'Challenge assumptions'],
            ['Resolve', 'Let the best case stand'],
          ].map(([value, label]) => (
            <div
              key={label}
              style={{
                padding: '1rem 1.1rem',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 460,
            padding: '2rem',
            borderRadius: 30,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.82))',
            boxShadow: '0 30px 80px rgba(86,103,240,0.12)',
            border: '1px solid rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
