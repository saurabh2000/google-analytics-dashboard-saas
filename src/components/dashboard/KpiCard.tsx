'use client'

import { AnalyticsData } from '@/lib/analytics-data'

interface KpiCardProps {
  id: string
  name: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'indigo' | 'teal' | 'pink'
  analyticsData: AnalyticsData | null
  onRemove?: (id: string) => void
  isCustomizable?: boolean
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-600 dark:text-blue-300',
    positive: 'text-blue-600 dark:text-blue-400',
    negative: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-600 dark:text-green-300',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    text: 'text-purple-600 dark:text-purple-300',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    text: 'text-orange-600 dark:text-orange-300',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-600 dark:text-red-300',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400'
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-600 dark:text-yellow-300',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400'
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900',
    text: 'text-indigo-600 dark:text-indigo-300',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400'
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-900',
    text: 'text-teal-600 dark:text-teal-300',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400'
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900',
    text: 'text-pink-600 dark:text-pink-300',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400'
  }
}

const getKpiValue = (id: string, data: AnalyticsData | null) => {
  if (!data) return { value: '0', change: 0 }

  switch (id) {
    case 'total-users':
      return { value: data.users.total.toLocaleString(), change: data.users.change }
    case 'sessions':
      return { value: data.sessions.total.toLocaleString(), change: data.sessions.change }
    case 'page-views':
      return { value: data.pageViews.total.toLocaleString(), change: data.pageViews.change }
    case 'avg-session':
      return { value: data.avgSessionDuration.total, change: data.avgSessionDuration.change }
    case 'bounce-rate':
      // Simulate bounce rate
      const bounceRate = 45.2 + (Math.random() - 0.5) * 10
      return { value: `${bounceRate.toFixed(1)}%`, change: -2.1 }
    case 'conversion-rate':
      // Simulate conversion rate
      const conversionRate = 3.4 + (Math.random() - 0.5) * 2
      return { value: `${conversionRate.toFixed(1)}%`, change: 8.7 }
    case 'revenue':
      // Simulate revenue based on sessions
      const revenue = data.sessions.total * 0.85
      return { value: `$${revenue.toLocaleString()}`, change: data.sessions.change + 2.1 }
    case 'new-users':
      // Simulate new users (70% of total users)
      const newUsers = Math.round(data.users.total * 0.7)
      return { value: newUsers.toLocaleString(), change: data.users.change + 1.5 }
    case 'returning-users':
      // Simulate returning users (30% of total users)
      const returningUsers = Math.round(data.users.total * 0.3)
      return { value: returningUsers.toLocaleString(), change: data.users.change - 3.2 }
    case 'events':
      // Simulate events (3x page views)
      const events = data.pageViews.total * 3
      return { value: events.toLocaleString(), change: data.pageViews.change + 1.8 }
    default:
      return { value: '0', change: 0 }
  }
}

export default function KpiCard({ 
  id, 
  name, 
  icon, 
  color, 
  analyticsData, 
  onRemove, 
  isCustomizable = false 
}: KpiCardProps) {
  const { value, change } = getKpiValue(id, analyticsData)
  const colors = colorClasses[color]
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative group">
      {/* Remove button (only visible on hover if customizable) */}
      {isCustomizable && onRemove && (
        <button
          onClick={() => onRemove(id)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 w-6 h-6 rounded-full flex items-center justify-center text-xs"
          title="Remove card"
        >
          ×
        </button>
      )}

      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 ${colors.bg} rounded-md flex items-center justify-center`}>
            <span className={`${colors.text} text-lg`}>{icon}</span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{name}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className={`text-sm ${
            isPositive ? colors.positive : 
            isNegative ? colors.negative : 
            'text-gray-500 dark:text-gray-400'
          }`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}% vs last period
          </p>
        </div>
      </div>
    </div>
  )
}