import { useSession } from 'next-auth/react'

// Role hierarchy levels
const roleHierarchy = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  TENANT_OWNER: 2,
  USER: 1
}

export type UserRole = keyof typeof roleHierarchy

export function useRole() {
  const { data: session } = useSession()
  
  const userRole = (session?.user as any)?.role as UserRole | undefined
  const userRoleLevel = userRole ? roleHierarchy[userRole] : 0
  
  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!userRole) return false
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const requiredRoleLevel = Math.min(...roles.map(r => roleHierarchy[r]))
    
    return userRoleLevel >= requiredRoleLevel
  }
  
  const isAdmin = (): boolean => {
    return hasRole(['ADMIN', 'SUPER_ADMIN'])
  }
  
  const isTenantOwner = (): boolean => {
    return hasRole(['TENANT_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  }
  
  const isSuperAdmin = (): boolean => {
    return userRole === 'SUPER_ADMIN'
  }
  
  return {
    role: userRole,
    roleLevel: userRoleLevel,
    hasRole,
    isAdmin,
    isTenantOwner,
    isSuperAdmin,
    isAuthenticated: !!session?.user
  }
}