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

export default function AdminUsersPage() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard-bypass" className="text-red-600 hover:text-red-700">
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage system users</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
          <p className="text-gray-600 mb-6">
            This is a placeholder page for user management functionality.
            In a real application, this would show a list of all users with options to:
          </p>
          <div className="space-y-2 text-left max-w-md mx-auto">
            <p>✓ View all registered users</p>
            <p>✓ Edit user profiles and permissions</p>
            <p>✓ Activate/deactivate user accounts</p>
            <p>✓ Reset user passwords</p>
            <p>✓ Assign user roles and tenant access</p>
          </div>
        </div>
      </main>
    </div>
  )
}