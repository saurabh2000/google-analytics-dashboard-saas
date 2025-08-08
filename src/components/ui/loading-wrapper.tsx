'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingWrapperProps {
  isLoading: boolean
  children: React.ReactNode
  skeleton?: React.ReactNode
  fullScreen?: boolean
  className?: string
  loadingText?: string
}

export function LoadingWrapper({
  isLoading,
  children,
  skeleton,
  fullScreen = false,
  className,
  loadingText = 'Loading...'
}: LoadingWrapperProps) {
  if (!isLoading) {
    return <>{children}</>
  }

  if (skeleton) {
    return <>{skeleton}</>
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-600">{loadingText}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-gray-600">{loadingText}</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ 
  size = 'default',
  className 
}: { 
  size?: 'sm' | 'default' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} 
    />
  )
}

export function LoadingOverlay({ 
  children,
  isLoading,
  text = 'Loading...'
}: { 
  children: React.ReactNode
  isLoading: boolean
  text?: string
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-600">{text}</span>
          </div>
        </div>
      )}
    </div>
  )
}