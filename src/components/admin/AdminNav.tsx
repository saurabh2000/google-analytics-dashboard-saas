'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminNavProps {
  userEmail?: string
  userName?: string
}

export default function AdminNav({ userEmail = 'Admin User', userName = 'saurabh2000@gmail.com' }: AdminNavProps) {
  const pathname = usePathname()

  const handleLogout = () => {
    // Clear the admin token cookie
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    window.location.href = '/admin/login'
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/tenants', label: 'Tenants', icon: '🏢' },
    { href: '/admin/billing', label: 'Billing', icon: '💳' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
  ]

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Admin Portal
              </span>
            </Link>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                      : 'text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userName}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {userEmail} • SUPER_ADMIN
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

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-3 gap-2">
            {navItems.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                    : 'text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}