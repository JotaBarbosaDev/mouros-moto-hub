
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unitOfMeasure: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryLog {
  id: string;
  inventoryId: string;
  previousQuantity: number;
  newQuantity: number;
  changeReason?: string;
  userId: string;
  createdAt: Date;
}

export const useInventory = () => {
  const queryClient = useQueryClient();

  // Fetch all inventory items
  const getInventoryItems = async (): Promise<InventoryItem[]> => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o inventário.',
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
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  };

  // Create a new inventory item
  const createInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> => {
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        name: itemData.name,
        quantity: itemData.quantity,
        unit_of_measure: itemData.unitOfMeasure
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o item de inventário.',
        variant: 'destructive',
      });
      throw error;
    }

    // Log the inventory creation
    await supabase
      .from('inventory_log')
      .insert({
        inventory_id: data.id,
        previous_quantity: 0,
        new_quantity: data.quantity,
        change_reason: 'Item criado'
      });

    toast({
      title: 'Sucesso',
      description: 'Item de inventário criado com sucesso.',
    });

    return {
      id: data.id,
      name: data.name,
      quantity: data.quantity,
      unitOfMeasure: data.unit_of_measure,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  // Update an inventory item
  const updateInventoryItem = async (itemData: InventoryItem): Promise<InventoryItem> => {
    // First get current quantity
    const { data: currentItem, error: fetchError } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('id', itemData.id)
      .single();

    if (fetchError) {
      toast({
        title: 'Erro',
        description: 'Não foi possível obter os dados atuais do item.',
        variant: 'destructive',
      });
      throw fetchError;
    }

    // Update the item
    const { data, error } = await supabase
      .from('inventory')
      .update({
        name: itemData.name,
        quantity: itemData.quantity,
        unit_of_measure: itemData.unitOfMeasure
      })
      .eq('id', itemData.id)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o item de inventário.',
        variant: 'destructive',
      });
      throw error;
    }

    // Log the inventory update if quantity changed
    if (currentItem.quantity !== itemData.quantity) {
      await supabase
        .from('inventory_log')
        .insert({
          inventory_id: data.id,
          previous_quantity: currentItem.quantity,
          new_quantity: data.quantity,
          change_reason: 'Atualização manual'
        });
    }

    toast({
      title: 'Sucesso',
      description: 'Item de inventário atualizado com sucesso.',
    });

    return {
      id: data.id,
      name: data.name,
      quantity: data.quantity,
      unitOfMeasure: data.unit_of_measure,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  // Delete an inventory item
  const deleteInventoryItem = async (itemId: string): Promise<void> => {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o item de inventário.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Item de inventário excluído com sucesso.',
    });
  };

  // Get inventory logs for an item
  const getInventoryLogs = async (inventoryId: string): Promise<InventoryLog[]> => {
    const { data, error } = await supabase
      .from('inventory_log')
      .select('*')
      .eq('inventory_id', inventoryId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico do inventário.',
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
      createdAt: new Date(log.created_at)
    }));
  };

  // Link inventory item to bar product
  const linkToBarProduct = async (inventoryId: string, barProductId: string): Promise<void> => {
    const { error } = await supabase
      .from('bar_products')
      .update({
        inventory_id: inventoryId
      })
      .eq('id', barProductId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível vincular o item ao produto do bar.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Item vinculado ao produto do bar com sucesso.',
    });
  };

  // React Query hooks
  const inventoryQuery = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryItems
  });

  const createItemMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: updateInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  const getLogsQuery = (inventoryId: string) => {
    return useQuery({
      queryKey: ['inventoryLogs', inventoryId],
      queryFn: () => getInventoryLogs(inventoryId),
      enabled: !!inventoryId
    });
  };

  const linkToBarProductMutation = useMutation({
    mutationFn: ({inventoryId, barProductId}: {inventoryId: string, barProductId: string}) => 
      linkToBarProduct(inventoryId, barProductId),
    onSuccess: () => {
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
    getLogsQuery,
    linkToBarProduct: linkToBarProductMutation.mutate
  };
};
