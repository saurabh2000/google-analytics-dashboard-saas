'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, 
  Calendar, 
  Download, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  Clock,
  User,
  Building,
  ArrowRight,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  id: string
  plan: {
    name: string
    price: number
    interval: string
  }
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

interface PaymentMethod {
  id: string
  type: string
  last4: string
  brand: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

interface Invoice {
  id: string
  amount: number
  currency: string
  status: string
  date: string
  period: string
}

export default function CustomerPortalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    fetchPortalData()
  }, [status, router])

  const fetchPortalData = async () => {
    try {
      // In a real implementation, fetch from your API
      // For now, simulate data
      setTimeout(() => {
        setSubscription({
          id: 'sub_123',
          plan: {
            name: 'Professional',
            price: 99,
            interval: 'month'
          },
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false
        })

        setPaymentMethods([
          {
            id: 'pm_123',
            type: 'card',
            last4: '4242',
            brand: 'visa',
            expMonth: 12,
            expYear: 2025,
            isDefault: true
          }
        ])

        setInvoices([
          {
            id: 'in_123',
            amount: 9900,
            currency: 'usd',
            status: 'paid',
            date: new Date().toISOString(),
            period: 'Dec 2024'
          }
        ])

        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching portal data:', error)
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenantId: session?.user?.email || 'default',
          returnUrl: window.location.href
        })
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        alert('Failed to open customer portal')
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
      alert('Failed to open customer portal')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'past_due':
        return 'bg-red-100 text-red-800'
      case 'canceled':
        return 'bg-gray-100 text-gray-800'
      case 'trialing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'past_due':
        return <AlertCircle className="w-4 h-4" />
      case 'canceled':
        return <Clock className="w-4 h-4" />
      case 'trialing':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing Portal</h1>
              <p className="text-gray-600 mt-2">
                Manage your subscription, payment methods, and billing history
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'subscription', label: 'Subscription', icon: Settings },
              { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard },
              { id: 'invoices', label: 'Invoices', icon: Download }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Plan */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription?.status || '')}`}>
                    {getStatusIcon(subscription?.status || '')}
                    {subscription?.status || 'Unknown'}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {subscription?.plan.name || 'No Plan'}
                  </div>
                  <div className="text-gray-600">
                    ${(subscription?.plan.price || 0) / 100}/{subscription?.plan.interval}
                  </div>
                </div>
                <button
                  onClick={handleManageSubscription}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Manage Subscription
                </button>
              </div>

              {/* Next Billing */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Next Billing</h3>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {subscription?.currentPeriodEnd 
                      ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                      : 'N/A'
                    }
                  </div>
                  <div className="text-gray-600">
                    {subscription?.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renewal enabled'}
                  </div>
                </div>
                <Link
                  href="/billing"
                  className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Change Plan
                </Link>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                  <CreditCard className="w-5 h-5 text-gray-400" />
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {paymentMethods.length > 0 
                      ? `${paymentMethods[0].brand.toUpperCase()} •••• ${paymentMethods[0].last4}`
                      : 'No payment method'
                    }
                  </div>
                  <div className="text-gray-600">
                    {paymentMethods.length > 0 
                      ? `Expires ${paymentMethods[0].expMonth}/${paymentMethods[0].expYear}`
                      : 'Add a payment method'
                    }
                  </div>
                </div>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                  {paymentMethods.length > 0 ? 'Update Payment Method' : 'Add Payment Method'}
                </button>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Subscription Details</h3>
                <button
                  onClick={handleManageSubscription}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Manage in Stripe
                </button>
              </div>

              {subscription ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                      <div className="text-lg font-medium text-gray-900">{subscription.plan.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                        {getStatusIcon(subscription.status)}
                        {subscription.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                      <div className="text-lg font-medium text-gray-900">
                        ${(subscription.plan.price / 100).toFixed(2)}/{subscription.plan.interval}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
                      <div className="text-lg font-medium text-gray-900 capitalize">{subscription.plan.interval}ly</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Billing Period</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Period Start</label>
                        <div className="text-gray-900">
                          {new Date(subscription.currentPeriodStart).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Period End</label>
                        <div className="text-gray-900">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Auto-renewal</h4>
                        <p className="text-sm text-gray-600">
                          {subscription.cancelAtPeriodEnd 
                            ? 'Your subscription will cancel at the end of the current billing period.'
                            : 'Your subscription will automatically renew.'
                          }
                        </p>
                      </div>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        {subscription.cancelAtPeriodEnd ? 'Re-enable Renewal' : 'Cancel Subscription'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h4>
                  <p className="text-gray-600 mb-6">
                    You don&apos;t have an active subscription. Choose a plan to get started.
                  </p>
                  <Link
                    href="/billing"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    View Plans
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment-methods' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Payment Methods</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Payment Method
                </button>
              </div>

              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {method.brand.toUpperCase()} •••• {method.last4}
                          </div>
                          <div className="text-sm text-gray-600">
                            Expires {method.expMonth}/{method.expYear}
                            {method.isDefault && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h4>
                  <p className="text-gray-600 mb-6">
                    Add a payment method to manage your subscription.
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                    Add Payment Method
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Billing History</h3>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                  Download All
                </button>
              </div>

              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Download className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Invoice #{invoice.id}
                          </div>
                          <div className="text-sm text-gray-600">
                            {invoice.period} • {new Date(invoice.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Download className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Invoices Yet</h4>
                  <p className="text-gray-600">
                    Your billing history will appear here once you have an active subscription.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
