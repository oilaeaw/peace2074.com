import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteTestUser() {
  try {
    // Delete the test user
    const deleted = await prisma.user.delete({
      where: {
        username: 'testuser'
      }
    })
    
    console.log('Deleted test user:', deleted.username)
    
    // Show remaining users
    const remaining = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true
      }
    })
    
    console.log('\nRemaining users:', remaining)
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

deleteTestUser()
