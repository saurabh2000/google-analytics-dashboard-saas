'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts'

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

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
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
              <div key={i} className="bg-gray-200 rounded-lg h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid - Simplified Original Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tenants</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalTenants}
              </p>
            </div>
            <div className="text-3xl">🏢</div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+5% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.activeSubscriptions}
              </p>
            </div>
            <div className="text-3xl">💳</div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+8% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${stats.monthlyRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+15% from last month</span>
          </div>
        </div>
      </div>

      {/* Additional Charts from Second Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Growth</h3>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Growth</h3>
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

      {/* Recent Users and Tenants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Users</h3>
            <Link href="/admin/users" className="text-red-600 hover:text-red-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
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
          </div>
        </div>

        {/* Recent Tenants */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Tenants</h3>
            <Link href="/admin/tenants" className="text-red-600 hover:text-red-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentTenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
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
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Create New Tenant
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Send System Notification
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Export User Data
          </button>
          <Link
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Main Site
          </Link>
        </div>
      </div>
    </div>
  )
}