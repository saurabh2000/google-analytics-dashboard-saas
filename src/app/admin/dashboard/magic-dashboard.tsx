'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Building2, CreditCard, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts'
import MagicKpiCard from '@/components/dashboard/MagicKpiCard'
import MagicEventsCard from '@/components/dashboard/MagicEventsCard'
import MagicRealtimeChart from '@/components/dashboard/MagicRealtimeChart'
import SparklesButton from '@/components/magicui/sparkles-button'
import MagicCard from '@/components/magicui/magic-card'
import { AnimatedList } from '@/components/magicui/animated-list'

// Chart data from the comprehensive dashboard
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

// System events for the animated list
const systemEvents = [
  {
    id: '1',
    type: 'signup',
    title: 'New Enterprise Tenant',
    value: 'DataFlow AI',
    timestamp: '2 min ago',
    user: 'admin@dataflow.ai'
  },
  {
    id: '2',
    type: 'purchase',
    title: 'Upgrade to Professional',
    value: '$99/mo',
    timestamp: '5 min ago',
    user: 'team@startupco.com'
  },
  {
    id: '3',
    type: 'signup',
    title: 'New Admin User',
    timestamp: '8 min ago',
    user: 'mike@techflow.com'
  },
  {
    id: '4',
    type: 'alert',
    title: 'High API Usage Alert',
    value: 'Acme Corp - 95% quota',
    timestamp: '12 min ago',
  },
  {
    id: '5',
    type: 'purchase',
    title: 'Enterprise Plan Renewal',
    value: '$299/mo',
    timestamp: '15 min ago',
    user: 'billing@growthco.com'
  },
]

export default function MagicAdminDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500)
  }, [])

  const stats = {
    totalUsers: 12847,
    totalTenants: 342,
    activeSubscriptions: 298,
    monthlyRevenue: 89432
  }

  // Mock recent users data
  const recentUsers = [
    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'USER', tenant: 'Acme Corp', joinedAt: '2024-01-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@startup.io', role: 'TENANT_OWNER', tenant: 'StartupCo', joinedAt: '2024-01-14' },
    { id: 3, name: 'Mike Wilson', email: 'mike@techflow.com', role: 'ADMIN', tenant: 'TechFlow', joinedAt: '2024-01-13' },
    { id: 4, name: 'Emily Davis', email: 'emily@growthco.com', role: 'USER', tenant: 'GrowthCo', joinedAt: '2024-01-12' },
    { id: 5, name: 'David Chen', email: 'david@dataflow.ai', role: 'USER', tenant: 'DataFlow', joinedAt: '2024-01-11' },
  ]

  // Mock recent tenants data
  const recentTenants = [
    { id: 1, name: 'Acme Corp', slug: 'acme', plan: 'unlimited', users: 45, createdAt: '2024-01-10', status: 'active' },
    { id: 2, name: 'StartupCo', slug: 'startup', plan: 'unlimited', users: 12, createdAt: '2024-01-08', status: 'active' },
    { id: 3, name: 'TechFlow', slug: 'techflow', plan: 'unlimited', users: 78, createdAt: '2024-01-05', status: 'active' },
    { id: 4, name: 'GrowthCo', slug: 'growthco', plan: 'unlimited', users: 23, createdAt: '2024-01-03', status: 'trial' },
    { id: 5, name: 'DataFlow AI', slug: 'dataflow', plan: 'unlimited', users: 156, createdAt: '2024-01-01', status: 'active' },
  ]

  const getRoleBadge = (role: string) => {
    const colors = {
      'SUPER_ADMIN': 'bg-red-100 text-red-800 border-red-200',
      'ADMIN': 'bg-orange-100 text-orange-800 border-orange-200',
      'TENANT_OWNER': 'bg-blue-100 text-blue-800 border-blue-200',
      'USER': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[role as keyof typeof colors] || colors.USER
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'trial': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'suspended': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid with Magic KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MagicKpiCard
          id="total-users"
          title="Total Users"
          value={stats.totalUsers}
          change={12}
          icon={Users}
          color="blue"
          trend={[8423, 9156, 10234, 11089, 12156, 12847]}
        />
        
        <MagicKpiCard
          id="active-tenants"
          title="Active Tenants"
          value={stats.totalTenants}
          change={5}
          icon={Building2}
          color="green"
          trend={[298, 310, 318, 325, 334, 342]}
        />
        
        <MagicKpiCard
          id="subscriptions"
          title="Subscriptions"
          value={stats.activeSubscriptions}
          change={8}
          icon={CreditCard}
          color="purple"
          trend={[245, 256, 267, 278, 287, 298]}
        />
        
        <MagicKpiCard
          id="monthly-revenue"
          title="Monthly Revenue"
          value={stats.monthlyRevenue}
          change={15}
          icon={DollarSign}
          color="orange"
          prefix="$"
          trend={[65400, 71200, 78900, 82100, 87300, 89432]}
        />
      </div>

      {/* Real-time Analytics and System Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <MagicRealtimeChart propertyName="Platform Analytics" />
        </div>
        <div className="lg:col-span-1">
          <MagicEventsCard isRealData={false} />
        </div>
      </div>

      {/* Additional Charts with Magic Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Growth Chart */}
        <MagicCard gradientColor="rgba(59, 130, 246, 0.1)" gradientSize={400}>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Line 
                type="monotone" 
                dataKey="mrr" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </MagicCard>

        {/* User Growth Chart */}
        <MagicCard gradientColor="rgba(34, 197, 94, 0.1)" gradientSize={400}>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Bar dataKey="users" fill="#22c55e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="active" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </MagicCard>
      </div>

      {/* Recent Users and Tenants with Animated Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Users */}
        <MagicCard gradientColor="rgba(168, 85, 247, 0.1)">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Users</h3>
            <Link href="/admin/users" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              View All →
            </Link>
          </div>
          <AnimatedList className="space-y-3" delay={200}>
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.joinedAt}</p>
                </div>
              </div>
            ))}
          </AnimatedList>
        </MagicCard>

        {/* Recent Tenants */}
        <MagicCard gradientColor="rgba(251, 146, 60, 0.1)">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Tenants</h3>
            <Link href="/admin/tenants" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              View All →
            </Link>
          </div>
          <AnimatedList className="space-y-3" delay={200}>
            {recentTenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {tenant.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{tenant.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tenant.users} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(tenant.status)}`}>
                    {tenant.status}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tenant.createdAt}</p>
                </div>
              </div>
            ))}
          </AnimatedList>
        </MagicCard>
      </div>

      {/* Quick Actions with Sparkles Buttons */}
      <MagicCard gradientColor="rgba(59, 130, 246, 0.05)">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <SparklesButton>
            Create New Tenant
          </SparklesButton>
          <SparklesButton variant="outline">
            Send System Notification
          </SparklesButton>
          <SparklesButton variant="outline">
            Export User Data
          </SparklesButton>
          <Link href="/">
            <SparklesButton variant="ghost">
              View Main Site
            </SparklesButton>
          </Link>
        </div>
      </MagicCard>
    </div>
  )
}