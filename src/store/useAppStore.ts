import { create } from 'zustand'
import { CurrentProduct, StoreData, ProductData, ProductTypeInfo, ComparisonResult } from '@/types'

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

  // Stores and products data
  stores: StoreData[]
  products: ProductData[]
  setStores: (stores: StoreData[]) => void
  setProducts: (products: ProductData[]) => void
  addStore: (store: StoreData) => void
  updateStore: (id: string, updates: Partial<StoreData>) => void
  removeStore: (id: string) => void
  addProduct: (product: ProductData) => void
  updateProduct: (id: string, updates: Partial<ProductData>) => void
  removeProduct: (id: string) => void

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

export const useAppStore = create<AppState>()((set, get) => ({
  // User management
  currentUserId: null,
  setCurrentUserId: (userId) => {
    const { currentUserId } = get()
    if (currentUserId !== userId) {
      // ユーザーが変わった場合、すべてのデータをクリア
      const newState: Partial<AppState> = {
        currentUserId: userId,
        stores: [],
        products: [],
        legacyStores: [],
        legacyProducts: [],
        currentProduct: defaultCurrentProduct,
        productAddPrefill: null
      }
      
      set(newState)
    }
  },
  clearUserData: () => set({
    currentUserId: null,
    stores: [],
    products: [],
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

      // Stores and products data  
      stores: [],
      products: [],
      setStores: (stores) => set({ stores }),
      setProducts: (products) => set({ products }),
      addStore: (store) => set((state) => ({
        stores: [...state.stores, { ...store, id: store.id || crypto.randomUUID() }]
      })),
      updateStore: (id, updates) => set((state) => ({
        stores: state.stores.map(store => 
          store.id === id ? { ...store, ...updates } : store
        )
      })),
      removeStore: (id) => set((state) => ({
        stores: state.stores.filter(store => store.id !== id),
        products: state.products.filter(product => product.storeId !== id)
      })),
      addProduct: (product) => set((state) => ({
        products: [...state.products, { ...product, id: product.id || crypto.randomUUID() }]
      })),
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(product => 
          product.id === id ? { ...product, ...updates } : product
        )
      })),
      removeProduct: (id) => set((state) => ({
        products: state.products.filter(product => product.id !== id)
      })),

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
        const { products } = get()
        return products.filter((product) => product.productType === type)
      },

      getCheapestProductByType: (type: string) => {
        const { getProductsByType } = get()
        const products = getProductsByType(type)
        if (products.length === 0) return null
        
        return products.reduce((cheapest, current) => {
          const currentUnitPrice = current.quantity > 0 ? (current.price / (current.quantity * current.count)) : 0
          const cheapestUnitPrice = cheapest.quantity > 0 ? (cheapest.price / (cheapest.quantity * cheapest.count)) : 0
          return currentUnitPrice < cheapestUnitPrice ? current : cheapest
        })
      },

      getComparisonResult: (): ComparisonResult | null => {
        const { currentProduct, getCheapestProductByType, stores } = get()
        
        if (currentProduct.unitPrice === 0) return null
        
        const cheapestProduct = getCheapestProductByType(currentProduct.type)
        if (!cheapestProduct) return null
        
        const cheapestUnitPrice = cheapestProduct.quantity > 0 ? (cheapestProduct.price / (cheapestProduct.quantity * cheapestProduct.count)) : 0
        const store = stores.find(s => s.id === cheapestProduct.storeId)
        
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
    }))