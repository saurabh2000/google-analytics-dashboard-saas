'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  isAdmin: boolean
}

export default function AdminDashboardBypass() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats] = useState({
    totalUsers: 1247,
    totalTenants: 89,
    activeSubscriptions: 76,
    monthlyRevenue: 7524
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        } else {
          router.push('/admin/login-bypass')
        }
      } else {
        router.push('/admin/login-bypass')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login-bypass')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Clear the admin token cookie
      document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      router.push('/admin/login-bypass')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Direct Authentication System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user.email} • {user.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Success Message */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">🎉 Admin Login Working!</h2>
            <p className="text-green-100">
              Direct authentication successful! No NextAuth issues. ✅
            </p>
            <div className="mt-4 bg-green-800/30 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Authentication Details:</h3>
              <ul className="space-y-1 text-sm">
                <li>✅ User ID: {user.id}</li>
                <li>✅ Email: {user.email}</li>
                <li>✅ Role: {user.role}</li>
                <li>✅ Admin Status: {user.isAdmin ? 'Yes' : 'No'}</li>
                <li>✅ Authentication: Direct JWT (bypassing NextAuth)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
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

        {/* Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Management</h3>
            <div className="space-y-3">
              <Link
                href="/admin/users-bypass"
                className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">All Users</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View and manage user accounts</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
              <Link
                href="/admin/tenants-bypass"
                className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Tenant Organizations</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage tenant accounts and settings</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            </div>
          </div>

          {/* System Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System Management</h3>
            <div className="space-y-3">
              <Link
                href="/admin/billing-bypass"
                className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Billing & Subscriptions</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monitor payments and subscriptions</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
              <Link
                href="/admin/analytics-bypass"
                className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">System Analytics</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Platform usage and performance metrics</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
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
      </main>
    </div>
  )
}