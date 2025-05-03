
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  unitOfMeasure: string;
  imageUrl: string;
  stock: number;
  minStock?: number;
  inventoryId?: string; // Add inventoryId property
}

export interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  unitOfMeasure: string;
  imageUrl: string;
}

export interface Sale {
  id: string;
  timestamp: Date;
  sellerId: string;
  seller: string;
  total: number;
  amountPaid: number;
  change: number;
  items: SaleItem[];
}

export interface User {
  id: string;
  name: string;
}
