import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define role hierarchy
const roleHierarchy = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  TENANT_OWNER: 2,
  USER: 1
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware entirely for static files and Next.js internals
  if (pathname.includes('_next') || pathname.includes('.') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/register',
    '/auth/error',
    '/auth/verify-request',
    '/auth/verify-email',
    '/auth/resend-verification',
    '/auth/reset-password',
    '/unauthorized'
  ]
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/auth/')
  
  // All admin routes use direct JWT authentication (bypass NextAuth completely)
  const isAdminRoute = pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')
  
  // Skip authentication for public routes and admin routes
  if (isPublicRoute || isAdminRoute) {
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
  
  // Role-based dashboard routing
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const userRole = (token as any).role
    const userEmail = (token as any).email
    
    console.log('🔍 Middleware - Dashboard access check:', {
      pathname,
      userRole,
      userEmail,
      tokenKeys: Object.keys(token)
    })
    
    // Check if user is explicitly in ADMIN_EMAILS environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
    const isExplicitAdmin = userEmail && adminEmails.includes(userEmail)
    
    // Only redirect to admin dashboard if user is explicitly listed as admin
    if (isExplicitAdmin && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN')) {
      console.log('🔀 Middleware - Redirecting explicit admin to admin dashboard')
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    
    // Tenant owners go to their tenant dashboard
    if (userRole === 'TENANT_OWNER' && (token as any).tenantId) {
      console.log('🔀 Middleware - Redirecting tenant owner to tenant dashboard')
      // In production, we'd fetch the tenant slug from the database
      // For now, redirect to a generic tenant route
      return NextResponse.redirect(new URL('/tenant/dashboard', request.url))
    }
    
    // All other users (including those with SUPER_ADMIN role but not in ADMIN_EMAILS) go to user dashboard
    console.log('✅ Middleware - Allowing user access to dashboard')
    return NextResponse.next()
  }
  
  // Admin routes handle their own authentication, skip NextAuth checks
  // This is already handled by the admin route bypass above, but kept for clarity
  
  // Tenant-specific routes require tenant membership
  if (pathname.startsWith('/tenant/')) {
    const tenantSlug = pathname.split('/')[2]
    const userTenantId = (token as any).tenantId
    
    // TODO: In production, verify tenant slug matches user's tenant
    if (!userTenantId && tenantSlug !== 'default') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  // Check if user account is active
  if ((token as any).isActive === false) {
    return NextResponse.redirect(new URL('/auth/account-suspended', request.url))
  }
  
  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', token.sub || '')
  requestHeaders.set('x-user-role', (token as any).role || 'USER')
  requestHeaders.set('x-tenant-id', (token as any).tenantId || '')
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  
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