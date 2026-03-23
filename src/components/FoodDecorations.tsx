'use client';
import { useEffect, useRef } from 'react';

/**
 * @fileOverview FoodDecorations component
 * Adds flowing decorative lines and food images to the sides of the page.
 */

export function FoodDecorations() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        // Step 1 — draw lines first
        el.querySelectorAll('.food-line').forEach((line, i) => {
          setTimeout(() => {
            (line as HTMLElement).style.strokeDashoffset = '0';
          }, i * 180);
        });

        // Step 2 — slide left food in
        el.querySelectorAll('.food-left-wrapper').forEach((item, i) => {
          setTimeout(() => {
            const f = item as HTMLElement;
            f.style.opacity = '1';
            f.style.transform = 'translateX(0px)';
          }, 500 + i * 150);
        });

        // Step 3 — slide right food in
        el.querySelectorAll('.food-right-wrapper').forEach((item, i) => {
          setTimeout(() => {
            const f = item as HTMLElement;
            f.style.opacity = '1';
            f.style.transform = 'translateX(0px)';
          }, 500 + i * 150);
        });

        observer.disconnect();
      },
      { threshold: 0.03 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const wrapperStyle = (isLeft: boolean, top: string, offset: string): React.CSSProperties => ({
    position: 'absolute',
    top,
    [isLeft ? 'left' : 'right']: offset,
    opacity: 0,
    transform: isLeft ? 'translateX(-90px)' : 'translateX(90px)',
    transition: 'opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
    pointerEvents: 'none',
    zIndex: 0,
  });

  const imgStyle = (width: string): React.CSSProperties => ({
    width,
    height: 'auto',
    display: 'block',
    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.25))',
    objectFit: 'contain',
  });

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* ══════════════════════════════════ */}
      {/* LEFT SVG LINE                      */}
      {/* Curves outward at 120, 600, 1050   */}
      {/* Curves inward at 360, 840          */}
      {/* ══════════════════════════════════ */}
      <svg
        className="hidden lg:block"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '210px',
          height: '100%',
          overflow: 'visible',
          zIndex: 0,
        }}
        viewBox="0 0 210 1300"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          className="food-line"
          d="M 30 0 C 30 60, 160 90, 165 160 C 170 230, 25 280, 20 360 C 15 440, 162 490, 165 570 C 168 650, 22 700, 18 780 C 14 860, 158 910, 160 990 C 162 1070, 20 1110, 20 1200 C 20 1280, 30 1300, 30 1400"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.2"
          fill="none"
          style={{
            strokeDasharray: 4500,
            strokeDashoffset: 4500,
            transition: 'stroke-dashoffset 2.4s ease-in-out',
          }}
        />
        <path
          className="food-line"
          d="M 50 0 C 50 60, 178 90, 182 160 C 186 230, 42 280, 37 360 C 32 440, 178 490, 180 570 C 182 650, 38 700, 34 780 C 30 860, 172 910, 174 990 C 176 1070, 36 1110, 36 1200 C 36 1280, 50 1300, 50 1400"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeOpacity="0.08"
          fill="none"
          style={{
            strokeDasharray: 4500,
            strokeDashoffset: 4500,
            transition: 'stroke-dashoffset 3s ease-in-out 0.2s',
          }}
        />
      </svg>

      {/* ══════════════════════════════════ */}
      {/* RIGHT SVG LINE — mirror of left    */}
      {/* ══════════════════════════════════ */}
      <svg
        className="hidden lg:block"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '210px',
          height: '100%',
          overflow: 'visible',
          zIndex: 0,
        }}
        viewBox="0 0 210 1300"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          className="food-line"
          d="M 180 0 C 180 60, 50 90, 45 160 C 40 230, 185 280, 190 360 C 195 440, 48 490, 45 570 C 42 650, 188 700, 192 780 C 196 860, 52 910, 50 990 C 48 1070, 190 1110, 190 1200 C 190 1280, 180 1300, 180 1400"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.2"
          fill="none"
          style={{
            strokeDasharray: 4500,
            strokeDashoffset: 4500,
            transition: 'stroke-dashoffset 2.4s ease-in-out 0.1s',
          }}
        />
        <path
          className="food-line"
          d="M 160 0 C 160 60, 32 90, 28 160 C 24 230, 168 280, 172 360 C 176 440, 30 490, 28 570 C 26 650, 170 700, 174 780 C 178 860, 34 910, 32 990 C 30 1070, 172 1110, 172 1200 C 172 1280, 160 1300, 160 1400"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeOpacity="0.08"
          fill="none"
          style={{
            strokeDasharray: 4500,
            strokeDashoffset: 4500,
            transition: 'stroke-dashoffset 3s ease-in-out 0.3s',
          }}
        />
      </svg>

      {/* ══════════════════════════════════ */}
      {/* LEFT FOOD                          */}
      {/* ══════════════════════════════════ */}
      <div className="food-left-wrapper hidden lg:block" style={wrapperStyle(true, '80px', '90px')}>
        <img src="/pizza.png" alt="pizza" style={imgStyle('220px')} />
      </div>
      <div className="food-left-wrapper hidden lg:block" style={wrapperStyle(true, '555px', '85px')}>
        <img src="/sandwich.png" alt="sandwich" style={imgStyle('190px')} />
      </div>
      <div className="food-left-wrapper hidden lg:block" style={wrapperStyle(true, '750px', '55px')}>
        <img src="/sub.png" alt="sub" style={imgStyle('160px')} />
      </div>
      <div className="food-left-wrapper hidden lg:block" style={wrapperStyle(true, '1000px', '75px')}>
        <img src="/garlicbread.png" alt="garlicbread" style={imgStyle('175px')} />
      </div>

      {/* ══════════════════════════════════ */}
      {/* RIGHT FOOD                         */}
      {/* ══════════════════════════════════ */}
      <div className="food-right-wrapper hidden lg:block" style={wrapperStyle(false, '80px', '20px')}>
        <img src="/burger.png" alt="burger" style={imgStyle('225px')} />
      </div>
      <div className="food-right-wrapper hidden lg:block" style={wrapperStyle(false, '320px', '55px')}>
        <img src="/chilli.png" alt="chilli" style={imgStyle('135px')} />
      </div>
      <div className="food-right-wrapper hidden lg:block" style={wrapperStyle(false, '555px', '20px')}>
        <img src="/sushi.png" alt="sushi" style={imgStyle('190px')} />
      </div>
      <div className="food-right-wrapper hidden lg:block" style={wrapperStyle(false, '790px', '45px')}>
        <img src="/mousse.png" alt="mousse" style={imgStyle('150px')} />
      </div>
      <div className="food-right-wrapper hidden lg:block" style={wrapperStyle(false, '1000px', '20px')}>
        <img src="/sundae.png" alt="sundae" style={imgStyle('180px')} />
      </div>
    </div>
  );
}
