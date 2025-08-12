import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Account Suspended
        </h1>
        
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Your account has been temporarily suspended. This may be due to:
        </p>
        
        <ul className="mt-4 text-left space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            Violation of our Terms of Service
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            Suspicious account activity
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            Payment issues with your subscription
          </li>
        </ul>
        
        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you believe this is a mistake, please contact our support team.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Contact Support
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
        
        <div className="mt-12 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
          </p>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
            Response time: Within 24 business hours
          </p>
        </div>
      </div>
    </div>
  )
}