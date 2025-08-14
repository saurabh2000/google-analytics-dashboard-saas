'use client'

import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import MagicCard from '@/components/magicui/magic-card'
import NumberTicker from '@/components/magicui/number-ticker'
import { cn } from '@/lib/utils'

interface MagicKpiCardProps {
  id: string
  title: string
  value: number
  change?: number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
  prefix?: string
  suffix?: string
  decimalPlaces?: number
  isCustomizable?: boolean
  onRemove?: (id: string) => void
  trend?: number[]
  gradientColor?: string
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    gradient: 'rgba(59, 130, 246, 0.15)',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    gradient: 'rgba(34, 197, 94, 0.15)',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    gradient: 'rgba(168, 85, 247, 0.15)',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400',
    gradient: 'rgba(251, 146, 60, 0.15)',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    gradient: 'rgba(239, 68, 68, 0.15)',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    icon: 'text-yellow-600 dark:text-yellow-400',
    gradient: 'rgba(245, 158, 11, 0.15)',
  },
}

export default function MagicKpiCard({
  id,
  title,
  value,
  change = 0,
  icon: Icon,
  color = 'blue',
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
  isCustomizable = false,
  onRemove,
  trend = [],
  gradientColor,
}: MagicKpiCardProps) {
  const colorClass = colorClasses[color]
  const isPositive = change >= 0

  // Generate mini sparkline path
  const generateSparklinePath = () => {
    if (trend.length < 2) return ''
    
    const width = 80
    const height = 30
    const padding = 2
    
    const min = Math.min(...trend)
    const max = Math.max(...trend)
    const range = max - min || 1
    
    const points = trend.map((val, i) => {
      const x = padding + (i / (trend.length - 1)) * (width - 2 * padding)
      const y = padding + ((max - val) / range) * (height - 2 * padding)
      return `${x},${y}`
    })
    
    return `M ${points.join(' L ')}`
  }

  return (
    <MagicCard
      className="relative group"
      gradientColor={gradientColor || colorClass.gradient}
      gradientSize={300}
      gradientOpacity={0.4}
    >
      {/* Remove button */}
      {isCustomizable && onRemove && (
        <button
          onClick={() => onRemove(id)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
          aria-label={`Remove ${title} card`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn('p-2 rounded-lg', colorClass.bg)}>
              <Icon className={cn('w-5 h-5', colorClass.icon)} />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          </div>
          
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              {prefix && <span className="text-2xl font-bold text-gray-900 dark:text-white">{prefix}</span>}
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                <NumberTicker value={value} decimalPlaces={decimalPlaces} />
              </span>
              {suffix && <span className="text-xl font-medium text-gray-600 dark:text-gray-400">{suffix}</span>}
            </div>
            
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {isPositive ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">vs last period</span>
              </div>
            )}
          </div>
        </div>

        {/* Mini sparkline */}
        {trend.length > 0 && (
          <div className="ml-4">
            <svg width="80" height="30" className="opacity-50">
              <path
                d={generateSparklinePath()}
                fill="none"
                stroke={colorClass.icon.split(' ')[0].replace('text-', '#')}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
              />
            </svg>
          </div>
        )}
      </div>
    </MagicCard>
  )
}