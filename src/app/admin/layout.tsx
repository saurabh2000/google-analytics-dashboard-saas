'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Shield, 
  FileText,
  HelpCircle,
  AlertTriangle,
  Database,
  Activity,
  Building2,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: BarChart3,
    description: 'System overview and key metrics'
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage all users across tenants'
  },
  {
    name: 'Tenants',
    href: '/admin/tenants',
    icon: Building2,
    description: 'Manage client organizations'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: Activity,
    description: 'Platform usage and performance metrics'
  },
  {
    name: 'Billing',
    href: '/admin/billing',
    icon: CreditCard,
    description: 'Billing, subscriptions, and transactions'
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: Shield,
    description: 'Security logs and compliance'
  },
  {
    name: 'System',
    href: '/admin/system',
    icon: Database,
    description: 'System health and configuration'
  },
  {
    name: 'Support',
    href: '/admin/support',
    icon: HelpCircle,
    description: 'Support tickets and customer issues'
  },
  {
    name: 'Logs',
    href: '/admin/logs',
    icon: FileText,
    description: 'Application logs and audit trail'
  },
  {
    name: 'Alerts',
    href: '/admin/alerts',
    icon: AlertTriangle,
    description: 'System alerts and monitoring'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Admin panel configuration'
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify')
        const data = await response.json()
        
        if (!data.success) {
          router.push('/admin/login')
        } else {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    // Skip auth check for login page
    if (!pathname.startsWith('/admin/login')) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [pathname, router])

  // For login page, don't show loading state or check auth
  if (pathname.startsWith('/admin/login')) {
    return <>{children}</>
  }

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleAdminLogout = async () => {
    try {
      // Call logout API endpoint
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Clear any local state
        setIsAuthenticated(false)
        // Force redirect to admin login using window.location to clear all state
        window.location.href = '/admin/login'
      } else {
        console.error('Logout failed')
        // Still try to redirect even if logout fails
        window.location.href = '/admin/login'
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect on error
      window.location.href = '/admin/login'
    }
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render admin layout if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-2xl font-bold text-red-600">Admin Panel</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-red-100 text-red-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-2xl font-bold text-red-600">Admin Panel</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-red-100 text-red-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={item.description}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User info */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full group">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {session?.user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user?.email || 'admin@example.com'}
                </p>
              </div>
              <button
                onClick={handleAdminLogout}
                className="ml-3 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex-1 flex items-center">
              <button
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex-1 px-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {navigation.find(item => isActive(item.href))?.name || 'Admin Dashboard'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {navigation.find(item => isActive(item.href))?.description || 'Manage your application'}
                  </p>
                </div>
                
                {/* Notifications */}
                <div className="flex items-center space-x-4">
                  <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      3
                    </span>
                  </button>
                  <div className="h-6 w-px bg-gray-300" />
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-600">System Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}