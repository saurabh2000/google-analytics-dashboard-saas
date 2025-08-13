'use client'

import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface RevenueCardProps {
  revenue: number
  growth: number
  goal: number
  currency?: string
  isRealData?: boolean
}

export default function RevenueCard({ 
  revenue, 
  growth, 
  goal, 
  currency = 'USD',
  isRealData = false 
}: RevenueCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const progressToGoal = (revenue / goal) * 100
  const remaining = Math.max(0, goal - revenue)

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Total Revenue
        </CardTitle>
        <div className="flex items-center space-x-2">
          {!isRealData && (
            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">
              Demo
            </span>
          )}
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Main Revenue */}
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(revenue)}
            </div>
            <div className="flex items-center space-x-1">
              {growth > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                "text-sm font-medium",
                growth > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Goal Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3 text-gray-500" />
                <span className="text-gray-500 dark:text-gray-400">Goal Progress</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                {progressToGoal.toFixed(1)}%
              </span>
            </div>
            
            <Progress value={Math.min(progressToGoal, 100)} className="h-2" />
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Current: {formatCurrency(revenue)}</span>
              <span>Goal: {formatCurrency(goal)}</span>
            </div>
            
            {remaining > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(remaining)} remaining to reach goal
              </div>
            )}
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(revenue * 0.6)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Subscriptions
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(revenue * 0.4)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                One-time
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 pointer-events-none" />
    </Card>
  )
}