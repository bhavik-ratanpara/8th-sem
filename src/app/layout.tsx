import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Cooking Lab | Premium Culinary AI',
  description: 'Elevate your culinary journey with precision AI-crafted recipes and professional cooking tutorials.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-primary/20">
        <FirebaseClientProvider>
          <Header />
          <main className="relative min-h-[calc(100vh-3.5rem)]">{children}</main>
          <Toaster />
          <footer className="border-t bg-card py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
                <div>
                  <h3 className="font-headline text-xl mb-4">Cooking Lab</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto md:mx-0">
                    A premium digital space for culinary exploration, powered by advanced artificial intelligence.
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-xl mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Courses</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-headline text-xl mb-4">Connect</h3>
                  <p className="text-muted-foreground text-sm mb-4">Join our community of chefs.</p>
                  <div className="flex justify-center md:justify-start gap-4">
                    {/* Placeholder social icons could go here */}
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Instagram</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">YouTube</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-8 text-center text-xs text-muted-foreground uppercase tracking-widest">
                &copy; {new Date().getFullYear()} Cooking Lab Culinary Arts. All rights reserved.
              </div>
            </div>
          </footer>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}