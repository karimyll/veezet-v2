"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Suspense } from "react"

function SetupRedirectContent() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("product")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Yönləndirmə Tənzimləməsi</h1>
          <p className="text-gray-600 mb-6">
            Bu məhsula yönləndirmə linki hələ əlavə edilməyib. Dashboard-dan məhsulunuzu redaktə edərək yönləndirmə linkini təyin edə bilərsiniz.
          </p>
          
          {productId && (
            <div className="text-sm text-gray-500 mb-6">
              Məhsul ID: {productId}
            </div>
          )}
          
          <div className="space-y-3">
            <Link href="/dashboard">
              <Button className="w-full">
                Dashboard-a Get
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="secondary" className="w-full">
                Ana Səhifə
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SetupRedirectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetupRedirectContent />
    </Suspense>
  )
}
