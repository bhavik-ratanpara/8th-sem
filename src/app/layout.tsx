import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Cooking Lab | Professional Culinary Academy',
  description: 'A minimalist, high-performance platform for professional-grade recipe generation and culinary intelligence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.cdnfonts.com/css/cal-sans" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Crustaceans+Signature&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          <Header />
          <div className="pt-16 min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border bg-background py-16 mt-auto">
              <div className="max-content px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">Cooking Lab</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Precision-crafted culinary intelligence for professional chefs and home enthusiasts alike.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Platform</h4>
                    <ul className="space-y-3 text-sm">
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Recipes</a></li>
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Academy</a></li>
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Company</h4>
                    <ul className="space-y-3 text-sm">
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Our Vision</a></li>
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Culinary Blog</a></li>
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact Support</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Legal</h4>
                    <ul className="space-y-3 text-sm">
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-border mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground">
                  <div>&copy; {new Date().getFullYear()} Cooking Lab Academy. Engineered for excellence.</div>
                  <div className="flex gap-8">
                    <span className="cursor-pointer hover:text-foreground transition-colors">Twitter</span>
                    <span className="cursor-pointer hover:text-foreground transition-colors">GitHub</span>
                    <span className="cursor-pointer hover:text-foreground transition-colors">LinkedIn</span>
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
