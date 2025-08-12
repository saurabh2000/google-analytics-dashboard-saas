import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'your-secret-key')

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('Admin login attempt:', { email, passwordLength: password?.length })
    
    // Validate admin credentials
    if (email === 'saurabh2000@gmail.com' && password === 'Admin@2025!') {
      console.log('✅ Admin credentials valid')
      
      // Create JWT token
      const token = await new SignJWT({
        sub: 'admin-001',
        email: 'saurabh2000@gmail.com',
        name: 'Admin User',
        role: 'SUPER_ADMIN',
        isAdmin: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret)
      
      // Set cookie
      const cookieStore = cookies()
      cookieStore.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 // 24 hours
      })
      
      console.log('✅ Admin token created and set')
      
      return NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: 'admin-001',
          email: 'saurabh2000@gmail.com',
          name: 'Admin User',
          role: 'SUPER_ADMIN',
          isAdmin: true
        }
      })
    } else {
      console.log('❌ Invalid admin credentials')
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('💥 Admin login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}