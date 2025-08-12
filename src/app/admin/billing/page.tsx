'use client'

import { useState, useEffect } from 'react'
import { CreditCard, DollarSign, TrendingUp, AlertTriangle, Clock, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Subscription {
  id: string
  tenant: string
  plan: 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING'
  amount: number
  currency: string
  nextBilling: string
  created: string
}

interface Transaction {
  id: string
  tenant: string
  amount: number
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING'
  created: string
  description: string
}

// Mock data
const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_1',
    tenant: 'Acme Corporation',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    amount: 299900,
    currency: 'usd',
    nextBilling: '2024-02-15T00:00:00Z',
    created: '2023-08-15T00:00:00Z'
  },
  {
    id: 'sub_2',
    tenant: 'StartupXYZ',
    plan: 'PROFESSIONAL',
    status: 'ACTIVE',
    amount: 19900,
    currency: 'usd',
    nextBilling: '2024-02-01T00:00:00Z',
    created: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sub_3',
    tenant: 'Beta Testing Co',
    plan: 'TRIAL',
    status: 'TRIALING',
    amount: 0,
    currency: 'usd',
    nextBilling: '2024-01-25T00:00:00Z',
    created: '2024-01-10T00:00:00Z'
  }
]

const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    tenant: 'Acme Corporation',
    amount: 299900,
    status: 'SUCCEEDED',
    created: '2024-01-15T10:00:00Z',
    description: 'Enterprise Plan - Monthly'
  },
  {
    id: 'txn_2',
    tenant: 'StartupXYZ',
    amount: 19900,
    status: 'SUCCEEDED',
    created: '2024-01-01T10:00:00Z',
    description: 'Professional Plan - Monthly'
  },
  {
    id: 'txn_3',
    tenant: 'Failed Corp',
    amount: 9900,
    status: 'FAILED',
    created: '2024-01-14T15:30:00Z',
    description: 'Starter Plan - Monthly'
  }
]

const revenueData = [
  { month: 'Aug', revenue: 245600, transactions: 89 },
  { month: 'Sep', revenue: 278900, transactions: 96 },
  { month: 'Oct', revenue: 312400, transactions: 104 },
  { month: 'Nov', revenue: 289700, transactions: 98 },
  { month: 'Dec', revenue: 356200, transactions: 112 },
  { month: 'Jan', revenue: 389500, transactions: 119 }
]

const planDistribution = [
  { name: 'Enterprise', value: 299900 * 12, count: 15, color: '#ef4444' },
  { name: 'Professional', value: 19900 * 45, count: 45, color: '#8b5cf6' },
  { name: 'Starter', value: 9900 * 78, count: 78, color: '#3b82f6' },
  { name: 'Trial', value: 0, count: 23, color: '#f59e0b' }
]

const planColors = {
  TRIAL: 'bg-yellow-100 text-yellow-800',
  STARTER: 'bg-blue-100 text-blue-800',
  PROFESSIONAL: 'bg-purple-100 text-purple-800',
  ENTERPRISE: 'bg-red-100 text-red-800'
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAST_DUE: 'bg-red-100 text-red-800',
  CANCELED: 'bg-gray-100 text-gray-800',
  TRIALING: 'bg-yellow-100 text-yellow-800'
}

const transactionStatusColors = {
  SUCCEEDED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800'
}

export default function AdminBillingPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSubscriptions(mockSubscriptions)
      setTransactions(mockTransactions)
      setLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalMRR = subscriptions.reduce((sum, sub) => sum + sub.amount, 0)
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE').length
  const totalTransactions = transactions.length
  const failedTransactions = transactions.filter(t => t.status === 'FAILED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscriptions</h1>
          <p className="text-gray-600">Monitor payments and subscription management</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700">
          <RefreshCw className="h-4 w-4" />
          Sync Stripe
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Monthly Recurring Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalMRR)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{activeSubs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <p className="text-2xl font-semibold text-gray-900">{totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Failed Payments</p>
              <p className="text-2xl font-semibold text-gray-900">{failedTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${formatCurrency(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Annual Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Billing
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subscription.tenant}</div>
                    <div className="text-sm text-gray-500">{subscription.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planColors[subscription.plan]}`}>
                      {subscription.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[subscription.status]}`}>
                      {subscription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(subscription.amount)}/mo
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(subscription.nextBilling)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                    <div className="text-sm text-gray-500">{transaction.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.tenant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {transaction.status === 'SUCCEEDED' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                      {transaction.status === 'FAILED' && <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                      {transaction.status === 'PENDING' && <Clock className="h-4 w-4 text-yellow-500 mr-2" />}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transactionStatusColors[transaction.status]}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.created)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}