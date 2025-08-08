'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { TenantProvider, useTenant } from '@/components/tenant/TenantProvider'
import TenantDashboardHeader from '@/components/tenant/TenantDashboardHeader'
import { subscriptionPlans, type StripePlan, type StripeSubscription, stripeService, formatPrice } from '@/lib/stripe'

// Inner billing component that uses tenant context
function TenantBilling() {
  const { tenant } = useTenant()
  const [currentSubscription, setCurrentSubscription] = useState<StripeSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [usageStats, setUsageStats] = useState<{
    users: number
    dashboards: number
    dataSources: number
    apiCalls: number
  } | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<StripePlan | null>(null)

  useEffect(() => {
    loadBillingData()
  }, [tenant])

  const loadBillingData = async () => {
    if (!tenant) return

    setLoading(true)
    try {
      // Load subscription and usage data
      const [subscription, usage] = await Promise.all([
        stripeService.getSubscription(tenant.id),
        stripeService.getUsageStats(tenant.id)
      ])

      setCurrentSubscription(subscription)
      setUsageStats(usage)
    } catch (error) {
      console.error('Failed to load billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: StripePlan) => {
    if (!tenant || !currentSubscription) return

    try {
      const checkoutSession = await stripeService.createCheckoutSession(
        currentSubscription.stripeCustomerId,
        plan.priceId,
        `/tenant/${tenant.slug}/billing?success=true`,
        `/tenant/${tenant.slug}/billing?canceled=true`
      )

      // In a real app, redirect to Stripe Checkout
      window.location.href = checkoutSession.checkoutUrl
    } catch (error) {
      console.error('Failed to create checkout session:', error)
    }
  }

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return

    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      try {
        await stripeService.cancelSubscription(currentSubscription.stripeSubscriptionId, true)
        await loadBillingData()
      } catch (error) {
        console.error('Failed to cancel subscription:', error)
      }
    }
  }

  const getCurrentPlan = () => {
    return subscriptionPlans.find(plan => plan.id === tenant?.plan) || subscriptionPlans[0]
  }

  const isCurrentPlan = (planId: string) => {
    return planId === tenant?.plan
  }

  const canUpgrade = (planId: string) => {
    const currentPlanIndex = subscriptionPlans.findIndex(p => p.id === tenant?.plan)
    const targetPlanIndex = subscriptionPlans.findIndex(p => p.id === planId)
    return targetPlanIndex > currentPlanIndex
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <TenantDashboardHeader
        onShowAlerts={() => {}}
        onShowCustomization={() => {}}
        selectedDateRange="30d"
        onDateRangeChange={() => {}}
        isRefreshing={false}
        lastUpdated={new Date()}
      />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Billing & Subscription</h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Plan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your subscription and billing details
                </p>
              </div>
              {currentSubscription && (
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  currentSubscription.status === 'active' 
                    ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
                }`}>
                  {currentSubscription.status === 'active' ? 'Active' : currentSubscription.status}
                </span>
              )}
            </div>

            {currentSubscription ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {currentSubscription.plan.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPrice(currentSubscription.plan.price)}/{currentSubscription.plan.interval}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Payment</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentSubscription.currentPeriodEnd.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentSubscription.cancelAtPeriodEnd ? 'Canceling' : 'Renewing'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">•••• 4242</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Visa ending in 4242</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mr-2"
                  >
                    Change Plan
                  </button>
                  {!currentSubscription.cancelAtPeriodEnd && (
                    <button
                      onClick={handleCancelSubscription}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No active subscription found</p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Choose Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Usage Statistics */}
        {usageStats && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Current Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Users</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {usageStats.users}
                      {tenant?.limits.maxUsers !== -1 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          /{tenant?.limits.maxUsers}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-2xl">👥</div>
                </div>
                {tenant?.limits.maxUsers !== -1 && (
                  <div className="mt-3">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (usageStats.users / tenant.limits.maxUsers) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dashboards</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {usageStats.dashboards}
                      {tenant?.limits.maxDashboards !== -1 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          /{tenant?.limits.maxDashboards}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-2xl">📊</div>
                </div>
                {tenant?.limits.maxDashboards !== -1 && (
                  <div className="mt-3">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (usageStats.dashboards / tenant.limits.maxDashboards) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Sources</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {usageStats.dataSources}
                      {tenant?.limits.maxDataSources !== -1 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          /{tenant?.limits.maxDataSources}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-2xl">🔗</div>
                </div>
                {tenant?.limits.maxDataSources !== -1 && (
                  <div className="mt-3">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (usageStats.dataSources / tenant.limits.maxDataSources) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">API Calls</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {usageStats.apiCalls.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
                  </div>
                  <div className="text-2xl">🚀</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing History */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Billing History</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {/* Mock billing history */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Jan 15, 2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Professional Plan - Monthly
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    $99.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      Download
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Dec 15, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Professional Plan - Monthly
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    $99.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      Download
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Plan Selection Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Choose Your Plan
                </h2>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-lg p-6 relative ${
                      plan.popular 
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
                        : 'border-gray-200 dark:border-gray-700'
                    } ${
                      isCurrentPlan(plan.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {plan.description}
                      </p>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(plan.price)}
                        <span className="text-lg text-gray-500 dark:text-gray-400">
                          /{plan.interval}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        if (isCurrentPlan(plan.id)) {
                          setShowUpgradeModal(false)
                        } else {
                          handleUpgrade(plan)
                        }
                      }}
                      disabled={isCurrentPlan(plan.id)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        isCurrentPlan(plan.id)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : canUpgrade(plan.id)
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {isCurrentPlan(plan.id) 
                        ? 'Current Plan' 
                        : canUpgrade(plan.id) 
                        ? 'Upgrade' 
                        : 'Downgrade'
                      }
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main page component with tenant provider
export default function TenantBillingPage() {
  const params = useParams()
  const tenantSlug = params.slug as string

  return (
    <TenantProvider tenantSlug={tenantSlug}>
      <TenantBilling />
    </TenantProvider>
  )
}