import React, { useState, useEffect } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Product, ProductSize, ProductType } from '@/types/product';
import { Plus, Search, Edit, Trash2, Eye, Filter, Lock } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuth } from '@/hooks/useAuth';
import { getFallbackImage } from '@/utils/image-utils';
import { useProducts } from '@/hooks/use-products';

// Componente para o formulário de produto
interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  size: ProductSize;
  color: string;
  type: ProductType;
  imageUrl: string;
  membersOnly: boolean;
  publishedOnLandingPage: boolean;
  stock: number;
}

interface ProductFormProps {
  initialValues?: ProductFormValues;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
}

const ProductForm = ({ initialValues, onSubmit, onCancel }: ProductFormProps) => {
  const [previewImage, setPreviewImage] = useState<string>(initialValues?.imageUrl || '');
  const form = useForm<ProductFormValues>({
    defaultValues: initialValues || {
      name: '',
      description: '',
      price: 0,
      size: 'Único',
      color: '',
      type: 'Outro',
      imageUrl: '',
      membersOnly: false,
      publishedOnLandingPage: true,
      stock: 0
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        form.setValue('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const productSizes: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL', 'Único'];
  const productTypes: ProductType[] = [
    'T-Shirt', 'Caneca', 'Boné', 'Pin', 'Patch', 'Adesivo', 'Outro'
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Produto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tamanho" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productSizes.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <Input placeholder="Cor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="aspect-square mb-4 border rounded-md overflow-hidden relative">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Pré-visualização" 
                  className="w-full h-full object-cover"
                  onError={() => {
                    setPreviewImage(getFallbackImage('product'));
                    form.setValue('imageUrl', getFallbackImage('product'));
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Imagem do Produto</p>
                </div>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                  </FormControl>
                  <FormDescription>
                    Selecione uma imagem para o produto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="membersOnly"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Apenas para sócios</FormLabel>
                    <FormDescription>
                      Apenas os sócios registados poderão comprar este produto
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publishedOnLandingPage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Publicar na Landing Page</FormLabel>
                    <FormDescription>
                      O produto será visível na loja pública
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const MemberStore = () => {
  const { products, isLoading, createProduct, updateProduct, deleteProduct, toggleProductVisibility } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    type: 'Todos',
    visibility: 'Todos',
    stock: 'Todos'
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();

  // Efeito para filtrar produtos com base em busca e filtros ativos
  useEffect(() => {
    if (!products) return;
    
    let result = [...products];

    // Filtro por busca de texto
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por tipo de produto
    if (activeFilters.type !== 'Todos') {
      result = result.filter(product => product.type === activeFilters.type);
    }

    // Filtro por visibilidade
    if (activeFilters.visibility !== 'Todos') {
      if (activeFilters.visibility === 'Sócios') {
        result = result.filter(product => product.membersOnly);
      } else if (activeFilters.visibility === 'Público') {
        result = result.filter(product => !product.membersOnly);
      } else if (activeFilters.visibility === 'Landing') {
        result = result.filter(product => product.publishedOnLandingPage);
      } else if (activeFilters.visibility === 'Não Landing') {
        result = result.filter(product => !product.publishedOnLandingPage);
      }
    }

    // Filtro por stock
    if (activeFilters.stock !== 'Todos') {
      if (activeFilters.stock === 'Em Stock') {
        result = result.filter(product => product.stock > 0);
      } else if (activeFilters.stock === 'Esgotado') {
        result = result.filter(product => product.stock <= 0);
      }
    }

    setFilteredProducts(result);
  }, [products, searchQuery, activeFilters]);

  const handleAddProduct = async (productData: ProductFormValues) => {
    createProduct(productData);
    setIsAddDialogOpen(false);
  };

  const handleEditProduct = async (productData: ProductFormValues) => {
    if (!selectedProduct) return;
    
    updateProduct({
      ...selectedProduct,
      ...productData
    });

    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    deleteProduct(selectedProduct.id);
    
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleToggleLandingPageVisibility = async (product: Product) => {
    toggleProductVisibility({
      productId: product.id,
      currentVisibility: product.publishedOnLandingPage
    });
  };

  const productTypes = ['Todos', 'T-Shirt', 'Caneca', 'Boné', 'Pin', 'Patch', 'Adesivo', 'Outro'];
  const visibilityOptions = ['Todos', 'Sócios', 'Público', 'Landing', 'Não Landing'];
  const stockOptions = ['Todos', 'Em Stock', 'Esgotado'];

  return (
    <MembersLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-display text-mouro-black">
            Gestão da <span className="text-mouro-red">Loja</span>
          </h1>
          
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-mouro-red hover:bg-mouro-red/90">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Procurar produtos..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select
                  value={activeFilters.type}
                  onValueChange={(value) => setActiveFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibilidade</label>
                <Select
                  value={activeFilters.visibility}
                  onValueChange={(value) => setActiveFilters(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Visibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock</label>
                <Select
                  value={activeFilters.stock}
                  onValueChange={(value) => setActiveFilters(prev => ({ ...prev, stock: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Stock" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <p>Carregando produtos...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Imagem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Visibilidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="w-10 h-10 rounded overflow-hidden">
                            <img 
                              src={product.imageUrl || getFallbackImage('product')} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = getFallbackImage('product');
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>{product.price.toFixed(2)}€</TableCell>
                        <TableCell>{product.type}</TableCell>
                        <TableCell>{product.size}</TableCell>
                        <TableCell>{product.color}</TableCell>
                        <TableCell className="text-center">
                          {product.stock > 0 ? (
                            <Badge variant="outline" className="bg-green-100">{product.stock}</Badge>
                          ) : (
                            <Badge variant="secondary">Esgotado</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {product.membersOnly && (
                              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                <Lock className="h-3 w-3" /> Sócios
                              </Badge>
                            )}
                            {product.publishedOnLandingPage ? (
                              <Badge variant="outline" className="bg-blue-100 text-xs">Landing</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Não publicado</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleLandingPageVisibility(product)} 
                            title={product.publishedOnLandingPage ? "Remover da landing page" : "Publicar na landing page"}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-muted-foreground">Nenhum produto encontrado</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para adicionar novo produto */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Produto</DialogTitle>
          </DialogHeader>
          <ProductForm 
            onSubmit={handleAddProduct} 
            onCancel={() => setIsAddDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar produto */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm 
              initialValues={{
                name: selectedProduct.name,
                description: selectedProduct.description,
                price: selectedProduct.price,
                size: selectedProduct.size || 'Único',
                color: selectedProduct.color || '',
                type: selectedProduct.type,
                imageUrl: selectedProduct.imageUrl || '',
                membersOnly: selectedProduct.membersOnly,
                publishedOnLandingPage: selectedProduct.publishedOnLandingPage,
                stock: selectedProduct.stock
              }}
              onSubmit={handleEditProduct} 
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedProduct(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza de que deseja excluir o produto "{selectedProduct?.name}"?</p>
          <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MembersLayout>
  );
};

export default MemberStore;
