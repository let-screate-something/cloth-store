import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Define categories
  const categories = [
    { name: 'Men', description: 'Clothing for Men' },
    { name: 'Women', description: 'Clothing for Women' },
    { name: 'Kids', description: 'Clothing for Kids' },
  ]

  console.log('Start seeding...')
  
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: {
        name: category.name,
        description: category.description,
      },
    })
    console.log(`Created/Updated category: ${createdCategory.name}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
