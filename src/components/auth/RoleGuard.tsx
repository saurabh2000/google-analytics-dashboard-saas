'use client'

import { ReactNode } from 'react'
import { useRole, UserRole } from '@/hooks/useRole'

interface RoleGuardProps {
  children: ReactNode
  requiredRole: UserRole | UserRole[]
  fallback?: ReactNode
}

export function RoleGuard({ children, requiredRole, fallback = null }: RoleGuardProps) {
  const { hasRole } = useRole()
  
  if (!hasRole(requiredRole)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Convenience components
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole={['ADMIN', 'SUPER_ADMIN']} fallback={fallback}>{children}</RoleGuard>
}

export function TenantOwnerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole="TENANT_OWNER" fallback={fallback}>{children}</RoleGuard>
}

export function SuperAdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole="SUPER_ADMIN" fallback={fallback}>{children}</RoleGuard>
}