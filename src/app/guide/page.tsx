'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  ChefHat,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GuidePage() {
  const steps = [
    {
      step: 1,
      title: "Getting Started — Sign Up",
      description: "Click the 'Sign Up' button in the top-right corner of the navbar to create your account. You can register using your Email and Password, or continue with Google OAuth. If you already have an account, click 'Log In' at the bottom of the form. Note: Choose one login method and stick with it to avoid any login issues.",
      image: "/guide/step1.png",
      highlights: [
        "Sign Up button located in top-right corner",
        "Multiple registration options (Email or Google)",
        "Easy access to Log In for existing users"
      ]
    },
    {
      step: 2,
      title: "Create Your Account",
      description: "Fill in your Full Name, Email Address, and Password to register. Click 'Sign Up' to create an Email + Password account. Or click the 'Google' button at the bottom to sign in with Google OAuth. If you already have an account, click the 'Log In' link at the bottom. Important: The warning box reminds you to choose one login method and always use the same one.",
      image: "/guide/step2.png",
      highlights: [
        "Option 1: Standard Email + Password registration",
        "Option 2: Fast Google OAuth sign-in",
        "Account integrity warning for consistent login"
      ]
    },
    {
      step: 3,
      title: "Home Page — Navigation & Profile Menu",
      description: "Once logged in, you will see the full navigation bar at the top with links to Home, Explore, My Recipes, Favourites, Guide, and About. Click your profile avatar (letter icon) in the top-right corner to open the Profile Menu, which works on both Desktop and Mobile. From the profile menu you can navigate to any page or Sign Out.",
      image: "/guide/step3.png",
      highlights: [
        "Consolidated Navigation Bar for quick access",
        "Interactive Profile Menu with all navigation options",
        "Cross-device compatible interface"
      ]
    },
    {
      step: 4,
      title: "Search Cooking Videos from YouTube",
      description: "Use the Search Bar in the top-right of the navbar to search for any food item. As you type, a dropdown will appear showing relevant cooking tutorial videos fetched live from YouTube. Click any video to watch it directly. This feature lets you find cooking guidance without leaving the app.",
      image: "/guide/step4.png",
      highlights: [
        "Live YouTube search integration",
        "Contextual video tutorials for any dish",
        "Seamless in-app preview results"
      ]
    },
    {
      step: 5,
      title: "Generate a Recipe with AI",
      description: "On the Home page, you will find two tools side by side. The AI Recipe Assistant (left) — type ingredients or cravings to get recipe name suggestions instantly. The Create Your Recipe form (right) — fill in Recipe Name, Number of Servings, Cuisine/Region, Language, and Diet Type (Vegetarian or Non-Vegetarian), then click 'Generate Recipe' to let AI create a complete recipe for you.",
      image: "/guide/step5.png",
      highlights: [
        "AI Recipe Assistant for creative inspiration",
        "Structured generation form for precise needs",
        "Custom servings, language, and diet controls"
      ]
    },
    {
      step: 6,
      title: "View, Save & Customize Your Recipe",
      description: "After generating a recipe, you can view the complete ingredients list and step-by-step cooking instructions. Click 'Save Recipe' to store it in your personal My Recipes page so you can access it anytime. Click 'View My Recipes' to see all your saved recipes. Use the 'Make Changes' box at the bottom to customize the recipe instantly.",
      image: "/guide/step6.png",
      highlights: [
        "Permanent storage with 'Save Recipe' button",
        "Real-time customization via 'Make Changes' box",
        "Instant instruction regeneration"
      ]
    },
    {
      step: 7,
      title: "My Recipes — Manage Your Collection",
      description: "The My Recipes page shows all recipes you have saved. Use the filter buttons (All, Vegetarian, Non-Vegetarian) and Sort options (Newest First, Oldest First) to organize your recipes. Use the search bar to find a specific recipe. Click 'View Recipe' to open any recipe. Click 'Share to Public' to make your recipe visible to all users.",
      image: "/guide/step7.png",
      highlights: [
        "Comprehensive filter and sort system",
        "Recipe search functionality",
        "Public sharing toggle for community contribution"
      ]
    },
    {
      step: 8,
      title: "Explore Community Recipes",
      description: "The Explore page shows all recipes shared publicly by all users in the community. Use filters like Veg, Non-Veg, Shared by Me, Most Liked, and Language to find recipes. Click 'Save' on any recipe card to add it to your My Recipes collection — the button will change to 'Saved ✓' once done.",
      image: "/guide/step8.png",
      highlights: [
        "Discover trending and most-liked recipes",
        "Community language and diet filters",
        "Instant one-click save to personal cookbook"
      ]
    },
    {
      step: 9,
      title: "Share Recipe Link with Anyone",
      description: "After a recipe is shared to the Explore section, you can share its direct link with anyone outside the app. Click the Share icon (top-right of the recipe card) to open the system share dialog. You can copy the link or share it directly via WhatsApp, Gmail, Facebook, Twitter, Discord, and more.",
      image: "/guide/step9.png",
      highlights: [
        "External sharing via system share dialog",
        "Support for all major social platforms",
        "Direct public URL generation"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO SECTION ── */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-6 md:mb-8 hover:translate-x-[-4px] transition-transform"
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
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-16 md:space-y-24 lg:space-y-32">
          {steps.map((step, index) => {
            const isOdd = (index + 1) % 2 !== 0;
            return (
              <div key={step.step} className="group">
                <div className={`flex flex-col ${isOdd ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-12 lg:gap-20`}>
                  {/* IMAGE SIDE */}
                  <div className="w-full md:w-1/2">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                      <Image 
                        src={step.image} 
                        alt={step.title}
                        width={800}
                        height={500}
                        className="relative rounded-xl w-full object-cover shadow-xl border border-border"
                      />
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
                      <ul className="space-y-2 md:space-y-3">
                        {step.highlights.map((highlight, hIndex) => (
                          <li key={hIndex} className="flex items-start gap-3 text-muted-foreground text-xs md:text-sm">
                            <div className="mt-1 flex-shrink-0">
                              <div className="h-3.5 w-3.5 md:h-4 md:w-4 rounded-full bg-primary/20 flex items-center justify-center">
                                <div className="h-1 md:h-1.5 w-1 md:w-1.5 rounded-full bg-primary" />
                              </div>
                            </div>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mt-16 md:mt-24 lg:mt-32" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FINAL CTA SECTION ── */}
      <section className="py-16 md:py-24 px-6 bg-secondary/10 border-t border-border">
        <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 mb-2 md:mb-4">
            <ChefHat className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            You're all set! 🎉
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            You now know everything about Cooking Lab. Start generating your first AI recipe today and transform your cooking experience.
          </p>
          <div className="pt-2 md:pt-4">
            <Button asChild size="lg" className="h-12 md:h-14 px-8 md:px-10 rounded-xl text-base md:text-lg font-bold shadow-lg shadow-primary/20">
              <Link href="/" className="flex items-center gap-2">
                Generate a Recipe
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
