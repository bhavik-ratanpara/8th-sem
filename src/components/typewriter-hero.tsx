'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
    <section className="w-full flex flex-col md:flex-row items-center gap-12 min-h-[520px] px-5 md:px-[60px] py-12 md:py-20 bg-background overflow-hidden">
      {/* Left Side - Cutout Image (45% width) */}
      <div className="w-full md:w-[45%] order-1 flex justify-center md:justify-start items-center">
        <img
          src="/hero-food.png"
          alt="Chef"
          style={{
            width: "100%",
            maxWidth: "440px",
            height: "auto",
            objectFit: "contain",
            background: "none",
            border: "none",
            borderRadius: "0",
            boxShadow: "none",
            display: "block"
          }}
          className="max-h-[250px] md:max-h-[450px]"
        />
      </div>

      {/* Right Side - Content (55% width) */}
      <div className="w-full md:w-[55%] flex flex-col items-center md:items-start text-center md:text-left md:pl-[32px] order-2">
        <h1 
          className="font-extrabold leading-[1.08] tracking-[-0.04em] mb-0" 
          style={{ 
            fontFamily: "'Cal Sans', Inter, sans-serif", 
            fontSize: 'clamp(36px, 4.5vw, 56px)' 
          }}
        >
          <span className="block text-[#0f0f0f] dark:text-[#ffffff]">Cook Smarter,</span>
          <span className="block min-h-[1.2em] text-[#2563eb] dark:text-[#60a5fa]">
            {currentWord}
            <span className={cn(
              "inline-block ml-1 font-light transition-opacity duration-100", 
              showCursor ? "opacity-100" : "opacity-0"
            )}>|</span>
          </span>
        </h1>

        <p 
          className="mt-4 text-[22px] font-normal leading-[1.8] text-[#6b7280] dark:text-[#a1a1aa] max-w-[420px]"
          style={{ fontFamily: "'Crustaceans Signature', cursive" }}
        >
          Get accurate recipes, exact quantities, and step-by-step guidance — powered by AI.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-[10px]">
          <Button 
            onClick={user ? handleScrollToForm : undefined}
            asChild={!user}
            className="h-auto py-[12px] px-7 text-sm font-semibold rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-none shadow-sm transition-all"
          >
            {user ? (
              <span>Generate a Recipe</span>
            ) : (
              <Link href="/signup">Generate a Recipe</Link>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-[12px] px-7 text-sm font-medium rounded-lg border-[#e5e7eb] dark:border-[#2a2a2a] bg-transparent text-[#6b7280] dark:text-[#71717a] hover:text-[#0f0f0f] dark:hover:text-white hover:border-[#0f0f0f] dark:hover:border-[#3f3f46] transition-all"
          >
            See How It Works
          </Button>
        </div>
      </div>
    </section>
  );
}
