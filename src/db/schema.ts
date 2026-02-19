import { pgTable, text, integer, real, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

// ========================
// Enum Constants
// ========================

export const userRoles = ['USER', 'ADMIN'] as const
export const productTypes = ['BUSINESS_CARD', 'REDIRECT_ITEM', 'STATIC_ITEM'] as const
export const productStatuses = ['PENDING_ACTIVATION', 'ACTIVE', 'INACTIVE'] as const
export const businessCardPlans = ['STARTER', 'PROFESSIONAL', 'BUSINESS'] as const
export const billingCycles = ['MONTHLY', 'YEARLY'] as const
export const subscriptionStatuses = ['ACTIVE', 'CANCELED', 'PAST_DUE', 'INACTIVE', 'TRIALING'] as const
export const paymentStatuses = ['PENDING', 'SUCCESSFUL', 'FAILED'] as const
export const contactTypes = ['PHONE', 'EMAIL', 'ADDRESS'] as const

export type UserRole = (typeof userRoles)[number]
export type ProductType = (typeof productTypes)[number]
export type ProductStatus = (typeof productStatuses)[number]
export type BusinessCardPlan = (typeof businessCardPlans)[number]
export type BillingCycle = (typeof billingCycles)[number]
export type SubscriptionStatus = (typeof subscriptionStatuses)[number]
export type PaymentStatus = (typeof paymentStatuses)[number]
export type ContactType = (typeof contactTypes)[number]

// Enum-like objects for backward compat with Prisma-style access (e.g. ProductType.BUSINESS_CARD)
export const ProductType = { BUSINESS_CARD: 'BUSINESS_CARD', REDIRECT_ITEM: 'REDIRECT_ITEM', STATIC_ITEM: 'STATIC_ITEM' } as const
export const BusinessCardPlan = { STARTER: 'STARTER', PROFESSIONAL: 'PROFESSIONAL', BUSINESS: 'BUSINESS' } as const
export const ProductStatus = { PENDING_ACTIVATION: 'PENDING_ACTIVATION', ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' } as const
export const UserRole = { USER: 'USER', ADMIN: 'ADMIN' } as const

// ========================
// Tables
// ========================

export const catalogProducts = pgTable('catalog_product', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  oneTimePrice: real('one_time_price').notNull().default(0),
  monthlyPrice: real('monthly_price').default(0),
  yearlyPrice: real('yearly_price').default(0),
  monthlyServiceFee: real('monthly_service_fee'),
  yearlyServiceFee: real('yearly_service_fee'),
  type: text('type', { enum: productTypes }).notNull(),
  plan: text('plan', { enum: businessCardPlans }),
  features: text('features'), // JSON string
  isActive: boolean('is_active').notNull().default(true),
  modelUrl: text('model_url'),
  modelPoster: text('model_poster'),
  colorOptions: text('color_options'), // JSON string
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const users = pgTable('user', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  password: text('password'),
  role: text('role', { enum: userRoles }).notNull().default('USER'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const accounts = pgTable('account', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
}, (table) => [
  uniqueIndex('account_provider_id_unique').on(table.provider, table.providerAccountId),
])

export const sessions = pgTable('session', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
})

export const verificationTokens = pgTable('verification_token', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires').notNull(),
}, (table) => [
  uniqueIndex('vt_identifier_token_unique').on(table.identifier, table.token),
])

export const products = pgTable('product', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  type: text('type', { enum: productTypes }).notNull(),
  status: text('status', { enum: productStatuses }).notNull().default('PENDING_ACTIVATION'),
  activatedAt: timestamp('activated_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  catalogProductId: text('catalog_product_id').notNull().references(() => catalogProducts.id),
  businessCardProfileId: text('business_card_profile_id').unique().references(() => businessCardProfiles.id),
  redirectItemId: text('redirect_item_id').unique().references(() => redirectItems.id),
  staticItemId: text('static_item_id').unique().references(() => staticItems.id),
})

export const subscriptions = pgTable('subscription', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  status: text('status', { enum: subscriptionStatuses }).notNull(),
  plan: text('plan', { enum: businessCardPlans }),
  price: real('price').notNull(),
  billingCycle: text('billing_cycle', { enum: billingCycles }).notNull(),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  paymentGatewaySubscriptionId: text('payment_gateway_subscription_id').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  productId: text('product_id').notNull().references(() => products.id),
})

export const payments = pgTable('payment', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  amount: real('amount').notNull(),
  currency: text('currency').notNull(),
  status: text('status', { enum: paymentStatuses }).notNull(),
  paymentGatewayTransactionId: text('payment_gateway_transaction_id').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  subscriptionId: text('subscription_id').notNull().references(() => subscriptions.id),
})

