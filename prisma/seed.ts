import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminEmail = 'admin@veezet.com'
  const adminPassword = await bcrypt.hash('admin', 12)

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('Admin user created:', adminUser)

  // Create regular user
  const userEmail = 'karimoff676@gmail.com'
  const userPassword = await bcrypt.hash('Karimoff11!', 12)

  const regularUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      name: 'Regular User',
      password: userPassword,
      role: 'USER',
    },
  })

  console.log('Regular user created:', regularUser)

  // Create catalog products
  const businessCardStarter = await prisma.catalogProduct.upsert({
    where: { id: 'starter-card' },
    update: {},
    create: {
      id: 'starter-card',
      name: 'Starter Vizitkart',
      description: 'Yeni başlayanlar üçün ideal NFC vizitkart. Əsas kontakt məlumatları və sosial media linklər.',
      imageUrl: '/img/products/starter-card.jpg',
      oneTimePrice: 25.99,
      monthlyServiceFee: 0,
      yearlyServiceFee: 12.99,
      type: 'BUSINESS_CARD',
      plan: 'STARTER',
      isActive: true
    }
  })

  const businessCardPro = await prisma.catalogProduct.upsert({
    where: { id: 'pro-card' },
    update: {},
    create: {
      id: 'pro-card',
      name: 'Professional Vizitkart',
      description: 'Peşəkarlar üçün tam funksional NFC vizitkart. QR kod, çoxlu sosial media və fərdi dizayn.',
      imageUrl: '/img/products/pro-card.jpg',
      oneTimePrice: 45.99,
      monthlyServiceFee: 2.99,
      yearlyServiceFee: 29.99,
      type: 'BUSINESS_CARD',
      plan: 'PROFESSIONAL',
      isActive: true
    }
  })

  const businessCardBusiness = await prisma.catalogProduct.upsert({
    where: { id: 'business-card' },
    update: {},
    create: {
      id: 'business-card',
      name: 'Business Vizitkart',
      description: 'Şirkətlər üçün premium NFC vizitkart. Analitika, qrup idarəsi və prioritet dəstək.',
      imageUrl: '/img/products/business-card.jpg',
      oneTimePrice: 89.99,
      monthlyServiceFee: 9.99,
      yearlyServiceFee: 99.99,
      type: 'BUSINESS_CARD',
      plan: 'BUSINESS',
      isActive: true
    }
  })

  const redirectItem = await prisma.catalogProduct.upsert({
    where: { id: 'redirect-item' },
    update: {},
    create: {
      id: 'redirect-item',
      name: 'Smart Redirect Sticker',
      description: 'İstənilən səhifəyə yönləndirən NFC stiker. Menyu, website və ya sosial media üçün.',
      imageUrl: '/img/products/redirect-sticker.jpg',
      oneTimePrice: 15.99,
      monthlyServiceFee: 0,
      yearlyServiceFee: 5.99,
      type: 'REDIRECT_ITEM',
      plan: null,
      isActive: true
    }
  })

  const staticItem = await prisma.catalogProduct.upsert({
    where: { id: 'static-item' },
    update: {},
    create: {
      id: 'static-item',
      name: 'Static Info Card',
      description: 'Sabit məlumat göstərən NFC kart. Şirkət məlumatı, WiFi şifrə və ya digər məlumatlar.',
      imageUrl: '/img/products/static-card.jpg',
      oneTimePrice: 19.99,
      monthlyServiceFee: 0,
      yearlyServiceFee: 0,
      type: 'STATIC_ITEM',
      plan: null,
      isActive: true
    }
  })

  console.log('Catalog products created:', {
    businessCardStarter,
    businessCardPro,
    businessCardBusiness,
    redirectItem,
    staticItem
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
