'use client'

import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'

export function RadarFeatures() {
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
    // Fetch the animation data from the public folder at runtime
    // to avoid import errors in Next.js
    async function loadAnm() {
      try {
        const response = await fetch('/chef-making-pizza.json')
        if (!response.ok) throw new Error('Failed to fetch animation data')
        const data = await response.json()
        setAnimationData(data)
      } catch (err) {
        console.error('Lottie load error:', err)
      }
    }
    loadAnm()
  }, [])

  return (
    <div
      style={{
        width: 'min(420px, 44vw)',
        height: 'min(420px, 44vw)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >

      {/* ── SINGLE OUTER ROTATING RING ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          animation: 'spinRing 8s linear infinite',
        }}
      >
        {/* Dashed decorative ring */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 420 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Outer dashed circle */}
          <circle
            cx="210"
            cy="210"
            r="200"
            stroke="#2563eb"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* Inner thin circle */}
          <circle
            cx="210"
            cy="210"
            r="185"
            stroke="#2563eb"
            strokeWidth="0.5"
            opacity="0.15"
          />
          {/* Dot markers on ring */}
          <circle cx="210" cy="10" r="4" fill="#2563eb" opacity="0.8"/>
          <circle cx="410" cy="210" r="4" fill="#2563eb" opacity="0.8"/>
          <circle cx="210" cy="410" r="4" fill="#2563eb" opacity="0.8"/>
          <circle cx="10" cy="210" r="4" fill="#2563eb" opacity="0.8"/>
          {/* Small dots between */}
          <circle cx="353" cy="67" r="2.5" fill="#60a5fa" opacity="0.5"/>
          <circle cx="353" cy="353" r="2.5" fill="#60a5fa" opacity="0.5"/>
          <circle cx="67" cy="353" r="2.5" fill="#60a5fa" opacity="0.5"/>
          <circle cx="67" cy="67" r="2.5" fill="#60a5fa" opacity="0.5"/>
        </svg>
      </div>

      {/* ── CHEF ANIMATION IN CENTER ── */}
      <div
        className="lottie-blend"
        style={{
          width: '78%',
          height: '78%',
          position: 'relative',
          zIndex: 2,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        {animationData && (
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        )}
      </div>

      {/* ── EDGE FADES ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle, 
            transparent 45%, 
            var(--page-bg) 72%)
        `,
        pointerEvents: 'none',
        zIndex: 3,
        borderRadius: '50%',
      }} />

    </div>
  )
}
