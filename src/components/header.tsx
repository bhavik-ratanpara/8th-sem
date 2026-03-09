'use client';

import { useState } from 'react';
import { Icons } from './icons';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Search, LogOut, User as UserIcon } from 'lucide-react';
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

export function Header() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <Link href="/" className="mr-4 flex items-center">
          <Icons.Logo className="h-6 w-6 mr-2" />
          <span className="font-bold hidden sm:inline-block">Cooking Lab</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
            {!isUserLoading && user && (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <div className="relative w-full max-w-sm">
                      <form onSubmit={handleSearch}>
                          <PopoverTrigger asChild>
                              <Input
                                  type="search"
                                  placeholder="Search recipe videos..."
                                  className="pr-10 h-9"
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
                              className="absolute right-0 top-0 h-full w-10"
                              disabled={isLoading}
                          >
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                          </Button>
                      </form>
                  </div>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] mt-2 p-2" align="start">
                      <YoutubeSearchResults videos={videos} isLoading={isLoading} error={error} />
                  </PopoverContent>
              </Popover>
            )}

            <div className="flex items-center space-x-2">
              {!isUserLoading && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || <UserIcon className="h-4 w-4" />}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName || 'Chef'}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild variant="default" size="sm">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
              {isUserLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
        </div>
      </div>
    </header>
  );
}
