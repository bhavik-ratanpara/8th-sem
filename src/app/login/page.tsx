'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  linkWithCredential,
  fetchSignInMethodsForEmail
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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const syncUserToFirestore = async (user: any) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || 'Chef',
        profilePictureUrl: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  };

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onEmailLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, values.email, values.password);

      // CHECK IF EMAIL IS VERIFIED
      if (!result.user.emailVerified) {
        // Sign out immediately
        await auth.signOut();
        
        toast({
          variant: "destructive",
          title: "Email not verified",
          description: 
            "Please verify your email first. " +
            "Check your inbox for the verification link.",
        });
        
        setIsLoading(false);
        return;
      }

      // Email verified — proceed to login
      await syncUserToFirestore(result.user);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Invalid email or password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      console.log('Starting Google Sign In...')
      const result = await signInWithPopup(auth, provider);
      console.log('Google Sign In successful')
      if (result.user) {
        await syncUserToFirestore(result.user);
        router.push('/');
      }
    } catch (error: any) {
      console.log('Google sign in error:', error);
      console.log('Error code:', error.code);
      console.log('Error customData:', error.customData);
      console.log('Error email:', error.customData?.email);
      console.log('Full error object:', JSON.stringify(error, null, 2));

      // Account exists with different credential
      if (error.code === 'auth/account-exists-with-different-credential') {
        console.log('Account conflict detected!');
        
        try {
          const email = error.customData?.email;

          if (!email) {
            toast({
              title: 'Login failed',
              description: 'Could not get email from Google.',
              variant: 'destructive',
            });
            return;
          }

          const methods = await fetchSignInMethodsForEmail(auth, email);

          if (methods.includes('password')) {
            const password = window.prompt(
              `This email is registered with a password.\n\nEnter your password to link both login methods:\n(${email})`
            );

            if (!password) {
              setIsLoading(false);
              return;
            }

            const emailResult = await signInWithEmailAndPassword(auth, email, password);
            const googleCredential = GoogleAuthProvider.credentialFromError(error);

            if (!googleCredential) {
              setIsLoading(false);
              return;
            }

            await linkWithCredential(emailResult.user, googleCredential);

            toast({
              title: 'Accounts linked successfully',
              description: 'You can now login with both Google and email+password.',
            });

            await syncUserToFirestore(emailResult.user);
            router.push('/');
            return;
          }
        } catch (linkError: any) {
          console.error('Linking error:', linkError);
          if (linkError.code === 'auth/wrong-password') {
            toast({
              title: 'Wrong password',
              description: 'Incorrect password. Could not link accounts.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Could not link accounts',
              description: linkError.message,
              variant: 'destructive',
            });
          }
        }
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          title: 'Google sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading && !user) {
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="text-sm text-secondary-foreground">Please sign in to your account.</p>
        </div>

        <div className="bg-card border border-border p-8 rounded-lg shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEmailLogin)} className="space-y-5">
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
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
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
          
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'hsl(var(--muted))',
            border: '0.5px solid hsl(var(--border))',
            marginBottom: '12px',
          }}>
            <div style={{ position: 'relative' }}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  color: 'hsl(var(--muted-foreground))',
                  flexShrink: 0,
                  marginTop: '1px',
                  cursor: 'pointer',
                }}
              >
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <p style={{
              fontSize: '11px',
              color: 'hsl(var(--muted-foreground))',
              lineHeight: '1.6',
              margin: 0,
            }}>
              If you registered with email and password,
              please use that to login — not Google.
              {' '}
              <span style={{
                display: 'block',
                marginTop: '4px',
                fontSize: '10px',
                color: 'hsl(var(--muted-foreground))',
                opacity: 0.8,
              }}>
                Note: If you sign in with Google using 
                an email already registered with a password,
                your account will switch to Google login
                and you will no longer be able to login
                with your email and password.
              </span>
            </p>
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
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
