import { z } from 'zod'

// Unit Type Schema
export const unitTypeSchema = z.object({
  value: z.string(),
  label: z.string(),
  category: z.string() // 'length', 'weight', 'volume', 'count'
})

export type UnitType = z.infer<typeof unitTypeSchema>

// Product Type Schema
export const productTypeSchema = z.object({
  value: z.string(),
  label: z.string(),
  defaultUnit: z.string(),
  allowedUnits: z.array(z.string())
})

export type ProductTypeInfo = z.infer<typeof productTypeSchema>

// Current Product Schema
export const currentProductSchema = z.object({
  type: z.string(),
  name: z.string().optional(),
  quantity: z.number().int().min(1),
  unit: z.string(),
  count: z.number().int().min(1).default(1),
  price: z.number().int().min(1),
  unitPrice: z.number().min(0)
})

export type CurrentProduct = z.infer<typeof currentProductSchema>

// Store Schema
export const storeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, '店舗名を入力してください'),
  location: z.string().optional(),
  notes: z.string().optional()
})

export type StoreData = z.infer<typeof storeSchema>

// Product Schema
export const productSchema = z.object({
  id: z.string().optional(),
  storeId: z.string(),
  productType: z.string(),
  name: z.string().optional(),
  quantity: z.number().int().min(1, '数量は1以上の整数を入力してください'),
  unit: z.string(),
  count: z.number().int().min(1, '入り数は1以上の整数を入力してください').default(1),
  price: z.number().int().min(1, '価格は1以上の整数を入力してください')
})

export type ProductData = z.infer<typeof productSchema>

// Comparison Result Interface
export interface ComparisonResult {
  cheapestRegular: {
    id: string
    name?: string
    storeName: string
    unitPrice: number
    quantity: number
    count: number
    price: number
  }
  savings: number
  savingsPercent: number
  isCurrentCheaper: boolean
}

// Auth User Interface
export interface AuthUser {
  id: string
  email: string | null
  fullName?: string
  avatarUrl?: string
}

// App State Interface
export interface AppState {
  user: AuthUser | null
  isLoading: boolean
  currentProduct: CurrentProduct
  stores: StoreData[]
  products: ProductData[]
  productTypes: ProductTypeInfo[]
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  message: string
  status?: number
  code?: string
}

// Form Validation Schemas
export const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください')
})

export const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  confirmPassword: z.string(),
  fullName: z.string().min(1, '氏名を入力してください')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword']
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

// Settings Schema
export const userSettingsSchema = z.object({
  defaultCurrency: z.string().default('JPY'),
  decimalPlaces: z.number().min(0).max(4).default(2),
  theme: z.enum(['light', 'dark']).default('light'),
  notificationsEnabled: z.boolean().default(true)
})

export type UserSettingsData = z.infer<typeof userSettingsSchema>