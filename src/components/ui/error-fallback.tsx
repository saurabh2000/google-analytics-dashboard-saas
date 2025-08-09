'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorFallbackProps {
  error: Error
  reset: () => void
}

export default function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        
        <h1 className="mt-4 text-xl font-semibold text-center text-gray-900">
          Oops! Something went wrong
        </h1>
        
        <p className="mt-2 text-sm text-center text-gray-600">
          We&apos;re sorry for the inconvenience. An unexpected error has occurred.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 p-4 bg-gray-100 rounded-md">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-gray-600 overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="w-4 h-4 mr-2" />
            Go home
          </button>
        </div>
      </div>
    </div>
  )
}