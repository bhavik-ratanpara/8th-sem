import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Link from 'next/link';
import { FooterAccountLinks } from '@/components/FooterAccountLinks';
import { FooterAccordion } from '@/components/FooterAccordion';
import { ChefHat } from 'lucide-react';
import { MissingItemsPopup } from '@/components/MissingItemsPopup';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';

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
    <html lang="en" className="dark">
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
          <SmoothScrollProvider>
            <Header />
            <MissingItemsPopup />
            <div className="pt-[52px] min-h-screen flex flex-col">
              <main className="flex-1">{children}</main>
              <footer className="relative z-20 border-t border-border bg-background py-8 mt-auto">
                <div className="max-w-6xl mx-auto px-6">

                  {/* MOBILE FOOTER — only on small screens */}
                  <div className="md:hidden">
                    {/* Brand section */}
                    <div className="px-6 py-6 border-b border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <ChefHat className="text-primary h-6 w-6" />
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
                    <div className="px-6 py-4 border-t border-border flex flex-col gap-2 text-center">
                      <div className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Cooking Lab.
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP FOOTER — only on large screens */}
                  <div className="hidden md:flex justify-between items-start mb-10">
                    {/* Brand */}
                    <div className="space-y-4 max-w-sm">
                      <div className="flex items-center gap-2">
                        <ChefHat className="text-primary h-6 w-6" />
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

                    {/* Links */}
                    <div className="flex gap-16">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                          Resources
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li>
                            <Link href="/guide" className="text-muted-foreground hover:text-foreground transition-colors">
                              Guide
                            </Link>
                          </li>
                          <li>
                            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                              About
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                          Legal
                        </h4>
                        <ul className="space-y-2 text-sm">
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
                  </div>

                  {/* Bottom bar desktop */}
                  <div className="hidden md:flex border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-muted-foreground">
                      © {new Date().getFullYear()} Cooking Lab.
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
          </SmoothScrollProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
