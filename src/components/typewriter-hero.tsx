'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <section className="w-full flex flex-col md:flex-row items-center gap-10 min-h-[520px] px-5 md:px-[60px] py-10 md:py-12 bg-background overflow-hidden">
      {/* Left Side - Image */}
      <div className="w-full md:w-[45%] order-1">
        <div className="relative w-full h-[260px] md:h-[480px] rounded-[12px] md:rounded-[16px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"
            alt="Professional chef cooking"
            className="w-full h-full object-cover"
            data-ai-hint="chef cooking"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent dark:from-black/60 light:from-white/20" />
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="w-full md:w-[55%] flex flex-col items-center md:items-start text-center md:text-left md:pl-10 order-2">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#3b82f6] dark:text-[#93c5fd] light:text-[#2563eb] text-[11px] font-medium tracking-[0.1em] uppercase rounded-full">
          ✦ AI Powered Recipe Generator
        </div>

        {/* Heading */}
        <h1 
          className="font-extrabold leading-[1.08] tracking-[-0.04em] mb-0" 
          style={{ 
            fontFamily: "'Cal Sans', Inter, sans-serif", 
            fontSize: 'clamp(36px, 4vw, 56px)' 
          }}
        >
          <span className="block text-foreground">Cook Smarter,</span>
          <span className="block min-h-[1.2em] text-[#60a5fa] dark:text-[#60a5fa] light:text-[#2563eb]">
            {currentWord}
            <span className={cn(
              "inline-block ml-1 font-light transition-opacity duration-100", 
              showCursor ? "opacity-100" : "opacity-0"
            )}>|</span>
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-4 text-[15px] leading-[1.75] text-muted-foreground max-w-[380px]">
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
            className="h-auto py-[11px] px-6 text-sm font-medium rounded-lg border-border bg-transparent text-muted-foreground hover:text-foreground transition-all"
          >
            See How It Works
          </Button>
        </div>

        {/* Stats Row */}
        <div className="mt-10 flex items-center justify-center md:justify-start divide-x divide-border">
          <div className="pr-5">
            <div className="text-[18px] font-bold text-foreground">500+</div>
            <div className="text-[12px] text-muted-foreground">Recipes</div>
          </div>
          <div className="px-5">
            <div className="text-[18px] font-bold text-foreground">8</div>
            <div className="text-[12px] text-muted-foreground">Cuisines</div>
          </div>
          <div className="px-5">
            <div className="text-[18px] font-bold text-foreground">100%</div>
            <div className="text-[12px] text-muted-foreground">Free</div>
          </div>
        </div>
      </div>
    </section>
  );
}
