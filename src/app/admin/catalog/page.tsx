'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
// import { CatalogProduct, ProductType } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/FormControls'
import { Modal } from '@/components/ui/Modal'
import { useCachedAPI } from '@/lib/api-cache'

// Define types manually until Prisma client is regenerated
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
  oneTimePrice: number
  monthlyServiceFee: number
  yearlyServiceFee: number
  type: ProductType
  plan?: BusinessCardPlan | null
  isActive: boolean
}

interface ProductFormData {
  name: string
  description: string
  oneTimePrice: string
  monthlyServiceFee: string
  type: ProductType
  plan: BusinessCardPlan | ''
  isActive: boolean
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  oneTimePrice: '',
  monthlyServiceFee: '',
  type: ProductType.BUSINESS_CARD,
  plan: BusinessCardPlan.STARTER,
  isActive: true
}

export default function AdminCatalogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Check authentication and admin role
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user is admin
    if ((session.user as { role?: string })?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  // Use cached API hook instead of manual state management
  const { data: products, loading, error: fetchError, refetch } = useCachedAPI<CatalogProduct[]>(
    '/api/admin/catalog',
    [session], // Add session as dependency
    10 // Cache for 10 minutes
  )

  // Set error if fetch fails
  useEffect(() => {
    if (fetchError) {
      setError('Failed to fetch products')
    }
  }, [fetchError])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // Validate that required fields are provided
    if (!formData.oneTimePrice || !formData.monthlyServiceFee) {
      setError('Please provide both one-time price and monthly service fee')
      setSubmitting(false)
      return
    }

    // Validate that business cards have a plan
    if (formData.type === ProductType.BUSINESS_CARD && !formData.plan) {
      setError('Please select a plan for business card products')
      setSubmitting(false)
      return
    }

    try {
      const url = editingProduct 
        ? `/api/admin/catalog/${editingProduct.id}`
        : '/api/admin/catalog'
      
      const method = editingProduct ? 'PUT' : 'POST'

      const submitData = {
        ...formData,
        oneTimePrice: parseFloat(formData.oneTimePrice),
        monthlyServiceFee: parseFloat(formData.monthlyServiceFee),
        plan: formData.type === ProductType.BUSINESS_CARD ? formData.plan : null
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        await refetch() // Refetch data after successful creation
        closeModal()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      setError('Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      console.log('Attempting to delete product with ID:', id)
      const response = await fetch(`/api/admin/catalog/${id}`, {
        method: 'DELETE',
      })

      console.log('Delete response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Delete successful:', result)
        await refetch() // Refetch data after successful deletion
        // Clear any existing errors
        setError('')
      } else {
        const errorData = await response.json()
        console.error('Delete failed:', errorData)
        setError(errorData.error || `Failed to delete product (${response.status})`)
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError(`Failed to delete product: ${err}`)
    }
  }

  // Modal handlers
  const openModal = (product?: CatalogProduct) => {
    console.log('Opening modal for product:', product)
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || '',
        oneTimePrice: product.oneTimePrice.toString(),
        monthlyServiceFee: product.monthlyServiceFee.toString(),
        type: product.type,
        plan: product.plan || (product.type === ProductType.BUSINESS_CARD ? BusinessCardPlan.STARTER : ''),
        isActive: product.isActive
      })
    } else {
      setEditingProduct(null)
      setFormData(initialFormData)
    }
    setIsModalOpen(true)
    setError('')
    console.log('Modal state set to true')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setFormData(initialFormData)
    setError('')
  }

  // Form input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Catalog Management</h1>
          <p className="mt-2 text-gray-600">Manage your product catalog</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Add Product Button */}
        <div className="mb-6">
          <Button onClick={() => {
            console.log('Add New Product button clicked')
            openModal()
          }}>
            Add New Product
          </Button>
          <div className="text-xs text-gray-500 mt-2">
            Modal state: {isModalOpen ? 'Open' : 'Closed'}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {!products || products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400">Start by adding your first product</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pricing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products && products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>One-time: {product.oneTimePrice.toFixed(2)} ₼</div>
                          <div>Monthly: {product.monthlyServiceFee.toFixed(2)} ₼</div>
                          <div>Yearly: {product.yearlyServiceFee.toFixed(2)} ₼</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.plan || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openModal(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error display within modal */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter product name"
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter product description (optional)"
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="One-Time Price"
              name="oneTimePrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.oneTimePrice}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />

            <Input
              label="Monthly Service Fee"
              name="monthlyServiceFee"
              type="number"
              step="0.01"
              min="0"
              value={formData.monthlyServiceFee}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Auto-calculation:</strong> Yearly service fee will be calculated as Monthly × 12 × 0.90 (10% discount)
                </p>
              </div>
            </div>
          </div>

          <Select
            label="Product Type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
          >
            <option value={ProductType.BUSINESS_CARD}>Business Card</option>
            <option value={ProductType.REDIRECT_ITEM}>Redirect Item</option>
            <option value={ProductType.STATIC_ITEM}>Static Item</option>
          </Select>

          {formData.type === ProductType.BUSINESS_CARD && (
            <Select
              label="Business Card Plan"
              name="plan"
              value={formData.plan}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a plan</option>
              <option value={BusinessCardPlan.STARTER}>Starter</option>
              <option value={BusinessCardPlan.PROFESSIONAL}>Professional</option>
              <option value={BusinessCardPlan.BUSINESS}>Business</option>
            </Select>
          )}

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 font-medium">
              Active (visible to customers)
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 pt-4 border-t border-gray-200">
            <Button 
              type="submit" 
              disabled={submitting}
              className="flex-1 sm:flex-none"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                editingProduct ? 'Update Product' : 'Create Product'
              )}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={closeModal}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
