import { z } from 'zod'

// Common validation helpers
const stringRequired = (fieldName: string, minLength: number = 1, maxLength: number = 255) =>
  z.string()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} must be no more than ${maxLength} characters`)
    .trim()

const optionalString = (maxLength: number = 255) =>
  z.string().max(maxLength).trim().optional()

const emailField = z.string().email('Invalid email address').toLowerCase()

const passwordField = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be no more than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')

const uuidField = z.string().uuid('Invalid UUID format')

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

const positiveInteger = z.number().int().positive()
const nonNegativeInteger = z.number().int().min(0)

// Analytics API Schemas
export const analyticsDataSchema = z.object({
  propertyId: stringRequired('Property ID', 1, 50),
  dateRange: z.enum(['7d', '30d', '90d', '365d', 'custom']).optional().default('30d'),
  startDate: dateField.optional(),
  endDate: dateField.optional(),
  metrics: z.array(z.string()).min(1, 'At least one metric is required').optional(),
  dimensions: z.array(z.string()).optional(),
  propertyName: optionalString(100)
}).refine(
  (data) => {
    if (data.dateRange === 'custom') {
      return data.startDate && data.endDate
    }
    return true
  },
  {
    message: 'Start date and end date are required when using custom date range',
    path: ['dateRange']
  }
)

export const analyticsFunnelSchema = z.object({
  propertyId: stringRequired('Property ID', 1, 50),
  funnelSteps: z.array(z.object({
    name: stringRequired('Step name', 1, 100),
    event: stringRequired('Event name', 1, 100),
    conditions: z.record(z.any()).optional()
  })).min(2, 'Funnel must have at least 2 steps'),
  dateRange: z.enum(['7d', '30d', '90d']).optional().default('30d')
})

export const analyticsPropertiesSchema = z.object({
  accountId: optionalString(50)
})

export const analyticsConnectSchema = z.object({
  propertyId: stringRequired('Property ID', 1, 50),
  propertyName: stringRequired('Property name', 1, 200),
  accountId: stringRequired('Account ID', 1, 50)
})

// Auth API Schemas
export const registerSchema = z.object({
  name: stringRequired('Name', 2, 100),
  email: emailField,
  password: passwordField,
  accountType: z.enum(['personal', 'tenant'], { 
    errorMap: () => ({ message: 'Account type must be either personal or tenant' })
  }),
  role: z.enum(['USER', 'TENANT_OWNER'], {
    errorMap: () => ({ message: 'Role must be either USER or TENANT_OWNER' })
  }),
  plan: z.enum(['free', 'startup', 'professional', 'enterprise']).optional(),
  // Tenant specific fields
  organizationName: optionalString(200),
  organizationSlug: z.string()
    .min(3, 'Organization URL must be at least 3 characters')
    .max(50, 'Organization URL must be no more than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Organization URL can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  industry: optionalString(100),
  teamSize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional()
}).refine(
  (data) => {
    if (data.accountType === 'tenant') {
      return data.organizationName && data.organizationSlug
    }
    return true
  },
  {
    message: 'Organization name and URL are required for tenant accounts',
    path: ['organizationName']
  }
)

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required')
})

export const resetPasswordSchema = z.object({
  email: emailField
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordField,
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
)

// Dashboard API Schemas
export const createDashboardSchema = z.object({
  name: stringRequired('Dashboard name', 1, 200),
  description: optionalString(1000),
  organizationId: uuidField.optional(),
  layout: z.object({
    cols: positiveInteger.max(24).default(12),
    rowHeight: positiveInteger.default(100),
    breakpoints: z.object({
      lg: positiveInteger.default(1200),
      md: positiveInteger.default(996),
      sm: positiveInteger.default(768),
      xs: positiveInteger.default(480),
      xxs: positiveInteger.default(0)
    }).optional()
  }).optional(),
  isDefault: z.boolean().optional().default(false),
  isPublic: z.boolean().optional().default(false),
  widgets: z.array(z.object({
    type: stringRequired('Widget type', 1, 50),
    title: stringRequired('Widget title', 1, 200),
    config: z.record(z.any()),
    position: z.object({
      x: nonNegativeInteger,
      y: nonNegativeInteger,
      w: positiveInteger,
      h: positiveInteger
    })
  })).optional()
})

export const updateDashboardSchema = createDashboardSchema.partial().extend({
  id: uuidField
})

export const duplicateDashboardSchema = z.object({
  name: stringRequired('Dashboard name', 1, 200),
  description: optionalString(1000)
})

// Billing API Schemas
export const createSubscriptionSchema = z.object({
  priceId: stringRequired('Price ID', 1, 100),
  organizationId: uuidField.optional(),
  successUrl: z.string().url('Invalid success URL').optional(),
  cancelUrl: z.string().url('Invalid cancel URL').optional()
})

export const updateSubscriptionSchema = z.object({
  priceId: stringRequired('Price ID', 1, 100)
})

export const usageRecordSchema = z.object({
  subscriptionItemId: stringRequired('Subscription item ID', 1, 100),
  quantity: positiveInteger,
  action: z.enum(['increment', 'set']).optional().default('increment'),
  timestamp: z.number().int().positive().optional()
})

// Organization API Schemas
export const createOrganizationSchema = z.object({
  name: stringRequired('Organization name', 2, 200),
  slug: z.string()
    .min(3, 'Organization URL must be at least 3 characters')
    .max(50, 'Organization URL must be no more than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Organization URL can only contain lowercase letters, numbers, and hyphens'),
  description: optionalString(1000),
  industry: optionalString(100),
  teamSize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  plan: z.enum(['free', 'startup', 'professional', 'enterprise']).optional().default('free')
})

export const updateOrganizationSchema = createOrganizationSchema.partial().extend({
  id: uuidField
})

export const inviteMemberSchema = z.object({
  email: emailField,
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'], {
    errorMap: () => ({ message: 'Role must be ADMIN, MEMBER, or VIEWER' })
  }),
  organizationId: uuidField
})

// Tenant API Schemas
export const tenantFeaturesSchema = z.object({
  tenantId: uuidField.optional(),
  features: z.array(z.string()).optional()
})

// Admin API Schemas
export const adminLoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required')
})

export const createTenantSchema = z.object({
  name: stringRequired('Tenant name', 2, 200),
  slug: z.string()
    .min(3, 'Tenant slug must be at least 3 characters')
    .max(50, 'Tenant slug must be no more than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Tenant slug can only contain lowercase letters, numbers, and hyphens'),
  plan: z.enum(['free', 'startup', 'professional', 'enterprise']).default('free'),
  settings: z.object({
    features: z.array(z.string()).optional(),
    limits: z.object({
      users: z.number().int().min(-1).default(-1),
      dashboards: z.number().int().min(-1).default(-1),
      widgets: z.number().int().min(-1).default(-1)
    }).optional(),
    industry: optionalString(100),
    teamSize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional()
  }).optional()
})

// Query parameter schemas for GET requests
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional().default(10),
  sortBy: optionalString(50),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

export const organizationQuerySchema = paginationSchema.extend({
  organizationId: z.string().uuid('Invalid organization ID').optional(),
  search: optionalString(200)
})

export const dashboardQuerySchema = paginationSchema.extend({
  organizationId: z.string().uuid('Invalid organization ID').optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
  isPublic: z.enum(['true', 'false']).transform(val => val === 'true').optional()
})

// Validation helper function
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: z.ZodError['errors']
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}

// Export commonly used schemas
export const schemas = {
  // Analytics
  analyticsData: analyticsDataSchema,
  analyticsFunnel: analyticsFunnelSchema,
  analyticsProperties: analyticsPropertiesSchema,
  analyticsConnect: analyticsConnectSchema,
  
  // Auth
  register: registerSchema,
  login: loginSchema,
  resetPassword: resetPasswordSchema,
  changePassword: changePasswordSchema,
  
  // Dashboard
  createDashboard: createDashboardSchema,
  updateDashboard: updateDashboardSchema,
  duplicateDashboard: duplicateDashboardSchema,
  
  // Billing
  createSubscription: createSubscriptionSchema,
  updateSubscription: updateSubscriptionSchema,
  usageRecord: usageRecordSchema,
  
  // Organization
  createOrganization: createOrganizationSchema,
  updateOrganization: updateOrganizationSchema,
  inviteMember: inviteMemberSchema,
  
  // Tenant
  tenantFeatures: tenantFeaturesSchema,
  
  // Admin
  adminLogin: adminLoginSchema,
  createTenant: createTenantSchema,
  
  // Query params
  pagination: paginationSchema,
  organizationQuery: organizationQuerySchema,
  dashboardQuery: dashboardQuerySchema
} as const

// Simple validation test function for development
export function testValidationSchemas(): boolean {
  console.log('🧪 Testing validation schemas...')
  
  // Test analytics data schema
  try {
    schemas.analyticsData.parse({
      propertyId: 'GA123456789',
      dateRange: '30d',
      propertyName: 'My Website'
    })
    console.log('✅ Analytics data validation: PASS')
  } catch (error) {
    console.log('❌ Analytics data validation: FAIL', error)
    return false
  }

  // Test invalid analytics data
  try {
    schemas.analyticsData.parse({
      propertyId: '',
      dateRange: 'invalid'
    })
    console.log('❌ Invalid analytics data should have failed: FAIL')
    return false
  } catch (error) {
    console.log('✅ Invalid analytics data correctly rejected: PASS')
  }

  // Test registration schema
  try {
    schemas.register.parse({
      name: 'John Doe',
      email: 'JOHN.DOE@EXAMPLE.COM',
      password: 'SecurePass123!',
      accountType: 'personal',
      role: 'USER'
    })
    console.log('✅ Registration validation: PASS')
  } catch (error) {
    console.log('❌ Registration validation: FAIL', error)
    return false
  }

  // Test invalid registration
  try {
    schemas.register.parse({
      name: 'J',
      email: 'invalid-email',
      password: 'weak',
      accountType: 'personal',
      role: 'USER'
    })
    console.log('❌ Invalid registration should have failed: FAIL')
    return false
  } catch (error) {
    console.log('✅ Invalid registration correctly rejected: PASS')
  }

  // Test dashboard creation
  try {
    schemas.createDashboard.parse({
      name: 'My Dashboard',
      description: 'A test dashboard',
      isDefault: false
    })
    console.log('✅ Dashboard creation validation: PASS')
  } catch (error) {
    console.log('❌ Dashboard creation validation: FAIL', error)
    return false
  }

  console.log('🎉 All validation tests passed!')
  return true
}

export default schemas