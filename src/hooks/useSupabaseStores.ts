'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createBrowserClient } from '@supabase/ssr'
import { StoreData } from '@/types'

export function useSupabaseStores() {
  const { user } = useAuth()
  const [stores, setStores] = useState<StoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 店舗一覧を取得
  const fetchStores = async () => {
    if (!user) {
      setStores([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      setStores(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching stores:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stores')
    } finally {
      setLoading(false)
    }
  }

  // 店舗を追加
  const addStore = async (storeData: Omit<StoreData, 'id'>) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('stores')
        .insert([{
          ...storeData,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error

      await fetchStores() // リスト更新
      return data
    } catch (err) {
      console.error('Error adding store:', err)
      setError(err instanceof Error ? err.message : 'Failed to add store')
      return null
    }
  }

  // 店舗を更新
  const updateStore = async (id: string, updates: Partial<StoreData>) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // セキュリティ: 自分の店舗のみ更新可能
        .select()
        .single()

      if (error) throw error

      await fetchStores() // リスト更新
      return data
    } catch (err) {
      console.error('Error updating store:', err)
      setError(err instanceof Error ? err.message : 'Failed to update store')
      return null
    }
  }

  // 店舗を削除
  const deleteStore = async (id: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // セキュリティ: 自分の店舗のみ削除可能

      if (error) throw error

      await fetchStores() // リスト更新
      return true
    } catch (err) {
      console.error('Error deleting store:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete store')
      return false
    }
  }

  useEffect(() => {
    fetchStores()
  }, [user])

  return {
    stores,
    loading,
    error,
    addStore,
    updateStore,
    deleteStore,
    refreshStores: fetchStores
  }
}