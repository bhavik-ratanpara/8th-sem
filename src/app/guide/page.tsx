'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  ChefHat, 
  Sparkles, 
  BookMarked, 
  Youtube, 
  Search,
  MessageSquare,
  Zap,
  Globe
} from 'lucide-react';
import { FoodDecorations } from '@/components/FoodDecorations';
import { Button } from '@/components/ui/button';

export default function GuidePage() {
  const steps = [
    {
      title: "Step 1: Define Your Dish",
      description: "Start by entering the name of the dish you want to cook. You can specify the number of servings, preferred cuisine (e.g., Italian, Indian), and your dietary preference (Vegetarian or Non-Vegetarian).",
      icon: ChefHat,
      hint: "recipe form",
      image: "https://picsum.photos/seed/guide1/800/500",
      details: [
        "Select your preferred language for the recipe.",
        "Use the 'AI Recipe Assistant' on the left for creative cravings or mood-based suggestions.",
        "Exact serving calculations are handled automatically by the AI."
      ]
    },
    {
      title: "Step 2: AI Generation & Customization",
      description: "Our Gemini-powered AI creates a professional recipe with exact quantities. Not happy with an ingredient? Remove it and click 'Update Instructions' to let the AI rewrite the steps instantly.",
      icon: Sparkles,
      hint: "ai generation",
      image: "https://picsum.photos/seed/guide2/800/500",
      details: [
        "Modify the recipe further by typing requests like 'make it spicy' or 'no oven' in the modification box.",
        "Adjust servings on the fly to see quantities scale precisely.",
        "High-performance markdown formatting ensures easy reading."
      ]
    },
    {
      title: "Step 3: Save & Share",
      description: "Once you have the perfect recipe, save it to your private collection. From there, you can mark it as a favourite or share it with the Cooking Lab community on the Explore page.",
      icon: BookMarked,
      hint: "recipe history",
      image: "https://picsum.photos/seed/guide3/800/500",
      details: [
        "Access 'My Recipes' to view your full history of culinary creations.",
        "Publicly shared recipes can be 'Liked' by other members of the community.",
        "Directly share recipe links with friends and family."
      ]
    },
    {
      title: "Step 4: Master the Technique",
      description: "Need a visual guide? Use our integrated YouTube search in the header to find curated video tutorials for the exact dish you are making.",
      icon: Youtube,
      hint: "video search",
      image: "https://picsum.photos/seed/guide4/800/500",
      details: [
        "Search videos directly from the navigation bar while you cook.",
        "Videos are filtered to show high-relevance 'how-to' guides.",
        "Seamlessly switch between text instructions and video tutorials."
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <FoodDecorations />
      
      <div className="max-content px-6 py-12 relative z-10">
        <Link 
          href="/"
          className="flex items-center gap-2 text-primary font-bold text-sm mb-10 hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            How to use <span className="text-primary">Cooking Lab</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Follow this visual guide to master our AI-powered culinary platform and start creating professional-grade recipes in seconds.
          </p>
        </div>

        <div className="space-y-32">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{step.title}</h2>
                </div>
                
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {step.description}
                </p>

                <ul className="space-y-3">
                  {step.details.map((detail, dIndex) => (
                    <li key={dIndex} className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-1 w-full">
                <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl group">
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors z-10" />
                  <Image 
                    src={step.image} 
                    alt={step.title}
                    width={800}
                    height={500}
                    data-ai-hint={step.hint}
                    className="w-full h-auto object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute top-4 left-4 z-20 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border text-[10px] font-bold uppercase tracking-widest text-primary">
                    Instructional Preview
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ / Final CTA */}
        <div className="mt-40 mb-20 text-center py-20 bg-secondary/20 rounded-3xl border border-border">
          <h2 className="text-3xl font-bold mb-4">Ready to start cooking?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto px-4">
            Now that you know how it works, why not try generating your first intelligent recipe?
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="px-10 h-12 rounded-xl">
              <Link href="/">Try it Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-10 h-12 rounded-xl">
              <Link href="/explore">Browse Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
