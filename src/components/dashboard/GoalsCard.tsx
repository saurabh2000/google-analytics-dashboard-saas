'use client'

import { Target, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface Goal {
  id: string
  name: string
  target: number
  current: number
  deadline: string
  status: 'on-track' | 'at-risk' | 'completed' | 'overdue'
  category: 'conversion' | 'traffic' | 'engagement' | 'revenue'
}

interface GoalsCardProps {
  goals: Goal[]
  isRealData?: boolean
}

const defaultGoals: Goal[] = [
  {
    id: '1',
    name: 'Monthly Signups',
    target: 500,
    current: 347,
    deadline: '2024-01-31',
    status: 'on-track',
    category: 'conversion'
  },
  {
    id: '2',
    name: 'Page Views',
    target: 50000,
    current: 42300,
    deadline: '2024-01-31',
    status: 'on-track',
    category: 'traffic'
  },
  {
    id: '3',
    name: 'Avg Session Duration',
    target: 180,
    current: 145,
    deadline: '2024-01-31',
    status: 'at-risk',
    category: 'engagement'
  }
]

export default function GoalsCard({ 
  goals = defaultGoals, 
  isRealData = false 
}: GoalsCardProps) {
  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'on-track':
        return <Target className="w-3 h-3 text-blue-500" />
      case 'at-risk':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />
      case 'overdue':
        return <Clock className="w-3 h-3 text-red-500" />
      default:
        return <Target className="w-3 h-3 text-gray-500" />
    }
  }

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'on-track':
        return 'text-blue-600 dark:text-blue-400'
      case 'at-risk':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'overdue':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'conversion':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'traffic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'engagement':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'revenue':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const formatValue = (value: number, category: Goal['category']) => {
    switch (category) {
      case 'revenue':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(value)
      case 'engagement':
        return `${Math.round(value)}s`
      default:
        return value.toLocaleString()
    }
  }

  const completedGoals = goals.filter(g => g.status === 'completed').length
  const totalGoals = goals.length
  const overallProgress = (completedGoals / totalGoals) * 100

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Goals & Objectives
        </CardTitle>
        <div className="flex items-center space-x-2">
          {!isRealData && (
            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">
              Demo
            </span>
          )}
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {completedGoals}/{totalGoals} completed
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Individual Goals */}
        <div className="space-y-3">
          {goals.slice(0, 3).map((goal) => {
            const progress = (goal.current / goal.target) * 100
            const daysLeft = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )
            
            return (
              <div key={goal.id} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(goal.status)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {goal.name}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      getCategoryColor(goal.category)
                    )}>
                      {goal.category}
                    </span>
                  </div>
                  <span className={cn("text-xs font-medium", getStatusColor(goal.status))}>
                    {goal.status.replace('-', ' ')}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatValue(goal.current, goal.category)} / {formatValue(goal.target, goal.category)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-1.5" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {completedGoals}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {goals.filter(g => g.status === 'at-risk').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              At Risk
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {goals.filter(g => g.status === 'on-track').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              On Track
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}