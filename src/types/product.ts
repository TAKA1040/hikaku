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
  value: string;
  label: string;
  unit: string;
}

export interface ComparisonResult {
  cheapestRegular: Product;
  savings: number;
  savingsPercent: number;
  isCurrentCheaper: boolean;
}