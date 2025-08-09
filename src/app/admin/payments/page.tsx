'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Search,
  Filter,
  Eye,
  Ban,
  Users,
  Calendar,
  Receipt,
  XCircle
} from 'lucide-react'

interface PaymentTransaction {
  id: string
  tenantId: string
  tenantName: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | 'cancelled'
  paymentMethod: 'card' | 'bank_transfer' | 'paypal' | 'stripe'
  description: string
  customerEmail: string
  createdAt: Date
  processedAt?: Date
  failureReason?: string
  refundAmount?: number
  subscriptionId?: string
  invoiceId?: string
}

interface Subscription {
  id: string
  tenantId: string
  tenantName: string
  customerId: string
  customerEmail: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  amount: number
  currency: string
  interval: 'month' | 'year'
  createdAt: Date
  canceledAt?: Date
  trialEnd?: Date
}

interface PaymentMetrics {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  transactions: {
    total: number
    succeeded: number
    failed: number
    pending: number
    failureRate: number
  }
  subscriptions: {
    active: number
    trialing: number
    churned: number
    churnRate: number
  }
  mrr: {
    current: number
    growth: number
    byPlan: { [key: string]: number }
  }
}

// Mock data generators
function generatePaymentMetrics(): PaymentMetrics {
  return {
    revenue: {
      total: 1247832,
      thisMonth: 89432,
      lastMonth: 82156,
      growth: 8.9
    },
    transactions: {
      total: 3421,
      succeeded: 3298,
      failed: 89,
      pending: 34,
      failureRate: 2.6
    },
    subscriptions: {
      active: 342,
      trialing: 45,
      churned: 23,
      churnRate: 3.1
    },
    mrr: {
      current: 89432,
      growth: 12.3,
      byPlan: {
        starter: 23400,
        professional: 41200,
        enterprise: 24832
      }
    }
  }
}

function generateTransactions(): PaymentTransaction[] {
  const statuses: PaymentTransaction['status'][] = ['succeeded', 'pending', 'failed', 'refunded']
  const methods: PaymentTransaction['paymentMethod'][] = ['card', 'bank_transfer', 'paypal', 'stripe']
  const tenants = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Digital Agency']
  const plans = ['Starter Plan', 'Professional Plan', 'Enterprise Plan']
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `txn_${i + 1}`,
    tenantId: `tenant-${Math.floor(Math.random() * 5)}`,
    tenantName: tenants[Math.floor(Math.random() * tenants.length)],
    amount: Math.floor(Math.random() * 50000) + 1000,
    currency: 'USD',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    paymentMethod: methods[Math.floor(Math.random() * methods.length)],
    description: plans[Math.floor(Math.random() * plans.length)],
    customerEmail: `user${i + 1}@example.com`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    processedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 29 * 24 * 60 * 60 * 1000) : undefined,
    failureReason: Math.random() > 0.8 ? 'Insufficient funds' : undefined,
    refundAmount: Math.random() > 0.9 ? Math.floor(Math.random() * 10000) : undefined,
    subscriptionId: `sub_${Math.floor(Math.random() * 100)}`,
    invoiceId: `inv_${Math.floor(Math.random() * 1000)}`
  }))
}

