import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user in the database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenant: true }
    })

    // Create user if doesn't exist (for Google OAuth users)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image,
          role: 'USER',
          isActive: true
        },
        include: { tenant: true }
      })
    }

    // Get user's tenant (organization equivalent)
    const organizations = user.tenant ? [
      {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        logo: user.tenant.logo,
        role: user.role === 'TENANT_OWNER' ? 'owner' : 'member'
      }
    ] : []

    return NextResponse.json({ 
      organizations,
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await req.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    // Find user in the database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    // Create user if doesn't exist (for Google OAuth users)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image,
          role: 'USER',
          isActive: true
        }
      })
    }

    // Check if user already has a tenant
    if (user.tenantId) {
      return NextResponse.json({ 
        error: 'User already belongs to an organization' 
      }, { status: 400 })
    }

    // Generate unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    let slug = baseSlug
    let counter = 1
    
    // Check if slug already exists
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    // Create tenant and update user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          settings: {}
        }
      })

      // Update user to be owner of this tenant
      await tx.user.update({
        where: { id: user.id },
        data: { 
          tenantId: tenant.id,
          role: 'TENANT_OWNER'
        }
      })

      return tenant
    })

    return NextResponse.json({ 
      organization: {
        id: result.id,
        name: result.name,
        slug: result.slug,
        role: 'owner'
      }
    })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}