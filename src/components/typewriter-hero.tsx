'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { RadarFeatures } from '@/components/RadarFeatures';
import { FoodDecorations } from '@/components/FoodDecorations';

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
    const element = document.getElementById('recipe-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="flex flex-row items-center py-4 md:py-12 px-0 md:pl-[60px] min-h-0 md:min-h-[540px] relative overflow-hidden"
      style={{
        display: "flex",
        width: "100%",
        maxWidth: "100vw",
        background: "transparent",
        justifyContent: "center",
        marginBottom: '32px',
      }}
    >
      <FoodDecorations />
      
      <div
        className="flex flex-row relative z-10"
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
          gap: "24px",
        }}
      >
        {/* LEFT — Text 52% */}
        <div
          className="w-[52%]"
          style={{
            flex: "0 0 52%",
            maxWidth: "52%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            paddingLeft: '16px',
            paddingRight: '8px',
            overflow: 'visible',
          }}
        >
          <div className="flex flex-col items-start text-left w-full">
            <h1 
              className="font-extrabold leading-[1.08] tracking-[-0.04em] mb-0" 
              style={{ 
                fontFamily: "'Cal Sans', Inter, sans-serif", 
                fontSize: 'clamp(22px, 7vw, 56px)' 
              }}
            >
              <span className="block text-foreground">Cook Smarter,</span>
              <span className="block min-h-[1.2em] text-primary whitespace-nowrap">
                {currentWord}
                <span className={cn(
                  "inline-block ml-1 font-light transition-opacity duration-100", 
                  showCursor ? "opacity-100" : "opacity-0"
                )}>|</span>
              </span>
            </h1>

            <p 
              className="mt-8 md:mt-12 font-normal leading-[1.6] md:leading-[1.8] text-muted-foreground max-w-full md:max-w-[420px] block"
              style={{ 
                fontFamily: "'Crustaceans Signature', cursive",
                fontSize: 'clamp(16px, 4.5vw, 22px)',
                marginBottom: '0px'
              }}
            >
              Get accurate recipes, exact quantities, and step-by-step guidance — powered by AI.
            </p>

            <div 
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '8px',
                marginTop: '56px',
                flexWrap: 'nowrap',
                alignItems: 'center',
              }}
            >
              <Button 
                onClick={user ? handleScrollToForm : undefined}
                asChild={!user}
                className="h-auto whitespace-nowrap"
                style={{
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px'
                }}
              >
                {user ? (
                  <span>Generate a Recipe</span>
                ) : (
                  <Link href="/signup">Generate a Recipe</Link>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="h-auto whitespace-nowrap"
                style={{
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '8px'
                }}
              >
                See How It Works
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT — Animation 48% */}
        <div
          className="w-[48%]"
          style={{
            flex: "0 0 48%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: '-80px', // Move animation upside to center with text content
          }}
        >
          <div className="w-full flex justify-center">
            <RadarFeatures />
          </div>
        </div>
      </div>
    </section>
  );
}
