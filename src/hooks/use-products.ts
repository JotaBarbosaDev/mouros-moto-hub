
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Product } from '@/types/product';

export const useProducts = () => {
  const queryClient = useQueryClient();

  // Fetch all products
  const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('store_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos.',
        variant: 'destructive',
      });
      throw error;
    }

    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      size: product.size,
      color: product.color || '',
      type: product.type,
      imageUrl: product.image_url || '',
      membersOnly: product.members_only,
      publishedOnLandingPage: product.published_on_landing_page,
      stock: product.stock,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at)
    }));
  };

  // Create a new product
  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const { data, error } = await supabase
      .from('store_products')
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        size: productData.size,
        color: productData.color || null,
        type: productData.type,
        image_url: productData.imageUrl || null,
        members_only: productData.membersOnly,
        published_on_landing_page: productData.publishedOnLandingPage,
        stock: productData.stock
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

    const newProduct: Product = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      size: data.size,
      color: data.color || '',
      type: data.type,
      imageUrl: data.image_url || '',
      membersOnly: data.members_only,
      publishedOnLandingPage: data.published_on_landing_page,
      stock: data.stock,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };

    toast({
      title: 'Sucesso',
      description: 'Produto criado com sucesso.',
    });

    return newProduct;
  };

  // Update an existing product
  const updateProduct = async (productData: Product): Promise<Product> => {
    const { data, error } = await supabase
      .from('store_products')
      .update({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        size: productData.size,
        color: productData.color || null,
        type: productData.type,
        image_url: productData.imageUrl || null,
        members_only: productData.membersOnly,
        published_on_landing_page: productData.publishedOnLandingPage,
        stock: productData.stock
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

    const updatedProduct: Product = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      size: data.size,
      color: data.color || '',
      type: data.type,
      imageUrl: data.image_url || '',
      membersOnly: data.members_only,
      publishedOnLandingPage: data.published_on_landing_page,
      stock: data.stock,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };

    toast({
      title: 'Sucesso',
      description: 'Produto atualizado com sucesso.',
    });

    return updatedProduct;
  };

  // Delete a product
  const deleteProduct = async (productId: string): Promise<void> => {
    const { error } = await supabase
      .from('store_products')
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

  // Toggle product visibility on landing page
  const toggleProductVisibility = async (productId: string, currentVisibility: boolean): Promise<void> => {
    const { error } = await supabase
      .from('store_products')
      .update({
        published_on_landing_page: !currentVisibility
      })
      .eq('id', productId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a visibilidade do produto.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: `Produto ${!currentVisibility ? 'publicado na' : 'removido da'} landing page.`,
    });
  };

  // React Query hooks
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ productId, currentVisibility }: { productId: string; currentVisibility: boolean }) => 
      toggleProductVisibility(productId, currentVisibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    toggleProductVisibility: toggleVisibilityMutation.mutate
  };
};
