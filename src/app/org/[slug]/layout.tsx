'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTenant } from '@/contexts/TenantContext'

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const router = useRouter()
  const { currentOrganization, organizations, loading } = useTenant()
  
  useEffect(() => {
    if (!loading && organizations.length > 0) {
      // Verify the organization slug in URL is valid
      const urlSlug = params.slug as string
      const validOrg = organizations.find(org => org.slug === urlSlug)
      
      if (!validOrg) {
        // Redirect to first available organization
        router.push(`/org/${organizations[0].slug}/dashboard`)
      }
    }
  }, [params.slug, organizations, loading, router])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (!currentOrganization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">No organization found</h2>
          <p className="mt-2 text-gray-600">Please contact support if this issue persists.</p>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}