import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Fetch all tenants with user count
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: { users: true }
        },
        users: {
          select: {
            id: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    const tenantsWithUserCount = tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,
      logo: tenant.logo,
      isActive: tenant.isActive,
      userCount: tenant._count.users,
      createdAt: tenant.createdAt,
      settings: tenant.settings as any
    }))
    
    return NextResponse.json({ tenants: tenantsWithUserCount })
    
  } catch (error) {
    console.error('Failed to fetch tenants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const { name, slug, domain, settings } = await request.json()
    
    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }
    
    // Check if slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug }
    })
    
    if (existingTenant) {
      return NextResponse.json(
        { error: 'Tenant with this slug already exists' },
        { status: 400 }
      )
    }
    
    // Create new tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        domain,
        settings: settings || {
          features: ['dashboard', 'reports', 'analytics'],
          limits: {
            users: 5,
            dashboards: 10,
            widgets: 50
          }
        }
      }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'TENANT_CREATED',
        resource: 'Tenant',
        resourceId: tenant.id,
        metadata: { tenantName: tenant.name, tenantSlug: tenant.slug },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent')
      }
    })
    
    return NextResponse.json({ tenant })
    
  } catch (error) {
    console.error('Failed to create tenant:', error)
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    )
  }
}