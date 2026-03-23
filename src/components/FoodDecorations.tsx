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

  const imgStyle = (width: string): React.CSSProperties => ({
    width,
    height: 'auto',
    display: 'block',
    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
    objectFit: 'contain',
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
      {/* LEFT SVG LINE — Shallower curves */}
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
          d="M 30 0 C 30 100, 140 150, 140 300 C 140 450, 30 500, 30 650 C 30 800, 140 850, 140 1000 C 140 1150, 30 1200, 30 1400"
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
          d="M 50 0 C 50 100, 160 150, 160 300 C 160 450, 50 500, 50 650 C 50 800, 160 850, 160 1000 C 160 1150, 50 1200, 50 1400"
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

      {/* RIGHT SVG LINE — Mirror of left */}
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
          d="M 180 0 C 180 100, 70 150, 70 300 C 70 450, 180 500, 180 650 C 180 800, 70 850, 70 1000 C 70 1150, 180 1200, 180 1400"
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
          d="M 160 0 C 160 100, 50 150, 50 300 C 50 450, 160 500, 160 650 C 160 800, 50 850, 50 1000 C 50 1150, 160 1200, 160 1400"
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

      {/* LEFT SIDE FOOD — 4 Items */}
      <div className="food-left-wrapper hidden lg:block" style={wrapperStyle(true, '20px', '20px')}>
        <img src="/pizza.png" alt="" style={imgStyle('220px')} />
      </div>
      <div className="food-left-wrapper hidden lg:block" style={wrapperStyle(true, '300px', '85px')}>
        <img src="/sandwich.png" alt="" style={imgStyle('190px')} />
      </div>
      <div className="food-left-wrapper hidden lg:block" style={wrapperStyle(true, '620px', '15px')}>
        <img src="/sub.png" alt="" style={imgStyle('160px')} />
      </div>
      <div className="food-left-wrapper hidden lg:block" style={wrapperStyle(true, '950px', '75px')}>
        <img src="/garlicbread.png" alt="" style={imgStyle('175px')} />
      </div>

      {/* RIGHT SIDE FOOD — 3 Items */}
      <div className="food-right-wrapper hidden lg:block" style={wrapperStyle(false, '20px', '20px')}>
        <img src="/burger.png" alt="" style={imgStyle('225px')} />
      </div>
      <div className="food-right-wrapper hidden lg:block" style={wrapperStyle(false, '300px', '85px')}>
        <img src="/chilli.png" alt="" style={imgStyle('135px')} />
      </div>
      <div className="food-right-wrapper hidden lg:block" style={wrapperStyle(false, '620px', '15px')}>
        <img src="/sushi.png" alt="" style={imgStyle('190px')} />
      </div>
    </div>
  )
}
