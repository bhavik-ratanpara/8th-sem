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
        minHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--background)',
      }}
    >
      {/* Radial Glow Background */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)',
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
            gap: '6px',
            background: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            color: '#f97316',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '6px 14px',
            borderRadius: '999px',
            marginBottom: '24px',
          }}
        >
          ✦ AI Powered Recipe Generator
        </div>

        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
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
              color: '#f97316',
              display: 'block',
              minHeight: '1.1em',
            }}
          >
            {currentWord}
            <span
              style={{
                opacity: showCursor ? 1 : 0,
                color: '#f97316',
                fontWeight: 300,
                marginLeft: '2px',
                transition: 'opacity 0.1s',
              }}
            >
              |
            </span>
          </span>
        </h1>

        <p
          style={{
            fontSize: '17px',
            color: 'hsl(var(--muted-foreground))',
            fontWeight: 400,
            maxWidth: '520px',
            margin: '20px auto 0',
            lineHeight: 1.7,
          }}
        >
          Get accurate recipes, exact quantities, and step-by-step guidance — powered by AI.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '32px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {user ? (
            <button
              onClick={handleScrollToForm}
              style={{
                background: '#f97316',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 28px',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                boxShadow: '0 4px 14px 0 rgba(249,115,22,0.3)',
              }}
            >
              Generate a Recipe
            </button>
          ) : (
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: '#f97316',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 28px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 4px 14px 0 rgba(249,115,22,0.3)',
                }}
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
              borderRadius: '8px',
              padding: '12px 28px',
              fontWeight: 500,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            See How It Works
          </button>
        </div>
      </div>
    </section>
  );
}
