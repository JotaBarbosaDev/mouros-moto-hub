
import { useState } from 'react';
import { useBarProducts } from '@/hooks/use-bar-products';
import { useInventory } from '@/hooks/use-inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, Edit, Trash, Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  unitOfMeasure: string;
  imageUrl: string;
  stock: number;
  minStock?: number;
  inventoryId?: string;
}

const productSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  price: z.coerce.number().min(0, { message: "O preço deve ser um número não negativo" }),
  description: z.string().optional(),
  unitOfMeasure: z.string().min(1, { message: "A unidade de medida é obrigatória" }),
  stock: z.coerce.number().int().min(0, { message: "O estoque deve ser um número inteiro não negativo" }),
  minStock: z.coerce.number().int().min(0, { message: "O estoque mínimo deve ser um número inteiro não negativo" }).optional(),
  imageUrl: z.string().optional(),
  inventoryId: z.string().optional(),
});

const linkInventorySchema = z.object({
  inventoryId: z.string().min(1, { message: "Selecione um item do inventário" }),
});

export const BarMenu = () => {
  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useBarProducts();
  const { items: inventoryItems, linkToBarProduct } = useInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      unitOfMeasure: "",
      stock: 0,
      minStock: 10,
      imageUrl: "",
      inventoryId: "",
    },
  });
  
  const linkForm = useForm<z.infer<typeof linkInventorySchema>>({
    resolver: zodResolver(linkInventorySchema),
    defaultValues: {
      inventoryId: "",
    },
  });
  
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedProduct(null);
      form.reset();
    }
  };
  
  const handleLinkDialogOpenChange = (open: boolean) => {
    setLinkDialogOpen(open);
    if (!open) {
      setSelectedProduct(null);
      linkForm.reset();
    }
  };
  
  const onSubmit = (data: z.infer<typeof productSchema>) => {
    if (selectedProduct) {
      // Update existing product
      updateProduct({
        ...selectedProduct,
        name: data.name,
        price: data.price,
        description: data.description || '',
        unitOfMeasure: data.unitOfMeasure,
        stock: data.stock,
        minStock: data.minStock,
        imageUrl: data.imageUrl || '',
        inventoryId: data.inventoryId
      });
      setDialogOpen(false);
    } else {
      // Create new product
      createProduct({
        name: data.name,
        price: data.price,
        description: data.description || '',
        unitOfMeasure: data.unitOfMeasure,
        stock: data.stock,
        minStock: data.minStock,
        imageUrl: data.imageUrl || '',
        inventoryId: data.inventoryId
      });
      setDialogOpen(false);
    }
  };
  
  const onLinkSubmit = (data: z.infer<typeof linkInventorySchema>) => {
    if (selectedProduct && data.inventoryId) {
      linkToBarProduct({
        inventoryId: data.inventoryId,
        barProductId: selectedProduct.id
      }, {
        onSuccess: () => {
          setLinkDialogOpen(false);
          toast({
            title: "Produto vinculado",
            description: `O produto foi vinculado ao item do inventário com sucesso.`
          });
        }
      });
    }
  };
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    form.setValue("name", product.name);
    form.setValue("price", product.price);
    form.setValue("description", product.description || '');
    form.setValue("unitOfMeasure", product.unitOfMeasure);
    form.setValue("stock", product.stock);
    form.setValue("minStock", product.minStock || 10);
    form.setValue("imageUrl", product.imageUrl || '');
    form.setValue("inventoryId", product.inventoryId || '');
    setDialogOpen(true);
  };
  
  const handleLinkProduct = (product: Product) => {
    setSelectedProduct(product);
    if (product.inventoryId) {
      linkForm.setValue("inventoryId", product.inventoryId);
    }
    setLinkDialogOpen(true);
  };
  
  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProduct(id);
    }
  };
  
  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get inventory item name from ID
  const getInventoryItemName = (inventoryId?: string) => {
    if (!inventoryId) return null;
    const item = inventoryItems.find(item => item.id === inventoryId);
    return item ? item.name : null;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <Input
            placeholder="Procurar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              <DialogDescription>
                {selectedProduct 
                  ? 'Edite os detalhes do produto existente.' 
                  : 'Preencha os detalhes para adicionar um novo produto ao bar.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (€)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="unitOfMeasure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar unidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Un">Un (Unidade)</SelectItem>
                            <SelectItem value="L">L (Litro)</SelectItem>
                            <SelectItem value="ml">ml (Mililitro)</SelectItem>
                            <SelectItem value="cl">cl (Centilitro)</SelectItem>
                            <SelectItem value="Kg">Kg (Quilograma)</SelectItem>
                            <SelectItem value="g">g (Grama)</SelectItem>
                            <SelectItem value="Dose">Dose</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Descrição do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque Mínimo</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem</FormLabel>
                      <FormControl>
                        <Input placeholder="URL da imagem (opcional)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Insira a URL de uma imagem para o produto (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="inventoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item de Inventário</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um item de inventário (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          {inventoryItems.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.quantity} {item.unitOfMeasure})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Vinculando a um item de inventário, as vendas deste produto 
                        reduzirão automaticamente a quantidade do item no inventário.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">
                    {selectedProduct ? 'Atualizar Produto' : 'Adicionar Produto'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Carregando produtos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <h3 className="text-xl font-medium text-slate-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-sm text-slate-500 mb-6">
            {searchTerm ? "Nenhum produto corresponde à sua busca." : "Não há produtos cadastrados no sistema."}
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const inventoryName = getInventoryItemName(product.inventoryId);
            return (
              <Card key={product.id} className="overflow-hidden">
                {product.imageUrl ? (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-slate-200 flex items-center justify-center">
                    <p className="text-slate-400">Sem imagem</p>
                  </div>
                )}
                
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-slate-500 mb-2">{product.description || 'Sem descrição'}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold">{product.price.toFixed(2)}€</p>
                    <Badge variant="outline">{product.unitOfMeasure}</Badge>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div className="text-xs flex justify-between">
                      <span>Estoque:</span>
                      <span className={product.stock <= (product.minStock || 10) ? 'text-red-500 font-semibold' : ''}>
                        {product.stock} {product.unitOfMeasure}
                      </span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span>Mínimo:</span>
                      <span>{product.minStock || 10} {product.unitOfMeasure}</span>
                    </div>
                    {inventoryName && (
                      <div className="text-xs flex justify-between">
                        <span>Inventário:</span>
                        <Badge variant="outline" className="text-xs">{inventoryName}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                  <Dialog open={linkDialogOpen} onOpenChange={handleLinkDialogOpenChange}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleLinkProduct(product)}
                      >
                        <Link className="h-4 w-4 mr-1" />
                        {product.inventoryId ? 'Trocar' : 'Vincular'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Vincular ao Inventário</DialogTitle>
                        <DialogDescription>
                          Vincule o produto "{selectedProduct?.name}" a um item do inventário.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...linkForm}>
                        <form onSubmit={linkForm.handleSubmit(onLinkSubmit)} className="space-y-4">
                          <FormField
                            control={linkForm.control}
                            name="inventoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item de Inventário</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione um item de inventário" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {inventoryItems.length === 0 ? (
                                      <SelectItem value="" disabled>Nenhum item no inventário</SelectItem>
                                    ) : (
                                      inventoryItems.map(item => (
                                        <SelectItem key={item.id} value={item.id}>
                                          {item.name} ({item.quantity} {item.unitOfMeasure})
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Ao vincular este produto a um item do inventário, 
                                  cada venda do produto reduzirá automaticamente a quantidade no inventário.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button type="submit" disabled={inventoryItems.length === 0}>
                              Vincular Item
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  
                  <div className="space-x-1">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
