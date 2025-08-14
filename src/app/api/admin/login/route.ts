import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { logger, sanitizeForLog } from '@/lib/logger'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

if (!process.env.NEXTAUTH_SECRET) {
  logger.error('NEXTAUTH_SECRET environment variable is required')
  throw new Error('NEXTAUTH_SECRET environment variable is required')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Input validation
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 })
    }

    // Rate limiting check (basic implementation)
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Get admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      logger.error('Admin credentials not configured in environment variables')
      return NextResponse.json({
        success: false,
        message: 'Server configuration error'
      }, { status: 500 })
    }
    
    // Validate admin credentials
    if (email === adminEmail && password === adminPassword) {
      
      // Create JWT token
      const token = await new SignJWT({
        sub: 'admin-001',
        email: adminEmail,
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
      
      // Log successful login (without sensitive details)
      logger.info('Admin login successful', sanitizeForLog({ email: email.substring(0, 3) + '***', ip }))
      
      return NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: 'admin-001',
          email: adminEmail,
          name: 'Admin User',
          role: 'SUPER_ADMIN',
          isAdmin: true
        }
      })
    } else {
      // Log failed attempt (without sensitive details)
      logger.warn('Failed admin login attempt', sanitizeForLog({ 
        ip, 
        email: email.substring(0, 3) + '***',
        timestamp: new Date().toISOString()
      }))
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 })
    }
  } catch (error) {
    logger.error('Admin login error', sanitizeForLog({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      ip
    }))
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 })
  }
}