function generateSubscriptions(): Subscription[] {
  const plans: Subscription['plan'][] = ['starter', 'professional', 'enterprise']
  const statuses: Subscription['status'][] = ['active', 'trialing', 'past_due', 'cancelled']
  const tenants = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Digital Agency']
  
  return Array.from({ length: 30 }, (_, i) => ({
    id: `sub_${i + 1}`,
    tenantId: `tenant-${Math.floor(Math.random() * 5)}`,
    tenantName: tenants[Math.floor(Math.random() * tenants.length)],
    customerId: `cus_${Math.floor(Math.random() * 1000)}`,
    customerEmail: `user${i + 1}@example.com`,
    plan: plans[Math.floor(Math.random() * plans.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    currentPeriodStart: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    currentPeriodEnd: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
    amount: [2900, 9900, 29900][Math.floor(Math.random() * 3)],
    currency: 'USD',
    interval: Math.random() > 0.5 ? 'month' : 'year',
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    canceledAt: Math.random() > 0.8 ? new Date() : undefined,
    trialEnd: Math.random() > 0.7 ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : undefined
  }))
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up',
  format = 'number',
  color = 'blue',
  subtitle
}: {
  title: string
  value: number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'stable'
  format?: 'number' | 'currency' | 'percentage'
  color?: string
  subtitle?: string
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`
      case 'percentage':
        return `${val}%`
      default:
        return val.toLocaleString()
    }
  }

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${colorClasses[color]} rounded-md p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium text-gray-900">
              {formatValue(value)}
            </dd>
            {subtitle && (
              <dd className="text-sm text-gray-500">{subtitle}</dd>
            )}
          </dl>
        </div>
        {change !== undefined && (
          <div className={`flex items-center ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-4 w-4 mr-1" />
            ) : null}
            <span className="text-sm font-medium">
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function TransactionRow({ transaction, onAction }: { transaction: PaymentTransaction; onAction: (action: string, id: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'refunded': return <RefreshCw className="h-4 w-4" />
      case 'cancelled': return <Ban className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
        <div className="text-sm text-gray-500">{transaction.createdAt.toLocaleDateString()}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{transaction.tenantName}</div>
        <div className="text-sm text-gray-500">{transaction.customerEmail}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          ${(transaction.amount / 100).toFixed(2)}
        </div>
        <div className="text-sm text-gray-500">{transaction.currency}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
          {getStatusIcon(transaction.status)}
          <span className="ml-1">{transaction.status}</span>
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 capitalize">{transaction.paymentMethod.replace('_', ' ')}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {transaction.description}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onAction('view', transaction.id)}
          className="text-blue-600 hover:text-blue-900 mr-3"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button className="text-gray-400 hover:text-gray-600">
          <Receipt className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

export default function PaymentsPage() {
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null)
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'subscriptions'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMetrics(generatePaymentMetrics())
      setTransactions(generateTransactions())
      setSubscriptions(generateSubscriptions())
      setLoading(false)
    }, 1000)
  }, [])

  const handleAction = (action: string, id: string) => {
    if (action === 'view') {
      const transaction = transactions.find(t => t.id === id)
      if (transaction) {
        setSelectedTransaction(transaction)
      }
    }
    console.log(`Action: ${action}, Transaction: ${id}`)
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === '' || transaction.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading || !metrics) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32" />
          ))}
        </div>
        <div className="bg-gray-200 rounded-lg h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={metrics.revenue.total}
          change={metrics.revenue.growth}
          icon={DollarSign}
          format="currency"
          color="green"
        />
        <MetricCard
          title="Monthly Recurring Revenue"
          value={metrics.mrr.current}
          change={metrics.mrr.growth}
          icon={TrendingUp}
          format="currency"
          color="blue"
        />
        <MetricCard
          title="Active Subscriptions"
          value={metrics.subscriptions.active}
          icon={Users}
          color="purple"
          subtitle={`${metrics.subscriptions.trialing} trialing`}
        />
        <MetricCard
          title="Payment Success Rate"
          value={100 - metrics.transactions.failureRate}
          change={0.3}
          icon={CheckCircle}
          format="percentage"
          color="green"
          trend="up"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="This Month Revenue"
          value={metrics.revenue.thisMonth}
          icon={Calendar}
          format="currency"
          color="blue"
        />
        <MetricCard
          title="Failed Transactions"
          value={metrics.transactions.failed}
          change={metrics.transactions.failureRate}
          icon={AlertCircle}
          color="red"
          trend="down"
        />
        <MetricCard
          title="Churn Rate"
          value={metrics.subscriptions.churnRate}
          change={0.5}
          icon={TrendingDown}
          format="percentage"
          color="yellow"
          trend="down"
        />
        <MetricCard
          title="Pending Transactions"
          value={metrics.transactions.pending}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: DollarSign },
              { id: 'transactions', name: 'Transactions', icon: Receipt },
              { id: 'subscriptions', name: 'Subscriptions', icon: RefreshCw }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'transactions' | 'subscriptions')}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MRR by Plan */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Plan</h3>
                  <div className="space-y-3">
                    {Object.entries(metrics.mrr.byPlan).map(([plan, amount]) => (
                      <div key={plan} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            plan === 'enterprise' ? 'bg-purple-500' :
                            plan === 'professional' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">{plan}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">${amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          {metrics.transactions.succeeded} successful payments
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-blue-800">
                          {metrics.subscriptions.active} paying customers
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">
                          {metrics.subscriptions.trialing} trial users
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All statuses</option>
                    <option value="succeeded">Succeeded</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.slice(0, 20).map((transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        onAction={handleAction}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing {Math.min(20, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </p>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="text-center py-12">
              <RefreshCw className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Subscriptions Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                Detailed subscription management will be implemented with the billing integration.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Transaction Details
                </h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-sm text-gray-900">${(selectedTransaction.amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tenant</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.tenantName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.createdAt.toLocaleString()}</p>
                  </div>
                  {selectedTransaction.processedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Processed</p>
                      <p className="text-sm text-gray-900">{selectedTransaction.processedAt.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {selectedTransaction.failureReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Failure Reason</p>
                    <p className="text-sm text-red-600">{selectedTransaction.failureReason}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                    View Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}