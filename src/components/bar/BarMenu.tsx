
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useBarProducts } from '@/hooks/use-bar-products';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeleteProductDialog } from './DeleteProductDialog';
import { Product } from '@/types/bar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const BarMenu = () => {
  const { products, isLoading, deleteProduct } = useBarProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'low-stock') return matchesSearch && product.stock <= (product.minStock || 10);
    
    return matchesSearch;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">A carregar produtos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar produtos..." 
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            value={filter}
            onValueChange={setFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os produtos</SelectItem>
              <SelectItem value="low-stock">Baixo estoque</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-mouro-red hover:bg-mouro-red/90 whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-md border border-slate-200">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 mt-4 mb-2">Nenhum produto cadastrado</h3>
          <p className="text-sm text-slate-500 mb-4">Adicione produtos para exibir no menu do bar.</p>
          <Button className="bg-mouro-red hover:bg-mouro-red/90 mx-auto">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p>Nenhum produto corresponde à sua pesquisa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    Sem imagem
                  </div>
                )}
                {product.stock <= (product.minStock || 10) && (
                  <Badge 
                    variant="destructive"
                    className="absolute top-2 right-2"
                  >
                    Estoque baixo
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-2">{product.description || "Sem descrição"}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold">{product.price.toFixed(2)}€</span>
                  <Badge variant="outline" className="bg-slate-100">
                    {product.stock} {product.unitOfMeasure}
                  </Badge>
                </div>
              </CardContent>
              
              <CardFooter className="border-t p-4 flex justify-between gap-2">
                <Button 
                  variant="outline"
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button 
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteClick(product)}
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedProduct && (
        <DeleteProductDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          product={selectedProduct}
          onDeleteProduct={handleDeleteConfirm}
        />
      )}
    </div>
  );
};
