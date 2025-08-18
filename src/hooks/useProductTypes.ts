import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ProductTypeInfo } from '@/types'
import { Database, ProductType } from '@/types/database'
import type { User } from '@supabase/auth-helpers-nextjs'

// Mapping for basic 4 product types (global, user_id = null)
const BASIC_PRODUCT_TYPE_EXTENSIONS: Record<string, { allowedUnits: string[], defaultUnit: string }> = {
  'wrap': { allowedUnits: ['m', 'cm', '個'], defaultUnit: 'm' },
  'toilet_paper': { allowedUnits: ['m', 'cm', 'ロール', '個'], defaultUnit: 'm' },
  'tissue': { allowedUnits: ['箱', '個'], defaultUnit: '箱' },
  'detergent': { allowedUnits: ['ml', 'L', 'g', 'kg'], defaultUnit: 'ml' }
}

export function useProductTypes() {
  const [productTypes, setProductTypes] = useState<ProductTypeInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  const supabase = createClientComponentClient<Database>()
  
  // Get current user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Convert database ProductType to frontend ProductTypeInfo
  const convertToProductTypeInfo = (dbType: ProductType): ProductTypeInfo => {
    // For basic types, use predefined extensions
    const extensions = BASIC_PRODUCT_TYPE_EXTENSIONS[dbType.value] || {
      allowedUnits: ['個'], 
      defaultUnit: '個'
    }
    
    return {
      id: dbType.id,
      value: dbType.value,
      label: dbType.label,
      unit: dbType.unit, // Keep for backward compatibility
      allowedUnits: extensions.allowedUnits,
      defaultUnit: extensions.defaultUnit,
      userId: null, // Will be set properly based on database data when schema supports it
      createdAt: dbType.created_at
    }
  }

  const fetchProductTypes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentUser) {
        // If not logged in, only show basic 4 types + "その他"
        const basicTypes: ProductTypeInfo[] = [
          { value: 'wrap', label: 'ラップ', unit: 'm', allowedUnits: ['m', 'cm', '個'], defaultUnit: 'm', userId: null },
          { value: 'toilet_paper', label: 'トイレットペーパー', unit: 'ロール', allowedUnits: ['m', 'cm', 'ロール', '個'], defaultUnit: 'm', userId: null },
          { value: 'tissue', label: 'ティッシュペーパー', unit: '箱', allowedUnits: ['箱', '個'], defaultUnit: '箱', userId: null },
          { value: 'detergent', label: '洗剤', unit: 'ml', allowedUnits: ['ml', 'L', 'g', 'kg'], defaultUnit: 'ml', userId: null },
          { value: 'other', label: 'その他', unit: '個', allowedUnits: ['個'], defaultUnit: '個', userId: null }
        ]
        setProductTypes(basicTypes)
        setLoading(false)
        return
      }
      
      // For logged-in users: fetch global types + user-specific types
      const userIdPrefix = currentUser.id.substring(0, 8)
      
      const { data: allTypes, error: fetchError } = await supabase
        .from('product_types')
        .select('*')
        .order('label')
      
      if (fetchError) {
        throw fetchError
      }
      
      // Separate global and user-specific types
      const globalTypes = allTypes.filter(pt => 
        !pt.value.includes('_') || !pt.value.endsWith(`_${userIdPrefix}`)
      )
      
      const userTypes = allTypes.filter(pt => 
        pt.value.includes('_') && pt.value.endsWith(`_${userIdPrefix}`)
      )
      
      // Convert global types
      const convertedGlobalTypes = globalTypes.map(convertToProductTypeInfo)
      
      // Convert user-specific types (remove user ID suffix from value for frontend)
      const convertedUserTypes = userTypes.map(dbType => {
        const originalValue = dbType.value.replace(`_${userIdPrefix}`, '')
        return {
          id: dbType.id,
          value: originalValue,
          label: dbType.label,
          unit: dbType.unit,
          allowedUnits: ['個'], // Default, will be enhanced later
          defaultUnit: dbType.unit,
          userId: currentUser.id,
          createdAt: dbType.created_at
        } as ProductTypeInfo
      })
      
      // Combine global and user types, then add "その他" option
      const otherType: ProductTypeInfo = {
        value: 'other',
        label: 'その他',
        unit: '個',
        allowedUnits: ['個'],
        defaultUnit: '個',
        userId: null
      }
      
      setProductTypes([...convertedGlobalTypes, ...convertedUserTypes, otherType])
      
    } catch (err) {
      console.error('Error fetching product types:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // Fallback to basic 4 types
      const fallbackTypes: ProductTypeInfo[] = [
        { value: 'wrap', label: 'ラップ', unit: 'm', allowedUnits: ['m', 'cm', '個'], defaultUnit: 'm', userId: null },
        { value: 'toilet_paper', label: 'トイレットペーパー', unit: 'ロール', allowedUnits: ['m', 'cm', 'ロール', '個'], defaultUnit: 'm', userId: null },
        { value: 'tissue', label: 'ティッシュペーパー', unit: '箱', allowedUnits: ['箱', '個'], defaultUnit: '箱', userId: null },
        { value: 'detergent', label: '洗剤', unit: 'ml', allowedUnits: ['ml', 'L', 'g', 'kg'], defaultUnit: 'ml', userId: null },
        { value: 'other', label: 'その他', unit: '個', allowedUnits: ['個'], defaultUnit: '個', userId: null }
      ]
      
      setProductTypes(fallbackTypes)
    } finally {
      setLoading(false)
    }
  }

  const addProductType = async (newType: Omit<ProductTypeInfo, 'id' | 'createdAt'>) => {
    try {
      if (!currentUser) {
        throw new Error('ログインが必要です')
      }
      
      // Create user-specific product type value to ensure uniqueness
      // Format: originalValue_userId (first 8 chars)
      const userSpecificValue = `${newType.value}_${currentUser.id.substring(0, 8)}`
      
      const { data, error: insertError } = await supabase
        .from('product_types')
        .insert({
          value: userSpecificValue,
          label: newType.label,
          unit: newType.defaultUnit
        })
        .select()
        .single()
      
      if (insertError) {
        throw insertError
      }
      
      // Create frontend representation
      const userProductType: ProductTypeInfo = {
        id: data.id,
        value: newType.value, // Use original value for frontend
        label: newType.label,
        unit: newType.defaultUnit,
        allowedUnits: newType.allowedUnits,
        defaultUnit: newType.defaultUnit,
        userId: currentUser.id,
        createdAt: data.created_at
      }
      
      setProductTypes(prev => {
        // Remove "その他" temporarily, add new type, then re-add "その他"
        const withoutOther = prev.filter(pt => pt.value !== 'other')
        const otherType = prev.find(pt => pt.value === 'other')
        return [...withoutOther, userProductType, otherType!]
      })
      
      return userProductType
    } catch (err) {
      console.error('Error adding product type:', err)
      throw err
    }
  }

  useEffect(() => {
    if (currentUser !== null) { // Only fetch when user state is determined
      fetchProductTypes()
    }
  }, [currentUser]) // Re-fetch when user changes

  return {
    productTypes,
    loading,
    error,
    addProductType,
    refetch: fetchProductTypes
  }
}