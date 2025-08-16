import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CurrentProduct, StoreData, ProductData, ProductTypeInfo, ComparisonResult } from '@/types'

// ユーザーIDベースのストレージキーを生成
const getUserStorageKey = () => {
  if (typeof window === 'undefined') return 'price-comparison-storage'
  
  // AuthProviderのユーザー情報を取得
  const authData = localStorage.getItem('sb-lkrndvcoyvvycyybuncp-auth-token')
  if (authData) {
    try {
      const auth = JSON.parse(authData)
      const userId = auth?.user?.id
      if (userId) {
        return `price-comparison-storage-${userId}`
      }
    } catch (error) {
      console.warn('Failed to parse auth data:', error)
    }
  }
  
  // フォールバック: 匿名ユーザー用
  return 'price-comparison-storage-anonymous'
}

interface AppState {
  // User management
  currentUserId: string | null
  setCurrentUserId: (userId: string | null) => void
  clearUserData: () => void

  // Current product being compared
  currentProduct: CurrentProduct
  setCurrentProduct: (product: Partial<CurrentProduct>) => void
  resetCurrentProduct: () => void

  // Product types
  productTypes: ProductTypeInfo[]
  setProductTypes: (types: ProductTypeInfo[]) => void

  // Cross-component intents
  productAddPrefill: Partial<ProductData> | null
  setProductAddPrefill: (prefill: Partial<ProductData> | null) => void

  // Legacy stores/products for comparison logic (fed from Supabase hooks)
  legacyStores: StoreData[]
  legacyProducts: ProductData[]
  setLegacyStores: (stores: StoreData[]) => void
  setLegacyProducts: (products: ProductData[]) => void

  // Utility methods (now work with legacy data for comparison)
  getProductsByType: (type: string) => ProductData[]
  getCheapestProductByType: (type: string) => ProductData | null
  getComparisonResult: () => ComparisonResult | null
}

const defaultCurrentProduct: CurrentProduct = {
  type: 'toilet_paper',
  name: '',
  quantity: 0,
  unit: 'm',
  count: 1,
  price: 0,
  unitPrice: 0
}

// 利用可能な単位
export const availableUnits = [
  // 長さ
  { value: 'm', label: 'メートル', category: 'length' },
  { value: 'cm', label: 'センチメートル', category: 'length' },
  { value: 'mm', label: 'ミリメートル', category: 'length' },
  
  // 重さ
  { value: 'kg', label: 'キログラム', category: 'weight' },
  { value: 'g', label: 'グラム', category: 'weight' },
  
  // 容量
  { value: 'L', label: 'リットル', category: 'volume' },
  { value: 'ml', label: 'ミリリットル', category: 'volume' },
  
  // 個数
  { value: '個', label: '個', category: 'count' },
  { value: '枚', label: '枚', category: 'count' },
  { value: 'ロール', label: 'ロール', category: 'count' },
  { value: '箱', label: '箱', category: 'count' },
  { value: '袋', label: '袋', category: 'count' }
]

