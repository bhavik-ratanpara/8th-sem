import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Link from 'next/link';
import { FooterAccountLinks } from '@/components/FooterAccountLinks';
import { FooterAccordion } from '@/components/FooterAccordion';
import { ChefHat } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cooking Lab | Professional Culinary Academy',
  description: 'A minimalist, high-performance platform for professional-grade recipe generation and culinary intelligence.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.cdnfonts.com/css/cal-sans" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          <Header />
          <div className="pt-16 min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border bg-background py-16 mt-auto">
              <div className="max-w-6xl mx-auto px-6">
                
                {/* MOBILE FOOTER — only on small screens */}
                <div className="md:hidden">
                  {/* Brand section */}
                  <div className="px-6 py-8 border-b border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                        <ChefHat className="text-primary-foreground h-4 w-4" />
                      </div>
                      <span className="font-bold text-foreground">
                        Cooking Lab
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      AI powered recipe generator.
                      Get accurate recipes with exact
                      quantities and step by step guidance.
                    </p>
                    <div className="flex gap-3">
                      <a
                        href="https://github.com/bhavik-ratanpara"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          text-xs text-muted-foreground
                          border border-border
                          rounded-md px-3 py-1.5
                          hover:text-foreground
                          hover:border-foreground/40
                          transition-colors duration-200
                        "
                      >
                        GitHub
                      </a>
                      <a
                        href="https://www.linkedin.com/in/bhavik-ratanpara-500011377/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          text-xs text-muted-foreground
                          border border-border
                          rounded-md px-3 py-1.5
                          hover:text-foreground
                          hover:border-foreground/40
                          transition-colors duration-200
                        "
                      >
                        LinkedIn
                      </a>
                    </div>
                  </div>

                  {/* Accordion sections */}
                  <FooterAccordion />

                  {/* Bottom bar mobile */}
                  <div className="px-6 py-6 border-t border-border flex flex-col gap-2 text-center">
                    <div className="text-xs text-muted-foreground">
                      © {new Date().getFullYear()} Cooking Lab.
                      Built by Bhavik Ratanpara.
                    </div>
                  </div>
                </div>

                {/* DESKTOP FOOTER — only on large screens */}
                <div className="hidden md:grid md:grid-cols-4 gap-12 mb-16">
                  {/* Brand */}
                  <div className="space-y-4 md:col-span-1">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                        <ChefHat className="text-primary-foreground h-4 w-4" />
                      </div>
                      <span className="font-bold text-foreground">
                        Cooking Lab
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      AI powered recipe generator.
                      Get accurate recipes with exact
                      quantities and step by step guidance.
                    </p>
                  </div>

                  {/* Navigate */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                      Navigate
                    </h4>
                    <ul className="space-y-3 text-sm">
                      <li>
                        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                          Home
                        </Link>
                      </li>
                      <li>
                        <Link href="/explore" className="text-muted-foreground hover:text-foreground transition-colors">
                          Explore
                        </Link>
                      </li>
                      <li>
                        <Link href="/history" className="text-muted-foreground hover:text-foreground transition-colors">
                          My Recipes
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                          About
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Account — dynamic based on auth */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                      Account
                    </h4>
                    <FooterAccountLinks />
                  </div>

                  {/* Legal */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                      Legal
                    </h4>
                    <ul className="space-y-3 text-sm">
                      <li>
                        <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                          Terms of Service
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Bottom bar desktop */}
                <div className="hidden md:flex border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Cooking Lab.
                    Built by Bhavik Ratanpara.
                  </div>
                  <div className="flex gap-6">
                    <a
                      href="https://github.com/bhavik-ratanpara"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      GitHub
                    </a>
                    <a
                      href="https://www.linkedin.com/in/bhavik-ratanpara-500011377/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>

              </div>
            </footer>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
