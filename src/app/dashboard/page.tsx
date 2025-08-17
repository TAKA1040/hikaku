'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Header } from '@/components/dashboard/Header'
import { CurrentProductForm } from '@/components/dashboard/CurrentProductForm'
import { ComparisonResult } from '@/components/dashboard/ComparisonResult'
import { StoreManagement } from '@/components/dashboard/StoreManagement'
import { ProductManagement } from '@/components/dashboard/ProductManagement'
import Link from 'next/link'

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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-8">
          {/* Current Product Section */}
          <div className="space-y-6">
            <CurrentProductForm />
            <ComparisonResult />
          </div>

          {/* Management Sections */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
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
            <div className="grid gap-3 md:gap-4 md:grid-cols-3 text-base sm:text-sm text-blue-700">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mx-auto">1</div>
                <p><strong>店舗を追加（任意）</strong></p>
                <p>必要に応じて、よく行く店舗を登録します</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mx-auto">2</div>
                <p><strong>商品を登録（任意）</strong></p>
                <p>よく買う商品の価格を登録（未登録店舗はここで入力しても登録可能）</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mx-auto">3</div>
                <p><strong>価格を比較</strong></p>
                <p>店頭で商品情報を入力して比較（登録なしでもOK）</p>
              </div>
            </div>
            <p className="text-sm sm:text-xs text-blue-600">ツールの利用にはログインが必要です。ネット接続は初回ログインに必要で、ログイン済みならオフラインでも比較・ローカル保存が可能です（サーバー同期は現在未対応）。</p>
            <div className="pt-2">
              <Link href="/guide" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto text-center">
                詳しい使い方を見る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}