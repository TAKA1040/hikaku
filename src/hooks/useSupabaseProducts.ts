'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase'
import { ProductData } from '@/types'

export function useSupabaseProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = getSupabaseClient()

  // 商品一覧を取得（店舗情報も含む）
  const fetchProducts = useCallback(async () => {
    if (!user) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores!inner(
            id,
            name,
            location
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // データ変換（ProductData形式に合わせる）
      interface SupabaseProduct {
        id: string
        store_id: string
        product_type: string
        name: string | null
        quantity: number
        count: number
        price: number
        unit: string | null
      }
      
      const transformedProducts: ProductData[] = (data || []).map((item: SupabaseProduct) => ({
        id: item.id,
        storeId: item.store_id,
        productType: item.product_type,
        name: item.name || '',
        quantity: Number(item.quantity),
        count: Number(item.count),
        price: Number(item.price),
        unit: item.unit || 'm'
      }))

      setProducts(transformedProducts)
      setError(null)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // 商品を追加
  const addProduct = async (productData: Omit<ProductData, 'id' | 'unitPrice'>) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          user_id: user.id,
          store_id: productData.storeId,
          product_type: productData.productType,
          name: productData.name || null,
          quantity: productData.quantity,
          unit: productData.unit,
          count: productData.count,
          price: productData.price
        }])
        .select()
        .single()

      if (error) throw error

      await fetchProducts() // リスト更新
      return data
    } catch (err) {
      console.error('Error adding product:', err)
      setError(err instanceof Error ? err.message : 'Failed to add product')
      return null
    }
  }

  // 商品を更新
  const updateProduct = async (id: string, updates: Partial<ProductData>) => {
    if (!user) return null

    try {
      // ProductData形式からデータベース形式に変換
      const dbUpdates: Record<string, unknown> = {}
      if (updates.storeId !== undefined) dbUpdates.store_id = updates.storeId
      if (updates.productType !== undefined) dbUpdates.product_type = updates.productType
      if (updates.name !== undefined) dbUpdates.name = updates.name || null
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity
      if (updates.unit !== undefined) dbUpdates.unit = updates.unit
      if (updates.count !== undefined) dbUpdates.count = updates.count
      if (updates.price !== undefined) dbUpdates.price = updates.price

      const { data, error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id) // セキュリティ: 自分の商品のみ更新可能
        .select()
        .single()

      if (error) throw error

      await fetchProducts() // リスト更新
      return data
    } catch (err) {
      console.error('Error updating product:', err)
      setError(err instanceof Error ? err.message : 'Failed to update product')
      return null
    }
  }

  // 商品を削除
  const deleteProduct = async (id: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // セキュリティ: 自分の商品のみ削除可能

      if (error) throw error

      await fetchProducts() // リスト更新
      return true
    } catch (err) {
      console.error('Error deleting product:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      return false
    }
  }

  // 商品タイプ別の最安商品を取得
  const getCheapestProductByType = (productType: string): ProductData | null => {
    const typeProducts = products.filter(p => p.productType === productType)
    if (typeProducts.length === 0) return null
    
    return typeProducts.reduce((cheapest, current) => {
      const currentUnitPrice = current.quantity > 0 ? (current.price / (current.quantity * current.count)) : 0
      const cheapestUnitPrice = cheapest.quantity > 0 ? (cheapest.price / (cheapest.quantity * cheapest.count)) : 0
      return currentUnitPrice < cheapestUnitPrice ? current : cheapest
    })
  }

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getCheapestProductByType,
    refreshProducts: fetchProducts
  }
}