'use client'

import { useState, useEffect } from 'react'

interface ClientTimestampProps {
  date: Date
  prefix?: string
  className?: string
}

export default function ClientTimestamp({ date, prefix = "", className }: ClientTimestampProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // Return null during SSR to avoid hydration mismatch
  }

  return (
    <span className={className}>
      {prefix}{date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })}
    </span>
  )
}