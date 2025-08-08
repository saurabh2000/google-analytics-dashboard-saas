import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      hasSession: !!session,
      hasUser: !!session?.user,
      hasAccessToken: !!session?.accessToken,
      hasRefreshToken: !!session?.refreshToken,
      user: session?.user ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      } : null,
      tokenInfo: session?.accessToken ? {
        hasAccessToken: true,
        tokenLength: (session.accessToken as string).length
      } : null
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get session',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}