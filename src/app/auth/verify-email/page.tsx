'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }
    
    // Verify the email
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
        const data = await response.json()
        
        if (response.ok) {
          setStatus('success')
          setMessage('Your email has been verified successfully!')
          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            router.push('/auth/signin?verified=true')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Failed to verify email')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred while verifying your email')
      }
    }
    
    verifyEmail()
  }, [token, email, router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 animate-pulse">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verifying your email...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we verify your email address
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Email verified!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Redirecting you to sign in...
              </p>
              <div className="mt-6">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verification failed
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  href="/auth/signin"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/auth/resend-verification"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Resend Verification Email
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}