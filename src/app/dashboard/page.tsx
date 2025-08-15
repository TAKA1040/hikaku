'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Header } from '@/components/dashboard/Header'
import { CurrentProductForm } from '@/components/dashboard/CurrentProductForm'
import { ComparisonResult } from '@/components/dashboard/ComparisonResult'
import { StoreManagement } from '@/components/dashboard/StoreManagement'
import { ProductManagement } from '@/components/dashboard/ProductManagement'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Current Product Section */}
          <div className="space-y-6">
            <CurrentProductForm />
            <ComparisonResult />
          </div>

          {/* Management Sections */}
          <div className="grid gap-8 lg:grid-cols-2">
            <StoreManagement />
            <ProductManagement />
          </div>
        </div>
      </main>
      
      {/* Help Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="card bg-blue-50 border-blue-200">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-blue-800">使い方ガイド</h3>
            <div className="grid gap-4 md:grid-cols-3 text-sm text-blue-700">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mx-auto">1</div>
                <p><strong>店舗を追加</strong></p>
                <p>よく行く店舗を登録します</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mx-auto">2</div>
                <p><strong>商品を登録</strong></p>
                <p>いつも買う商品の価格を登録</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mx-auto">3</div>
                <p><strong>価格を比較</strong></p>
                <p>店頭で商品情報を入力して比較</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}