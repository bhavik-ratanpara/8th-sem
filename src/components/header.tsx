'use client';

import { useState, useEffect } from 'react';
import { Icons } from './icons';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Search, LogOut, User as UserIcon, ChefHat } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { YoutubeSearchResults, type YouTubeVideo } from './youtube-search-results';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Header() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setVideos([]);
    setPopoverOpen(true);

    try {
      const response = await fetch(`/api/youtube?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`An error occurred: ${response.statusText}`);
      }
      const data = await response.json();
      setVideos(data.items || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch videos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-background/95 backdrop-blur shadow-sm border-b h-16" 
          : "bg-transparent h-20"
      )}
    >
      <div className="container mx-auto flex h-full items-center px-4 justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <ChefHat className="h-6 w-6 text-primary" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight hidden sm:inline-block italic">
            Cooking <span className="text-primary not-italic">Lab</span>
          </span>
        </Link>

        <div className="flex items-center space-x-6">
            {!isUserLoading && user && (
              <div className="hidden md:block">
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <div className="relative w-full max-w-sm">
                        <form onSubmit={handleSearch}>
                            <PopoverTrigger asChild>
                                <Input
                                    type="search"
                                    placeholder="Search chef tutorials..."
                                    className="pr-10 h-10 rounded-full border-primary/20 bg-background/50 focus:bg-background"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        if(!e.target.value.trim()){
                                            setPopoverOpen(false);
                                        }
                                    }}
                                />
                            </PopoverTrigger>
                            <Button
                                type="submit"
                                size="icon"
                                variant="ghost"
                                className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Search className="h-4 w-4 text-primary" />}
                            </Button>
                        </form>
                    </div>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] mt-2 p-2 rounded-2xl shadow-xl" align="start">
                        <YoutubeSearchResults videos={videos} isLoading={isLoading} error={error} />
                    </PopoverContent>
                </Popover>
              </div>
            )}

            <nav className="flex items-center space-x-2">
              {!isUserLoading && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {user.displayName?.charAt(0) || user.email?.charAt(0) || <UserIcon className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 rounded-2xl p-2 mt-2" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal p-4">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-bold leading-none font-headline">{user.displayName || 'Chef'}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer rounded-xl p-3">
                          <LogOut className="mr-3 h-4 w-4" />
                          <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex gap-4">
                      <Button asChild variant="ghost" className="font-bold text-xs uppercase tracking-widest text-foreground hover:text-primary hover:bg-transparent">
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild variant="default" className="pill-button h-10 bg-primary text-xs uppercase tracking-widest">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
              {isUserLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </nav>
        </div>
      </div>
    </header>
  );
}