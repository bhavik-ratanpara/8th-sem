'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Direction = 'up' | 'down' | 'left' | 'right';

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Extra class names for the wrapper div */
  className?: string;
  /** Delay in seconds before the animation starts (default: 0) */
  delay?: number;
  /** Direction the element moves FROM (default: 'up') */
  direction?: Direction;
  /** Animation duration in seconds (default: 0.7) */
  duration?: number;
  /** How far (px) the element travels (default: 40) */
  distance?: number;
  /** ScrollTrigger start string (default: 'top 88%') */
  start?: string;
}

const getFromVars = (direction: Direction, distance: number) => {
  switch (direction) {
    case 'up':    return { y: distance };
    case 'down':  return { y: -distance };
    case 'left':  return { x: distance };
    case 'right': return { x: -distance };
  }
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.7,
  distance = 40,
  start = 'top 88%',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fromVars = getFromVars(direction, distance);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, ...fromVars },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: 'play none none none',
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, direction, duration, distance, start]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
