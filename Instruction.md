# **Veezet 2.0 \- Project README & Development Plan**

This document serves as the master README.md and the single source of truth for the development of the Veezet 2.0 platform. It contains the complete architectural blueprint, database design, and a step-by-step development roadmap.

## **1\. Project Overview**

Veezet 2.0 is a modern, multi-product, subscription-based NFC platform. The core business logic revolves around these key principles:

* **Hybrid Model (Product \+ Service):** Users pay a **one-time price** to purchase the physical NFC product. Afterwards, a recurring **monthly or yearly service fee** is required to keep the digital profile/service active.  
* **Multi-Product Architecture:** The platform supports three distinct product types: BUSINESS\_CARD (a fully editable profile page), REDIRECT\_ITEM (an NFC product redirecting to a URL), and STATIC\_ITEM (an NFC product with static information).  
* **Customer-Centric Subscription Model:** The recurring service fee subscription begins only when the physical product is delivered and activated by an administrator, not at the time of payment.  
* **Centralized User Dashboard:** A single registered User (identified by email) can own and manage multiple products from one central account.

## **2\. Technology Stack**

* **Framework:** Next.js (with React)  
* **Language:** TypeScript  
* **Database ORM:** Prisma  
* **Database:** PostgreSQL (Hosted on a production-ready provider like Neon or Azure)  
* **File Storage (Images):** Azure Blob Storage  
* **Deployment (Application):** Vercel

## **3\. Complete Database Architecture (Prisma Schema)**

This is the definitive schema for the project. All data interactions must conform to these models.

// \==========================================  
// Generator and Datasource  
// \==========================================  
generator client {  
  provider \= "prisma-client-js"  
}

datasource db {  
  provider \= "postgresql"  
  url      \= env("DATABASE\_URL")  
}

// \==========================================  
// Marketplace and Admin Models  
// \==========================================  
model CatalogProduct {  
  id                 String  @id @default(cuid())  
  name               String  
  description        String  
  imageUrl           String?  
  oneTimePrice       Float   // The initial price to buy the physical product.  
  monthlyServiceFee  Float?  // The recurring monthly service fee.  
  yearlyServiceFee   Float?  // The recurring yearly service fee.  
  type               ProductType  
  plan               BusinessCardPlan? // Only relevant for BUSINESS\_CARD type  
  isActive           Boolean @default(true)

  ownedProducts Product\[\]  
}

// \==========================================  
// Core User Models: User, Product  
// \==========================================  
model User {  
  id        String    @id @default(cuid())  
  email     String    @unique  
  password  String  
  name      String?  
  createdAt DateTime  @default(now())  
  updatedAt DateTime  @updatedAt

  products  Product\[\]  
}

model Product {  
  id                    String        @id @default(cuid())  
  name                  String  
  type                  ProductType  
  status                ProductStatus @default(PENDING\_ACTIVATION)  
  createdAt             DateTime      @default(now())  
  updatedAt             DateTime      @updatedAt  
    
  ownerId               String  
  owner                 User          @relation(fields: \[ownerId\], references: \[id\])

  catalogProductId      String  
  catalogProduct        CatalogProduct @relation(fields: \[catalogProductId\], references: \[id\])

  businessCardProfile   BusinessCardProfile? @relation(fields: \[businessCardProfileId\], references: \[id\])  
  businessCardProfileId String?              @unique  
  redirectItem          RedirectItem?        @relation(fields: \[redirectItemId\], references: \[id\])  
  redirectItemId        String?              @unique  
  staticItem            StaticItem?          @relation(fields: \[staticItemId\], references: \[id\])  
  staticItemId          String?              @unique  
    
  subscriptions         Subscription\[\]  
}

// \==========================================  
// Subscription and Payment Models  
// \==========================================  
model Subscription {  
  id                                String              @id @default(cuid())  
  status                            SubscriptionStatus  
  plan                              BusinessCardPlan? // Can be null for non-business-card products  
  price                             Float             // Stores the recurring service fee (monthly or yearly).  
  billingCycle                      BillingCycle  
  currentPeriodStart                DateTime?  
  currentPeriodEnd                  DateTime?  
  paymentGatewaySubscriptionId      String              @unique   
  createdAt                         DateTime            @default(now())  
  updatedAt                         DateTime            @updatedAt  
    
  productId                         String  
  product                           Product             @relation(fields: \[productId\], references: \[id\])  
    
  payments                          Payment\[\]  
}

model Payment {  
  id                            String        @id @default(cuid())  
  amount                        Float  
  currency                      String  
  status                        PaymentStatus  
  paymentGatewayTransactionId   String        @unique  
  createdAt                     DateTime      @default(now())  
    
  // A payment can be for the initial purchase or a recurring subscription fee.  
  // We can add a 'type' field here later if needed to distinguish them.  
  subscriptionId                String  
  subscription                  Subscription  @relation(fields: \[subscriptionId\], references: \[id\])  
}

