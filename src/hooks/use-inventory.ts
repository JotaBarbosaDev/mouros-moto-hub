import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem, InventoryLog, InventoryCategory, InventoryUseType } from '@/types/inventory';

export type { InventoryItem, InventoryLog };

export interface CreateInventoryItemDto {
  name: string;
  quantity: number;
  unitOfMeasure: string;
  category: InventoryCategory;
  useType: InventoryUseType;
  imageUrl?: string;
}

export const useInventory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all inventory items
  const getInventoryItems = async (): Promise<InventoryItem[]> => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens do inventário.',
        variant: 'destructive',
      });
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitOfMeasure: item.unit_of_measure,
      category: item.category as InventoryCategory,
      useType: item.use_type as InventoryUseType,
      imageUrl: item.image_url,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  };

  // Create new inventory item
  const createInventoryItem = async (item: CreateInventoryItemDto): Promise<InventoryItem> => {
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        name: item.name,
        quantity: item.quantity,
        unit_of_measure: item.unitOfMeasure,
        category: item.category,
        use_type: item.useType,
        image_url: item.imageUrl,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o item ao inventário.',
        variant: 'destructive',
      });
      throw error;
    }
    
    // If the item is for bar use, create a bar product
    if (item.useType === 'Bar') {
      try {
        await supabase
          .from('bar_products')
          .insert({
            name: item.name,
            price: 0, // Default price, to be updated later
            stock: item.quantity,
            unit_of_measure: item.unitOfMeasure,
            description: `Produto automático de ${item.category.toLowerCase()}`,
            image_url: item.imageUrl,
            inventory_id: data.id
          });
      } catch (err) {
        console.error('Error creating bar product:', err);
        // Don't throw, just log the error as the inventory item was created
      }
    }

    toast({
      title: 'Sucesso',
      description: 'Item adicionado ao inventário com sucesso.',
    });

    return {
      id: data.id,
      name: data.name,
      quantity: data.quantity,
      unitOfMeasure: data.unit_of_measure,
      category: data.category as InventoryCategory,
      useType: data.use_type as InventoryUseType,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  };

  // Update inventory item
  const updateInventoryItem = async (item: InventoryItem): Promise<InventoryItem> => {
    const previousItem = await supabase
      .from('inventory')
      .select('quantity')
      .eq('id', item.id)
      .single();
    
    const previousQuantity = previousItem.data?.quantity || 0;
    
    const { data, error } = await supabase
      .from('inventory')
      .update({
        name: item.name,
        quantity: item.quantity,
        unit_of_measure: item.unitOfMeasure,
        category: item.category,
        use_type: item.useType,
        image_url: item.imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o item do inventário.',
        variant: 'destructive',
      });
      throw error;
    }

    // Log quantity change if it's different
    if (previousQuantity !== item.quantity) {
      try {
        await supabase
          .from('inventory_log')
          .insert({
            inventory_id: item.id,
            previous_quantity: previousQuantity,
            new_quantity: item.quantity,
            change_reason: 'Atualização manual',
          });
      } catch (logError) {
        console.error('Error logging inventory change:', logError);
      }
      
      // Update related bar product if this item has one
      try {
        const { data: barProductData } = await supabase
          .from('bar_products')
          .select('id')
          .eq('inventory_id', item.id)
          .maybeSingle();
          
        if (barProductData) {
          await supabase
            .from('bar_products')
            .update({ 
              stock: item.quantity,
              name: item.name,
              unit_of_measure: item.unitOfMeasure,
              image_url: item.imageUrl
            })
            .eq('id', barProductData.id);
        } else if (item.useType === 'Bar') {
          // Create bar product if it doesn't exist and item is for bar use
          await supabase
            .from('bar_products')
            .insert({
              name: item.name,
              price: 0, // Default price, to be updated later
              stock: item.quantity,
              unit_of_measure: item.unitOfMeasure,
              description: `Produto automático de ${item.category.toLowerCase()}`,
              image_url: item.imageUrl,
              inventory_id: item.id
            });
        }
      } catch (barError) {
        console.error('Error updating bar product:', barError);
      }
    }

    toast({
      title: 'Sucesso',
      description: 'Item atualizado com sucesso.',
    });

    return {
      id: data.id,
      name: data.name,
      quantity: data.quantity,
      unitOfMeasure: data.unit_of_measure,
      category: data.category as InventoryCategory,
      useType: data.use_type as InventoryUseType,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  };

  // Delete inventory item
  const deleteInventoryItem = async (id: string): Promise<void> => {
    // Check if there's a related bar product
    const { data: barProductData } = await supabase
      .from('bar_products')
      .select('id')
      .eq('inventory_id', id)
      .maybeSingle();
      
    if (barProductData) {
      // Delete related bar product
      await supabase
        .from('bar_products')
        .delete()
        .eq('id', barProductData.id);
    }
    
    // Delete inventory item
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível eliminar o item do inventário.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Item eliminado com sucesso.',
    });
  };

  // Get logs for a specific inventory item
  const getInventoryLogs = async (inventoryId: string): Promise<InventoryLog[]> => {
    const { data, error } = await supabase
      .from('inventory_log')
      .select('*')
      .eq('inventory_id', inventoryId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico do item.',
        variant: 'destructive',
      });
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(log => ({
      id: log.id,
      inventoryId: log.inventory_id,
      previousQuantity: log.previous_quantity,
      newQuantity: log.new_quantity,
      changeReason: log.change_reason,
      userId: log.user_id,
      createdAt: log.created_at,
    }));
  };

  // React Query hooks
  const inventoryQuery = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryItems
  });

  const getLogsQuery = (inventoryId: string) => useQuery({
    queryKey: ['inventoryLogs', inventoryId],
    queryFn: () => getInventoryLogs(inventoryId),
    enabled: !!inventoryId
  });

  const createItemMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['barProducts'] });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: updateInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['barProducts'] });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['barProducts'] });
    }
  });

  return {
    items: inventoryQuery.data || [],
    isLoading: inventoryQuery.isLoading,
    isError: inventoryQuery.isError,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    getLogsQuery
  };
};
