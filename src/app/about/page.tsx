'use client';

import Link from 'next/link';
import { 
  ChefHat, 
  Sparkles, 
  Globe, 
  BookMarked,
  Users,
  ArrowRight,
  Github,
  Linkedin,
  Zap,
  Heart,
  CheckCircle2,
  XCircle,
  Layout,
  Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoodDecorations } from '@/components/FoodDecorations';

/**
 * @fileOverview Redesigned About page matching the app's SaaS visual identity.
 */
export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <FoodDecorations />
      
      {/* ── HERO SECTION ── */}
      <section className="relative z-10 pt-20 pb-16 px-6 border-b border-border">
        <div className="max-content text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-6">
            Our Mission
          </div>
          <h1 
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6"
            style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}
          >
            Cooking made
            <span className="text-primary"> intelligent.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We believe everyone deserves to cook great food with confidence — 
            whether you are a professional chef or cooking for the first time.
          </p>
        </div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <section className="relative z-10 py-20 px-6 border-b border-border bg-secondary/5">
        <div className="max-content">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Cooking should not be this hard.
            </h2>
            <p className="text-muted-foreground">The gap between a craving and a perfect meal just got smaller.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-sm font-bold uppercase tracking-wider">Before Cooking Lab</span>
              </div>
              <ul className="space-y-4">
                {[
                  'Searching multiple websites for one recipe',
                  'Wrong quantities — too much or too little',
                  'No clear step-by-step guidance',
                  'Recipes only available in one language',
                  'No easy way to save or share your collection',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                    <span className="mt-1 text-destructive font-bold">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="bg-card border-2 border-primary/20 p-8 rounded-2xl shadow-md space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles className="h-24 w-24 text-primary" />
              </div>
              <div className="flex items-center gap-3 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">With Cooking Lab</span>
              </div>
              <ul className="space-y-4">
                {[
                  'One prompt generates complete recipes instantly',
                  'Exact quantities auto-scaled to your servings',
                  'Clear step-by-step AI powered guidance',
                  'Generate recipes in any language you speak',
                  'Save, favourite and share with the community',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground font-medium leading-relaxed">
                    <span className="mt-1 text-primary font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section className="relative z-10 py-20 px-6 border-b border-border">
        <div className="max-content">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Process</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Three steps to perfection.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: ChefHat,
                title: 'Enter your dish',
                desc: 'Type any dish name, choose your cuisine, set servings and preferred language.',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'AI generates recipe',
                desc: 'Gemini AI instantly creates a complete recipe with exact quantities and clear steps.',
              },
              {
                step: '03',
                icon: BookMarked,
                title: 'Save and share',
                desc: 'Save to your collection, mark favourites, and share with the community.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border p-8 rounded-2xl hover:border-primary/40 transition-colors group relative">
                {/* Fixed visibility for step numbers: Increased contrast significantly for both modes */}
                <div className="text-5xl font-black text-primary/40 dark:text-primary/50 mb-4 group-hover:text-primary/60 transition-colors pointer-events-none select-none">
                  {item.step}
                </div>
                <div className="bg-primary/5 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="relative z-10 py-20 px-6 border-b border-border bg-secondary/5">
        <div className="max-content">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need.</h2>
            <p className="text-muted-foreground">Professional tools for the modern home cook.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI Generation',
                desc: 'Powered by Google Gemini for accurate recipes in seconds.',
              },
              {
                icon: Globe,
                title: 'Multi Language',
                desc: 'Generate recipes in any language — cook in your native tongue.',
              },
              {
                icon: Zap,
                title: 'Auto-Scaling',
                desc: 'Exact quantities scaled for any number of servings.',
              },
              {
                icon: Layout,
                title: 'Private Cookbook',
                desc: 'Build your personal recipe collection and access it anywhere.',
              },
              {
                icon: Users,
                title: 'Community Explore',
                desc: 'Discover and save recipes shared by other passionate chefs.',
              },
              {
                icon: Heart,
                title: 'Personal Picks',
                desc: 'Mark your top recipes as favourites for quick access.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 bg-card border border-border rounded-xl shadow-sm">
                <div className="shrink-0 bg-primary/5 w-10 h-10 rounded-lg flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="relative z-10 py-20 px-6 border-b border-border">
        <div className="max-content text-center">
          <h2 className="text-2xl font-bold mb-10 flex items-center justify-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            Built with a modern stack.
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Next.js 15',
              'TypeScript',
              'Firebase Auth',
              'Firestore',
              'Genkit',
              'Gemini AI',
              'Tailwind CSS',
              'Shadcn UI',
            ].map((tech, i) => (
              <span key={i} className="px-4 py-2 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground shadow-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CREATOR SECTION ── */}
      <section className="relative z-10 py-24 px-6 border-b border-border bg-secondary/5">
        <div className="max-content">
          <div className="max-w-2xl mx-auto bg-card border border-border p-10 rounded-3xl shadow-xl text-center">
            <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold border-4 border-background shadow-lg mx-auto mb-8">
              B
            </div>
            <h3 className="text-2xl font-bold mb-2">Bhavik</h3>
            <p className="text-primary font-semibold text-sm mb-6 uppercase tracking-wider">Lead Developer</p>
            <p className="text-muted-foreground leading-relaxed mb-10 text-sm">
              Cooking Lab is my 8th semester project — built to solve a real
              problem and master modern web development with AI integration.
              I'm passionate about creating tools that make complex tasks feel simple.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://github.com/bhavik-ratanpara"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-secondary transition-colors"
              >
                <Github className="h-4 w-4"/>
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/bhavik-ratanpara-500011377/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-secondary transition-colors"
              >
                <Linkedin className="h-4 w-4"/>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-content text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to cook smarter?</h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            Join the Cooking Lab community and start generating your first AI-powered recipe today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-10 rounded-2xl text-base font-bold shadow-lg shadow-primary/20">
              <Link href="/" className="flex items-center gap-2">
                Generate a Recipe
                <ArrowRight className="h-5 w-5"/>
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="h-14 px-10 rounded-2xl text-base font-bold">
              <Link href="/explore">Explore Community</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
