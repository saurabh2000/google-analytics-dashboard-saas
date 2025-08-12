import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('Testing admin login:', { email, passwordLength: password?.length })
    
    // Test the exact credentials
    if (email === 'saurabh2000@gmail.com' && password === 'Admin@2025!') {
      return NextResponse.json({
        success: true,
        message: 'Admin credentials are correct!',
        user: {
          id: 'admin-001',
          email: 'saurabh2000@gmail.com',
          name: 'Admin User',
          role: 'SUPER_ADMIN'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
        received: { email, passwordMatch: password === 'Admin@2025!' }
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}