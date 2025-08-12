// Re-export authOptions from the config file
export { authOptions } from '@/lib/auth-config'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function checkUserRole(requiredRole: string | string[]) {
  const session = await getSession()
  if (!session?.user) return false
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  const userRole = (session.user as any).role
  
  // Role hierarchy: SUPER_ADMIN > ADMIN > TENANT_OWNER > USER
  const roleHierarchy = {
    SUPER_ADMIN: 4,
    ADMIN: 3,
    TENANT_OWNER: 2,
    USER: 1
  }
  
  const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredRoleLevel = Math.min(...roles.map(r => roleHierarchy[r as keyof typeof roleHierarchy] || 0))
  
  return userRoleLevel >= requiredRoleLevel
}