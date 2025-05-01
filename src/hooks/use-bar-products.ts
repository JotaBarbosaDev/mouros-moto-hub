
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Product } from '@/types/bar';

export const useBarProducts = () => {
  const queryClient = useQueryClient();

  // Fetch all bar products
  const getBarProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('bar_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos do bar.',
        variant: 'destructive',
      });
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || '',
      unitOfMeasure: product.unit_of_measure,
      imageUrl: product.image_url || '',
      stock: product.stock,
      minStock: product.min_stock
    }));
  };

  // Create a new bar product
  const createBarProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const { data, error } = await supabase
      .from('bar_products')
      .insert({
        name: productData.name,
        price: productData.price,
        description: productData.description || null,
        unit_of_measure: productData.unitOfMeasure,
        image_url: productData.imageUrl || null,
        stock: productData.stock || 0,
        min_stock: productData.minStock || 10
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o produto.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Produto criado com sucesso.',
    });

    return {
      id: data.id,
      name: data.name,
      price: data.price,
      description: data.description || '',
      unitOfMeasure: data.unit_of_measure,
      imageUrl: data.image_url || '',
      stock: data.stock,
      minStock: data.min_stock
    };
  };

  // Update a bar product
  const updateBarProduct = async (productData: Product): Promise<Product> => {
    const { data, error } = await supabase
      .from('bar_products')
      .update({
        name: productData.name,
        price: productData.price,
        description: productData.description || null,
        unit_of_measure: productData.unitOfMeasure,
        image_url: productData.imageUrl || null,
        stock: productData.stock,
        min_stock: productData.minStock || 10
      })
      .eq('id', productData.id)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o produto.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Produto atualizado com sucesso.',
    });

    return {
      id: data.id,
      name: data.name,
      price: data.price,
      description: data.description || '',
      unitOfMeasure: data.unit_of_measure,
      imageUrl: data.image_url || '',
      stock: data.stock,
      minStock: data.min_stock
    };
  };

  // Delete a bar product
  const deleteBarProduct = async (productId: string): Promise<void> => {
    const { error } = await supabase
      .from('bar_products')
      .delete()
      .eq('id', productId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o produto.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Produto excluído com sucesso.',
    });
  };

  // Update product stock
  const updateProductStock = async (productId: string, newStock: number): Promise<void> => {
    const { error } = await supabase
      .from('bar_products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o estoque.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Estoque atualizado com sucesso.',
    });
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
