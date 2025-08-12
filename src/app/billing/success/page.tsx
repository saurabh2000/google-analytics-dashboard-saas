'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Download, Users, BarChart3, Database } from 'lucide-react'
import Link from 'next/link'

interface SuccessPageProps {
  // Component props if needed
}

export default function SuccessPage({}: SuccessPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      // In a real implementation, you might want to verify the session with your backend
      // For now, we'll simulate a successful subscription
      setTimeout(() => {
        setSubscriptionData({
          plan: 'Professional',
          status: 'active',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        })
        setIsLoading(false)
      }, 1000)
    } else {
      // No session ID, redirect to dashboard
      router.push('/dashboard')
    }
  }, [sessionId, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your New Subscription!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your {subscriptionData?.plan} plan is now active. You&apos;re all set to explore advanced analytics features.
          </p>
        </div>

        {/* Subscription Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Subscription Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Plan</h3>
              <p className="text-blue-600 font-medium">{subscriptionData?.plan}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Status</h3>
              <p className="text-green-600 font-medium capitalize">{subscriptionData?.status}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-3">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Next Billing</h3>
              <p className="text-purple-600 font-medium">{subscriptionData?.nextBillingDate}</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            What&apos;s Next?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Invite Your Team
              </h3>
              <p className="text-gray-600 mb-4">
                Start collaborating with your team members. Invite users and assign roles to get everyone up and running.
              </p>
              <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Manage Users
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Create Your First Dashboard
              </h3>
              <p className="text-gray-600 mb-4">
                Build custom dashboards with advanced widgets and real-time data to track your key metrics.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Getting Started Guide
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Connect Your Data Sources</h3>
                <p className="text-gray-600 text-sm">
                  Connect Google Analytics, databases, or other data sources to start collecting insights.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Create Custom Dashboards</h3>
                <p className="text-gray-600 text-sm">
                  Build personalized dashboards with drag-and-drop widgets to visualize your data.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Set Up Alerts & Reports</h3>
                <p className="text-gray-600 text-sm">
                  Configure automated alerts and scheduled reports to stay informed about your metrics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Go to Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="text-sm text-gray-600">
            <p>
              Need help? Check out our{' '}
              <Link href="/docs" className="text-blue-600 hover:underline">
                documentation
              </Link>{' '}
              or{' '}
              <Link href="/support" className="text-blue-600 hover:underline">
                contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
