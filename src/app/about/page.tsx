'use client'
import Link from 'next/link'
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
  Heart
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ══════════════════════════════ */}
      {/* SECTION 1 — HERO             */}
      {/* ══════════════════════════════ */}
      <section className="
        relative overflow-hidden
        pt-24 pb-20 px-6
        border-b border-border
      ">
        <div className="
          max-w-3xl mx-auto 
          text-center
        ">
          <div className="
            inline-flex items-center gap-2
            px-3 py-1.5 rounded-full
            border border-border
            text-xs text-muted-foreground
            mb-8
          ">
            <Sparkles className="h-3 w-3" />
            Powered by Gemini AI
          </div>

          <h1 className="
            text-5xl md:text-6xl 
            font-bold tracking-tight
            text-foreground
            leading-tight mb-6
          ">
            Cooking made
            <span className="text-primary">
              {' '}intelligent.
            </span>
          </h1>

          <p className="
            text-lg text-muted-foreground
            leading-relaxed max-w-xl mx-auto
          ">
            We believe everyone deserves to 
            cook great food with confidence — 
            whether you are a professional chef
            or cooking for the first time.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════ */}
      {/* SECTION 2 — PROBLEM WE SOLVE */}
      {/* ══════════════════════════════ */}
      <section className="
        py-20 px-6
        border-b border-border
      ">
        <div className="max-w-5xl mx-auto">
          <div className="
            text-center mb-16
          ">
            <p className="
              text-xs font-semibold 
              uppercase tracking-widest
              text-muted-foreground mb-4
            ">
              The Problem
            </p>
            <h2 className="
              text-3xl md:text-4xl 
              font-bold tracking-tight
            ">
              Cooking should not be this hard.
            </h2>
          </div>

          <div className="
            grid grid-cols-1 md:grid-cols-2 
            gap-6
          ">
            {/* Before */}
            <div className="
              rounded-xl border border-border
              p-8 space-y-4
              bg-background
            ">
              <p className="
                text-xs font-semibold
                uppercase tracking-widest
                text-muted-foreground
              ">
                Before Cooking Lab
              </p>
              {[
                'Searching multiple websites for one recipe',
                'Wrong quantities — too much or too little',
                'No clear step by step guidance',
                'Recipes only in one language',
                'No way to save or share your recipes',
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-3"
                >
                  <div className="
                    mt-0.5 h-5 w-5 rounded-full
                    border border-destructive/30
                    flex items-center justify-center
                    flex-shrink-0
                  ">
                    <span className="
                      text-destructive text-[10px]
                      font-bold
                    ">✕</span>
                  </div>
                  <p className="
                    text-sm text-muted-foreground
                    leading-relaxed
                  ">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            {/* After */}
            <div className="
              rounded-xl border border-primary/30
              p-8 space-y-4
              bg-primary/5
            ">
              <p className="
                text-xs font-semibold
                uppercase tracking-widest
                text-primary
              ">
                With Cooking Lab
              </p>
              {[
                'One prompt generates complete recipe instantly',
                'Exact quantities auto-scaled to your servings',
                'Clear step by step AI powered guidance',
                'Generate recipes in any language',
                'Save, favourite and share with community',
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-3"
                >
                  <div className="
                    mt-0.5 h-5 w-5 rounded-full
                    border border-primary/40
                    flex items-center justify-center
                    flex-shrink-0
                  ">
                    <span className="
                      text-primary text-[10px]
                      font-bold
                    ">✓</span>
                  </div>
                  <p className="
                    text-sm text-foreground
                    leading-relaxed
                  ">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ */}
      {/* SECTION 3 — HOW IT WORKS     */}
      {/* ══════════════════════════════ */}
      <section className="
        py-20 px-6
        border-b border-border
      ">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="
              text-xs font-semibold
              uppercase tracking-widest
              text-muted-foreground mb-4
            ">
              How It Works
            </p>
            <h2 className="
              text-3xl md:text-4xl
              font-bold tracking-tight
            ">
              Three steps to a perfect recipe.
            </h2>
          </div>

          <div className="
            grid grid-cols-1 md:grid-cols-3
            gap-8
          ">
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
                desc: 'Save to your collection, mark favourites, and share with the Cooking Lab community.',
              },
            ].map((item, i) => (
              <div key={i} className="
                relative p-8
                rounded-xl border border-border
                bg-background
                group
              ">
                <div className="
                  text-5xl font-bold
                  text-muted-foreground/10
                  mb-4 leading-none
                ">
                  {item.step}
                </div>
                <div className="mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="
                  font-semibold text-foreground
                  mb-2
                ">
                  {item.title}
                </h3>
                <p className="
                  text-sm text-muted-foreground
                  leading-relaxed
                ">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ */}
      {/* SECTION 4 — FEATURES         */}
      {/* ══════════════════════════════ */}
      <section className="
        py-20 px-6
        border-b border-border
      ">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="
              text-xs font-semibold
              uppercase tracking-widest
              text-muted-foreground mb-4
            ">
              Features
            </p>
            <h2 className="
              text-3xl md:text-4xl
              font-bold tracking-tight
            ">
              Everything you need to cook smarter.
            </h2>
          </div>

          <div className="
            grid grid-cols-1 md:grid-cols-2
            lg:grid-cols-3 gap-4
          ">
            {[
              {
                icon: Sparkles,
                title: 'AI Recipe Generation',
                desc: 'Powered by Google Gemini — generates accurate recipes in seconds.',
              },
              {
                icon: Globe,
                title: 'Multi Language',
                desc: 'Generate recipes in any language — cook in your mother tongue.',
              },
              {
                icon: Zap,
                title: 'Exact Quantities',
                desc: 'Auto-scaled ingredients for any number of servings — no guessing.',
              },
              {
                icon: BookMarked,
                title: 'Save Recipes',
                desc: 'Build your personal recipe collection — access anytime anywhere.',
              },
              {
                icon: Users,
                title: 'Community Explore',
                desc: 'Discover and save recipes shared by the Cooking Lab community.',
              },
              {
                icon: Heart,
                title: 'Like and Favourite',
                desc: 'Like community recipes and favourite your personal ones.',
              },
            ].map((item, i) => (
              <div key={i} className="
                p-6 rounded-xl
                border border-border
                bg-background
                hover:border-primary/30
                transition-colors duration-200
              ">
                <div className="mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="
                  font-semibold text-foreground
                  text-sm mb-1.5
                ">
                  {item.title}
                </h3>
                <p className="
                  text-xs text-muted-foreground
                  leading-relaxed
                ">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ */}
      {/* SECTION 5 — TECH STACK       */}
      {/* ══════════════════════════════ */}
      <section className="
        py-20 px-6
        border-b border-border
      ">
        <div className="max-w-3xl mx-auto text-center">
          <p className="
            text-xs font-semibold
            uppercase tracking-widest
            text-muted-foreground mb-4
          ">
            Built With
          </p>
          <h2 className="
            text-3xl font-bold
            tracking-tight mb-12
          ">
            Modern tech stack.
          </h2>

          <div className="
            flex flex-wrap justify-center
            gap-3
          ">
            {[
              'Next.js 15',
              'TypeScript',
              'Firebase Auth',
              'Firestore',
              'Gemini AI',
              'Vercel',
              'Tailwind CSS',
              'Shadcn UI',
            ].map((tech, i) => (
              <div key={i} className="
                px-4 py-2 rounded-full
                border border-border
                text-sm text-muted-foreground
                font-medium
                hover:border-primary/40
                hover:text-foreground
                transition-colors duration-200
              ">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ */}
      {/* SECTION 6 — CREATOR          */}
      {/* ══════════════════════════════ */}
      <section className="
        py-20 px-6
        border-b border-border
      ">
        <div className="max-w-3xl mx-auto text-center">
          <p className="
            text-xs font-semibold
            uppercase tracking-widest
            text-muted-foreground mb-4
          ">
            The Creator
          </p>
          <h2 className="
            text-3xl font-bold
            tracking-tight mb-12
          ">
            Built with passion.
          </h2>

          <div className="
            inline-flex flex-col
            items-center gap-6
            p-8 rounded-2xl
            border border-border
            bg-background
          ">
            <div className="
              text-3xl font-bold text-primary
            ">
              BR
            </div>

            <div>
              <h3 className="
                text-xl font-bold
                text-foreground mb-1
              ">
                Bhavik Ratanpara
              </h3>
              <p className="
                text-sm text-muted-foreground
                mb-6
              ">
                Final Year Engineering Student
                · Full Stack Developer
              </p>
              <p className="
                text-sm text-muted-foreground
                leading-relaxed
                max-w-md mx-auto mb-8
              ">
                Cooking Lab is my 8th semester
                project — built to solve a real
                problem and learn modern web
                development with AI integration.
              </p>

              <div className="
                flex items-center justify-center
                gap-4
              ">
                <a
                  href="https://github.com/bhavik-ratanpara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center gap-2
                    px-4 py-2 rounded-lg
                    border border-border
                    text-sm text-muted-foreground
                    hover:text-foreground
                    hover:border-foreground/40
                    transition-all duration-200
                  "
                >
                  <Github className="h-4 w-4"/>
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/bhavik-ratanpara-500011377/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center gap-2
                    px-4 py-2 rounded-lg
                    border border-border
                    text-sm text-muted-foreground
                    hover:text-foreground
                    hover:border-foreground/40
                    transition-all duration-200
                  "
                >
                  <Linkedin className="h-4 w-4"/>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ */}
      {/* SECTION 7 — CTA              */}
      {/* ══════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="
          max-w-2xl mx-auto text-center
        ">
          <h2 className="
            text-3xl md:text-4xl
            font-bold tracking-tight mb-4
          ">
            Ready to cook smarter?
          </h2>
          <p className="
            text-muted-foreground mb-10
          ">
            Join the Cooking Lab community
            and start generating perfect
            recipes today.
          </p>
          <div className="
            flex flex-wrap justify-center
            gap-4
          ">
            <Link href="/">
              <button className="
                flex items-center gap-2
                px-6 py-3 rounded-lg
                bg-primary text-primary-foreground
                font-semibold text-sm
                hover:opacity-90
                transition-opacity duration-200
              ">
                Generate a Recipe
                <ArrowRight className="h-4 w-4"/>
              </button>
            </Link>
            <Link href="/explore">
              <button className="
                flex items-center gap-2
                px-6 py-3 rounded-lg
                border border-border
                text-foreground
                font-semibold text-sm
                hover:bg-accent
                transition-colors duration-200
              ">
                Explore Community
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
