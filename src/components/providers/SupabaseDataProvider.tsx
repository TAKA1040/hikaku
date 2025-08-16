'use client'

import { useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { useSupabaseStores } from '@/hooks/useSupabaseStores'
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts'
import { useAppStore } from '@/store/useAppStore'

export function SupabaseDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { stores } = useSupabaseStores()
  const { products } = useSupabaseProducts()
  const { setLegacyStores, setLegacyProducts } = useAppStore()

  // Supabaseから取得したデータをlegacyストアに同期
  useEffect(() => {
    if (user) {
      setLegacyStores(stores)
      setLegacyProducts(products)
    } else {
      // ユーザーがログアウトした場合はクリア
      setLegacyStores([])
      setLegacyProducts([])
    }
  }, [user, stores, products, setLegacyStores, setLegacyProducts])

  return <>{children}</>
}