"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/Button"

// Helper function to generate URL slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

// Define types
enum ProductType {
  BUSINESS_CARD = 'BUSINESS_CARD',
  REDIRECT_ITEM = 'REDIRECT_ITEM',
  STATIC_ITEM = 'STATIC_ITEM'
}

enum BusinessCardPlan {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  BUSINESS = 'BUSINESS'
}

interface CatalogProduct {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  oneTimePrice: number
  monthlyServiceFee: number
  yearlyServiceFee: number
  type: ProductType
  plan?: BusinessCardPlan | null
}

export default function OrderPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const productId = params.productId as string

  const [product, setProduct] = useState<CatalogProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    billingCycle: "MONTHLY" as "MONTHLY" | "YEARLY",
    // Profile selection fields
    profileFor: "" as "myself" | "business" | "someone-else" | "",
    profileName: "",
    profileTitle: "",
    profileSlug: "",
    // Redirect URL for REDIRECT_ITEM products
    redirectUrl: ""
  })

  // Profile selection step
  const [showProfileSelection, setShowProfileSelection] = useState(false)
  const [profileStep, setProfileStep] = useState<"selection" | "details">("selection")

  useEffect(() => {
    // Pre-fill email and name if user is logged in
    if (session?.user?.email) {
      setFormData(prev => ({
        ...prev,
        email: session.user!.email!,
        name: session.user!.name || ""
      }))
    }
  }, [session])

  useEffect(() => {
    // Show profile selection for business card products for ALL users (logged in and guests)
    if (product?.type === ProductType.BUSINESS_CARD) {
      setShowProfileSelection(true)
    }
  }, [product])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch('/api/catalog')
        if (response.ok) {
          const products = await response.json()
          const foundProduct = products.find((p: CatalogProduct) => p.id === productId)
          if (foundProduct) {
            setProduct(foundProduct)
          } else {
            setError("Product not found")
          }
        } else {
          setError("Failed to load product")
        }
      } catch (err) {
        setError("Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleBillingCycleChange = (cycle: "MONTHLY" | "YEARLY") => {
    setFormData(prev => ({
      ...prev,
      billingCycle: cycle
    }))
  }

  const validateForm = () => {
    // For logged-in users, email validation is not needed
    if (!session?.user && !formData.email) {
      setError("Email is required")
      return false
    }

    // For redirect items, URL is required
    if (product?.type === ProductType.REDIRECT_ITEM) {
      if (!formData.redirectUrl) {
        setError("Yönləndirmə URL-i tələb olunur")
        return false
      }
      // Basic URL validation
      try {
        new URL(formData.redirectUrl)
      } catch {
        setError("Düzgün URL daxil edin (məsələn: https://instagram.com/username)")
        return false
      }
    }

    // For business card products, check if profile selection is complete
    if (product?.type === ProductType.BUSINESS_CARD) {
      if (!formData.profileFor) {
        setError("Kart kimə görə olduğunu seçin")
        return false
      }
      
      // Profile name is required for:
      // - Business profiles (both logged-in and guest users)
      // - Someone-else profiles (both logged-in and guest users)
      // - Guest users selecting "myself" (profileName becomes their account name)
      if (formData.profileFor === 'business' || formData.profileFor === 'someone-else' || (!session?.user && formData.profileFor === 'myself')) {
        if (!formData.profileName) {
          setError("Profil adı daxil edilməlidir")
          return false
        }
      }
    }

    // If user is not logged in, password is required for new account creation
    if (!session?.user) {
      if (!formData.name) {
        setError("Name is required")
        return false
      }
      if (!formData.password) {
        setError("Password is required")
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return false
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        // Use session data for logged-in users, form data for guests
        name: session?.user?.name || formData.name,
        email: session?.user?.email || formData.email,
        password: session?.user ? undefined : formData.password,
        catalogProductId: productId,
        billingCycle: formData.billingCycle,
        isExistingUser: !!session?.user,
        // Profile data for business cards
        profileFor: formData.profileFor, // Add this to help backend understand the context
        profileName: formData.profileName,
        profileTitle: formData.profileTitle,
        profileSlug: formData.profileSlug,
        // Redirect URL for redirect items
        redirectUrl: formData.redirectUrl
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to success page or dashboard
        router.push(`/order/success?orderId=${result.order.product.id}`)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create order")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentPrice = formData.billingCycle === "YEARLY" 
    ? product.yearlyServiceFee 
    : product.monthlyServiceFee

  const savings = formData.billingCycle === "YEARLY" 
    ? ((product.monthlyServiceFee * 12 - product.yearlyServiceFee) / (product.monthlyServiceFee * 12) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Liquid Glass Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-pink-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-200/35 to-blue-300/35 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 right-20 w-64 h-64 bg-gradient-to-br from-purple-200/25 to-indigo-300/25 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-white/10 via-blue-100/10 to-purple-100/10"></div>

      <div className="relative z-10 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Link href="/" className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-6 group transition-all duration-300">
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Ana səhifəyə qayıt
          </Link>
          <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sifarişi tamamla</h1>
            <p className="text-gray-600">Məhsulunuzu satın almaq üçün məlumatları doldurun</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Summary */}
            <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl hover:bg-white/35 hover:border-white/60 transition-all duration-500">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 6V7h6v3H7z" clipRule="evenodd" />
                  </svg>
                </div>
                Sifariş xülasəsi
              </h2>
              
              <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl p-6 mb-6 hover:bg-white/40 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-3">{product.description}</p>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                        {product.oneTimePrice.toFixed(2)} ₼
                      </span>
                      <span className="text-sm text-gray-600 ml-2">birdəfəlik</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Plan Selection */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Xidmət planını seçin
              </h3>
              
              <div className="space-y-4 mb-8">
                <label className={`block backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                  formData.billingCycle === 'MONTHLY' 
                    ? 'bg-blue-500/20 border-blue-400/60 shadow-lg shadow-blue-500/20' 
                    : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/50'
                }`}>
                  <input
                    type="radio"
                    name="billingCycle"
                    value="MONTHLY"
                    checked={formData.billingCycle === 'MONTHLY'}
                    onChange={() => handleBillingCycleChange('MONTHLY')}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900 text-lg">Aylıq plan</div>
                      <div className="text-gray-600">Hər ay ödəniş</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-gray-900">{product.monthlyServiceFee.toFixed(2)} ₼/ay</div>
                    </div>
                  </div>
                </label>

                <label className={`block backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                  formData.billingCycle === 'YEARLY' 
                    ? 'bg-green-500/20 border-green-400/60 shadow-lg shadow-green-500/20' 
                    : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/50'
                }`}>
                  <input
                    type="radio"
                    name="billingCycle"
                    value="YEARLY"
                    checked={formData.billingCycle === 'YEARLY'}
                    onChange={() => handleBillingCycleChange('YEARLY')}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900 text-lg">İllik plan</div>
                      <div className="text-gray-600">İllik ödəniş</div>
                      {savings > 0 && (
                        <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1 rounded-full mt-2 font-medium">
                          {savings.toFixed(0)}% endirim
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-gray-900">{product.yearlyServiceFee.toFixed(2)} ₼/il</div>
                      <div className="text-sm text-gray-600">{(product.yearlyServiceFee / 12).toFixed(2)} ₼/ay</div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Total */}
              <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl p-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Bu gün ümumi:</span>
                  <span className="text-3xl font-bold" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                    {product.oneTimePrice.toFixed(2)} ₼
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  Xidmət ödənişi məhsul aktivləşdirildikdən sonra başlayır
                </p>
              </div>
            </div>

            {/* Order Form */}
            <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl hover:bg-white/35 hover:border-white/60 transition-all duration-500">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                {session ? "Sifarişi təsdiq et" : "Hesab və sifariş məlumatları"}
              </h2>

              {/* Profile Selection for Business Cards */}
              {showProfileSelection && (
                <div className="mb-8">
                  {profileStep === "selection" && (
                    <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-400/30 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Bu kart kimə görədir?</h3>
                      <div className="space-y-3">
                        <label className={`block backdrop-blur-xl border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                          formData.profileFor === 'myself' 
                            ? 'bg-blue-500/20 border-blue-400/60 shadow-lg shadow-blue-500/20' 
                            : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/50'
                        }`}>
                          <input
                            type="radio"
                            name="profileFor"
                            value="myself"
                            checked={formData.profileFor === 'myself'}
                            onChange={(e) => setFormData(prev => ({ ...prev, profileFor: e.target.value as any }))}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full border-2 border-gray-400 mr-3 flex items-center justify-center">
                              {formData.profileFor === 'myself' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                            <span className="font-medium text-gray-900">Mənim üçün</span>
                          </div>
                        </label>

                        <label className={`block backdrop-blur-xl border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                          formData.profileFor === 'business' 
                            ? 'bg-blue-500/20 border-blue-400/60 shadow-lg shadow-blue-500/20' 
                            : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/50'
                        }`}>
                          <input
                            type="radio"
                            name="profileFor"
                            value="business"
                            checked={formData.profileFor === 'business'}
                            onChange={(e) => setFormData(prev => ({ ...prev, profileFor: e.target.value as any }))}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full border-2 border-gray-400 mr-3 flex items-center justify-center">
                              {formData.profileFor === 'business' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                            <span className="font-medium text-gray-900">Biznesim üçün</span>
                          </div>
                        </label>

                        <label className={`block backdrop-blur-xl border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                          formData.profileFor === 'someone-else' 
                            ? 'bg-blue-500/20 border-blue-400/60 shadow-lg shadow-blue-500/20' 
                            : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/50'
                        }`}>
                          <input
                            type="radio"
                            name="profileFor"
                            value="someone-else"
                            checked={formData.profileFor === 'someone-else'}
                            onChange={(e) => setFormData(prev => ({ ...prev, profileFor: e.target.value as any }))}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full border-2 border-gray-400 mr-3 flex items-center justify-center">
                              {formData.profileFor === 'someone-else' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                            <span className="font-medium text-gray-900">Başqa şəxs üçün</span>
                          </div>
                        </label>
                      </div>

                      {formData.profileFor && (
                        <div className="mt-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (formData.profileFor === 'myself') {
                                if (session?.user) {
                                  // For logged-in users selecting "myself", auto-fill with user's data
                                  setFormData(prev => ({
                                    ...prev,
                                    profileName: session?.user?.name || "",
                                    profileTitle: "",
                                    profileSlug: ""
                                  }))
                                  setShowProfileSelection(false)
                                } else {
                                  // For guests selecting "myself", go to details to get their name
                                  setProfileStep("details")
                                }
                              } else {
                                // For business or someone-else selections, go to details
                                setProfileStep("details")
                              }
                            }}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                          >
                            Davam et
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {profileStep === "details" && (formData.profileFor !== 'myself' || !session?.user) && (
                    <div className="backdrop-blur-xl bg-green-500/10 border border-green-400/30 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          {formData.profileFor === 'myself' ? 'Sizin məlumatlarınız' : 
                           formData.profileFor === 'business' ? 'Biznes məlumatları' : 'Şəxs məlumatları'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setProfileStep("selection")}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          ← Geri
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="profileName" className="block text-sm font-bold text-gray-800 mb-2">
                            {formData.profileFor === 'myself' ? 'Sizin tam adınız' :
                             formData.profileFor === 'business' ? 'Biznes adı' : 'Tam ad'}
                          </label>
                          <input
                            id="profileName"
                            name="profileName"
                            type="text"
                            value={formData.profileName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/60 transition-all duration-300"
                            placeholder={formData.profileFor === 'myself' ? 'Tam adınızı daxil edin' :
                                        formData.profileFor === 'business' ? 'Biznes adını daxil edin' : 'Tam adı daxil edin'}
                          />
                        </div>

                        {/* Only show title field for 'someone-else', not for business or myself */}
                        {formData.profileFor === 'someone-else' && (
                          <div>
                            <label htmlFor="profileTitle" className="block text-sm font-bold text-gray-800 mb-2">
                              Vəzifə/Mövqe
                            </label>
                            <input
                              id="profileTitle"
                              name="profileTitle"
                              type="text"
                              value={formData.profileTitle}
                              onChange={handleChange}
                              className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/60 transition-all duration-300"
                              placeholder="Layihə meneceri"
                            />
                          </div>
                        )}

                        <div className="mt-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              // Generate slug from profile name
                              const slug = generateSlug(formData.profileName)
                              setFormData(prev => ({ 
                                ...prev, 
                                profileSlug: slug,
                                // For guests selecting "myself", use profileName as their account name too
                                ...(formData.profileFor === 'myself' && !session ? { name: formData.profileName } : {})
                              }))
                              setShowProfileSelection(false)
                            }}
                            disabled={!formData.profileName}
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Təsdiq et
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-400/60 text-red-800 px-4 py-3 rounded-2xl mb-6 backdrop-blur-xl">
                  {error}
                </div>
              )}

              {/* Redirect URL input for REDIRECT_ITEM products */}
              {product?.type === ProductType.REDIRECT_ITEM && (
                <div className="mb-8">
                  <div className="backdrop-blur-xl bg-purple-500/10 border border-purple-400/30 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      Yönləndirmə URL-i
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Bu məhsul toxunduqda istifadəçiləri hara yönləndirmək istəyirsiniz?
                    </p>
                    <div>
                      <label htmlFor="redirectUrl" className="block text-sm font-bold text-gray-800 mb-2">
                        Hedef URL
                      </label>
                      <input
                        id="redirectUrl"
                        name="redirectUrl"
                        type="url"
                        value={formData.redirectUrl}
                        onChange={handleChange}
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/60 transition-all duration-300"
                        placeholder="https://instagram.com/username"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Məsələn: Instagram, Facebook, Website və ya istənilən başqa link
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show form only when profile selection is complete or not needed */}
              {(!showProfileSelection || formData.profileFor) && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {!session && (
                  <div className="bg-blue-500/20 border border-blue-400/60 rounded-2xl p-4 mb-6 backdrop-blur-xl">
                    <p className="text-blue-800 font-medium">
                      <strong>Veezet-də yenisiniz?</strong> Bu sifariş ilə hesabınızı yaradacağıq.
                    </p>
                    <p className="text-blue-700 text-sm mt-2">
                      Sifariş tamamlandıqdan sonra hesabınıza daxil ola və məhsulunuzu idarə edə bilərsiniz.
                    </p>
                  </div>
                )}

                {/* User details - only show for guests or when profile is for someone else */}
                {!session && (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-gray-800 mb-2">
                        Tam ad
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/60 transition-all duration-300"
                        placeholder="Tam adınızı daxil edin"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-2">
                        Email ünvanı
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/60 transition-all duration-300"
                        placeholder="Email ünvanınızı daxil edin"
                      />
                    </div>
                  </>
                )}

                {/* Show user info for logged-in users when ordering for themselves or business */}
                {session && (formData.profileFor === 'myself' || formData.profileFor === 'business') && (
                  <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">
                      {formData.profileFor === 'myself' ? 'Profil məlumatları:' : 'Sifariş verən istifadəçi:'}
                    </h4>
                    <div className="text-sm text-gray-700">
                      <p><strong>Ad:</strong> {session.user?.name || 'Əlavə edilməyib'}</p>
                      <p><strong>Email:</strong> {session.user?.email}</p>
                    </div>
                  </div>
                )}

                {!session && (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-bold text-gray-800 mb-2">
                        Parol
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/60 transition-all duration-300"
                        placeholder="Parol seçin"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-800 mb-2">
                        Parolu təsdiq edin
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/60 transition-all duration-300"
                        placeholder="Parolunuzu təsdiq edin"
                      />
                    </div>
                  </>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {isSubmitting ? "İşlənir..." : `Sifarişi tamamla - ${product.oneTimePrice.toFixed(2)} ₼`}
                  </button>
                </div>

                {!session && (
                  <p className="text-xs text-gray-600 text-center mt-4 leading-relaxed">
                    Bu sifarişi verməklə hesab yaratmağa və xidmət şərtlərimizi qəbul etməyə razılaşırsınız.
                  </p>
                )}
              </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
