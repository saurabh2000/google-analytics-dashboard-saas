const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updateDemoUserPassword() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('demo123', 12)
    
    // Update the demo user with a password
    const user = await prisma.user.update({
      where: { email: 'demo@example.com' },
      data: {
        password: hashedPassword,
        isActive: true,
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Demo user password updated successfully!')
    console.log('📧 Email: demo@example.com')
    console.log('🔑 Password: demo123')
    console.log('👤 User:', user.name)
    
  } catch (error) {
    console.error('❌ Error updating demo user:', error)
    console.log('\n🔍 Attempting to create new test user instead...')
    
    // If demo user doesn't exist, create a new test user
    try {
      const hashedPassword = await bcrypt.hash('test123', 12)
      const newUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: hashedPassword,
          role: 'USER',
          isActive: true,
          emailVerified: new Date()
        }
      })
      
      console.log('✅ Test user created successfully!')
      console.log('📧 Email: test@example.com')
      console.log('🔑 Password: test123')
      console.log('👤 User:', newUser.name)
    } catch (createError) {
      console.error('❌ Error creating test user:', createError)
    }
  } finally {
    await prisma.$disconnect()
  }
}

updateDemoUserPassword()