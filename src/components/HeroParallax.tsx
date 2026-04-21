'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroParallaxProps {
  /** Background image URL or gradient string passed to backgroundImage CSS */
  backgroundImage?: string;
  /** Additional Tailwind / CSS classes for the outer section wrapper */
  className?: string;
  /** How much slower the background moves relative to the scroll.
   *  0 = no movement, 1 = normal scroll speed. Default: 0.4 (40%) */
  speed?: number;
  children: React.ReactNode;
}

export function HeroParallax({
  backgroundImage,
  className = '',
  speed = 0.4,
  children,
}: HeroParallaxProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    // The background starts at its natural position and moves upward more slowly
    // than the viewport — giving a classic parallax lag.
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bg,
        { yPercent: 0 },
        {
          // Negative yPercent pushes bg up; multiply by speed so it lags behind.
          yPercent: -(speed * 30),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [speed]);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Parallax background layer */}
      <div
        ref={bgRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-20% 0',   // over-size vertically so edges never show on scroll
          backgroundImage: backgroundImage ?? undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform',
          zIndex: 0,
        }}
      />

      {/* Content sits above the moving background */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
