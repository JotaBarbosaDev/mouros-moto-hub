
export type InventoryCategory = 
  | 'Bebida' 
  | 'Comida' 
  | 'Roupa' 
  | 'Equipamento' 
  | 'Material Promocional'
  | 'Material de Limpeza'
  | 'Outro';

export type InventoryUseType = 
  | 'Bar' 
  | 'Loja' 
  | 'Limpeza' 
  | 'Eventos'
  | 'Brinde'
  | 'Outro';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unitOfMeasure: string;
  category: InventoryCategory;
  useType: InventoryUseType;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  inventoryId: string;
  previousQuantity: number;
  newQuantity: number;
  changeReason?: string;
  userId?: string;
  createdAt: string;
}
