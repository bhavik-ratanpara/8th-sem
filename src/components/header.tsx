'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Search, LogOut, User as UserIcon, ChefHat, Moon, Sun, BookMarked, Star } from 'lucide-react';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { YoutubeSearchResults, type YouTubeVideo } from './youtube-search-results';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import * as PopoverPrimitive from "@radix-ui/react-popover";

export function Header() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (systemDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    setIsDark(theme === "dark");

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newTheme = !prev;
      const themeName = newTheme ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", themeName);
      localStorage.setItem("theme", themeName);
      return newTheme;
    });
  };

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
        throw new Error(`Could not find videos.`);
      }
      const data = await response.json();
      setVideos(data.items || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch tutorials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-background border-b border-border h-16">
      <div className="max-content flex h-full items-center px-4 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight text-foreground">
            Cooking Lab
          </span>
        </Link>

        <div className="flex items-center space-x-4">
            {!isUserLoading && user && (
              <div className="hidden md:block">
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <div className="relative w-full max-w-sm">
                        <form onSubmit={handleSearch}>
                            <PopoverPrimitive.Anchor asChild>
                                <Input
                                    type="search"
                                    placeholder="Search for tutorials..."
                                    className="pr-10 h-10 bg-secondary/50 border-border"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        if(!e.target.value.trim()){
                                            setPopoverOpen(false);
                                        }
                                    }}
                                />
                            </PopoverPrimitive.Anchor>
                            <Button
                                type="submit"
                                size="icon"
                                variant="ghost"
                                className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 text-muted-foreground" />}
                            </Button>
                        </form>
                    </div>
                    <PopoverContent className="w-[400px] mt-2 p-0 rounded-lg shadow-xl bg-popover border-border" align="end">
                        <YoutubeSearchResults videos={videos} isLoading={isLoading} error={error} />
                    </PopoverContent>
                </Popover>
              </div>
            )}

            <nav className="flex items-center space-x-2">
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-md hover:bg-secondary"
                  onClick={toggleTheme}
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              )}

              {!isUserLoading && (
                <>
                  {user ? (
                    <div className="relative flex items-center gap-4" ref={dropdownRef}>
                      <Link href="/" className="text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors hidden sm:block">Home</Link>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="relative rounded-full overflow-hidden border border-border p-0"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        <Avatar className="h-full w-full">
                          <AvatarImage 
                            src={user.photoURL || ''} 
                            alt={user.displayName || 'User'} 
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xs font-medium bg-secondary flex items-center justify-center h-full w-full">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || <UserIcon className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
                      </Button>

                      {dropdownOpen && (
                        <div className="absolute right-0 top-12 w-64 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-4 py-3 border-b border-border bg-secondary/10">
                            <p className="text-sm font-semibold truncate text-foreground">{user.displayName || 'Chef'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          
                          <div className="p-1">
                            <Link 
                              href="/history" 
                              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <BookMarked className="h-4 w-4 text-primary" />
                              My Recipes
                            </Link>
                            <Link 
                              href="/history?filter=favourite" 
                              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <Star className="h-4 w-4 text-amber-500" />
                              Favourites
                            </Link>
                          </div>
                          
                          <div className="border-t border-border p-1 bg-secondary/5">
                            <button 
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button asChild variant="ghost" size="sm" className="font-medium text-sm h-10 px-4">
                        <Link href="/login">Sign In</Link>
                      </Button>
                      <Button asChild size="sm" className="font-medium text-sm bg-primary text-primary-foreground h-10 px-5 rounded-md">
                        <Link href="/signup">Start Cooking</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
              {isUserLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </nav>
        </div>
      </div>
    </header>
  );
}
