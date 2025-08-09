'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/contexts/TenantContext'

export default function OrgRedirectPage() {
  const router = useRouter()
  const { organizations, loading } = useTenant()
  
  useEffect(() => {
    if (!loading && organizations.length > 0) {
      // Redirect to first organization's dashboard
      router.push(`/org/${organizations[0].slug}/dashboard`)
    }
  }, [organizations, loading, router])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (organizations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900">Setting up your workspace</h2>
          <p className="mt-2 text-gray-600">This will only take a moment...</p>
        </div>
      </div>
    )
  }
  
  return null
}