import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Product } from '@/types/bar';
import { barProductService } from '@/services/bar-product-service';

export const useBarProducts = () => {
  const queryClient = useQueryClient();

  // Fetch all bar products
  const getBarProducts = async (): Promise<Product[]> => {
    try {
      return await barProductService.getAll();
    } catch (error) {
      console.error('Erro ao buscar produtos do bar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos do bar.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Create a new bar product
  const createBarProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const product = await barProductService.create(productData);
      
      toast({
        title: 'Sucesso',
        description: 'Produto criado com sucesso.',
      });
      
      return product;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o produto.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update a bar product
  const updateBarProduct = async (productData: Product): Promise<Product> => {
    try {
      const product = await barProductService.update(productData.id, productData);
      
      toast({
        title: 'Sucesso',
        description: 'Produto atualizado com sucesso.',
      });
      
      return product;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o produto.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Delete a bar product
  const deleteBarProduct = async (productId: string): Promise<void> => {
    try {
      await barProductService.delete(productId);
      
      toast({
        title: 'Sucesso',
        description: 'Produto excluído com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o produto.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update product stock
  const updateProductStock = async (productId: string, newStock: number): Promise<void> => {
    try {
      await barProductService.updateStock(productId, newStock);
      
      toast({
        title: 'Sucesso',
        description: 'Estoque atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o estoque.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // React Query hooks
  const barProductsQuery = useQuery({
    queryKey: ['barProducts'],
    queryFn: getBarProducts
  });

  const createBarProductMutation = useMutation({
    mutationFn: createBarProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barProducts'] });
    }
  });

  const updateBarProductMutation = useMutation({
    mutationFn: updateBarProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barProducts'] });
    }
  });

  const deleteBarProductMutation = useMutation({
    mutationFn: deleteBarProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barProducts'] });
    }
  });

  const updateProductStockMutation = useMutation({
    mutationFn: ({ productId, newStock }: { productId: string; newStock: number }) =>
      updateProductStock(productId, newStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barProducts'] });
    }
  });

  return {
    products: barProductsQuery.data || [],
    isLoading: barProductsQuery.isLoading,
    isError: barProductsQuery.isError,
    createProduct: createBarProductMutation.mutate,
    updateProduct: updateBarProductMutation.mutate,
    deleteProduct: deleteBarProductMutation.mutate,
    updateProductStock: updateProductStockMutation.mutate
  };
};
