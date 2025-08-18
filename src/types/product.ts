export interface Product {
  id: number;
  type: string;
  name: string;
  store?: string;
  quantity: string;
  count: string | number;
  price: string;
  unitPrice: number;
}

export interface ProductType {
  id?: string;
  value: string;
  label: string;
  unit: string; // Keep for backward compatibility
  allowedUnits: string[];
  defaultUnit: string;
  userId?: string | null; // For user-specific types
  createdAt?: string;
}

export interface ComparisonResult {
  cheapestRegular: Product;
  savings: number;
  savingsPercent: number;
  isCurrentCheaper: boolean;
}