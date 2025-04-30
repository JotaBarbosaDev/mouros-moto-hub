
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  unitOfMeasure: string; // Un, g, Kg, L, etc.
  stock: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  unitOfMeasure: string;
  imageUrl?: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  seller: string;
  sellerId: string;
  timestamp: Date;
  total: number;
  amountPaid: number;
  change: number;
}
