
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Image } from 'lucide-react';
import { Product } from '@/types/bar';
import { mockProducts } from '@/data/bar-mock-data';
import { AddProductDialog } from './AddProductDialog';
import { EditProductDialog } from './EditProductDialog';
import { DeleteProductDialog } from './DeleteProductDialog';

export const BarMenu = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const handleAddProduct = (product: Product) => {
    const newProduct = {
      ...product,
      id: `p${products.length + 1}`
    };
    
    setProducts([...products, newProduct]);
    setAddDialogOpen(false);
  };
  
  const handleEditProduct = (product: Product) => {
    setProducts(products.map(p => 
      p.id === product.id ? product : p
    ));
    setEditDialogOpen(false);
  };
  
  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    
    setProducts(products.filter(p => p.id !== selectedProduct.id));
    setDeleteDialogOpen(false);
  };
  
  const showEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };
  
  const showDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Produtos do Bar</h2>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Unidade</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Image className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500 line-clamp-2">
                      {product.description || 'Sem descrição'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{product.unitOfMeasure}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {product.price.toFixed(2)}€
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => showEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-red-500"
                        onClick={() => showDeleteDialog(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-gray-500">
                    Não existem produtos para mostrar
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      <AddProductDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onAddProduct={handleAddProduct} 
      />
      
      {selectedProduct && (
        <>
          <EditProductDialog 
            open={editDialogOpen} 
            onOpenChange={setEditDialogOpen} 
            product={selectedProduct}
            onEditProduct={handleEditProduct} 
          />
          
          <DeleteProductDialog 
            open={deleteDialogOpen} 
            onOpenChange={setDeleteDialogOpen} 
            product={selectedProduct}
            onDeleteProduct={handleDeleteProduct} 
          />
        </>
      )}
    </div>
  );
};
