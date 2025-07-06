"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function ComingSoonPage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("product")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tezliklə Aktivləşəcək</h1>
          <p className="text-gray-600 mb-6">
            Məhsulunuz hələ aktivləşdirilməyib. Administrator tərəfindən aktivləşdirildikdən sonra istifadə edə bilərsiniz.
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
