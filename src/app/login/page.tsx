'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Chrome } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Syncs the user's profile to Firestore.
   * NOTE: We only store non-sensitive profile info here. 
   * Passwords are NEVER stored in Firestore; they stay in Firebase Auth.
   */
  const syncUserToFirestore = async (user: any) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    // We initiate a non-blocking write to sync user activity/existence
    if (!userDoc.exists()) {
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || 'New Chef',
        profilePictureUrl: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        fridgeIngredientIds: [],
      }, { merge: true });
    } else {
      setDocumentNonBlocking(userRef, {
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  };

  const onEmailLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      // Step 1: Securely authenticate with Firebase Auth (handles passwords)
      const result = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      // Step 2: Sync profile to Firestore (handles display data)
      await syncUserToFirestore(result.user);
      
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // Step 1: Securely authenticate with Google via Firebase Auth
      const result = await signInWithPopup(auth, provider);
      
      // Step 2: Sync profile to Firestore
      await syncUserToFirestore(result.user);
      
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google login failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-headline font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email to sign in to your Cooking Lab
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEmailLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="chef@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
              </Button>
            </form>
          </Form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" type="button" disabled={isLoading} onClick={onGoogleLogin}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-4 w-4" />
            )}{" "}
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-bold">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
