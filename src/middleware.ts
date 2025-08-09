import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/error',
    '/auth/verify-request',
    '/api/auth'
  ]
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/auth/')
  )
  
  // Skip authentication for public routes and static files
  if (isPublicRoute || pathname.includes('_next') || pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // Get the token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // Redirect to signin if not authenticated
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signInUrl)
  }
  
  // Redirect old routes to organization-based routes
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return NextResponse.redirect(new URL('/org', request.url))
  }
  
  // Admin routes require admin role
  if (pathname.startsWith('/admin')) {
    // For now, we'll check if the user email matches admin emails
    // In production, this should check user roles from database
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
    const userEmail = (token.email as string)?.toLowerCase()
    
    console.log('Admin check:', {
      pathname,
      userEmail,
      adminEmails,
      hasAccess: adminEmails.includes(userEmail)
    })
    
    if (!adminEmails.includes(userEmail)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  // Tenant-based routing
  // Extract tenant from subdomain or path
  const host = request.headers.get('host') || ''
  const subdomain = host.split('.')[0]
  
  // If using subdomain-based multi-tenancy
  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost:3000') {
    // Add tenant info to headers for use in the app
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant-id', subdomain)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  // For path-based multi-tenancy (e.g., /tenant/[tenantId]/dashboard)
  // This would be handled by the routing system
  
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}