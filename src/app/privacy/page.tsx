'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/**
 * @fileOverview Privacy Policy page for Cooking Lab.
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-20">
        
        <Link 
          href="/"
          className="flex items-center gap-2 text-primary font-bold text-sm mb-10 hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Legal
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: March 2026
          </p>
        </div>

        <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              1. Information We Collect
            </h2>
            <p>
              When you create an account we collect your 
              email address and name. If you sign in with 
              Google we receive your Google profile 
              information including your name and email.
            </p>
            <p>
              We also collect recipes you generate, save, 
              and share on the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to provide and 
              improve Cooking Lab. This includes 
              authenticating your account, saving your 
              recipes, and enabling community features 
              like sharing and liking recipes.
            </p>
            <p>
              We do not sell your personal information 
              to any third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              3. Data Storage
            </h2>
            <p>
              Your data is stored securely using Google 
              Firebase — a trusted cloud platform by 
              Google. Your recipes and account information 
              are stored in Firestore database with 
              appropriate security rules.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              4. AI Generated Content
            </h2>
            <p>
              Recipes are generated using Google Gemini AI. 
              Your recipe requests are processed by 
              Google Gemini API. Please do not include 
              sensitive personal information in recipe 
              generation prompts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              5. Cookies
            </h2>
            <p>
              We use essential cookies for authentication 
              and session management. We do not use 
              tracking or advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              6. Your Rights
            </h2>
            <p>
              You can delete your account and all 
              associated data at any time. You can also 
              remove any recipes you have shared from 
              the community Explore page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              7. Contact
            </h2>
            <p>
              If you have any questions about this 
              Privacy Policy please contact us via 
              GitHub or LinkedIn.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
