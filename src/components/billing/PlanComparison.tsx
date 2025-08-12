'use client'

import { useState, useEffect } from 'react'
import { Check, X, Star, ArrowRight } from 'lucide-react'
import { subscriptionPlans, StripePlan, formatPrice } from '@/lib/stripe-client'

interface PlanComparisonProps {
  currentPlanId?: string
  onPlanSelect?: (plan: StripePlan) => void
  showUpgradeButton?: boolean
  className?: string
}

interface PlanFeature {
  name: string
  included: boolean
  description?: string
}

export default function PlanComparison({
  currentPlanId,
  onPlanSelect,
  showUpgradeButton = true,
  className = ''
}: PlanComparisonProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [plans, setPlans] = useState<StripePlan[]>([])

  useEffect(() => {
    // Fetch plans from API or use local data
    setPlans(subscriptionPlans)
  }, [])

  const getFeatureStatus = (plan: StripePlan, feature: string): PlanFeature => {
    const isIncluded = plan.features.some(f => 
      f.toLowerCase().includes(feature.toLowerCase())
    )
    
    return {
      name: feature,
      included: isIncluded,
      description: isIncluded ? plan.features.find(f => 
        f.toLowerCase().includes(feature.toLowerCase())
      ) : undefined
    }
  }

  const commonFeatures = [
    'Basic Analytics Dashboard',
    'Data Export (CSV)',
    'Email Support',
    'Mobile Responsive',
    'Real-time Updates'
  ]

  const handlePlanSelect = (plan: StripePlan) => {
    setSelectedPlan(plan.id)
    onPlanSelect?.(plan)
  }

  const isCurrentPlan = (planId: string) => planId === currentPlanId
  const canUpgrade = (plan: StripePlan) => {
    if (!currentPlanId) return true
    const currentPlan = plans.find(p => p.id === currentPlanId)
    if (!currentPlan) return true
    return plan.price > currentPlan.price
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your analytics needs. All plans include our core features with additional capabilities as you scale.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan.id)
          const canUpgradePlan = canUpgrade(plan)
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-lg border-2 p-6 transition-all duration-200 ${
                plan.popular
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>
              </div>

              {/* Plan Limits */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Users:</span>
                  <span className="font-medium">
                    {plan.limits.maxUsers === -1 ? 'Unlimited' : `Up to ${plan.limits.maxUsers}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dashboards:</span>
                  <span className="font-medium">
                    {plan.limits.maxDashboards === -1 ? 'Unlimited' : `Up to ${plan.limits.maxDashboards}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Data Sources:</span>
                  <span className="font-medium">
                    {plan.limits.maxDataSources === -1 ? 'Unlimited' : `Up to ${plan.limits.maxDataSources}`}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {showUpgradeButton && (
                <button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isCurrent || !canUpgradePlan}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : canUpgradePlan
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : canUpgradePlan ? 'Upgrade Now' : 'Downgrade Not Available'}
                </button>
              )}

              {/* Plan Features */}
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                {plan.features.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
                {plan.features.length > 6 && (
                  <div className="text-sm text-gray-500 text-center pt-2">
                    +{plan.features.length - 6} more features
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Detailed Feature Comparison
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                {plans.map((plan) => (
                  <th key={plan.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commonFeatures.map((feature) => (
                <tr key={feature}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {feature}
                  </td>
                  {plans.map((plan) => {
                    const featureStatus = getFeatureStatus(plan, feature)
                    return (
                      <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-center">
                        {featureStatus.included ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Selection Summary */}
      {selectedPlan && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                Selected Plan: {plans.find(p => p.id === selectedPlan)?.name}
              </h4>
              <p className="text-blue-700">
                {plans.find(p => p.id === selectedPlan)?.description}
              </p>
            </div>
            <button
              onClick={() => onPlanSelect?.(plans.find(p => p.id === selectedPlan)!)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
            >
              Continue to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}