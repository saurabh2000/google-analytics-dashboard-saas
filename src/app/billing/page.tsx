'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { StripePlan } from '@/lib/stripe-client'
import PlanComparison from '@/components/billing/PlanComparison'
import CheckoutForm from '@/components/billing/CheckoutForm'
import { ArrowLeft, CreditCard, Shield, CheckCircle } from 'lucide-react'

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<StripePlan | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    // Fetch current subscription
    fetchCurrentSubscription()
  }, [status, router])

  const fetchCurrentSubscription = async () => {
    try {
      // In a real implementation, fetch from your API
      // For now, simulate no current subscription
      setCurrentSubscription(null)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanSelect = (plan: StripePlan) => {
    setSelectedPlan(plan)
  }

  const handleBackToPlans = () => {
    setSelectedPlan(null)
  }

  const handleCheckoutSuccess = () => {
    // Redirect to success page or dashboard
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    )
  }

  if (selectedPlan) {
    return (
      <CheckoutForm
        selectedPlan={selectedPlan}
        tenantId={session?.user?.email || 'default'}
        onBack={handleBackToPlans}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Analytics Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your analytics needs. All plans include our core features with additional capabilities as you scale.
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Current Plan: {currentSubscription.plan.name}
                  </h3>
                  <p className="text-gray-600">
                    Next billing date: {currentSubscription.nextBillingDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/billing/portal')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Manage Subscription
              </button>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
            <p className="text-gray-600 text-sm">
              Bank-level security with Stripe. Your data is always protected.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No Setup Fees</h3>
            <p className="text-gray-600 text-sm">
              Get started immediately with no hidden costs or setup charges.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Flexible Billing</h3>
            <p className="text-gray-600 text-sm">
              Monthly or annual billing. Cancel anytime with no penalties.
            </p>
          </div>
        </div>

        {/* Plan Comparison */}
        <PlanComparison
          currentPlanId={currentSubscription?.plan?.id}
          onPlanSelect={handlePlanSelect}
          showUpgradeButton={true}
        />

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 text-sm">
                We offer a 14-day free trial on all plans. No credit card required to start your trial.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards including Visa, Mastercard, American Express, and Discover.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Absolutely! You can cancel your subscription at any time. No long-term contracts or cancellation fees.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Sales */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Need a Custom Plan?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              For enterprise customers or organizations with specific requirements, we offer custom plans with dedicated support and tailored features.
            </p>
            <div className="space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                Contact Sales
              </button>
              <button className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
