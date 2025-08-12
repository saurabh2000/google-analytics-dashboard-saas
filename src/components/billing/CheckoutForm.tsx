'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StripePlan, formatPrice } from '@/lib/stripe-client'
import { Check, Loader2, CreditCard, Shield, ArrowLeft } from 'lucide-react'

interface CheckoutFormProps {
  selectedPlan: StripePlan
  tenantId: string
  onBack?: () => void
  className?: string
}

interface CheckoutFormData {
  email: string
  name: string
  company: string
  agreeToTerms: boolean
  agreeToMarketing: boolean
}

export default function CheckoutForm({
  selectedPlan,
  tenantId,
  onBack,
  className = ''
}: CheckoutFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    name: '',
    company: '',
    agreeToTerms: false,
    agreeToMarketing: false
  })

  const handleInputChange = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckout = async () => {
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/billing/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId: selectedPlan.priceId,
          successUrl: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/billing/cancel`,
          tenantId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.email && formData.name && formData.agreeToTerms

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Your Subscription
        </h1>
        <p className="text-gray-600">
          You&apos;re just a few steps away from accessing {selectedPlan.name} features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Billing Information
            </h2>

            <form className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Company Inc."
                />
              </div>

              {/* Terms and Marketing */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeToMarketing"
                    checked={formData.agreeToMarketing}
                    onChange={(e) => handleInputChange('agreeToMarketing', e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreeToMarketing" className="text-sm text-gray-700">
                    I agree to receive marketing communications about product updates and new features
                  </label>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!isFormValid || isLoading}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors duration-200 ${
                  isFormValid && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Continue to Payment
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>

            {/* Selected Plan */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{selectedPlan.name}</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(selectedPlan.price)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {selectedPlan.description}
              </p>
              <div className="text-xs text-gray-500">
                Billed {selectedPlan.interval}ly
              </div>
            </div>

            {/* Features Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                What&apos;s included:
              </h4>
              <ul className="space-y-2">
                {selectedPlan.features.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
                {selectedPlan.features.length > 5 && (
                  <li className="text-sm text-gray-500 text-center pt-2">
                    +{selectedPlan.features.length - 5} more features
                  </li>
                )}
              </ul>
            </div>

            {/* Plan Limits */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Plan Limits:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Users:</span>
                  <span className="font-medium">
                    {selectedPlan.limits.maxUsers === -1 ? 'Unlimited' : `Up to ${selectedPlan.limits.maxUsers}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dashboards:</span>
                  <span className="font-medium">
                    {selectedPlan.limits.maxDashboards === -1 ? 'Unlimited' : `Up to ${selectedPlan.limits.maxDashboards}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Sources:</span>
                  <span className="font-medium">
                    {selectedPlan.limits.maxDataSources === -1 ? 'Unlimited' : `Up to ${selectedPlan.limits.maxDataSources}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                Your payment information is secure and encrypted. We use Stripe for secure payment processing.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      {onBack && (
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Plan Selection
          </button>
        </div>
      )}
    </div>
  )
}
