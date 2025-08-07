import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Store the selected property ID in your database
    // 2. Validate that the user has access to this property
    // 3. Set up any necessary data fetching schedules

    // For demo purposes, we'll just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Google Analytics connected successfully',
      propertyId,
      propertyName: propertyId.includes('123456789') ? 'My Website' : 'E-commerce Site'
    })
  } catch (error) {
    console.error('Error connecting GA property:', error)
    return NextResponse.json(
      { error: 'Failed to connect property' }, 
      { status: 500 }
    )
  }
}