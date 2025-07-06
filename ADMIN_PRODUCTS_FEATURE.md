# Admin Products Management

## Overview
Added a comprehensive admin products management page that allows administrators to view and manage all user products in the system.

## Features

### 1. Products List View
- **URL**: `/admin/products`
- **Access**: Admin users only
- **Data**: All user products with complete details including:
  - Product information (name, type, status, pricing)
  - User information (owner name, email)
  - Subscription details (status, billing cycle, pricing)
  - Profile information (business card profiles, redirect URLs)
  - Creation and update timestamps

### 2. Filtering and Sorting
- **Status Filter**: All, Active, Pending Activation, Inactive
- **Type Filter**: All, Business Card, Redirect Item, Static Item
- **Sorting**: By creation date, last update, name, or status
- **Sort Order**: Ascending or descending

### 3. Product Actions
- **Activate Products**: One-click activation for pending products
- **View Public Pages**: Direct links to live business card pages
- **Test Redirects**: Test redirect functionality for redirect products

### 4. Real-time Management
- **Cached Data**: Uses API caching for performance (10-minute cache)
- **Auto-refresh**: Automatically refreshes data after actions
- **Live Status**: Real-time product status updates

## API Endpoints

### GET `/api/admin/products`
**Purpose**: Fetch all user products for admin view
**Auth**: Admin only
**Response**: Array of products with full details including:
```typescript
interface AdminProduct {
  id: string
  name: string
  type: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  catalogProduct: {
    // Product template details
  }
  subscription: {
    // Subscription information
  } | null
  profile: {
    // Business card profile
  } | null
  redirectItem: {
    // Redirect configuration
  } | null
  staticItem: {
    // Static item details
  } | null
}
```

## UI Components

### 1. Filter Controls
- Status dropdown with all status options
- Product type dropdown
- Sort field selection
- Sort order toggle button

### 2. Product Cards
- Rich information display with glassmorphism design
- Color-coded status badges
- Organized information sections:
  - Product metadata
  - Subscription status
  - Profile information
  - Additional details (redirects, static content)

### 3. Action Buttons
- Conditional action buttons based on product status and type
- Activation button for pending products
- View public page for active business cards
- Test redirect for redirect items

## Performance Optimizations
- **API Caching**: 10-minute cache to reduce database load
- **Efficient Queries**: Single query with all required joins
- **Smart Refresh**: Only refreshes after actions, not on every visit
- **Optimized Filtering**: Client-side filtering for instant results

## Usage

1. **Access**: Navigate to `/admin/products` (admin login required)
2. **Filter**: Use dropdown filters to narrow down products
3. **Sort**: Select sort field and order for organization
4. **Manage**: Use action buttons to activate or test products
5. **Monitor**: View real-time status and subscription information

## Integration
- **Admin Dashboard**: Added new "Məhsul İdarəsi" (Product Management) card
- **Navigation**: Seamless integration with existing admin navigation
- **Permissions**: Properly protected with admin-only access
- **Caching**: Integrated with the existing API cache system

## Benefits
- **Complete Visibility**: Admins can see all user products in one place
- **Efficient Management**: Quick actions for common admin tasks
- **Performance**: Cached data reduces server load
- **User Experience**: Rich UI with proper status indicators
- **Scalability**: Handles large numbers of products efficiently
