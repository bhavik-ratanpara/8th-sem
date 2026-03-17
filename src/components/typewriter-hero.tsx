
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

  // Find the hero image from the placeholder library
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-food-cutout');

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
    <section className="w-full flex flex-col md:flex-row items-center gap-10 min-h-[520px] px-5 md:px-[60px] py-12 md:py-12 bg-background overflow-hidden">
      {/* Left Side - Cutout Image */}
      <div className="w-full md:w-[48%] order-1 flex justify-start">
        <div className="relative w-full max-w-[480px]">
          {heroImage && (
            <img
              src={heroImage.imageUrl}
              alt={heroImage.description}
              className="w-full h-auto object-contain bg-transparent"
              data-ai-hint={heroImage.imageHint}
            />
          )}
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="w-full md:w-[52%] flex flex-col items-center md:items-start text-center md:text-left md:pl-[48px] order-2">
        {/* Heading */}
        <h1 
          className="font-extrabold leading-[1.08] tracking-[-0.04em] mb-0" 
          style={{ 
            fontFamily: "'Cal Sans', Inter, sans-serif", 
            fontSize: 'clamp(36px, 4vw, 56px)' 
          }}
        >
          <span className="block text-foreground">Cook Smarter,</span>
          <span className="block min-h-[1.2em] text-[#60a5fa]">
            {currentWord}
            <span className={cn(
              "inline-block ml-1 font-light transition-opacity duration-100", 
              showCursor ? "opacity-100" : "opacity-0"
            )}>|</span>
          </span>
        </h1>

        {/* Subtext with Signature font */}
        <p 
          className="mt-4 text-[22px] font-normal leading-[1.8] text-[#a1a1aa] dark:text-[#a1a1aa]"
          style={{ fontFamily: "'Crustaceans Signature', cursive" }}
        >
          Get accurate recipes, exact quantities, and step-by-step guidance — powered by AI.
        </p>

        {/* Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center md:justify-start gap-[10px]">
          <Button 
            onClick={user ? handleScrollToForm : undefined}
            asChild={!user}
            className="h-auto py-[11px] px-6 text-sm font-semibold rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-none shadow-sm"
          >
            {user ? (
              <span>Generate a Recipe</span>
            ) : (
              <a href="/signup">Generate a Recipe</a>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-[11px] px-6 text-sm font-medium rounded-lg border-border bg-transparent text-[#71717a] hover:text-foreground transition-all"
          >
            See How It Works
          </Button>
        </div>
      </div>
    </section>
  );
}
