import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem, InventoryLog } from '@/types/inventory';
import { inventoryService } from '@/services/inventory-service';
import type { CreateInventoryItemDto } from '@/services/inventory-service';

// Re-exportando os tipos para facilitar o uso em outros componentes
export type { InventoryItem, InventoryLog };
export { CreateInventoryItemDto };

export const useInventory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Busca todos os itens
  const getInventoryItems = async (): Promise<InventoryItem[]> => {
    try {
      return await inventoryService.getAll();
    } catch (error) {
      console.error('Erro ao buscar itens do inventário:', error);
      throw error;
    }
  };

  // Busca o histórico de um item específico
  const getInventoryLogs = async (inventoryId: string): Promise<InventoryLog[]> => {
    try {
      return await inventoryService.getHistory(inventoryId);
    } catch (error) {
      console.error('Erro ao buscar histórico de item:', error);
      throw error;
    }
  };

  // Hooks do React Query
  const inventoryQuery = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryItems
  });
  
  // Reagir a erros usando onSuccess/onError do React Query
  if (inventoryQuery.error) {
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar os itens do inventário.',
      variant: 'destructive'
    });
  }
  
  // Hook para usar logs de inventário
  const useInventoryItemLogs = (inventoryId: string) => {
    return useQuery({
      queryKey: ['inventoryLogs', inventoryId],
      queryFn: () => getInventoryLogs(inventoryId),
      enabled: !!inventoryId
    });
  };

  // Mutation para criar um item
  const createItemMutation = useMutation({
    mutationFn: async (item: CreateInventoryItemDto): Promise<InventoryItem> => {
      try {
        const result = await inventoryService.create(item);
        
        // Se o item for para uso no bar, devemos criar um produto de bar também (API separada)
        if (item.useType === 'Bar') {
          try {
            // Importação dinâmica para evitar dependência circular
            const { barProductService } = await import('@/services/bar-product-service');
            await barProductService.create({
              name: item.name,
              price: 0, // Preço padrão, a ser atualizado posteriormente
              stock: item.quantity,
              unitOfMeasure: item.unitOfMeasure,
              description: `Produto automático de ${item.category.toLowerCase()}`,
              imageUrl: item.imageUrl || '',
              minStock: 0, // Adicionando o campo minStock que é obrigatório
              inventoryId: result.id
            });
          } catch (err) {
            console.error('Error creating bar product:', err);
            // Não lançamos erro, pois o item do inventário foi criado com sucesso
          }
        }
        
        return result;
      } catch (error) {
        console.error('Erro ao criar item do inventário:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['barProducts'] });
      toast({
        title: 'Sucesso',
        description: 'Item adicionado ao inventário com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o item ao inventário.',
        variant: 'destructive',
      });
    }
  });

  // Mutation para atualizar um item
  const updateItemMutation = useMutation({
    mutationFn: async (item: InventoryItem): Promise<InventoryItem> => {
      try {
        // Obtemos o item atual para comparar a quantidade
        const currentItem = await inventoryService.getById(item.id);
        const previousQuantity = currentItem.quantity;
        
        // Atualiza o item no inventário
        const result = await inventoryService.update(item.id, item);
        
        // Se a quantidade mudou, atualizamos o produto de bar relacionado
        if (previousQuantity !== item.quantity) {
          try {
            // Importação dinâmica para evitar dependência circular
            const { barProductService } = await import('@/services/bar-product-service');
            
            // Verifica se existe um produto de bar relacionado
            const barProduct = await barProductService.getByInventoryId(item.id);
            
            if (barProduct) {
              // Atualiza o produto de bar existente
              await barProductService.update(barProduct.id, { 
                ...barProduct, // Mantém os dados existentes
                stock: item.quantity,
                name: item.name,
                unitOfMeasure: item.unitOfMeasure,
                imageUrl: item.imageUrl || ''
              });
            } else if (item.useType === 'Bar') {
              // Cria um produto de bar se não existir e o item for para uso no bar
              await barProductService.create({
                name: item.name,
                price: 0, // Preço padrão, a ser atualizado posteriormente
                stock: item.quantity,
                unitOfMeasure: item.unitOfMeasure,
                description: `Produto automático de ${item.category.toLowerCase()}`,
                imageUrl: item.imageUrl || '',
                minStock: 0, // Adicionando o campo minStock que é obrigatório
                inventoryId: item.id
              });
            }
          } catch (barError) {
            console.error('Error updating bar product:', barError);
          }
        }
        
        return result;
      } catch (error) {
        console.error('Erro ao atualizar item do inventário:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['barProducts'] });
      toast({
        title: 'Sucesso',
        description: 'Item atualizado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o item do inventário.',
        variant: 'destructive',
      });
    }
  });

  // Mutation para excluir um item
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        // Importação dinâmica para evitar dependência circular
        const { barProductService } = await import('@/services/bar-product-service');
        
        // Verifica se existe um produto de bar relacionado
        try {
          const barProduct = await barProductService.getByInventoryId(id);
          if (barProduct) {
            // Remove o produto de bar relacionado
            await barProductService.delete(barProduct.id);
          }
        } catch (barError) {
          console.error('Error checking/deleting bar product:', barError);
        }
        
        // Remove o item do inventário
        await inventoryService.delete(id);
      } catch (error) {
        console.error('Erro ao eliminar item do inventário:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['barProducts'] });
      toast({
        title: 'Sucesso',
        description: 'Item eliminado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível eliminar o item do inventário.',
        variant: 'destructive',
      });
    }
  });

  // Funções de wrapper para as mutations
  const createItem = async (
    item: CreateInventoryItemDto,
    options?: { onSuccess?: () => void }
  ): Promise<InventoryItem> => {
    const result = await createItemMutation.mutateAsync(item);
    if (options?.onSuccess) {
      options.onSuccess();
    }
    return result;
  };

  const updateItem = async (
    item: InventoryItem,
    options?: { onSuccess?: () => void }
  ): Promise<InventoryItem> => {
    const result = await updateItemMutation.mutateAsync(item);
    if (options?.onSuccess) {
      options.onSuccess();
    }
    return result;
  };

  const deleteItem = async (id: string): Promise<void> => {
    return deleteItemMutation.mutateAsync(id);
  };

  // Retorno do hook com todas as funcionalidades
  return {
    items: inventoryQuery.data || [],
    isLoading: inventoryQuery.isLoading,
    isError: inventoryQuery.isError,
    createItem,
    updateItem,
    deleteItem,
    // Função para obter logs, mantemos o nome conforme usado na aplicação
    getLogsQuery: useInventoryItemLogs,
    // Expondo as mutations para casos mais avançados
    createItemMutation,
    updateItemMutation,
    deleteItemMutation
  };
};
