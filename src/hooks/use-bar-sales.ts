
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Sale, SaleItem } from '@/types/bar';
import { useAuth } from '@/hooks/useAuth';

export const useBarSales = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all sales
  const getSales = async (): Promise<Sale[]> => {
    const { data, error } = await supabase
      .from('bar_sales')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as vendas.',
        variant: 'destructive',
      });
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    const salesIds = data.map(sale => sale.id);

    // Fetch all sale items for these sales
    const { data: saleItemsData, error: saleItemsError } = await supabase
      .from('bar_sale_items')
      .select('*')
      .in('sale_id', salesIds);

    if (saleItemsError) {
      console.error('Error fetching sale items:', saleItemsError);
      // Continue with sales even if items fetch fails
    }

    // Group sale items by sale_id
    const itemsBySaleId: Record<string, SaleItem[]> = {};
    (saleItemsData || []).forEach(item => {
      if (!itemsBySaleId[item.sale_id]) {
        itemsBySaleId[item.sale_id] = [];
      }
      
      itemsBySaleId[item.sale_id].push({
        productId: item.product_id,
        productName: item.product_name,
        price: item.price,
        quantity: item.quantity,
        total: item.total,
        unitOfMeasure: item.unit_of_measure,
        imageUrl: item.image_url || ''
      });
    });

    // Map sales with their items
    return data.map(sale => ({
      id: sale.id,
      timestamp: new Date(sale.timestamp),
      sellerId: sale.seller_id,
      seller: sale.seller_name,
      total: sale.total,
      amountPaid: sale.amount_paid,
      change: sale.change,
      items: itemsBySaleId[sale.id] || []
    }));
  };

  // Create a new sale
  const createSale = async (saleData: { 
    items: Omit<SaleItem, 'imageUrl'>[];
    amountPaid: number;
  }): Promise<Sale> => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado para registrar uma venda.',
        variant: 'destructive',
      });
      throw new Error('User not authenticated');
    }

    const total = saleData.items.reduce((sum, item) => sum + item.total, 0);
    const change = saleData.amountPaid - total;

    // Insert the sale
    const { data: saleData, error: saleError } = await supabase
      .from('bar_sales')
      .insert({
        seller_id: user.id,
        seller_name: user.email, // Ideally, use user's full name if available
        total,
        amount_paid: saleData.amountPaid,
        change,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (saleError) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a venda.',
        variant: 'destructive',
      });
      throw saleError;
    }

    const saleId = saleData.id;
    
    // Insert sale items
    const saleItemsToInsert = saleData.items.map(item => ({
      sale_id: saleId,
      product_id: item.productId,
      product_name: item.productName,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
      unit_of_measure: item.unitOfMeasure,
      image_url: null // Will be set later if available
    }));

    const { error: itemsError } = await supabase
      .from('bar_sale_items')
      .insert(saleItemsToInsert);

    if (itemsError) {
      console.error('Error inserting sale items:', itemsError);
      // Continue since the sale has been created
    }

    // Update product stock for each item
    for (const item of saleData.items) {
      // First get current stock
      const { data: productData, error: productError } = await supabase
        .from('bar_products')
        .select('stock')
        .eq('id', item.productId)
        .single();

      if (productError) continue; // Skip if error

      const newStock = (productData?.stock || 0) - item.quantity;
      if (newStock < 0) continue; // Skip if would go negative

      // Update stock
      await supabase
        .from('bar_products')
        .update({ stock: newStock })
        .eq('id', item.productId);
    }

    toast({
      title: 'Sucesso',
      description: 'Venda registrada com sucesso.',
    });

    // Return new sale with items
    return {
      id: saleId,
      timestamp: new Date(),
      sellerId: user.id,
      seller: user.email,
      total,
      amountPaid: saleData.amountPaid,
      change,
      items: saleData.items.map(item => ({
        ...item,
        imageUrl: ''
      }))
    };
  };

  // React Query hooks
  const salesQuery = useQuery({
    queryKey: ['barSales'],
    queryFn: getSales
  });

  const createSaleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barSales'] });
      queryClient.invalidateQueries({ queryKey: ['barProducts'] }); // Invalidate products to update stock
    }
  });

  return {
    sales: salesQuery.data || [],
    isLoading: salesQuery.isLoading,
    isError: salesQuery.isError,
    createSale: createSaleMutation.mutate
  };
};
