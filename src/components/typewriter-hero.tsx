'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/firebase';

const words = [
  'Not Harder.',
  'Eat Better.',
  'Save Time.',
  'Impress Everyone.',
  'Like a Chef.',
];

export function TypewriterHero() {
  const [currentWord, setCurrentWord] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const blink = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    const fullWord = words[wordIndex];

    if (!isDeleting && currentWord === fullWord) {
      const pause = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(pause);
    }

    if (isDeleting && currentWord === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const speed = isDeleting ? 35 : 60;

    const timer = setTimeout(() => {
      setCurrentWord((prev) =>
        isDeleting
          ? fullWord.slice(0, prev.length - 1)
          : fullWord.slice(0, prev.length + 1)
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [currentWord, isDeleting, wordIndex]);

  const handleScrollToForm = () => {
    document.getElementById('recipe-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      style={{
        minHeight: '520px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'hsl(var(--background))',
      }}
    >
      {/* Radial Glow Background */}
      <div
        style={{
          position: 'absolute',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            color: '#3b82f6',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: '8px 16px',
            borderRadius: '999px',
            marginBottom: '32px',
          }}
        >
          ✦ AI Powered Recipe Generator
        </div>

        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 60px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            margin: 0,
          }}
        >
          <span
            style={{
              color: 'hsl(var(--foreground))',
              display: 'block',
            }}
          >
            Cook Smarter,
          </span>

          <span
            style={{
              color: '#3b82f6',
              display: 'block',
              minHeight: '1.2em',
            }}
          >
            {currentWord}
            <span
              style={{
                opacity: showCursor ? 1 : 0,
                color: '#3b82f6',
                fontWeight: 300,
                marginLeft: '4px',
                transition: 'opacity 0.1s',
              }}
            >
              |
            </span>
          </span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'hsl(var(--muted-foreground))',
            fontWeight: 400,
            maxWidth: '580px',
            margin: '24px auto 0',
            lineHeight: 1.6,
          }}
        >
          Get accurate recipes, exact quantities, and step-by-step guidance — powered by AI.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '40px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {user ? (
            <button
              onClick={handleScrollToForm}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '14px 32px',
                fontWeight: 600,
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
            >
              Generate a Recipe
            </button>
          ) : (
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '14px 32px',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
              >
                Generate a Recipe
              </button>
            </Link>
          )}

          <button
            style={{
              background: 'transparent',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              padding: '14px 32px',
              fontWeight: 500,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'hsl(var(--secondary))')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            See How It Works
          </button>
        </div>
      </div>
    </section>
  );
}
