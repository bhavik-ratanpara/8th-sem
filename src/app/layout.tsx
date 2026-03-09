import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { BackgroundAnimation } from '@/components/background-animation';
import { Header } from '@/components/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Cooking Lab',
  description: 'Your personal AI chef. Create any recipe, for any number of people, from anywhere in the world.',
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
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <BackgroundAnimation />
          <Header />
          <main className="relative z-10 min-h-[calc(100vh-3.5rem)]">{children}</main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}