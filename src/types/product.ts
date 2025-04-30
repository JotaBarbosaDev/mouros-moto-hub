
export type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Único';

export type ProductType = 'T-Shirt' | 'Caneca' | 'Boné' | 'Pin' | 'Patch' | 'Adesivo' | 'Outro';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  size?: ProductSize;
  color?: string;
  type: ProductType;
  imageUrl?: string;
  membersOnly: boolean;
  publishedOnLandingPage: boolean;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}
