const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    // Create or update the test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Test User',
        isActive: true,
        emailVerified: new Date()
      },
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Test user created/updated successfully!')
    console.log('📧 Email: test@example.com')
    console.log('🔑 Password: password123')
    console.log('👤 User ID:', user.id)
    
  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()