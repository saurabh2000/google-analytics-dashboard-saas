import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sourceDashboard = await prisma.dashboard.findUnique({
      where: { id: params.id },
      include: {
        widgets: true,
        user: true
      }
    })
    
    if (!sourceDashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    // Check permissions
    if (sourceDashboard.user.email !== session.user.email && !sourceDashboard.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description } = body

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

    // Create duplicate dashboard
    const duplicatedDashboard = await prisma.dashboard.create({
      data: {
        userId: user.id,
        name: name || `${sourceDashboard.name} (Copy)`,
        description: description || sourceDashboard.description,
        layout: sourceDashboard.layout,
        settings: sourceDashboard.settings,
        isDefault: false,
        isPublic: false,
        shareToken: null,
        widgets: {
          create: sourceDashboard.widgets.map(widget => ({
            type: widget.type,
            title: widget.title,
            configuration: widget.configuration,
            position: widget.position,
            size: widget.size,
            dataSource: widget.dataSource,
            refreshRate: widget.refreshRate,
            isVisible: widget.isVisible,
          }))
        }
      },
      include: {
        widgets: true
      }
    })

    return NextResponse.json({ dashboard: duplicatedDashboard }, { status: 201 })
  } catch (error) {
    console.error('Error duplicating dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}