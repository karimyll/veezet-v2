'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useCachedAPI } from '@/lib/api-cache';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

interface UserProduct {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  catalogProduct: {
    id: string;
    name: string;
    description: string;
    oneTimePrice: number;
    monthlyServiceFee: number | null;
    yearlyServiceFee: number | null;
    type: string;
    plan: string | null;
  };
  subscription: {
    id: string;
    status: string;
    price: number;
    billingCycle: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    createdAt: string;
  } | null;
  profile: {
    id: string;
    slug: string;
    title: string | null;
    profilePictureUrl: string | null;
  } | null;
  redirectItem: {
    id: string;
    targetUrl: string;
  } | null;
  staticItem: {
    id: string;
    description: string | null;
  } | null;
}

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Use cached API hook
  const { data: products, loading, error } = useCachedAPI<UserProduct[]>(
    '/api/me/products',
    [session],
    10
  );

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING_ACTIVATION':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'INACTIVE':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PENDING_ACTIVATION':
        return 'Pending Activation';
      case 'INACTIVE':
        return 'Inactive';
      default:
        return status;
    }
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'BUSINESS_CARD':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'REDIRECT_ITEM':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        );
      case 'STATIC_ITEM':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
    }
  };

  if (status === 'loading' || !session) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#4C257B] border-t-transparent rounded-full"
          />
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium text-gray-600"
          >
            Yüklənir...
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50"
      >
        <div className="flex">
          {/* Sidebar Skeleton */}
          <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
            <LoadingSkeleton avatar={true} lines={6} />
          </div>
          {/* Main Content Skeleton */}
          <div className="flex-1 p-8">
            <div className="mb-8">
              <LoadingSkeleton lines={2} className="mb-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <AnimatedCard key={i} delay={i * 0.1} className="p-6">
                  <LoadingSkeleton lines={3} />
                </AnimatedCard>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <AnimatedCard key={i} delay={i * 0.1} className="p-6">
                  <LoadingSkeleton lines={4} avatar={true} />
                </AnimatedCard>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <AnimatedCard className="p-8 max-w-md w-full mx-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Xəta baş verdi</h3>
          <p className="text-gray-600 mb-4">Məlumatlar yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.</p>
          <AnimatedButton
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#4C257B] to-[#6B46C1] text-white"
            shimmer={true}
          >
            Yenidən cəhd et
          </AnimatedButton>
        </AnimatedCard>
      </motion.div>
    );
  }

  const activeProducts = products?.filter(p => p.status === 'ACTIVE') || [];
  const pendingProducts = products?.filter(p => p.status === 'PENDING_ACTIVATION') || [];
  const businessCards = products?.filter(p => p.type === 'BUSINESS_CARD') || [];
  const totalRevenue = products?.reduce((sum, p) => sum + (p.subscription?.price || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout with sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
                </svg>
                <span>Overview</span>
              </Link>
              
              <Link href="/marketplace" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Marketplace</span>
              </Link>
              
              <Link href="/account" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 p-8"
        >
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {session.user?.name || 'User'}
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your NFC products today.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Products */}
            <AnimatedCard delay={0.1} hoverScale={1.05} className="p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="p-3 bg-blue-50 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </motion.div>
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <motion.div 
                className="text-3xl font-bold text-gray-900 mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {products?.length || 0}
              </motion.div>
              <div className="text-sm text-gray-500">Products</div>
            </AnimatedCard>

            {/* Active Products */}
            <AnimatedCard delay={0.2} hoverScale={1.05} className="p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="p-3 bg-green-50 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <span className="text-sm text-gray-500">Active</span>
              </div>
              <motion.div 
                className="text-3xl font-bold text-green-600 mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {activeProducts.length}
              </motion.div>
              <div className="text-sm text-gray-500">Products</div>
            </AnimatedCard>

            {/* Pending Products */}
            <AnimatedCard delay={0.3} hoverScale={1.05} className="p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="p-3 bg-orange-50 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <span className="text-sm text-gray-500">Pending</span>
              </div>
              <motion.div 
                className="text-3xl font-bold text-orange-600 mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {pendingProducts.length}
              </motion.div>
              <div className="text-sm text-gray-500">Products</div>
            </AnimatedCard>

            {/* Business Cards */}
            <AnimatedCard delay={0.4} hoverScale={1.05} className="p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="p-3 bg-purple-50 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </motion.div>
                <span className="text-sm text-gray-500">Cards</span>
              </div>
              <motion.div 
                className="text-3xl font-bold text-purple-600 mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {businessCards.length}
              </motion.div>
              <div className="text-sm text-gray-500">Business Cards</div>
            </AnimatedCard>
          </div>

          {/* Content Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Products List */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <AnimatedCard className="border border-gray-200" hoverShadow={false}>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
                    <AnimatedButton
                      as={Link}
                      href="/marketplace"
                      className="bg-gradient-to-r from-[#4C257B] to-[#6B46C1] text-white text-sm font-medium"
                      shimmer={true}
                      startContent={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      }
                    >
                      Add Product
                    </AnimatedButton>
                  </div>
                </div>
                
                <div className="p-6">
                  {products && products.length > 0 ? (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {products.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="border border-gray-200 rounded-xl p-6 hover:border-[#4C257B] transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <motion.div 
                                  className="p-3 bg-gray-50 rounded-lg"
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {getProductTypeIcon(product.type)}
                                </motion.div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {product.catalogProduct.name}
                                  </h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                                    {getStatusText(product.status)}
                                  </span>
                                </div>
                                
                                <div className="text-sm text-gray-500 mb-3">
                                  <p>{product.type.replace('_', ' ')}</p>
                                  <p>Created {new Date(product.createdAt).toLocaleDateString()}</p>
                                </div>

                                {product.subscription && (
                                  <div className="flex items-center space-x-2 text-sm">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                                      ${product.subscription.price}/{product.subscription.billingCycle.toLowerCase()}
                                    </span>
                                    <span className={`px-2 py-1 rounded-md font-medium ${
                                      product.subscription.status === 'ACTIVE' 
                                        ? 'bg-green-50 text-green-700' 
                                        : 'bg-gray-50 text-gray-700'
                                    }`}>
                                      {product.subscription.status}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2">
                              {product.profile && product.status === 'ACTIVE' && (
                                <Link
                                  href={`/cards/${product.profile.slug}`}
                                  target="_blank"
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View
                                </Link>
                              )}
                              
                              {product.status === 'ACTIVE' && (
                                <Link
                                  href={`/edit/product/${product.id}`}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                      <p className="text-gray-500 mb-6">Get started by browsing our product catalog</p>
                      <Link
                        href="/marketplace"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Browse Products
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/marketplace"
                    className="w-full flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Browse Products
                  </Link>
                  
                  <Link
                    href="/account"
                    className="w-full flex items-center px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Account Settings
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {activeProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.catalogProduct.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.status === 'ACTIVE' ? 'Active' : 'Pending'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {activeProducts.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
