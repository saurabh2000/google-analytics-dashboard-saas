'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from './AdminNav'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  isAdmin: boolean
}

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function AdminLayout({ children, title = 'Admin Panel', subtitle = 'System Administration' }: AdminLayoutProps) {
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
          router.push('/admin/login')
        }
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav userName={user.name} userEmail={user.email} />
      
      {title && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}