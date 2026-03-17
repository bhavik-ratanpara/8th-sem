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
      className="relative flex flex-col items-center justify-center text-center overflow-hidden w-full"
      style={{
        padding: '72px 40px 40px',
        marginBottom: '8px',
      }}
    >
      {/* Radial Glow Background */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[860px] mx-auto">
        <div
          className="inline-flex items-center gap-2 mb-6"
          style={{
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            color: 'var(--primary)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: '999px',
          }}
        >
          ✦ AI Powered Recipe Generator
        </div>

        <h1
          className="font-extrabold leading-[1.08] tracking-[-0.04em] mb-0 w-full max-w-[700px] mx-auto"
          style={{
            fontFamily: "'Cal Sans', 'Inter', sans-serif",
            fontSize: 'clamp(40px, 5.5vw, 60px)',
          }}
        >
          <span className="block text-foreground">
            Cook Smarter,
          </span>

          <span
            className="block min-h-[1.2em]"
            style={{
              color: 'var(--primary)',
            }}
          >
            {currentWord}
            <span
              className="inline-block transition-opacity duration-100 ml-1 font-light"
              style={{
                opacity: showCursor ? 1 : 0,
                color: 'var(--primary)',
              }}
            >
              |
            </span>
          </span>
        </h1>

        <p
          className="font-normal mx-auto leading-[1.75] mt-5"
          style={{
            fontSize: '15px',
            color: 'var(--muted-foreground)',
            maxWidth: '480px',
          }}
        >
          Get accurate recipes, exact quantities, and step-by-step guidance — powered by AI.
        </p>

        <div className="flex gap-[10px] mt-10 flex-wrap justify-center">
          {user ? (
            <button
              onClick={handleScrollToForm}
              className="bg-primary text-primary-foreground border-none rounded-lg px-[28px] py-[10px] font-semibold text-[15px] cursor-pointer transition-colors hover:bg-primary/90"
            >
              Generate a Recipe
            </button>
          ) : (
            <Link href="/signup" className="no-underline">
              <button
                className="bg-primary text-primary-foreground border-none rounded-lg px-[28px] py-[10px] font-semibold text-[15px] cursor-pointer transition-colors hover:bg-primary/90"
              >
                Generate a Recipe
              </button>
            </Link>
          )}

          <button
            className="bg-transparent border rounded-lg px-[22px] py-[10px] font-medium text-[14px] cursor-pointer transition-all duration-200"
            style={{
              color: 'var(--muted-foreground)',
              borderColor: 'var(--border)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'var(--foreground)';
              e.currentTarget.style.borderColor = 'var(--muted-foreground)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'var(--muted-foreground)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            See How It Works
          </button>
        </div>
      </div>
    </section>
  );
}
