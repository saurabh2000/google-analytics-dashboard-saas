'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification link has expired or has already been used.',
  Default: 'An error occurred during authentication.'
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessage = error && errorMessages[error] ? errorMessages[error] : errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {errorMessage}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">🚫</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  What happened?
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>
                    {error === 'Configuration' && 
                      'The Google OAuth configuration may be incomplete. Please check your environment variables.'
                    }
                    {error === 'AccessDenied' && 
                      'You declined the authorization request or your account doesn\'t have the necessary permissions.'
                    }
                    {error === 'Verification' && 
                      'The verification process failed. Please try signing in again.'
                    }
                    {(!error || !errorMessages[error]) && 
                      'An unexpected error occurred during the authentication process.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </Link>
            
            <Link
              href="/dashboard"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue to Demo Dashboard
            </Link>
            
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Development Info:
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Error: {error || 'Unknown'}<br/>
              Check your console and environment variables.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}