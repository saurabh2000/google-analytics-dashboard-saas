'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

interface Organization {
  id: string
  name: string
  slug: string
  role: string
}

interface TenantContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  loading: boolean
  switchOrganization: (orgId: string) => Promise<void>
  isAdmin: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchUserOrganizations()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session?.user?.email, status])

  const fetchUserOrganizations = async () => {
    try {
      console.log('Fetching user organizations...')
      const response = await fetch('/api/organizations')
      console.log('Organizations response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Organizations data:', data)
        
        // If user has no organizations, create a personal one
        if (data.organizations.length === 0) {
          console.log('No organizations found, creating one...')
          const createResponse = await fetch('/api/organizations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: `${session?.user?.name || session?.user?.email}'s Workspace`
            })
          })
          
          console.log('Create organization response status:', createResponse.status)
          
          if (createResponse.ok) {
            const newOrg = await createResponse.json()
            console.log('New organization created:', newOrg)
            setOrganizations([newOrg.organization])
            setCurrentOrganization(newOrg.organization)
            router.push(`/org/${newOrg.organization.slug}/dashboard`)
            return
          } else {
            const errorData = await createResponse.json()
            console.error('Failed to create organization:', errorData)
          }
        }
        
        setOrganizations(data.organizations)
        
        // Set current organization from URL or default to first one
        const pathSegments = pathname.split('/')
        const orgSlugIndex = pathSegments.indexOf('org')
        const urlOrgSlug = orgSlugIndex !== -1 ? pathSegments[orgSlugIndex + 1] : null
        
        if (urlOrgSlug) {
          const org = data.organizations.find((o: Organization) => o.slug === urlOrgSlug)
          if (org) {
            setCurrentOrganization(org)
          } else {
            // Redirect to valid organization
            router.push(`/org/${data.organizations[0].slug}/dashboard`)
          }
        } else if (data.organizations.length > 0) {
          // No organization in URL, redirect to first organization
          setCurrentOrganization(data.organizations[0])
          if (!pathname.startsWith('/org/')) {
            router.push(`/org/${data.organizations[0].slug}/dashboard`)
          }
        }
      } else {
        console.error('Organizations API returned error status:', response.status)
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchOrganization = async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    if (org) {
      setCurrentOrganization(org)
      // Update URL to reflect new organization
      const newPath = pathname.replace(/\/org\/[^\/]+/, `/org/${org.slug}`)
      router.push(newPath)
    }
  }

  const isAdmin = currentOrganization?.role === 'owner' || currentOrganization?.role === 'admin'

  return (
    <TenantContext.Provider value={{
      currentOrganization,
      organizations,
      loading,
      switchOrganization,
      isAdmin
    }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}