import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CurrentProduct, StoreData, ProductData, ProductTypeInfo, ComparisonResult } from '@/types'

interface AppState {
  // Current product being compared
  currentProduct: CurrentProduct
  setCurrentProduct: (product: Partial<CurrentProduct>) => void
  resetCurrentProduct: () => void

  // Product types
  productTypes: ProductTypeInfo[]
  setProductTypes: (types: ProductTypeInfo[]) => void

  // Stores
  stores: StoreData[]
  setStores: (stores: StoreData[]) => void
  addStore: (store: StoreData) => void
  updateStore: (id: string, store: Partial<StoreData>) => void
  removeStore: (id: string) => void

  // Products
  products: ProductData[]
  setProducts: (products: ProductData[]) => void
  addProduct: (product: ProductData) => void
  updateProduct: (id: string, product: Partial<ProductData>) => void
  removeProduct: (id: string) => void

  // Cross-component intents
  productAddPrefill: Partial<ProductData> | null
  setProductAddPrefill: (prefill: Partial<ProductData> | null) => void

  // Utility methods
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

      // Stores
      stores: [],
      setStores: (stores) => set({ stores }),
      addStore: (store) =>
        set((state) => ({
          stores: [...state.stores, { ...store, id: store.id || crypto.randomUUID() }]
        })),
      updateStore: (id, storeUpdate) =>
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === id ? { ...store, ...storeUpdate } : store
          )
        })),
      removeStore: (id) =>
        set((state) => ({
          stores: state.stores.filter((store) => store.id !== id),
          products: state.products.filter((product) => product.storeId !== id)
        })),

      // Products
      products: [],
      setProducts: (products) => set({ products }),
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, { ...product, id: product.id || crypto.randomUUID() }]
        })),
      updateProduct: (id, productUpdate) =>
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id === id) {
              const updated = { ...product, ...productUpdate }
              // Recalculate unit price if needed
              if ('quantity' in productUpdate || 'count' in productUpdate || 'price' in productUpdate) {
                const { quantity, count, price } = updated
                // Add unit price calculation here if needed by UI
              }
              return updated
            }
            return product
          })
        })),
      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id)
        })),

      // Cross-component intents
      productAddPrefill: null,
      setProductAddPrefill: (prefill) => set({ productAddPrefill: prefill }),

      // Utility methods
      getProductsByType: (type: string) => {
        const { products } = get()
        return products.filter((product) => product.productType === type)
      },

      getCheapestProductByType: (type: string) => {
        const { getProductsByType } = get()
        const products = getProductsByType(type)
        if (products.length === 0) return null
        
        return products.reduce((cheapest, current) => {
          const currentUnitPrice = current.price / (current.quantity * current.count)
          const cheapestUnitPrice = cheapest.price / (cheapest.quantity * cheapest.count)
          return currentUnitPrice < cheapestUnitPrice ? current : cheapest
        })
      },

      getComparisonResult: (): ComparisonResult | null => {
        const { currentProduct, getCheapestProductByType, stores } = get()
        
        if (currentProduct.unitPrice === 0) return null
        
        const cheapestProduct = getCheapestProductByType(currentProduct.type)
        if (!cheapestProduct) return null
        
        const cheapestUnitPrice = cheapestProduct.price / (cheapestProduct.quantity * cheapestProduct.count)
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
          isCurrentCheaper: savings > 0
        }
      }
    }),
    {
      name: 'price-comparison-storage',
      partialize: (state) => ({
        stores: state.stores,
        products: state.products,
        currentProduct: state.currentProduct,
        productAddPrefill: state.productAddPrefill
      })
    }
  )
)