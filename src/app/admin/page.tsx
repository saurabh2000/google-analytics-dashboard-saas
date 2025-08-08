'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  CreditCard, 
  Building2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Server,
  Database,
  Zap,
  Clock
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface SystemMetrics {
  users: {
    total: number
    active: number
    new: number
    change: number
  }
  tenants: {
    total: number
    active: number
    trial: number
    paying: number
  }
  revenue: {
    mrr: number
    arr: number
    churn: number
    ltv: number
  }
  system: {
    uptime: number
    responseTime: number
    errorRate: number
    activeConnections: number
  }
}

// Mock data - in real app, this would come from APIs
function generateMetrics(): SystemMetrics {
  return {
    users: {
      total: 12847,
      active: 8934,
      new: 234,
      change: 12.3
    },
    tenants: {
      total: 342,
      active: 298,
      trial: 89,
      paying: 209
    },
    revenue: {
      mrr: 89432,
      arr: 1073184,
      churn: 3.2,
      ltv: 2840
    },
    system: {
      uptime: 99.97,
      responseTime: 124,
      errorRate: 0.03,
      activeConnections: 1247
    }
  }
}

const revenueData = [
  { month: 'Jan', mrr: 65400, arr: 784800 },
  { month: 'Feb', mrr: 71200, arr: 854400 },
  { month: 'Mar', mrr: 78900, arr: 946800 },
  { month: 'Apr', mrr: 82100, arr: 985200 },
  { month: 'May', mrr: 87300, arr: 1047600 },
  { month: 'Jun', mrr: 89432, arr: 1073184 },
]

const userGrowthData = [
  { month: 'Jan', users: 8423, active: 6234 },
  { month: 'Feb', users: 9156, active: 6891 },
  { month: 'Mar', users: 10234, active: 7456 },
  { month: 'Apr', users: 11089, active: 8012 },
  { month: 'May', users: 12156, active: 8634 },
  { month: 'Jun', users: 12847, active: 8934 },
]

const planDistribution = [
  { name: 'Starter', value: 156, color: '#8884d8' },
  { name: 'Professional', value: 89, color: '#82ca9d' },
  { name: 'Enterprise', value: 53, color: '#ffc658' },
  { name: 'Trial', value: 44, color: '#ff7c7c' }
]

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up',
  format = 'number',
  color = 'blue'
}: {
  title: string
  value: number
  change?: number
  icon: any
  trend?: 'up' | 'down' | 'stable'
  format?: 'number' | 'currency' | 'percentage'
  color?: string
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

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMetrics(generateMetrics())
      setLoading(false)
    }, 1000)
  }, [])

  if (loading || !metrics) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Activity className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              All systems operational
            </p>
            <p className="text-xs text-green-600">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={metrics.users.total}
          change={metrics.users.change}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Active Tenants"
          value={metrics.tenants.active}
          change={5.2}
          icon={Building2}
          color="green"
        />
        <MetricCard
          title="Monthly Revenue"
          value={metrics.revenue.mrr}
          change={8.7}
          icon={DollarSign}
          format="currency"
          color="purple"
        />
        <MetricCard
          title="System Uptime"
          value={metrics.system.uptime}
          change={0.02}
          icon={Server}
          format="percentage"
          color="green"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="New Users Today"
          value={metrics.users.new}
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Trial Tenants"
          value={metrics.tenants.trial}
          icon={Clock}
          color="yellow"
        />
        <MetricCard
          title="Churn Rate"
          value={metrics.revenue.churn}
          trend="down"
          change={0.8}
          icon={TrendingDown}
          format="percentage"
          color="red"
        />
        <MetricCard
          title="Avg Response Time"
          value={metrics.system.responseTime}
          icon={Zap}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="mrr" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#82ca9d" />
              <Bar dataKey="active" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { type: 'user', action: 'New user registered', time: '2 minutes ago', color: 'bg-green-100 text-green-800' },
              { type: 'payment', action: 'Payment processed', time: '5 minutes ago', color: 'bg-blue-100 text-blue-800' },
              { type: 'tenant', action: 'Tenant upgraded plan', time: '12 minutes ago', color: 'bg-purple-100 text-purple-800' },
              { type: 'alert', action: 'High CPU usage detected', time: '18 minutes ago', color: 'bg-red-100 text-red-800' },
              { type: 'user', action: 'User support ticket', time: '25 minutes ago', color: 'bg-yellow-100 text-yellow-800' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.color}`}>
                  {activity.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {activity.action}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}