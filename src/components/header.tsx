'use client';

import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Search, LogOut, User as UserIcon, ChefHat, Moon, Sun } from 'lucide-react';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { YoutubeSearchResults, type YouTubeVideo } from './youtube-search-results';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import * as PopoverPrimitive from "@radix-ui/react-popover";

export function Header() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    setMounted(true);
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
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-background border-b border-border h-16 transition-colors duration-200">
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
                                    placeholder="Search for recipes..."
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
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              )}

              {!isUserLoading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-4">
                      <Link href="/" className="text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors hidden sm:block">Home</Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 border border-border">
                              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                              <AvatarFallback className="text-xs font-medium">
                                {user.displayName?.charAt(0) || user.email?.charAt(0) || <UserIcon className="h-5 w-5" />}
                              </AvatarFallback>
                            </Avatar>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 mt-2" align="end">
                          <DropdownMenuLabel className="font-normal px-4 py-3">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-semibold">{user.displayName || 'Chef'}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive px-4 py-3 cursor-pointer">
                            <LogOut className="mr-3 h-4 w-4" />
                            <span className="font-medium">Sign Out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
