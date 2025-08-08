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

    // Get user's dashboards
    const userDashboards = await prisma.dashboard.findMany({
      where: { userId: user.id },
      include: {
        widgets: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ dashboards: userDashboards })
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