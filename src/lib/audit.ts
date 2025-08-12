import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

interface AuditLogData {
  userId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, any>
  request?: NextRequest
}

export async function createAuditLog({
  userId,
  action,
  resource,
  resourceId,
  metadata,
  request
}: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        metadata,
        ipAddress: request?.headers.get('x-forwarded-for') || 
                  request?.headers.get('x-real-ip') || 
                  request?.ip,
        userAgent: request?.headers.get('user-agent')
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw error to prevent audit logging from breaking the main operation
  }
}

// Common audit actions
export const AUDIT_ACTIONS = {
  // User actions
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_UPDATED: 'USER_UPDATED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  USER_DELETED: 'USER_DELETED',
  
  // Tenant actions
  TENANT_CREATED: 'TENANT_CREATED',
  TENANT_UPDATED: 'TENANT_UPDATED',
  TENANT_SUSPENDED: 'TENANT_SUSPENDED',
  TENANT_ACTIVATED: 'TENANT_ACTIVATED',
  TENANT_DELETED: 'TENANT_DELETED',
  
  // Admin actions
  ADMIN_ACCESS: 'ADMIN_ACCESS',
  ROLE_CHANGED: 'ROLE_CHANGED',
  PERMISSIONS_CHANGED: 'PERMISSIONS_CHANGED',
  
  // Security actions
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  TWO_FACTOR_ENABLED: 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED: 'TWO_FACTOR_DISABLED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  
  // Data actions
  DATA_EXPORTED: 'DATA_EXPORTED',
  DASHBOARD_CREATED: 'DASHBOARD_CREATED',
  DASHBOARD_DELETED: 'DASHBOARD_DELETED',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED'
} as const

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]