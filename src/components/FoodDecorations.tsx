'use client';
import { useEffect, useRef } from 'react';

export function FoodDecorations() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate lines first
            const lines = entry.target.querySelectorAll('.svg-line');
            lines.forEach((line, i) => {
              setTimeout(() => {
                line.classList.add('animate-draw');
              }, i * 100);
            });

            // Then animate food items
            const leftItems = entry.target.querySelectorAll('.food-item.from-left');
            leftItems.forEach((item, i) => {
              setTimeout(() => {
                item.classList.add('animate-left');
              }, 200 + i * 150);
            });

            const rightItems = entry.target.querySelectorAll('.food-item.from-right');
            rightItems.forEach((item, i) => {
              setTimeout(() => {
                item.classList.add('animate-right');
              }, 200 + i * 150);
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* LEFT SIDE SVG CURVED LINE */}
      <svg
        className="hidden lg:block"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '220px',
          height: '100%',
          overflow: 'visible',
        }}
        viewBox="0 0 220 600"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          className="svg-line"
          d="M -20 50 C 40 80, 180 120, 160 200 C 140 280, 20 300, 40 380 C 60 460, 180 480, 160 560"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.12"
          fill="none"
        />
        <path
          className="svg-line"
          d="M 20 80 C 80 110, 200 150, 180 230 C 160 310, 40 330, 60 410 C 80 490, 200 510, 180 590"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.07"
          fill="none"
        />
      </svg>

      {/* RIGHT SIDE SVG CURVED LINE */}
      <svg
        className="hidden lg:block"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '220px',
          height: '100%',
          overflow: 'visible',
        }}
        viewBox="0 0 220 600"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          className="svg-line"
          d="M 240 50 C 180 80, 40 120, 60 200 C 80 280, 200 300, 180 380 C 160 460, 40 480, 60 560"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.12"
          fill="none"
        />
        <path
          className="svg-line"
          d="M 200 80 C 140 110, 20 150, 40 230 C 60 310, 180 330, 160 410 C 140 490, 20 510, 40 590"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.07"
          fill="none"
        />
      </svg>

      {/* LEFT FOOD IMAGES */}
      <img
        src="/pizza.png"
        alt=""
        className="food-item from-left food-float-img hidden lg:block"
        style={{
          position: 'absolute',
          top: '8%',
          left: '2%',
          width: '130px',
          height: 'auto',
        }}
      />
      <img
        src="/sandwich.png"
        alt=""
        className="food-item from-left food-float-img hidden lg:block"
        style={{
          position: 'absolute',
          top: '42%',
          left: '1%',
          width: '110px',
          height: 'auto',
        }}
      />
      <img
        src="/lemon.png"
        alt=""
        className="food-item from-left food-float-img hidden lg:block"
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '3%',
          width: '80px',
          height: 'auto',
        }}
      />
      <img
        src="/sub.png"
        alt=""
        className="food-item from-left food-float-img hidden lg:block"
        style={{
          position: 'absolute',
          top: '72%',
          left: '0.5%',
          width: '95px',
          height: 'auto',
        }}
      />

      {/* RIGHT FOOD IMAGES */}
      <img
        src="/burger.png"
        alt=""
        className="food-item from-right food-float-img hidden lg:block"
        style={{
          position: 'absolute',
          top: '8%',
          right: '2%',
          width: '140px',
          height: 'auto',
        }}
      />
      <img
        src="/sushi.png"
        alt=""
        className="food-item from-right food-float-img hidden lg:block"
        style={{
          position: 'absolute',
          top: '42%',
          right: '1%',
          width: '100px',
          height: 'auto',
        }}
      />
      <img
        src="/chilli.png"
        alt=""
        className="food-item from-right food-float-img hidden lg:block"
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '3%',
          width: '75px',
          height: 'auto',
        }}
      />

      {/* MOBILE ITEMS */}
      <img
        src="/pizza.png"
        alt=""
        className="food-item from-left food-float-img block lg:hidden"
        style={{
          position: 'absolute',
          top: '5%',
          left: '-10px',
          width: '55px',
          height: 'auto',
          opacity: 0.6,
        }}
      />
      <img
        src="/burger.png"
        alt=""
        className="food-item from-right food-float-img block lg:hidden"
        style={{
          position: 'absolute',
          top: '5%',
          right: '-10px',
          width: '60px',
          height: 'auto',
          opacity: 0.6,
        }}
      />
    </div>
  );
}
