import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  return withAdminAuth(request, async (_req: AuthenticatedRequest) => {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { productId } = await params;

        if (!productId) {
          return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // First, get the product to check its status
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            catalogProduct: true,
            subscriptions: {
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            owner: true
          }
        });

        if (!product) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check if product is in PENDING_ACTIVATION status
        if (product.status !== 'PENDING_ACTIVATION') {
          return NextResponse.json(
            { error: `Product is already ${product.status.toLowerCase()}` },
            { status: 400 }
          );
        }

        // Get the latest subscription for this product
        const subscription = product.subscriptions[0];
        if (!subscription) {
          return NextResponse.json({ error: 'No subscription found for this product' }, { status: 400 });
        }

        // Use transaction to ensure data consistency with timeout
        const result = await prisma.$transaction(async (tx: any) => {
        // Calculate subscription period dates
        const now = new Date();
        const currentPeriodStart = now;
        let currentPeriodEnd: Date;

        if (subscription.billingCycle === 'MONTHLY') {
          currentPeriodEnd = new Date(now);
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        } else {
          currentPeriodEnd = new Date(now);
          currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        }

        // Update subscription with active status and period dates
        await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            currentPeriodStart,
            currentPeriodEnd
          }
        });

        // Create product-specific data based on product type
        const productSpecificUpdate: any = {};

        if (product.type === 'BUSINESS_CARD') {
          // Create a business card profile if it doesn't exist
          if (!product.businessCardProfileId) {
            // Generate a unique slug based on owner's name or email
            const baseSlug = product.owner.name 
              ? product.owner.name.toLowerCase().replace(/[^a-z0-9]/g, '')
              : product.owner.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            
            let slug = baseSlug;
            let counter = 1;
            
            // Ensure slug is unique
            while (await tx.businessCardProfile.findUnique({ where: { slug } })) {
              slug = `${baseSlug}${counter}`;
              counter++;
            }

            const businessCardProfile = await tx.businessCardProfile.create({
              data: {
                slug,
                plan: product.catalogProduct.plan || 'STARTER',
                fullName: product.owner.name || 'My Business Card'
              }
            });

            productSpecificUpdate.businessCardProfileId = businessCardProfile.id;
          }        } else if (product.type === 'REDIRECT_ITEM') {
        // Create a redirect item if it doesn't exist
        if (!product.redirectItemId) {
          const redirectItem = await tx.redirectItem.create({
            data: {
              targetUrl: 'https://example.com' // Default URL, user can change later
            }
          });

          productSpecificUpdate.redirectItemId = redirectItem.id;
        }        } else if (product.type === 'STATIC_ITEM') {
        // Create a static item if it doesn't exist
        if (!product.staticItemId) {
          const staticItem = await tx.staticItem.create({
            data: {
              description: 'Static NFC Item' // Default description, user can change later
            }
          });

          productSpecificUpdate.staticItemId = staticItem.id;
        }
      }        // Update product status to ACTIVE and link product-specific data
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: {
            status: 'ACTIVE',
            ...productSpecificUpdate
          },
        include: {
          catalogProduct: true,
          subscriptions: true,
          businessCardProfile: true,
          redirectItem: true,
          staticItem: true,
          owner: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      return updatedProduct;
    }, {
      timeout: 10000, // 10 second timeout
      maxWait: 5000,  // 5 second max wait
    });

        return NextResponse.json({
          message: 'Product activated successfully',
          product: result
        });

      } catch (error) {
        console.error(`Activation attempt ${attempt} failed:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // If it's a transaction error and we have retries left, try again
        if (attempt < maxRetries && (
          lastError.message.includes('Transaction') || 
          lastError.message.includes('transaction') ||
          lastError.message.includes('connection')
        )) {
          console.log(`Retrying activation in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // Exponential backoff
          continue;
        }
        
        // If it's not a retryable error, return immediately
        if (lastError.message.includes('Product not found') || 
            lastError.message.includes('already') ||
            lastError.message.includes('No subscription found')) {
          return NextResponse.json(
            { error: lastError.message },
            { status: 400 }
          );
        }
        
        // If we've exhausted retries, break out
        if (attempt === maxRetries) {
          break;
        }
      }
    }

    // If we get here, all retries failed
    console.error('All activation attempts failed:', lastError);
    return NextResponse.json(
      { error: lastError?.message || 'Internal server error' },
      { status: 500 }
    );
  });
}
