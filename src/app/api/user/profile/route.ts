import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return the session user data
    // In a real app, you'd fetch from database
    const user = {
      id: session.user.email, // Use email as ID for now
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: 'USER',
      tenantId: null,
      tenant: null,
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      settings: {
        timezone: 'UTC',
        locale: 'en',
        notifications: {
          email: true,
          inApp: true,
          reports: true
        }
      }
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    
    // For now, just return success
    // In a real app, you'd update the database
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}