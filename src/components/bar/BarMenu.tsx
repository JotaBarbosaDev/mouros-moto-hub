
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Pencil, 
  Trash, 
  Search, 
  Plus, 
  Package2, 
  DollarSign, 
  Eye, 
  EyeOff,
  AlertTriangle 
} from "lucide-react";
import { useBarProducts } from '@/hooks/use-bar-products';
import { Product } from '@/types/bar';
import { Badge } from "@/components/ui/badge";
import { AddBarProductDialog } from './AddBarProductDialog';

export function BarMenu() {
  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useBarProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!isLoading && products) {
      setFilteredProducts(
        products.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [products, searchTerm, isLoading]);
  
  const lowStockProducts = filteredProducts.filter(
    (product) => product.stock <= (product.minStock || 10)
  ).length;
  
  const handleCreateProduct = (productData: Omit<Product, 'id'>) => {
    createProduct({
      ...productData,
      // Set defaults for any missing fields
      description: productData.description || "",
      imageUrl: productData.imageUrl || "",
    });
  };
  
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProduct(productId);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-mouro-red hover:bg-mouro-red/90" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredProducts.length}</div>
            <p className="text-sm text-muted-foreground">produtos no catálogo</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Stock Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{lowStockProducts}</div>
            <p className="text-sm text-muted-foreground">produtos com stock baixo</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Inventário Ligado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {filteredProducts.filter(p => p.inventoryId).length}
            </div>
            <p className="text-sm text-muted-foreground">produtos vinculados ao inventário</p>
          </CardContent>
        </Card>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>A carregar produtos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-md border border-slate-200">
          <h3 className="text-xl font-medium text-slate-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-sm text-slate-500 mb-4">
            {searchTerm ? "Nenhum produto corresponde à sua pesquisa." : "Adicione produtos para começar."}
          </p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="hidden md:table-cell">Unidade</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <Package2 className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name}
                    {product.description && (
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {product.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                      {product.price.toFixed(2)}€
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.unitOfMeasure}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className={product.stock <= (product.minStock || 10) ? "text-amber-500 font-semibold" : ""}>
                      {product.stock}
                      {product.stock <= (product.minStock || 10) && (
                        <AlertTriangle className="inline-block ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center space-x-2">
                      {product.inventoryId && (
                        <Badge variant="secondary">Inventário</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <AddBarProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleCreateProduct}
      />
    </div>
  );
}