export const businessCardProfiles = pgTable('business_card_profile', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  productId: text('product_id').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan', { enum: businessCardPlans }).notNull().default('STARTER'),
  fullName: text('full_name'),
  title: text('title'),
  company: text('company'),
  bio: text('bio'),
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  profilePicture: text('profile_picture'),
  profilePictureUrl: text('profile_picture_url'),
  coverImage: text('cover_image'),
  notes: text('notes'),
  theme: text('theme').default('default'),
  views: integer('views').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const redirectItems = pgTable('redirect_item', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  targetUrl: text('target_url').notNull(),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const staticItems = pgTable('static_item', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const contactInfos = pgTable('contact_info', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  type: text('type', { enum: contactTypes }).notNull(),
  value: text('value').notNull(),
  label: text('label'),
  profileId: text('profile_id').notNull().references(() => businessCardProfiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const socialLinks = pgTable('social_link', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  platform: text('platform').notNull(),
  name: text('name'),
  icon: text('icon'),
  url: text('url').notNull(),
  label: text('label'),
  profileId: text('profile_id').notNull().references(() => businessCardProfiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const additionalLinks = pgTable('additional_link', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'),
  url: text('url').notNull(),
  profileId: text('profile_id').notNull().references(() => businessCardProfiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const messages = pgTable('message', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  senderName: text('sender_name').notNull(),
  senderEmail: text('sender_email').notNull(),
  senderMessage: text('sender_message').notNull(),
  isSeen: boolean('is_seen').notNull().default(false),
  sentAt: timestamp('sent_at').notNull().defaultNow(),
  recipientProfileId: text('recipient_profile_id').notNull().references(() => businessCardProfiles.id, { onDelete: 'cascade' }),
})

// ========================
// Relations
// ========================

export const catalogProductRelations = relations(catalogProducts, ({ many }) => ({
  ownedProducts: many(products),
}))

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  products: many(products),
}))

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const productRelations = relations(products, ({ one, many }) => ({
  owner: one(users, { fields: [products.ownerId], references: [users.id] }),
  catalogProduct: one(catalogProducts, { fields: [products.catalogProductId], references: [catalogProducts.id] }),
  businessCardProfile: one(businessCardProfiles, { fields: [products.businessCardProfileId], references: [businessCardProfiles.id] }),
  redirectItem: one(redirectItems, { fields: [products.redirectItemId], references: [redirectItems.id] }),
  staticItem: one(staticItems, { fields: [products.staticItemId], references: [staticItems.id] }),
  subscriptions: many(subscriptions),
}))

export const subscriptionRelations = relations(subscriptions, ({ one, many }) => ({
  product: one(products, { fields: [subscriptions.productId], references: [products.id] }),
  payments: many(payments),
}))

export const paymentRelations = relations(payments, ({ one }) => ({
  subscription: one(subscriptions, { fields: [payments.subscriptionId], references: [subscriptions.id] }),
}))

export const businessCardProfileRelations = relations(businessCardProfiles, ({ one, many }) => ({
  product: one(products, { fields: [businessCardProfiles.productId], references: [products.id] }),
  contacts: many(contactInfos),
  socialLinks: many(socialLinks),
  additionalLinks: many(additionalLinks),
  messages: many(messages),
}))

export const redirectItemRelations = relations(redirectItems, ({ one }) => ({
  product: one(products),
}))

export const staticItemRelations = relations(staticItems, ({ one }) => ({
  product: one(products),
}))

export const contactInfoRelations = relations(contactInfos, ({ one }) => ({
  profile: one(businessCardProfiles, { fields: [contactInfos.profileId], references: [businessCardProfiles.id] }),
}))

export const socialLinkRelations = relations(socialLinks, ({ one }) => ({
  profile: one(businessCardProfiles, { fields: [socialLinks.profileId], references: [businessCardProfiles.id] }),
}))

export const additionalLinkRelations = relations(additionalLinks, ({ one }) => ({
  profile: one(businessCardProfiles, { fields: [additionalLinks.profileId], references: [businessCardProfiles.id] }),
}))

export const messageRelations = relations(messages, ({ one }) => ({
  recipientProfile: one(businessCardProfiles, { fields: [messages.recipientProfileId], references: [businessCardProfiles.id] }),
}))
