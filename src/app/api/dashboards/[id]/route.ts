import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: {
        widgets: true,
        user: true
      }
    })
    
    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    // Check permissions
    if (dashboard.user.email !== session.user.email && !dashboard.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ dashboard })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: { user: true }
    })
    
    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    // Check permissions
    if (dashboard.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, layout, widgets, isDefault } = body

    // If setting as default, unset other defaults
    if (isDefault && !dashboard.isDefault) {
      await prisma.dashboard.updateMany({
        where: { 
          userId: dashboard.userId,
          isDefault: true,
          NOT: { id }
        },
        data: { isDefault: false }
      })
    }

    const updatedDashboard = await prisma.dashboard.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(layout && { layout }),
        ...(isDefault !== undefined && { isDefault }),
      },
      include: {
        widgets: true
      }
    })

    return NextResponse.json({ dashboard: updatedDashboard })
  } catch (error) {
    console.error('Error updating dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: { user: true }
    })
    
    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    // Check permissions
    if (dashboard.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete dashboard and associated widgets (CASCADE)
    await prisma.dashboard.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Dashboard deleted successfully' })
  } catch (error) {
    console.error('Error deleting dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}