'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Wraps children in an observer that triggers an entrance CSS class exactly once.
 * @param {string} className - Optional existing classnames
 * @param {number} delay - Animation delay in milliseconds
 * @param {boolean} staggerChildren - Wait slightly for child components
 */
export default function ScrollReveal({ children, className = '', delay = 0 }) {
  const [isVisible, setIsVisible] = useState(true);
  const domRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    setIsVisible(false);

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      rootMargin: '0px',
      threshold: 0.15 // Triggers when 15% visible
    });
    
    if (domRef.current) {
      observer.observe(domRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`reveal-base ${isVisible ? 'reveal-visible' : 'reveal-hidden'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