// \==========================================  
// Product-Specific Data Models  
// \==========================================  
model BusinessCardProfile {  
  id                  String            @id @default(cuid())  
  slug                String            @unique // The public URL identifier, e.g., "emilkarimov"  
  plan                BusinessCardPlan  @default(STARTER)  
  title               String?  
  profilePictureUrl   String?  
  notes               String?  
    
  Product             Product?

  contacts            ContactInfo\[\]  
  socialLinks         SocialLink\[\]  
  additionalLinks     AdditionalLink\[\]  
  messages            Message\[\]  
}

model RedirectItem {  
  id        String   @id @default(cuid())  
  targetUrl String  
    
  Product   Product?  
}

model StaticItem {  
  id           String  @id @default(cuid())  
  description  String?  
    
  Product      Product?  
}

// \==========================================  
// Ancillary Models (for Business Cards)  
// \==========================================  
model ContactInfo {  
  id        String      @id @default(cuid())  
  type      ContactType  
  value     String  
    
  profileId String  
  profile   BusinessCardProfile @relation(fields: \[profileId\], references: \[id\], onDelete: Cascade)  
}

model SocialLink {  
  id        String  @id @default(cuid())  
  name      String  
  icon      String?  
  url       String

  profileId String  
  profile   BusinessCardProfile @relation(fields: \[profileId\], references: \[id\], onDelete: Cascade)  
}

model AdditionalLink {  
  id        String  @id @default(cuid())  
  title     String  
  icon      String?  
  url       String

  profileId String  
  profile   BusinessCardProfile @relation(fields: \[profileId\], references: \[id\], onDelete: Cascade)  
}

model Message {  
  id                 String   @id @default(cuid())  
  senderName         String  
  senderEmail        String  
  senderMessage      String  
  isSeen             Boolean  @default(false)  
  sentAt             DateTime @default(now())

  recipientProfileId String  
  recipientProfile   BusinessCardProfile @relation(fields: \[recipientProfileId\], references: \[id\], onDelete: Cascade)  
}

// \==========================================  
// Enums  
// \==========================================  
enum BillingCycle {  
  MONTHLY  
  YEARLY  
}

enum ProductStatus {  
  PENDING\_ACTIVATION  
  ACTIVE  
  INACTIVE  
}

enum ProductType {  
  BUSINESS\_CARD  
  REDIRECT\_ITEM  
  STATIC\_ITEM  
}

enum BusinessCardPlan {  
  STARTER  
  PROFESSIONAL  
  BUSINESS  
}

enum SubscriptionStatus {  
  ACTIVE  
  CANCELED  
  PAST\_DUE  
  INACTIVE  
  TRIALING  
}

enum PaymentStatus {  
  PENDING  
  SUCCESSFUL  
  FAILED  
}

enum ContactType {  
  PHONE  
  EMAIL  
  ADDRESS  
}

## **4\. Development Roadmap: Step-by-Step**

This roadmap outlines the creation of models, services (APIs), and UI components in a logical sequence.

### **Stage 1: Foundation & Core Setup**

* **Goal:** Create the project's skeleton and database structure.  
* **Actions:**  
  1. **Project Initialization:** Create a new Next.js project with TypeScript and Tailwind CSS.  
  2. **Prisma Setup:** Install and initialize Prisma in the project.  
  3. **Model Creation (Definition):** Copy the entire database schema above into prisma/schema.prisma.  
  4. **Database Connection:** Configure the DATABASE\_URL in the .env file.  
  5. **Database Migration:** Run npx prisma migrate dev to create all tables in the database and npx prisma generate to create the Prisma Client.

### **Stage 2: Admin Panel \- Catalog Management**

* **Goal:** Allow the admin to manage the sales catalog.  
* **Actions:**  
  1. **Backend (API Services):**  
     * Create API routes for CatalogProduct CRUD operations.  
     * **Logic:** When creating/updating a CatalogProduct, the admin will only input the monthlyServiceFee. The backend will automatically calculate the yearlyServiceFee (e.g., monthlyServiceFee \* 12 \* 0.90 for a 10% discount) and save both values to the database.  
  2. **Frontend (UI Components):**  
     * Create the admin page /admin/catalog with UI components to manage the catalog. The form should only require the monthly fee, and the yearly fee can be displayed as a calculated, read-only value.

### **Stage 3: Public Marketplace & User Authentication** ✅ **COMPLETED**

* **Goal:** Allow public users to see products and existing users to login.  
* **Actions:**  
  1. **Backend (API Services):** ✅  
     * ✅ Create a public API route GET /api/catalog to return active products.  
     * ✅ Set up NextAuth.js for authentication.  
     * ✅ Create login API for existing users only.  
  2. **Frontend (UI Components):** ✅  
     * ✅ Update the main marketplace page (/) with authentication-aware header.  
     * ✅ Create the login page (/auth/signin) for existing users.  
     * ✅ Remove separate registration - users register during first purchase.

### **Stage 4: New User Onboarding & Order Process** ✅ **COMPLETED**

