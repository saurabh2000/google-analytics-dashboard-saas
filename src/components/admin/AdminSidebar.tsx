'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminSidebarProps {
  userEmail?: string
  userName?: string
  onLogout?: () => void
}

export default function AdminSidebar({ userEmail = 'saurabh2000@gmail.com', userName = 'Admin User', onLogout }: AdminSidebarProps) {
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
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Admin Portal
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-r-2 border-red-500'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {userEmail}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout || handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}