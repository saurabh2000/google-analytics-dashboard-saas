import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'your-secret-key')

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No admin token found'
      }, { status: 401 })
    }
    
    const { payload } = await jwtVerify(token, secret)
    
    if (payload.isAdmin && payload.role === 'SUPER_ADMIN') {
      return NextResponse.json({
        success: true,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          isAdmin: payload.isAdmin
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid admin token'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Admin token verification error:', error)
    return NextResponse.json({
      success: false,
      message: 'Token verification failed'
    }, { status: 401 })
  }
}