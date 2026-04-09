import { useState, useEffect } from 'react';

/**
 * A highly performant parallax scroll tracking hook without heavy libraries.
 * Utilizes requestAnimationFrame to prevent layout thrashing on heavy scroll.
 */
export default function useParallax() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Attach passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial fetch
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
}
