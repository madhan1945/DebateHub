'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '3rem 1.5rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>DebateHub</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>The platform where the best argument wins.</p>
          </div>
          {[
            { heading: 'Platform', links: [['Browse Debates', '/debates'], ['Create Debate', '/debates/create'], ['Leaderboard', '/leaderboard'], ['Search', '/search']] },
            { heading: 'Company',  links: [['About', '/about'], ['Blog', '/blog'], ['Careers', '/careers'], ['Press', '/press']] },
            { heading: 'Support',  links: [['Help Centre', '/help'], ['Community Guidelines', '/guidelines'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>{heading}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* New Contact Section */}
          <div style={{ gridColumn: 'span 1' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Connect</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>Visit us on this email for queries:</p>
            <a href="mailto:debatehub@gmail.com" style={{ display: 'inline-block', fontSize: '0.875rem', color: 'var(--brand)', textDecoration: 'none', fontWeight: 500, marginBottom: '1.25rem', transition: 'opacity 0.2s' }} onMouseEnter={e => e.target.style.opacity = 0.8} onMouseLeave={e => e.target.style.opacity = 1}>
              debatehub@gmail.com
            </a>
            
            <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
              {[
                { name: 'GitHub', url: 'https://github.com/madhan1945', icon: <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.293 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>, viewBox: '0 0 24 24' },
                { name: 'Instagram', url: 'https://instagram.com/berserk_jinx', icon: <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 2.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm5.5-1A1.5 1.5 0 1 0 16 6a1.5 1.5 0 0 0 1.5 1.5z" fill="currentColor"/>, viewBox: '0 0 24 24' },
                { name: 'Discord', url: 'https://discord.com/users/madhan1945', icon: <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" fill="currentColor"/>, viewBox: '0 0 24 24' }
              ].map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', transition: 'all 0.2s', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand-light)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  aria-label={s.name}
                  title={s.name}
                >
                  <svg width="14" height="14" viewBox={s.viewBox} fill="none">
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>© {new Date().getFullYear()} DebateHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
