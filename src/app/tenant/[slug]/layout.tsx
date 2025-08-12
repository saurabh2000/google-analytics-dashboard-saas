'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function TenantLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    redirect('/auth/signin')
  }

  // Check if user has access to this tenant
  const userRole = (session as any)?.user?.role
  if (userRole !== 'TENANT_OWNER' && userRole !== 'ADMIN') {
    redirect('/unauthorized')
  }

  return <>{children}</>
}