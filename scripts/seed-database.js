const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample data...');

    // Create sample users
    const users = await Promise.all([
      prisma.user.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'USER'
        }
      }),
      prisma.user.create({
        data: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'USER'
        }
      }),
      prisma.user.create({
        data: {
          name: 'Mike Johnson',
          email: 'mike@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'USER'
        }
      })
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create sample catalog products
    const catalogProducts = await Promise.all([
      prisma.catalogProduct.create({
        data: {
          name: 'Basic Business Card',
          description: 'A simple digital business card',
          oneTimePrice: 9.99,
          monthlyServiceFee: 2.99,
          type: 'BUSINESS_CARD',
          plan: 'STARTER',
          isActive: true
        }
      }),
      prisma.catalogProduct.create({
        data: {
          name: 'Professional Business Card',
          description: 'A professional digital business card with advanced features',
          oneTimePrice: 19.99,
          monthlyServiceFee: 4.99,
          type: 'BUSINESS_CARD',
          plan: 'PROFESSIONAL',
          isActive: true
        }
      }),
      prisma.catalogProduct.create({
        data: {
          name: 'Business Business Card',
          description: 'A premium business card for enterprises',
          oneTimePrice: 49.99,
          monthlyServiceFee: 9.99,
          type: 'BUSINESS_CARD',
          plan: 'BUSINESS',
          isActive: true
        }
      })
    ]);

    console.log(`✅ Created ${catalogProducts.length} catalog products`);

    // Create sample business card profiles
    const profiles = await Promise.all([
      prisma.businessCardProfile.create({
        data: {
          slug: 'john-doe',
          plan: 'STARTER',
          fullName: 'John Doe',
          title: 'Software Engineer',
          views: 125,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20')
        }
      }),
      prisma.businessCardProfile.create({
        data: {
          slug: 'jane-smith',
          plan: 'PROFESSIONAL',
          fullName: 'Jane Smith',
          title: 'Marketing Manager',
          views: 89,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-25')
        }
      }),
      prisma.businessCardProfile.create({
        data: {
          slug: 'mike-johnson',
          plan: 'BUSINESS',
          fullName: 'Mike Johnson',
          title: 'CEO',
          views: 234,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-30')
        }
      })
    ]);

    console.log(`✅ Created ${profiles.length} business card profiles`);

    // Create sample products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'John\'s Business Card',
          type: 'BUSINESS_CARD',
          status: 'ACTIVE',
          ownerId: users[0].id,
          catalogProductId: catalogProducts[0].id,
          businessCardProfileId: profiles[0].id,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20')
        }
      }),
      prisma.product.create({
        data: {
          name: 'Jane\'s Business Card',
          type: 'BUSINESS_CARD',
          status: 'ACTIVE',
          ownerId: users[1].id,
          catalogProductId: catalogProducts[1].id,
          businessCardProfileId: profiles[1].id,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-25')
        }
      }),
      prisma.product.create({
        data: {
          name: 'Mike\'s Business Card',
          type: 'BUSINESS_CARD',
          status: 'PENDING_ACTIVATION',
          ownerId: users[2].id,
          catalogProductId: catalogProducts[2].id,
          businessCardProfileId: profiles[2].id,
          createdAt: new Date('2024-01-25'),
          updatedAt: new Date('2024-01-30')
        }
      })
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Create sample subscriptions
    const subscriptions = await Promise.all([
      prisma.subscription.create({
        data: {
          status: 'ACTIVE',
          plan: 'STARTER',
          price: 2.99,
          billingCycle: 'MONTHLY',
          currentPeriodStart: new Date('2024-01-15'),
          currentPeriodEnd: new Date('2024-02-15'),
          paymentGatewaySubscriptionId: 'stripe_sub_1',
          productId: products[0].id,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20')
        }
      }),
      prisma.subscription.create({
        data: {
          status: 'ACTIVE',
          plan: 'PROFESSIONAL',
          price: 4.99,
          billingCycle: 'MONTHLY',
          currentPeriodStart: new Date('2024-01-20'),
          currentPeriodEnd: new Date('2024-02-20'),
          paymentGatewaySubscriptionId: 'stripe_sub_2',
          productId: products[1].id,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-25')
        }
      })
    ]);

    console.log(`✅ Created ${subscriptions.length} subscriptions`);

    // Create sample payments
    const payments = await Promise.all([
      prisma.payment.create({
        data: {
          amount: 9.99,
          currency: 'USD',
          status: 'SUCCESSFUL',
          paymentGatewayTransactionId: 'stripe_pi_1',
          subscriptionId: subscriptions[0].id,
          createdAt: new Date('2024-01-15')
        }
      }),
      prisma.payment.create({
        data: {
          amount: 2.99,
          currency: 'USD',
          status: 'SUCCESSFUL',
          paymentGatewayTransactionId: 'stripe_pi_2',
          subscriptionId: subscriptions[0].id,
          createdAt: new Date('2024-01-15')
        }
      }),
      prisma.payment.create({
        data: {
          amount: 19.99,
          currency: 'USD',
          status: 'SUCCESSFUL',
          paymentGatewayTransactionId: 'stripe_pi_3',
          subscriptionId: subscriptions[1].id,
          createdAt: new Date('2024-01-20')
        }
      }),
      prisma.payment.create({
        data: {
          amount: 4.99,
          currency: 'USD',
          status: 'SUCCESSFUL',
          paymentGatewayTransactionId: 'stripe_pi_4',
          subscriptionId: subscriptions[1].id,
          createdAt: new Date('2024-01-20')
        }
      })
    ]);

    console.log(`✅ Created ${payments.length} payments`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Database now contains:');
    console.log(`   - ${users.length} users`);
    console.log(`   - ${catalogProducts.length} catalog products`);
    console.log(`   - ${profiles.length} business card profiles`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${subscriptions.length} subscriptions`);
    console.log(`   - ${payments.length} payments`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
