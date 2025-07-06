"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

interface ProductData {
  id: string
  name: string
  type: string
  status: string
  redirectItem?: {
    id: string
    targetUrl: string
  }
  staticItem?: {
    id: string
    description: string | null
  }
}

export default function EditProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = params.productId as string

  const [productData, setProductData] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [targetUrl, setTargetUrl] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (productId) {
      fetchProductData()
    }
  }, [session, status, productId])

  const fetchProductData = async () => {
    try {
      const response = await fetch('/api/me/products')
      if (response.ok) {
        const products = await response.json()
        const product = products.find((p: any) => p.id === productId)
        
        if (!product) {
          setError("Product not found")
          return
        }

        if (product.type === 'BUSINESS_CARD') {
          router.push(`/edit/business-card/${product.profile?.id}`)
          return
        }

        if (product.status !== 'ACTIVE') {
          setError("Cannot edit inactive product")
          return
        }

        setProductData(product)
        
        if (product.type === 'REDIRECT_ITEM' && product.redirectItem) {
          setTargetUrl(product.redirectItem.targetUrl || "")
        }
        
        if (product.type === 'STATIC_ITEM' && product.staticItem) {
          setDescription(product.staticItem.description || "")
        }
      }
    } catch (error) {
      console.error('Failed to fetch product data:', error)
      setError("Failed to load product data")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const requestBody: any = {}
      
      if (productData?.type === 'REDIRECT_ITEM') {
        if (!targetUrl.trim()) {
          setError("Target URL is required")
          setSaving(false)
          return
        }
        requestBody.targetUrl = targetUrl.trim()
      } else if (productData?.type === 'STATIC_ITEM') {
        requestBody.description = description.trim() || null
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save product')
      }
    } catch (error) {
      console.error('Failed to save product:', error)
      setError('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
          <div className="mt-6">
            <Link href="/dashboard">
              <Button variant="primary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!productData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit {productData.type === 'REDIRECT_ITEM' ? 'Redirect' : 'Static'} Product
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">Cancel</Button>
              </Link>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleSave}
                disabled={saving || (productData.type === 'REDIRECT_ITEM' && !isValidUrl(targetUrl))}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Product Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Product Name:</span> {productData.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Type:</span> {productData.type.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Status:</span> {productData.status}
                </p>
              </div>
            </div>

            {/* Redirect Item Configuration */}
            {productData.type === 'REDIRECT_ITEM' && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Redirect Configuration</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      targetUrl && !isValidUrl(targetUrl) ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com"
                    required
                  />
                  {targetUrl && !isValidUrl(targetUrl) && (
                    <p className="mt-1 text-sm text-red-600">Please enter a valid URL</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    When someone taps your NFC product, they will be redirected to this URL.
                  </p>
                </div>
              </div>
            )}

            {/* Static Item Configuration */}
            {productData.type === 'STATIC_ITEM' && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Static Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the static information that will be displayed when someone interacts with your NFC product..."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    This information will be displayed when someone taps your NFC product.
                  </p>
                </div>
              </div>
            )}

            {/* Current Configuration Display */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Configuration</h3>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                {productData.type === 'REDIRECT_ITEM' && productData.redirectItem && (
                  <div>
                    <p className="text-sm font-medium text-blue-900">Current Target URL:</p>
                    <p className="text-sm text-blue-700 font-mono break-all">
                      {productData.redirectItem.targetUrl}
                    </p>
                  </div>
                )}
                {productData.type === 'STATIC_ITEM' && productData.staticItem && (
                  <div>
                    <p className="text-sm font-medium text-blue-900">Current Description:</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {productData.staticItem.description || "No description set"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Link href="/dashboard">
                <Button variant="secondary">Cancel</Button>
              </Link>
              <Button 
                variant="primary"
                onClick={handleSave}
                disabled={saving || (productData.type === 'REDIRECT_ITEM' && !isValidUrl(targetUrl))}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
