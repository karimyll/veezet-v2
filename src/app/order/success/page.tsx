"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId")
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!orderId) {
      router.push("/")
      return
    }

    // Countdown for auto-redirect
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push("/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [orderId, router])

  if (!orderId) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
          <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Order Successful! 🎉
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your order has been processed successfully
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6 text-left">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What happens next?</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Account Created</p>
                <p className="text-sm text-gray-600">Your account has been set up and you can now sign in.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Product Preparation</p>
                <p className="text-sm text-gray-600">Your NFC product is being prepared for shipment.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-400">3</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Admin Activation</p>
                <p className="text-sm text-gray-600">An admin will activate your product once it's delivered.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-400">4</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Service Activation</p>
                <p className="text-sm text-gray-600">Your recurring service billing will start after activation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>Your product status is currently "Pending Activation". You'll be able to manage it once an admin activates your order.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Back to Marketplace
            </Button>
          </Link>
        </div>

        {/* Auto redirect notice */}
        <p className="text-xs text-gray-500">
          Redirecting to dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
