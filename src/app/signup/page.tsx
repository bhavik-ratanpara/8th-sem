'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
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
import { Loader2, Chrome } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingRedirect, setIsVerifyingRedirect] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const createUserProfile = async (user: any, name: string) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        displayName: name,
        profilePictureUrl: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  };

  useEffect(() => {
    setIsMounted(true);

    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await createUserProfile(result.user, result.user.displayName || 'Chef');
          router.push('/');
        }
      } catch (error: any) {
        console.error("Signup redirect error:", error);
        toast({
          variant: "destructive",
          title: "Signup Error",
          description: error.message || "Failed to sign up with Google.",
        });
      } finally {
        setIsVerifyingRedirect(false);
      }
    };

    checkRedirect();
  }, [auth, router, toast]);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const onSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(result.user, { displayName: values.displayName });
      await createUserProfile(result.user, values.displayName);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
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
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  if (isVerifyingRedirect) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 bg-background">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-secondary-foreground">Create your account to start cooking.</p>
        </div>

        <div className="bg-card border border-border p-8 rounded-lg shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSignup)} className="space-y-5">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-medium text-foreground">Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alex Chef" className="input-saas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-medium text-foreground">Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" className="input-saas" {...field} />
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
                    <FormLabel className="text-[13px] font-medium text-foreground">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="input-saas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary text-primary-foreground h-10 font-medium" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-secondary-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" type="button" disabled={isLoading} onClick={onGoogleLogin} className="w-full h-10">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-4 w-4" />
            )}{" "}
            Google
          </Button>
        </div>

        <p className="text-center text-sm text-secondary-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
