'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, MoreVertical, Info, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { AnalyticsData } from '@/lib/analytics-data'

interface EnhancedKpiCardProps {
  id: string
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
  progress?: number
  goal?: number
  description?: string
  trend?: number[]
  isCustomizable?: boolean
  onRemove?: (id: string) => void
  onToggleVisibility?: (id: string) => void
  isVisible?: boolean
  analyticsData?: AnalyticsData | null
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    trend: 'text-blue-600 dark:text-blue-400',
    progress: 'bg-blue-500'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    trend: 'text-green-600 dark:text-green-400',
    progress: 'bg-green-500'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    trend: 'text-purple-600 dark:text-purple-400',
    progress: 'bg-purple-500'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400',
    trend: 'text-orange-600 dark:text-orange-400',
    progress: 'bg-orange-500'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    trend: 'text-red-600 dark:text-red-400',
    progress: 'bg-red-500'
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'text-yellow-600 dark:text-yellow-400',
    trend: 'text-yellow-600 dark:text-yellow-400',
    progress: 'bg-yellow-500'
  }
}

export default function EnhancedKpiCard({
  id,
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'blue',
  progress,
  goal,
  description,
  trend,
  isCustomizable,
  onRemove,
  onToggleVisibility,
  isVisible = true
}: EnhancedKpiCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const colorConfig = colorClasses[color]
  
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString()
    }
    return val
  }

  const renderTrend = () => {
    if (!trend || trend.length < 2) return null
    
    const last = trend[trend.length - 1]
    const previous = trend[trend.length - 2]
    const trendDirection = last > previous ? 'up' : 'down'
    
    return (
      <div className="flex items-center space-x-1">
        {trendDirection === 'up' ? (
          <TrendingUp className="w-3 h-3 text-green-500" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500" />
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {((last - previous) / previous * 100).toFixed(1)}%
        </span>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Card className={cn(
        "relative transition-all duration-200 hover:shadow-lg",
        !isVisible && "opacity-50"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className={cn("p-2 rounded-lg", colorConfig.bg)}>
              <div className={cn("w-4 h-4", colorConfig.icon)}>
                {icon}
              </div>
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </CardTitle>
              {description && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          
          {isCustomizable && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 py-1">
                  <button
                    onClick={() => {
                      onToggleVisibility?.(id)
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{isVisible ? 'Hide' : 'Show'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsExpanded(!isExpanded)
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                  {onRemove && (
                    <button
                      onClick={() => {
                        onRemove(id)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-1 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* Main Value */}
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatValue(value)}
              </div>
              {renderTrend()}
            </div>
            
            {/* Change Indicator */}
            {change !== undefined && (
              <div className="flex items-center space-x-1">
                {change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : change < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : null}
                <span className={cn(
                  "text-sm font-medium",
                  change > 0 ? "text-green-600 dark:text-green-400" :
                  change < 0 ? "text-red-600 dark:text-red-400" :
                  "text-gray-600 dark:text-gray-400"
                )}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
            
            {/* Progress Bar */}
            {progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Progress</span>
                  <span className="text-gray-700 dark:text-gray-300">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            {/* Goal Tracking */}
            {goal !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Goal</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatValue(goal)}
                </span>
              </div>
            )}
            
            {/* Expanded Content */}
            {isExpanded && trend && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  7-day trend
                </div>
                <div className="flex items-end space-x-1 h-8">
                  {trend.slice(-7).map((val, index) => {
                    const maxVal = Math.max(...trend.slice(-7))
                    const height = (val / maxVal) * 100
                    return (
                      <div
                        key={index}
                        className={cn("flex-1 rounded-sm", colorConfig.progress)}
                        style={{ height: `${height}%` }}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}