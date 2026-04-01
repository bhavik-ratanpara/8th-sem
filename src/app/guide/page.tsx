'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  ChefHat,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GuidePage() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const steps = [
    {
      step: 1,
      title: "Getting Started — Sign Up",
      description: "Click the 'Sign Up' button in the top-right corner of the navbar to create your account. You can register using your Email and Password, or continue with Google OAuth. If you already have an account, click 'Log In' at the bottom of the form. Note: Choose one login method and stick with it to avoid any login issues.",
      image: "/step1.png",
      highlights: [
        "Sign Up button is highlighted in top-right corner (red box)"
      ]
    },
    {
      step: 2,
      title: "Create Your Account",
      description: "Fill in your Full Name, Email Address, and Password to register. Click 'Sign Up' to create an Email + Password account. Or click the 'Google' button at the bottom to sign in with Google OAuth. If you already have an account, click the 'Log In' link at the bottom. Important: The warning box reminds you to choose one login method and always use the same one.",
      image: "/step2.png",
      highlights: [
        "Email + Password fields marked as option 1",
        "Google button marked as option 2 (OAuth)",
        "Log In link marked for already registered users"
      ]
    },
    {
      step: 3,
      title: "Home Page — Navigation & Profile Menu",
      description: "Once logged in, you will see the full navigation bar at the top with links to Home, Explore, My Recipes, Favourites, Guide, and About. Click your profile avatar (letter icon) in the top-right corner to open the Profile Menu, which works on both Desktop and Mobile. From the profile menu you can navigate to any page or Sign Out.",
      image: "/step3.png",
      highlights: [
        "Navigation bar highlighted with red box",
        "Profile menu dropdown highlighted showing all navigation options"
      ]
    },
    {
      step: 4,
      title: "Search Cooking Videos from YouTube",
      description: "Use the Search Bar in the top-right of the navbar to search for any food item. As you type, a dropdown will appear showing relevant cooking tutorial videos fetched live from YouTube. Click any video to watch it directly. This feature lets you find cooking guidance without leaving the app.",
      image: "/step4.png",
      highlights: [
        "Search bar showing 'Burrata Salad' typed",
        "Dropdown showing YouTube video results highlighted in red box"
      ]
    },
    {
      step: 5,
      title: "Generate a Recipe with AI",
      description: "On the Home page, you will find two tools side by side. The AI Recipe Assistant (left) — type ingredients or cravings to get recipe name suggestions instantly. The Create Your Recipe form (right) — fill in Recipe Name, Number of Servings, Cuisine/Region, Language, and Diet Type (Vegetarian or Non-Vegetarian), then click 'Generate Recipe' to let AI create a complete recipe for you. Both tools serve different purposes — use based on your needs.",
      image: "/step5.png",
      highlights: [
        "AI Recipe Assistant box with arrow pointing to it",
        "Create Your Recipe form with all fields highlighted in red boxes",
        "Note: both are used for different purposes"
      ]
    },
    {
      step: 6,
      title: "View, Save & Customize Your Recipe",
      description: "After generating a recipe, you can view the complete ingredients list and step-by-step cooking instructions. Click 'Save Recipe' to store it in your personal My Recipes page so you can access it anytime. Click 'View My Recipes' to see all your saved recipes. Use the 'Make Changes' box at the bottom to customize the recipe — type things like 'make it spicier', 'no onion', or 'I don't have an oven' and click 'Update Recipe' to regenerate it instantly.",
      image: "/step6.png",
      highlights: [
        "Save Recipe button highlighted",
        "View My Recipes button highlighted",
        "Make Changes box highlighted in red box"
      ]
    },
    {
      step: 7,
      title: "My Recipes — Manage Your Collection",
      description: "The My Recipes page shows all recipes you have saved. Use the filter buttons (All, Vegetarian, Non-Vegetarian) and Sort options (Newest First, Oldest First) to organize your recipes. Use the search bar to find a specific recipe. Click 'View Recipe' to open any recipe. Click 'Share to Public' to make your recipe visible to all users in the Explore community section.",
      image: "/step7.png",
      highlights: [
        "Filter and sort bar highlighted in red box",
        "Share to Public button highlighted with arrow"
      ]
    },
    {
      step: 8,
      title: "Explore Community Recipes",
      description: "The Explore page shows all recipes shared publicly by all users in the community. Use filters like Veg, Non-Veg, Shared by Me, Most Liked, and Language to find recipes. Click 'Save' on any recipe card to add it to your My Recipes collection — the button will change to 'Saved ✓' once done. Your own shared recipes will show a 'Remove' button instead of Save.",
      image: "/step8.png",
      highlights: [
        "Save button highlighted with arrow",
        "Saved button showing state change highlighted with arrow"
      ]
    },
    {
      step: 9,
      title: "Share Recipe Link with Anyone",
      description: "After a recipe is shared to the Explore section, you can share its direct link with anyone outside the app. Click the Share icon (top-right of the recipe card) to open the system share dialog. You can copy the link or share it directly via WhatsApp, Gmail, Facebook, Twitter, Discord, and more.",
      image: "/step9.png",
      highlights: [
        "Share icon on recipe card highlighted with red box and arrow",
        "Share dialog popup showing copy link and social share options highlighted"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO SECTION ── */}
      <section className="pt-12 pb-8 md:pt-24 md:pb-16 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4 md:mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            App Guide
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Learn how to use <span className="text-primary font-semibold">Cooking Lab</span> step by step and master our AI-powered culinary platform.
          </p>
        </div>
      </section>

      {/* ── GUIDE STEPS ── */}
      <section className="py-8 md:py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12 md:space-y-24">
          {steps.map((step, index) => {
            const isOdd = (index + 1) % 2 !== 0;
            return (
              <div key={step.step} className="group">
                <div className={`flex flex-col ${isOdd ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-6 md:gap-20`}>
                  {/* IMAGE SIDE */}
                  <div className="w-full md:w-1/2">
                    <div
                      onClick={() => {
                        setLightboxImage(step.image)
                        setLightboxAlt(step.title)
                      }}
                      style={{
                        cursor: 'zoom-in',
                        position: 'relative',
                      }}
                    >
                      <Image 
                        src={step.image} 
                        alt={step.title}
                        width={800}
                        height={500}
                        className="rounded-xl w-full object-cover shadow-xl border border-border hover:opacity-90 transition-opacity duration-200"
                      />
                      
                      {/* Zoom hint */}
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        pointerEvents: 'none',
                      }}>
                        <svg 
                          width="12" height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" x1="21" x2="16.65" y2="16.65"/>
                          <line x1="11" y1="8" x2="11" y2="14"/>
                          <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                        Click to zoom
                      </div>
                    </div>
                  </div>

                  {/* TEXT SIDE */}
                  <div className="w-full md:w-1/2 space-y-4 md:space-y-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold tracking-widest uppercase">
                      Step {step.step}
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
                      {step.title}
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    <div className="space-y-2 md:space-y-3 pt-2">
                      <p className="text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider">Key Highlights:</p>
                      <ul className="space-y-2">
                        {step.highlights.map((highlight, hIndex) => (
                          <li key={hIndex} className="flex items-start gap-3 text-muted-foreground text-xs md:text-sm">
                            <div className="mt-1 flex-shrink-0">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            </div>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="h-px w-full bg-border mt-12 md:mt-24" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FINAL CTA SECTION ── */}
      <section className="py-16 md:py-24 px-6 bg-secondary/10 border-t border-border">
        <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            You're all set! 🎉
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            You now know everything about Cooking Lab. Start generating your first AI recipe today.
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="h-12 md:h-14 px-8 md:px-10 rounded-xl text-base md:text-lg font-bold shadow-lg shadow-primary/20">
              <Link href="/" className="flex items-center gap-2">
                Generate a Recipe
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox at the end of the page container */}
      {lightboxImage && (
        <>
          {/* Dark overlay */}
          <div
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 50,
              cursor: 'zoom-out',
            }}
          />

          {/* Lightbox container */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 51,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              pointerEvents: 'none',
            }}
          >
            {/* Image wrapper */}
            <div
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                pointerEvents: 'all',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setLightboxImage(null)}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '0',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  zIndex: 52,
                }}
              >
                <svg
                  width="18" height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              {/* Alt text label */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                left: '0',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '13px',
                fontWeight: 500,
              }}>
                {lightboxAlt}
              </div>

              {/* The enlarged image */}
              <Image
                src={lightboxImage}
                width={1200}
                height={750}
                alt={lightboxAlt}
                style={{
                  maxWidth: '90vw',
                  maxHeight: '85vh',
                  width: 'auto',
                  height: 'auto',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />

              {/* Close hint */}
              <div style={{
                position: 'absolute',
                bottom: '-32px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}>
                Press Esc or click outside to close
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
