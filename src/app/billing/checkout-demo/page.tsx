'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { subscriptionPlans, getPlanByPriceId, formatPrice } from '@/lib/stripe'

export default function CheckoutDemoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const sessionId = searchParams.get('session')
  const priceId = searchParams.get('price')
  const plan = priceId ? getPlanByPriceId(priceId) : null

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      handleCompleteCheckout()
    }
  }, [countdown])

  const handleCompleteCheckout = async () => {
    setProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      // In a real app, this would redirect back to the tenant's billing page
      router.push('/tenant/demo/billing?success=true&session_id=' + sessionId)
    }, 2000)
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invalid Session
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The checkout session could not be found or has expired.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              🔒 Secure Checkout Demo
            </h1>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          {!processing ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">💳</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Complete Your Purchase
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Demo checkout for testing purposes
                </p>
              </div>

              {/* Plan Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {plan.name} Plan
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(plan.price)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      per {plan.interval}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(plan.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                    <span className="text-gray-900 dark:text-white">$0.00</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(plan.price)}</span>
                  </div>
                </div>
              </div>

              {/* Mock Payment Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Card Number
                  </label>
                  <div className="bg-gray-100 dark:bg-gray-600 p-3 rounded-lg">
                    <div className="text-gray-600 dark:text-gray-300">•••• •••• •••• 4242</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiry
                    </label>
                    <div className="bg-gray-100 dark:bg-gray-600 p-3 rounded-lg">
                      <div className="text-gray-600 dark:text-gray-300">12/28</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CVC
                    </label>
                    <div className="bg-gray-100 dark:bg-gray-600 p-3 rounded-lg">
                      <div className="text-gray-600 dark:text-gray-300">•••</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-processing Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="text-blue-600 dark:text-blue-400">ℹ️</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Demo Mode:</strong> Payment will be processed automatically in {countdown} seconds...
                  </div>
                </div>
              </div>

              <button
                onClick={handleCompleteCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors"
              >
                Complete Purchase
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={() => router.back()}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                >
                  ← Back to billing
                </button>
              </div>

              {/* Security Notice */}
              <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                🔒 This is a demo checkout. No real payment will be processed.
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Processing Payment...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we process your subscription.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}