* **Goal:** Implement the logic for new users to register and purchase products in one flow.  
* **Actions:**  
  1. **Backend (API Service):** ✅  
     * ✅ Create the order creation API: POST /api/orders. This service receives new user details (name, email, password) and product choice with billingCycle (MONTHLY or YEARLY). It then:  
       * ✅ Uses a Prisma $transaction.  
       * ✅ **First, creates the User record if the email doesn't exist.**  
       * ✅ Creates the Product, Subscription, and Payment records linked to that user.  
       * ✅ **The first Payment record's amount is the oneTimePrice from the CatalogProduct.**  
       * ✅ **The Subscription record's price and billingCycle fields are set based on the user's choice.**  
  2. **Frontend (UI Components):** ✅  
     * ✅ Added "Order Now" buttons to marketplace product cards.  
     * ✅ Created a checkout/order page (`/order/[productId]`). This page:  
       * ✅ Includes account creation fields (name, email, password) for new users.  
       * ✅ Allows existing users to use their existing account.  
       * ✅ Clearly shows the one-time price.  
       * ✅ **Requires the user to select a recurring service fee plan (Monthly vs. Yearly)** using radio buttons, showing the respective prices and discounts.  
     * ✅ Implemented the client-side logic for the "Complete Order" button to call the order API, passing the user details and selected billingCycle.  
     * ✅ Created order success page with clear next steps.  
     * ✅ Updated dashboard to display user's purchased products.  
       * **Require the user to select a recurring service fee plan (Monthly vs. Yearly)** using radio buttons, showing the respective prices and discounts.  
     * Implement the client-side logic for the "Confirm Payment" button to call the order API, passing the selected billingCycle.

### **Stage 5: Enhanced User Dashboard** ✅ **COMPLETED**

* **Goal:** Allow logged-in users to see their purchased products with enhanced management features.  
* **Actions:**  
  1. **Backend (API Service):** ✅  
     * ✅ Enhanced the user's products API: GET /api/me/products with complete product details including profile, redirect, and static item data.  
  2. **Frontend (UI Components):** ✅  
     * ✅ Enhanced the protected dashboard page (/dashboard) with improved product management features.  
     * ✅ Added detailed product status indicators with color-coded badges for ACTIVE, PENDING_ACTIVATION, and INACTIVE states.  
     * ✅ Implemented comprehensive recurring service fee display showing price, billing cycle, and subscription status.  
     * ✅ Added product statistics dashboard with total, active, pending, and business card counts.  
     * ✅ Enhanced product cards with detailed information including purchase price, service fees, subscription periods, and product-specific data.  
     * ✅ Added product type icons and improved visual hierarchy.  
     * ✅ Implemented empty state for users with no products.  
     * ✅ Added "View Public Page" buttons for active business cards.  
     * ✅ Enhanced responsive design for better mobile experience.

### **Stage 6: Product & Profile Management** ✅ **COMPLETED**

* **Goal:** Allow users to edit their active products and create public card pages.  
* **Actions:**  
  1. **Backend (API Services):** ✅  
     * ✅ Created the profile update API (PUT /api/profiles/business-card/[profileId]) which handles text updates for business card profiles including title, profile picture URL, notes, contacts, social links, and additional links.  
     * ✅ Created the redirect/static item update API (PUT /api/products/[productId]) for updating redirect target URLs and static item descriptions.  
     * ✅ Created the public card data API (GET /api/cards/[slug]) to serve public business card pages with comprehensive profile information.  
     * ✅ Implemented proper authorization checks to ensure users can only edit their own products.  
     * ✅ Added validation for active product status and URL format validation.  
  2. **Frontend (UI Components):** ✅  
     * ✅ Created the dynamic public card page (/cards/[slug]) with beautiful, responsive design showcasing business card profiles.  
     * ✅ Built comprehensive business card profile editing page (/edit/business-card/[profileId]) with forms for all profile fields including contacts, social links, and additional links.  
     * ✅ Implemented redirect/static item editing page (/edit/product/[productId]) for managing product-specific configurations.  
     * ✅ Enhanced dashboard with proper navigation links to edit pages based on product type.  
     * ✅ Added form validation, loading states, and error handling across all editing interfaces.  
     * ✅ Implemented responsive design with modern UI components and clear visual hierarchy.

### **Stage 7: Admin Panel \- Order Activation** ✅ **COMPLETED**

* **Goal:** Allow the admin to finalize the order process.  
* **Actions:**  
  1. **Backend (API Services):** ✅  
     * ✅ Created the pending orders API (GET /api/admin/orders) with pagination, admin authentication, and comprehensive order data including customer details, product information, and subscription details.  
     * ✅ Created the activation API (POST /api/admin/products/\[productId\]/activate) which sets the product status to ACTIVE, updates subscription start/end dates, creates product-specific data (business card profiles, redirect items, static items), and ensures unique slug generation for business cards.  
  2. **Frontend (UI Components):** ✅  
     * ✅ Created the admin orders page (/admin/orders) with a responsive table displaying pending orders, customer information, pricing details, and an "Activate" button for each order.  
     * ✅ Added admin panel navigation link to the dashboard header for admin users.  
     * ✅ Implemented proper admin authentication checks, loading states, error handling, and success feedback.  
     * ✅ Added pagination support for handling large numbers of pending orders.  
     * ✅ Enhanced admin layout with consistent navigation and styling.