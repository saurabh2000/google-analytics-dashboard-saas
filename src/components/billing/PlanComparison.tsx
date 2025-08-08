'use client'

import { useState } from 'react'
import { subscriptionPlans, formatPrice, type StripePlan } from '@/lib/stripe'

interface PlanComparisonProps {
  currentPlan?: string
  onSelectPlan?: (plan: StripePlan) => void
  className?: string
}

export default function PlanComparison({ 
  currentPlan, 
  onSelectPlan, 
  className = '' 
}: PlanComparisonProps) {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month')

  const handlePlanSelection = (plan: StripePlan) => {
    if (onSelectPlan) {
      onSelectPlan(plan)
    }
  }

  const isCurrentPlan = (planId: string) => {
    return planId === currentPlan
  }

  return (
    <div className={className}>
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'month'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'year'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Yearly
            <span className="ml-1 text-green-600 dark:text-green-400 text-xs">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {subscriptionPlans.map((plan) => {
          const yearlyPrice = Math.round(plan.price * 12 * 0.8) // 20% discount
          const displayPrice = billingCycle === 'year' ? yearlyPrice : plan.price
          const pricePerMonth = billingCycle === 'year' ? Math.round(yearlyPrice / 12) : plan.price

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 ${
                plan.popular 
                  ? 'bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 border-2 border-blue-500 shadow-lg scale-105' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md'
              } ${
                isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''
              } transition-all duration-300 hover:shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {plan.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(pricePerMonth)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      /month
                    </span>
                  </div>
                  {billingCycle === 'year' && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatPrice(displayPrice)} billed yearly
                      <span className="text-green-600 dark:text-green-400 ml-1 font-medium">
                        (Save {formatPrice(plan.price * 12 - yearlyPrice)})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  What&apos;s included:
                </div>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanSelection(plan)}
                disabled={isCurrentPlan(plan.id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-all duration-300 ${
                  isCurrentPlan(plan.id)
                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-md hover:shadow-lg'
                }`}
              >
                {isCurrentPlan(plan.id) ? 'Current Plan' : `Get ${plan.name}`}
              </button>

              {plan.limits && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Plan Limits
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plan.limits.maxUsers === -1 ? '∞' : plan.limits.maxUsers}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Users</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plan.limits.maxDashboards === -1 ? '∞' : plan.limits.maxDashboards}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Dashboards</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plan.limits.maxDataSources === -1 ? '∞' : plan.limits.maxDataSources}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Sources</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-12 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          All plans include 14-day free trial • No setup fees • Cancel anytime
        </div>
        <div className="mt-4 space-x-6 text-sm">
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            Compare all features →
          </a>
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            Contact sales
          </a>
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            View FAQ
          </a>
        </div>
      </div>
    </div>
  )
}