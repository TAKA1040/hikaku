export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_types: {
        Row: {
          id: string
          value: string
          label: string
          unit: string
          allowed_units: string[] // JSONB array of allowed units
          default_unit: string
          user_id: string | null // NULL for global types, user ID for custom types
          created_at: string
        }
        Insert: {
          id?: string
          value: string
          label: string
          unit: string
          allowed_units: string[]
          default_unit: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          value?: string
          label?: string
          unit?: string
          allowed_units?: string[]
          default_unit?: string
          user_id?: string | null
          created_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          user_id: string
          name: string
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          store_id: string
          product_type: string
          name: string | null
          quantity: number
          count: number
          price: number
          unit_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          store_id: string
          product_type: string
          name?: string | null
          quantity: number
          count?: number
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          store_id?: string
          product_type?: string
          name?: string | null
          quantity?: number
          count?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      price_comparisons: {
        Row: {
          id: string
          user_id: string
          product_type: string
          current_product_name: string | null
          current_quantity: number
          current_count: number
          current_price: number
          current_unit_price: number
          compared_product_id: string | null
          is_current_cheaper: boolean
          savings_amount: number
          savings_percent: number
          location: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_type: string
          current_product_name?: string | null
          current_quantity: number
          current_count?: number
          current_price: number
          current_unit_price: number
          compared_product_id?: string | null
          is_current_cheaper: boolean
          savings_amount: number
          savings_percent: number
          location?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_type?: string
          current_product_name?: string | null
          current_quantity?: number
          current_count?: number
          current_price?: number
          current_unit_price?: number
          compared_product_id?: string | null
          is_current_cheaper?: boolean
          savings_amount?: number
          savings_percent?: number
          location?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          default_currency: string
          decimal_places: number
          theme: string
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          default_currency?: string
          decimal_places?: number
          theme?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          default_currency?: string
          decimal_places?: number
          theme?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_cheapest_products: {
        Row: {
          user_id: string
          product_type: string
          product_id: string
          name: string | null
          store_name: string
          quantity: number
          count: number
          price: number
          unit_price: number
        }
      }
      user_comparison_stats: {
        Row: {
          user_id: string
          total_comparisons: number
          good_deals_found: number
          avg_savings_percent: number | null
          total_potential_savings: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProductType = Database['public']['Tables']['product_types']['Row']
export type Store = Database['public']['Tables']['stores']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type PriceComparison = Database['public']['Tables']['price_comparisons']['Row']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type StoreInsert = Database['public']['Tables']['stores']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type PriceComparisonInsert = Database['public']['Tables']['price_comparisons']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type StoreUpdate = Database['public']['Tables']['stores']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']