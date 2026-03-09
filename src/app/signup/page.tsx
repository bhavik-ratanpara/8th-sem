'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
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
import { Loader2, Chrome, User, Mail, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid culinary email.'),
  password: z.string().min(6, 'Security codes must be at least 6 characters.'),
});

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const createUserProfile = (user: any, name: string) => {
    setDocumentNonBlocking(doc(db, 'users', user.uid), {
      id: user.uid,
      email: user.email,
      displayName: name,
      profilePictureUrl: user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      fridgeIngredientIds: [],
    }, { merge: true });
  };

  const onSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(result.user, { displayName: values.displayName });
      createUserProfile(result.user, values.displayName);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
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
      const result = await signInWithPopup(auth, provider);
      createUserProfile(result.user, result.user.displayName || 'Distinguished Chef');
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Auth Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-20 bg-muted/20">
      <div className="hero-gradient absolute inset-0 -z-10" />
      <Card className="w-full max-w-lg culinary-card border-none shadow-2xl p-4 overflow-hidden animate-fade-in">
        <div className="h-2 bg-accent absolute top-0 left-0 right-0" />
        <CardHeader className="space-y-4 text-center pt-12">
          <div className="bg-accent/10 p-4 rounded-full w-fit mx-auto mb-2">
            <Sparkles className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-4xl font-headline font-bold italic">Join the Lab</CardTitle>
          <CardDescription className="text-base">
            Establish your professional culinary identity today.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSignup)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Professional Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Chef Jean-Pierre" className="h-12 rounded-xl border-border/50 bg-background/50" {...field} />
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
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="chef@cookinglab.com" className="h-12 rounded-xl border-border/50 bg-background/50" {...field} />
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
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" /> Security Code
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="h-12 rounded-xl border-border/50 bg-background/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="pill-button w-full h-14 text-lg bg-accent hover:bg-accent/90 text-white shadow-xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : 'Begin Journey'}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
              <span className="bg-card px-4 text-muted-foreground">Or establish via</span>
            </div>
          </div>

          <Button variant="outline" type="button" disabled={isLoading} onClick={onGoogleLogin} className="pill-button w-full h-14 border-primary/20 text-primary hover:bg-primary/5 transition-all">
            {isLoading ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="mr-3 h-5 w-5 text-primary" />
            )}{" "}
            Google Identity
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center pb-12">
          <div className="text-sm text-muted-foreground">
            Already established?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold transition-colors ml-1">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}