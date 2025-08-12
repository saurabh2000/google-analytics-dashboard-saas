'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, RefreshCw, HelpCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import PlanComparison from '@/components/billing/PlanComparison'

export default function CancelPage() {
  const router = useRouter()
  const [showPlans, setShowPlans] = useState(false)

  const handleRetry = () => {
    router.back()
  }

  const handleViewPlans = () => {
    setShowPlans(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cancel Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Checkout Cancelled
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            No worries! Your checkout was cancelled and you haven&apos;t been charged. You can try again anytime.
          </p>
        </div>

        {/* Action Options */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            What would you like to do?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Try Again</h3>
              <p className="text-gray-600 text-sm mb-4">
                Complete your subscription with the same plan and payment method.
              </p>
              <button
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Retry Checkout
              </button>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-green-300 transition-colors duration-200">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">View Plans</h3>
              <p className="text-gray-600 text-sm mb-4">
                Explore different subscription options that might better fit your needs.
              </p>
              <button
                onClick={handleViewPlans}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Browse Plans
              </button>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors duration-200">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Help</h3>
              <p className="text-gray-600 text-sm mb-4">
                Contact our support team for assistance with your subscription.
              </p>
              <Link
                href="/support"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Common Reasons for Cancellation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Common Reasons for Cancellation
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ?
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Payment Method Issues</h3>
                <p className="text-gray-600 text-sm">
                  Having trouble with your credit card or payment method? We accept all major credit cards and can help troubleshoot payment issues.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ?
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Plan Questions</h3>
                <p className="text-gray-600 text-sm">
                  Not sure which plan is right for you? Our team can help assess your needs and recommend the best option.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ?
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Technical Problems</h3>
                <p className="text-gray-600 text-sm">
                  Experiencing technical difficulties during checkout? We&apos;re here to help resolve any issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Comparison (Conditional) */}
        {showPlans && (
          <div className="mb-8">
            <PlanComparison
              showUpgradeButton={false}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
            />
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <div className="text-sm text-gray-500">
            <p>
              Need immediate assistance?{' '}
              <Link href="/support" className="text-blue-600 hover:underline">
                Contact our support team
              </Link>{' '}
              or call us at{' '}
              <span className="font-medium">1-800-ANALYTICS</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
