'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Search, LogOut, User as UserIcon, ChefHat, Moon, Sun, BookMarked, Star, X, Globe } from 'lucide-react';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { YoutubeSearchResults, type YouTubeVideo } from './youtube-search-results';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from '@/lib/utils';

export function Header() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  const [isDark, setIsDark] = useState<boolean>(false);

  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
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
    <header className="sticky top-0 z-50 w-full h-[52px] bg-background border-b border-border">
      <div className="flex items-center w-full h-full px-6 overflow-hidden relative">
        
        {/* LEFT - Logo */}
        <div className="flex-shrink-0 mr-auto">
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="font-bold text-[18px] tracking-tight text-foreground whitespace-nowrap">
              Cooking Lab
            </span>
          </Link>
        </div>

        {/* CENTER - Nav links (Desktop only) */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-full">
          <Link href="/" className={cn("nav-link text-[15px]", pathname === "/" && "active")}>
            Home
          </Link>
          <span className="nav-separator">/</span>
          <Link href="/explore" className={cn("nav-link text-[15px]", pathname === "/explore" && "active")}>
            Explore
          </Link>
          {!isUserLoading && user && (
            <>
              <span className="nav-separator">/</span>
              <Link href="/history" className={cn("nav-link text-[15px]", pathname.startsWith("/history") && "active")}>
                My Recipes
              </Link>
            </>
          )}
        </nav>

        {/* RIGHT - Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          
          {/* Search */}
          {!isUserLoading && user && (
            <div className={cn(
              "transition-all duration-300",
              isMobileSearchOpen ? "w-[130px] sm:w-[180px]" : "w-0 md:w-[150px] overflow-hidden"
            )}>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <div className="relative w-full">
                  <form onSubmit={handleSearch} className="flex items-center">
                    <PopoverPrimitive.Anchor asChild>
                      <Input
                        type="search"
                        placeholder="Search..."
                        className="pr-8 h-8 md:h-9 bg-secondary/50 border-border text-[12px]"
                        autoFocus={isMobileSearchOpen}
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
                      className="absolute right-0 top-0 h-full w-8 hover:bg-transparent"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                  </form>
                </div>
                <PopoverContent className="w-[calc(100vw-2rem)] md:w-[400px] mt-2 p-0 rounded-lg shadow-xl bg-popover border-border" align="end">
                  <YoutubeSearchResults videos={videos} isLoading={isLoading} error={error} />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Search Toggle (Mobile) */}
          {!isUserLoading && user && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              {isMobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
          )}

          {/* Theme Toggle */}
          {mounted && !isMobileSearchOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {/* Profile Dropdown */}
          {!isUserLoading && !isMobileSearchOpen && (
            <>
              {user ? (
                <div className="relative flex items-center" ref={dropdownRef}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 md:h-9 md:w-9 rounded-full overflow-hidden border border-border p-0"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage 
                        src={user.photoURL || ''} 
                        alt={user.displayName || 'User'} 
                        className="object-cover"
                      />
                      <AvatarFallback className="text-[10px] bg-secondary flex items-center justify-center h-full w-full">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || <UserIcon className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-[40px] md:top-[44px] w-64 bg-card border border-border rounded-lg shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-border bg-secondary/10">
                        <p className="text-sm font-semibold truncate text-foreground">{user.displayName || 'Chef'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      
                      <div className="p-1">
                        <Link 
                          href="/history" 
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <BookMarked className="h-4 w-4 text-primary" />
                          My Recipes
                        </Link>
                        <Link 
                          href="/history?filter=favourite" 
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Star className="h-4 w-4 text-amber-500" />
                          Favourites
                        </Link>
                      </div>
                      
                      <div className="border-t border-border p-1 bg-secondary/5">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <Button asChild variant="ghost" size="sm" className="h-8 md:h-9 text-[12px] px-2 md:px-3">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm" className="h-8 md:h-9 text-[12px] bg-primary text-primary-foreground px-2 md:px-4">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </>
          )}
          {isUserLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>
    </header>
  );
}