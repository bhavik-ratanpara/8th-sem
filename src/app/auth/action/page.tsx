'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  applyActionCode,
} from 'firebase/auth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { initializeFirebase } from '@/firebase';

type Status = 'loading' | 'success' | 'error'

function AuthActionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')

    if (!mode || !oobCode) {
      setStatus('error')
      setErrorMessage('Invalid verification link.')
      return
    }

    const handleAction = async () => {
      const { auth } = initializeFirebase()

      try {
        if (mode === 'verifyEmail') {
          // Apply the email verification code
          await applyActionCode(auth, oobCode)
          setStatus('success')

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setStatus('error')
          setErrorMessage('Unknown action type.')
        }
      } catch (error: any) {
        setStatus('error')
        
        if (error.code === 'auth/invalid-action-code') {
          setErrorMessage(
            'This verification link has expired or ' +
            'already been used. Please sign up again.'
          )
        } else if (error.code === 'auth/expired-action-code') {
          setErrorMessage(
            'This verification link has expired. ' +
            'Please sign up again.'
          )
        } else {
          setErrorMessage(
            error.message || 
            'Verification failed. Please try again.'
          )
        }
      }
    }

    handleAction()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 bg-background">
      <div className="w-full max-w-[400px] text-center space-y-6">

        {/* Loading state */}
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">
                Verifying your email...
              </h1>
              <p className="text-sm text-muted-foreground">
                Please wait a moment.
              </p>
            </div>
          </>
        )}

        {/* Success state */}
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">
                Email verified!
              </h1>
              <p className="text-sm text-muted-foreground">
                Your account has been activated successfully.
                Redirecting to login...
              </p>
            </div>
            <Link href="/login">
              <button className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
                Go to Login
              </button>
            </Link>
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">
                Verification failed
              </h1>
              <p className="text-sm text-muted-foreground">
                {errorMessage}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/signup">
                <button className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
                  Sign Up Again
                </button>
              </Link>
              <Link href="/login">
                <button className="w-full h-10 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-accent transition-colors">
                  Go to Login
                </button>
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AuthActionContent />
    </Suspense>
  )
}
