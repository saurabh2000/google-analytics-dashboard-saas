import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use raw query to ensure trigger works
    const { Client } = require('pg')
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'analytics_db',
      user: process.env.DB_USER || 'saurabkshaah',
    })

    await client.connect()

    // Get user from database, create if doesn't exist
    let userResult = await client.query('SELECT * FROM "User" WHERE email = $1', [session.user.email])
    let user = userResult.rows[0]

    if (!user) {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await client.query(
        'INSERT INTO "User" (id, email, name, image, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
        [userId, session.user.email, session.user.name, session.user.image]
      )
      userResult = await client.query('SELECT * FROM "User" WHERE id = $1', [userId])
      user = userResult.rows[0]
    }

    // Get user's organizations

    const result = await client.query(`
      SELECT 
        o.id,
        o.name,
        o.slug,
        o.logo,
        om.role
      FROM "Organization" o
      INNER JOIN "OrganizationMember" om ON o.id = om."organizationId"
      WHERE om."userId" = $1
      ORDER BY o."createdAt" ASC
    `, [user.id])

    await client.end()

    return NextResponse.json({ 
      organizations: result.rows,
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

    // Get user, create if doesn't exist using raw query
    const { Client } = require('pg')
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'analytics_db',
      user: process.env.DB_USER || 'saurabkshaah',
    })

    await client.connect()

    let userResult = await client.query('SELECT * FROM "User" WHERE email = $1', [session.user.email])
    let user = userResult.rows[0]

    if (!user) {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await client.query(
        'INSERT INTO "User" (id, email, name, image, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
        [userId, session.user.email, session.user.name, session.user.image]
      )
      userResult = await client.query('SELECT * FROM "User" WHERE id = $1', [userId])
      user = userResult.rows[0]
    }

    // Create organization

    // Generate unique slug
    let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    let slug = baseSlug
    let counter = 1
    
    // Check if slug already exists
    let slugExists = true
    while (slugExists) {
      const checkSlug = await client.query(
        'SELECT id FROM "Organization" WHERE slug = $1',
        [slug]
      )
      if (checkSlug.rows.length === 0) {
        slugExists = false
      } else {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }
    
    const orgId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await client.query('BEGIN')
    
    // Create organization
    await client.query(`
      INSERT INTO "Organization" (id, name, slug, settings, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `, [orgId, name, slug, JSON.stringify({})])

    // Add user as owner
    await client.query(`
      INSERT INTO "OrganizationMember" (id, "organizationId", "userId", role, "joinedAt")
      VALUES ($1, $2, $3, 'owner', NOW())
    `, [memberId, orgId, user.id])

    await client.query('COMMIT')
    await client.end()

    return NextResponse.json({ 
      organization: {
        id: orgId,
        name,
        slug,
        role: 'owner'
      }
    })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}