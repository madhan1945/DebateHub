'use client';
import { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import { getApiBaseUrl } from '../../lib/env';

const supportApiUrl = getApiBaseUrl();

export default function HelpPage() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Welcome to the DebateHub Help Centre! I'm your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  const faqs = [
    { q: "How does reputation work?", a: "Your reputation increases when your arguments receive upvotes and when you actively participate in debates. Highly reputable users are granted the 'Pro Debater' badge." },
    { q: "How do I moderate toxicity?", a: "DebateHub is powered by Anthropic's Claude 3 AI, which actively reviews every argument submitted. If severe toxicity is detected, the submission is blocked automatically." },
    { q: "Can I delete my debates?", a: "Yes, you can manage your arguments and debates directly from your profile dashboard. However, you cannot delete a debate once it has concluded." },
    { q: "How do subscriptions work?", a: "DebateHub offers mock subscriptions for 'Pro' and 'Philosopher King' tiers. Visit the /subscription page to try out our mock payment gateways (Stripe, UPI, PayPal)." }
  ];

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    
    // Optimistic UI update
    const newMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Create a formatted payload for OpenAI
      // Maps our custom {role, text} to GPT's {role, content} format
      const payloadMessages = newMessages.map(m => ({ 
        role: m.role === 'bot' ? 'assistant' : 'user', 
        content: m.text 
      }));

      const response = await fetch(`${supportApiUrl}/support/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages })
      });

      const data = await response.json();
      
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: data.message }]);
      
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: "My connection to the mainframe has been severed. Please wait and try again." }]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .dot-typing { width: 6px; height: 6px; border-radius: 50%; background-color: var(--text-muted); animation: dotPulse 1.5s infinite ease-in-out; }
        .dot-typing:nth-child(1) { animation-delay: 0s; }
        .dot-typing:nth-child(2) { animation-delay: 0.2s; }
        .dot-typing:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotPulse { 0%, 100% { transform: scale(0.6); opacity: 0.5; } 50% { transform: scale(1); opacity: 1; } }
      `}</style>
      <Navbar />
      
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(86,103,240,0.05) 100%)', borderBottom: '1px solid var(--border)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Help Centre</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>Find answers to common questions, or chat with our automated support bot.</p>
      </div>

      <div style={{ maxWidth: 1100, margin: '3rem auto', padding: '0 1.5rem', flex: 1, width: '100%', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        
        {/* Left Col: FAQS */}
        <div style={{ flex: '1 1 500px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{faq.q}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Support Bot */}
        <div style={{ flex: '1 1 350px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 550, boxShadow: 'var(--shadow-md)' }}>
            
            {/* Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-elevated)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>DebateHub Agent</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Online · AI Assistant</p>
              </div>
            </div>

            {/* Chat Canvas */}
            <div ref={chatContainerRef} style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-base)', scrollBehavior: 'smooth' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    maxWidth: '85%', 
                    padding: '0.75rem 1rem', 
                    borderRadius: m.role === 'user' ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                    background: m.role === 'user' ? 'var(--brand)' : 'var(--bg-elevated)',
                    color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span className="dot-typing"></span><span className="dot-typing"></span><span className="dot-typing"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  placeholder="Type your issue..." 
                  style={{ flex: 1, padding: '0.625rem 1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 999, color: 'var(--text-primary)', outline: 'none' }} 
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                />
                <Button type="submit" variant="primary" style={{ padding: '0 1rem', borderRadius: 999 }} disabled={!input.trim() || isTyping}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </Button>
              </form>
            </div>
            
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
