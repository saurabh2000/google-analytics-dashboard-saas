import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  accountType: z.enum(['personal', 'tenant']),
  role: z.enum(['USER', 'TENANT_OWNER']),
  plan: z.string().optional(),
  // Tenant specific fields
  organizationName: z.string().optional(),
  organizationSlug: z.string().optional(),
  industry: z.string().optional(),
  teamSize: z.string().optional()
})

// In-memory storage for demo (would be database in production)
const mockUsers: any[] = []
const mockTenants: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Registration request body:', JSON.stringify(body, null, 2))
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    console.log('✅ Validation passed')
    
    // Check if user already exists (mock)
    const existingUser = mockUsers.find(user => user.email === validatedData.email)
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    let tenant = null
    let userRole = validatedData.role
    let tenantId = null
    
    // Handle tenant creation for tenant owners
    if (validatedData.accountType === 'tenant' && validatedData.organizationName) {
      // Validate tenant-specific fields
      if (!validatedData.organizationSlug) {
        return NextResponse.json(
          { error: 'Organization slug is required' },
          { status: 400 }
        )
      }
      
      // Check if tenant slug already exists (mock)
      const existingTenant = mockTenants.find(t => t.slug === validatedData.organizationSlug)
      
      if (existingTenant) {
        return NextResponse.json(
          { error: 'Organization URL is already taken' },
          { status: 400 }
        )
      }
      
      // Determine plan limits
      const planLimits = {
        free: { users: 1, dashboards: 1, widgets: 10 },
        startup: { users: 5, dashboards: 10, widgets: 50 },
        professional: { users: 20, dashboards: -1, widgets: -1 },
        enterprise: { users: -1, dashboards: -1, widgets: -1 }
      }
      
      const limits = planLimits[validatedData.plan as keyof typeof planLimits] || planLimits.free
      
      // Create tenant (mock)
      tenant = {
        id: `tenant-${mockTenants.length + 1}`,
        name: validatedData.organizationName,
        slug: validatedData.organizationSlug,
        plan: validatedData.plan || 'free',
        settings: {
          features: ['dashboard', 'reports', 'analytics'],
          limits,
          industry: validatedData.industry,
          teamSize: validatedData.teamSize
        },
        createdAt: new Date()
      }
      
      mockTenants.push(tenant)
      tenantId = tenant.id
      userRole = 'TENANT_OWNER'
    } else if (validatedData.accountType === 'personal') {
      // For personal accounts, they'll need to be invited to a tenant later
      userRole = 'USER'
    }
    
    // Create user (mock)
    const user = {
      id: `user-${mockUsers.length + 1}`,
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: userRole,
      tenantId: tenantId,
      isActive: true,
      createdAt: new Date()
    }
    
    mockUsers.push(user)
    
    console.log('✅ Mock registration successful:', {
      user: { id: user.id, email: user.email, role: user.role },
      tenant: tenant ? { id: tenant.id, name: tenant.name, slug: tenant.slug } : null
    })
    
    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tenant: tenant ? {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug
      } : null
    })
    
  } catch (error) {
    console.error('💥 Registration error:', error)
    
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Registration failed. Please try again.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}