'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Sync Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis via GSAP ticker for frame-perfect sync
    const ticker = gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Prevent GSAP from using its own lagSmoothing since Lenis handles it
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
