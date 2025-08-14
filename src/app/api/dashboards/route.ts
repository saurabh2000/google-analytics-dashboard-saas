import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { withErrorHandler, ValidationError, AuthenticationError } from '@/lib/error-handler'
import { schemas } from '@/lib/validation-schemas'
import { logger, sanitizeForLog } from '@/lib/logger'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new AuthenticationError('Unauthorized')
  }
  
  // Get and validate query params
  const { searchParams } = new URL(req.url)
  const queryData = {
    organizationId: searchParams.get('organizationId'),
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    sortBy: searchParams.get('sortBy'),
    sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc'
  }
  
  const validation = schemas.dashboardQuery.safeParse(queryData)
  if (!validation.success) {
    throw new ValidationError('Invalid query parameters', validation.error.issues)
  }
  
  const { organizationId } = validation.data
  
  if (!organizationId) {
    throw new ValidationError('Organization ID is required')
  }

  // Get user from database
  let user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  // Create user if not exists
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      }
    })
    logger.info('Created new user', sanitizeForLog({ userId: user.id, email: user.email }))
  }

    // Verify user has access to this organization
    const { Client } = await import('pg')
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'analytics_db',
      user: process.env.DB_USER || 'saurabkshaah',
    })

    await client.connect()
    
    const memberCheck = await client.query(`
      SELECT role FROM "OrganizationMember" 
      WHERE "userId" = $1 AND "organizationId" = $2
    `, [user.id, organizationId])
    
    if (memberCheck.rows.length === 0) {
      await client.end()
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get organization's dashboards
    const dashboards = await client.query(`
      SELECT d.*, 
        COUNT(w.id) as widget_count
      FROM "Dashboard" d
      LEFT JOIN "Widget" w ON d.id = w."dashboardId"
      WHERE d."organizationId" = $1
      GROUP BY d.id
      ORDER BY d."updatedAt" DESC
    `, [organizationId])

    await client.end()

    logger.info('Dashboards fetched successfully', sanitizeForLog({ 
      organizationId, 
      dashboardCount: dashboards.rows.length,
      userId: user.id 
    }))

    return NextResponse.json({ 
      dashboards: dashboards.rows,
      userRole: memberCheck.rows[0].role 
    })
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new AuthenticationError('Unauthorized')
  }

  const body = await req.json()
  
  // Validate request body
  const validation = schemas.createDashboard.safeParse(body)
  if (!validation.success) {
    throw new ValidationError('Invalid dashboard data', validation.error.issues)
  }
  
  const { name, description, layout, widgets, isDefault, organizationId } = validation.data

  // Get or create user
  let user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      }
    })
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.dashboard.updateMany({
      where: { 
        userId: user.id,
        isDefault: true 
      },
      data: { isDefault: false }
    })
  }

  const dashboard = await prisma.dashboard.create({
    data: {
      userId: user.id,
      organizationId,
      name,
      description: description || '',
      layout: layout || { cols: 12, rowHeight: 100, breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } },
      settings: {},
      isDefault: isDefault || false,
      isPublic: false,
      shareToken: null,
    },
    include: {
      widgets: true
    }
  })

  logger.info('Dashboard created successfully', sanitizeForLog({
    dashboardId: dashboard.id,
    name: dashboard.name,
    userId: user.id
  }))

  return NextResponse.json({ dashboard }, { status: 201 })
})