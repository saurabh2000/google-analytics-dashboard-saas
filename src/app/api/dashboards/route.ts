import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get organization ID from query params
    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
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
    }

    // Verify user has access to this organization
    const { Client } = require('pg')
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

    return NextResponse.json({ 
      dashboards: dashboards.rows,
      userRole: memberCheck.rows[0].role 
    })
  } catch (error) {
    console.error('Error fetching dashboards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, layout, widgets, isDefault } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

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

    return NextResponse.json({ dashboard }, { status: 201 })
  } catch (error) {
    console.error('Error creating dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}