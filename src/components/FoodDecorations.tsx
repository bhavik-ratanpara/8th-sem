'use client'

import { useEffect, useRef } from 'react'

export function FoodDecorations() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        el.querySelectorAll('.food-line').forEach((line, i) => {
          setTimeout(() => {
            ;(line as HTMLElement).style.strokeDashoffset = '0'
          }, i * 180)
        })

        el.querySelectorAll('.food-left-wrapper').forEach((item, i) => {
          setTimeout(() => {
            const f = item as HTMLElement
            f.style.opacity = '1'
            f.style.transform = 'translateX(0px)'
          }, 500 + i * 150)
        })

        el.querySelectorAll('.food-right-wrapper').forEach((item, i) => {
          setTimeout(() => {
            const f = item as HTMLElement
            f.style.opacity = '1'
            f.style.transform = 'translateX(0px)'
          }, 500 + i * 150)
        })

        observer.disconnect()
      },
      { threshold: 0.03 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const wrapperStyle = (isLeft: boolean, top: string, offset: string): React.CSSProperties => ({
    position: 'absolute',
    top,
    [isLeft ? 'left' : 'right']: offset,
    opacity: 0,
    transform: `translateX(${isLeft ? '-90px' : '90px'})`,
    transition: 'opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
    pointerEvents: 'none',
    zIndex: 0,
  })

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
      <style jsx global>{`
        /* Default Sizes for Large Screens (Windows / High-Res Desktop) */
        .food-img-pizza { width: 220px; }
        .food-img-sub { width: 180px; }
        .food-img-burger { width: 160px; }
        .food-img-sushi { width: 140px; }

        /* Smaller than laptop (1400px): Decrease exactly 2x size to prevent text merge */
        @media (max-width: 1400px) {
          .food-img-pizza { width: 110px; }
          .food-img-sub { width: 90px; }
          .food-img-burger { width: 80px; }
          .food-img-sushi { width: 70px; }
        }

        /* If no empty space left (1200px): Hide all decorations */
        @media (max-width: 1200px) {
          .food-decoration-container {
            display: none !important;
          }
        }
      `}</style>

      <div className="food-decoration-container w-full h-full relative">
        <svg
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
            d="M 30 0 C 30 100, 140 150, 140 300 C 140 450, 30 500, 30 650 C 30 800, 140 850, 140 1000"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.15"
            fill="none"
            style={{
              strokeDasharray: 4500,
              strokeDashoffset: 4500,
              transition: 'stroke-dashoffset 2.4s ease-in-out',
            }}
          />
        </svg>

        <svg
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
            d="M 180 0 C 180 100, 70 150, 70 300 C 70 450, 180 500, 180 650 C 180 800, 70 850, 70 1000"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.15"
            fill="none"
            style={{
              strokeDasharray: 4500,
              strokeDashoffset: 4500,
              transition: 'stroke-dashoffset 2.4s ease-in-out 0.1s',
            }}
          />
        </svg>

        {/* Left Side Items - Positioned perfectly on SVG path peaks */}
        <div className="food-left-wrapper" style={wrapperStyle(true, '10px', '25px')}>
          <img 
            src="/pizza.png" 
            alt="pizza" 
            className="food-img-pizza h-auto block drop-shadow-xl object-contain" 
          />
        </div>
        <div className="food-left-wrapper" style={wrapperStyle(true, '250px', '45px')}>
          <img 
            src="/sub.png" 
            alt="sub" 
            className="food-img-sub h-auto block drop-shadow-xl object-contain" 
          />
        </div>
        
        {/* Right Side Items - Positioned perfectly on SVG path peaks */}
        <div className="food-right-wrapper" style={wrapperStyle(false, '10px', '25px')}>
          <img 
            src="/burger.png" 
            alt="burger" 
            className="food-img-burger h-auto block drop-shadow-xl object-contain" 
          />
        </div>
        <div className="food-right-wrapper" style={wrapperStyle(false, '280px', '45px')}>
          <img 
            src="/sushi.png" 
            alt="sushi" 
            className="food-img-sushi h-auto block drop-shadow-xl object-contain" 
          />
        </div>
      </div>
    </div>
  )
}
