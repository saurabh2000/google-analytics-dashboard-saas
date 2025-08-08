'use client'

import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface SimpleKPICardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

export default function SimpleKPICard({
  title,
  value,
  change,
  trend = 'neutral',
  subtitle,
}: SimpleKPICardProps) {
  const getTrendColor = () => {
    if (!change) return ''
    
    if (trend === 'up') {
      return change > 0 ? 'text-green-600' : 'text-red-600'
    } else if (trend === 'down') {
      return change < 0 ? 'text-green-600' : 'text-red-600'
    }
    
    return 'text-gray-600'
  }

  const getTrendIcon = () => {
    if (!change) return null
    
    return change > 0 ? (
      <ArrowUpIcon className="w-4 h-4" />
    ) : (
      <ArrowDownIcon className="w-4 h-4" />
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 h-full flex flex-col">
      <h3 className="text-sm font-medium text-gray-600 mb-4">{title}</h3>
      
      <div className="flex-1">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {value}
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="font-medium">
              {change > 0 ? '+' : ''}{change}%
            </span>
            {subtitle && (
              <span className="text-gray-500 ml-1">{subtitle}</span>
            )}
          </div>
        )}
        
        {!change && subtitle && (
          <div className="text-sm text-gray-500">{subtitle}</div>
        )}
      </div>
    </div>
  )
}