const defaultProductTypes: ProductTypeInfo[] = [
  { 
    value: 'toilet_paper', 
    label: 'トイレットペーパー', 
    defaultUnit: 'm',
    allowedUnits: ['m', 'cm', 'ロール', '個']
  },
  { 
    value: 'wrap', 
    label: 'ラップ', 
    defaultUnit: 'm',
    allowedUnits: ['m', 'cm', '個']
  },
  { 
    value: 'tissue', 
    label: 'ティッシュペーパー', 
    defaultUnit: '箱',
    allowedUnits: ['箱', '個']
  },
  { 
    value: 'detergent', 
    label: '洗剤', 
    defaultUnit: 'ml',
    allowedUnits: ['ml', 'L', 'g', 'kg']
  },
  { 
    value: 'shampoo', 
    label: 'シャンプー', 
    defaultUnit: 'ml',
    allowedUnits: ['ml', 'L']
  },
  { 
    value: 'rice', 
    label: 'お米', 
    defaultUnit: 'kg',
    allowedUnits: ['kg', 'g']
  },
  { 
    value: 'oil', 
    label: '食用油', 
    defaultUnit: 'ml',
    allowedUnits: ['ml', 'L']
  },
  { 
    value: 'milk', 
    label: '牛乳', 
    defaultUnit: 'ml',
    allowedUnits: ['ml', 'L']
  },
  { 
    value: 'bread', 
    label: 'パン', 
    defaultUnit: '枚',
    allowedUnits: ['枚', '個', 'g', 'kg']
  },
  { 
    value: 'eggs', 
    label: '卵', 
    defaultUnit: '個',
    allowedUnits: ['個', 'kg', 'g']
  }
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User management
      currentUserId: null,
      setCurrentUserId: (userId) => {
        const { currentUserId } = get()
        if (currentUserId !== userId) {
          // ユーザーが変わった場合、すべてのデータをクリア
          set({
            currentUserId: userId,
            stores: [],
            products: [],
            currentProduct: defaultCurrentProduct,
            productAddPrefill: {}
          })
        }
      },
      clearUserData: () => set({
        currentUserId: null,
        legacyStores: [],
        legacyProducts: [],
        currentProduct: defaultCurrentProduct,
        productAddPrefill: null
      }),

      // Current product
      currentProduct: defaultCurrentProduct,
      setCurrentProduct: (product) =>
        set((state) => {
          const updated = { ...state.currentProduct, ...product }
          
          // If product type changed, update unit to default
          if ('type' in product) {
            const productType = state.productTypes.find(pt => pt.value === product.type)
            if (productType) {
              updated.unit = productType.defaultUnit
            }
          }
          
          // Recalculate unit price if quantity, count, or price changed
          if ('quantity' in product || 'count' in product || 'price' in product) {
            const { quantity, count, price } = updated
            updated.unitPrice = quantity > 0 && price > 0 
              ? Math.round((price / (quantity * count)) * 100) / 100
              : 0
          }
          
          return { currentProduct: updated }
        }),
      resetCurrentProduct: () => set({ currentProduct: defaultCurrentProduct }),

      // Product types
      productTypes: defaultProductTypes,
      setProductTypes: (productTypes) => set({ productTypes }),

      // Legacy stores/products (for comparison logic only)
      legacyStores: [],
      legacyProducts: [],
      setLegacyStores: (stores) => set({ legacyStores: stores }),
      setLegacyProducts: (products) => set({ legacyProducts: products }),

      // Cross-component intents
      productAddPrefill: null,
      setProductAddPrefill: (prefill) => set({ productAddPrefill: prefill }),

      // Utility methods (work with legacy data from Supabase)
      getProductsByType: (type: string) => {
        const { legacyProducts } = get()
        return legacyProducts.filter((product) => product.type === type)
      },

      getCheapestProductByType: (type: string) => {
        const { getProductsByType } = get()
        const products = getProductsByType(type)
        if (products.length === 0) return null
        
        return products.reduce((cheapest, current) => 
          current.unitPrice < cheapest.unitPrice ? current : cheapest
        )
      },

      getComparisonResult: (): ComparisonResult | null => {
        const { currentProduct, getCheapestProductByType, legacyStores } = get()
        
        if (currentProduct.unitPrice === 0) return null
        
        const cheapestProduct = getCheapestProductByType(currentProduct.type)
        if (!cheapestProduct) return null
        
        const cheapestUnitPrice = cheapestProduct.unitPrice
        const store = legacyStores.find(s => s.id === cheapestProduct.storeId)
        
        const savings = cheapestUnitPrice - currentProduct.unitPrice
        const savingsPercent = Math.abs((savings / cheapestUnitPrice) * 100)
        
        return {
          cheapestRegular: {
            id: cheapestProduct.id!,
            name: cheapestProduct.name,
            storeName: store?.name || '不明な店舗',
            unitPrice: cheapestUnitPrice,
            quantity: cheapestProduct.quantity,
            count: cheapestProduct.count,
            price: cheapestProduct.price
          },
          savings,
          savingsPercent,
          isCurrentCheaper: savings >= 0
        }
      }
    }),
    {
      name: getUserStorageKey(),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        currentProduct: state.currentProduct,
        productAddPrefill: state.productAddPrefill
        // Note: legacyStores and legacyProducts are not persisted - they come from Supabase
      }),
      // ユーザー切り替え時にストレージを再初期化
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 認証状態が変わった場合、ストレージキーを再確認
          const currentKey = getUserStorageKey()
          if (currentKey !== state.name) {
            // ストレージキーが変わった場合、データをクリア
            localStorage.removeItem(state.name || 'price-comparison-storage')
          }
        }
      }
    }
  )
)