import { useState } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Clock, Edit, Trash, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventory, InventoryItem, InventoryLog } from '@/hooks/use-inventory';
import { useBarProducts } from '@/hooks/use-bar-products';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { InventoryCategory, InventoryUseType } from '@/types/inventory';

const inventoryItemSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  quantity: z.coerce.number().int().min(0, { message: "A quantidade deve ser um número inteiro não negativo" }),
  unitOfMeasure: z.string().min(1, { message: "A unidade de medida é obrigatória" }),
  category: z.string().min(1, { message: "A categoria é obrigatória" }),
  useType: z.string().min(1, { message: "O tipo de uso é obrigatório" }),
  imageUrl: z.string().optional(),
});

const inventoryUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(0, { message: "A quantidade deve ser um número inteiro não negativo" }),
  reason: z.string().optional(),
});

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  
  const { items, isLoading, createItem, updateItem, deleteItem, getLogsQuery } = useInventory();
  const { products } = useBarProducts();
  const { toast } = useToast();
  
  // Get inventory logs if an item is selected for viewing
  const { data: itemLogs, isLoading: isLoadingLogs } = getLogsQuery(viewingItemId || '');
  
  // Form for creating/editing inventory items
  const form = useForm<z.infer<typeof inventoryItemSchema>>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      unitOfMeasure: "",
      category: "Outro",
      useType: "Outro",
      imageUrl: "",
    },
  });
  
  // Form for updating inventory quantity
  const updateForm = useForm<z.infer<typeof inventoryUpdateSchema>>({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: {
      quantity: 0,
      reason: "",
    },
  });
  
  // Handle form submission for new/edit item
  const onSubmit = (data: z.infer<typeof inventoryItemSchema>) => {
    if (selectedItem) {
      // Update existing item
      updateItem({
        ...selectedItem,
        name: data.name,
        quantity: data.quantity,
        unitOfMeasure: data.unitOfMeasure,
        category: data.category as InventoryCategory,
        useType: data.useType as InventoryUseType,
        imageUrl: data.imageUrl
      }, {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedItem(null);
          form.reset();
        }
      });
    } else {
      // Create new item
      createItem({
        name: data.name,
        quantity: data.quantity,
        unitOfMeasure: data.unitOfMeasure,
        category: data.category as InventoryCategory,
        useType: data.useType as InventoryUseType,
        imageUrl: data.imageUrl
      }, {
        onSuccess: () => {
          setDialogOpen(false);
          form.reset();
        }
      });
    }
  };
  
  // Handle quantity update submission
  const onUpdateSubmit = (data: z.infer<typeof inventoryUpdateSchema>) => {
    if (selectedItem) {
      updateItem({
        ...selectedItem,
        quantity: data.quantity
      }, {
        onSuccess: () => {
          setUpdateDialogOpen(false);
          setSelectedItem(null);
          updateForm.reset();
        }
      });
    }
  };
  
  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedItem(null);
      form.reset();
    }
  };
  
  // Reset update form when dialog closes
  const handleUpdateDialogOpenChange = (open: boolean) => {
    setUpdateDialogOpen(open);
    if (!open) {
      setSelectedItem(null);
      updateForm.reset();
    }
  };
  
  // Set form values when editing an item
  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    form.setValue("name", item.name);
    form.setValue("quantity", item.quantity);
    form.setValue("unitOfMeasure", item.unitOfMeasure);
    form.setValue("category", item.category);
    form.setValue("useType", item.useType);
    form.setValue("imageUrl", item.imageUrl || "");
    setDialogOpen(true);
  };
  
  // Set update form values when updating quantity
  const handleUpdateQuantity = (item: InventoryItem) => {
    setSelectedItem(item);
    updateForm.setValue("quantity", item.quantity);
    setUpdateDialogOpen(true);
  };
  
  // Handle deleting an item
  const handleDeleteItem = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este item do inventário?")) {
      // Check if the item is linked to any bar product
      const linkedProducts = products.filter(p => p.inventoryId === id);
      if (linkedProducts.length > 0) {
        toast({
          title: "Não foi possível excluir",
          description: `Este item está vinculado a ${linkedProducts.length} produto(s) do bar.`,
          variant: "destructive"
        });
        return;
      }
      
      deleteItem(id);
    }
  };
  
  // Get all unique units of measure
  const uniqueUnits = [...new Set(items.map(item => item.unitOfMeasure))];
  
  // Filter items based on search term and unit filter
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = unitFilter === 'all' || item.unitOfMeasure === unitFilter;
    
    return matchesSearch && matchesUnit;
  });
  
  // Find which products are linked to this inventory item
  const getLinkedProducts = (inventoryId: string) => {
    return products.filter(product => product.inventoryId === inventoryId);
  };
  
  // Calculate total inventory value
  const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalUnits = uniqueUnits.length;

  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-mouro-black">
            Inventário do <span className="text-mouro-red">Clube</span>
          </h1>
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-mouro-red hover:bg-mouro-red/90">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedItem ? 'Editar Item' : 'Adicionar Item'}</DialogTitle>
                <DialogDescription>
                  {selectedItem 
                    ? 'Edite os detalhes do item de inventário.' 
                    : 'Preencha os dados para adicionar um novo item ao inventário.'
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
                          <Input placeholder="Nome do item" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
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
                        <FormLabel>Unidade de Medida</FormLabel>
                        <FormControl>
                          <Input placeholder="Un, L, Kg, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">
                      {selectedItem ? 'Salvar Alterações' : 'Adicionar Item'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar no inventário..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64 flex items-center">
            <Filter className="mr-2 h-4 w-4 text-gray-400" />
            <Select
              value={unitFilter}
              onValueChange={setUnitFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as unidades</SelectItem>
                {uniqueUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total de Itens</p>
            <p className="text-2xl font-bold">{totalItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Tipos de Itens</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Unidades de Medida</p>
            <p className="text-2xl font-bold">{totalUnits}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando inventário...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Produtos Vinculados</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const linkedProducts = getLinkedProducts(item.id);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>{item.unitOfMeasure}</TableCell>
                      <TableCell>
                        {linkedProducts.length > 0 ? (
                          <Badge className="bg-blue-500">{linkedProducts.length} produto(s)</Badge>
                        ) : (
                          <Badge variant="outline">Nenhum</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-2">
                          <Dialog open={updateDialogOpen} onOpenChange={handleUpdateDialogOpenChange}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdateQuantity(item)}
                              >
                                Ajustar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Atualizar Quantidade</DialogTitle>
                                <DialogDescription>
                                  Ajuste a quantidade em estoque de "{selectedItem?.name}".
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...updateForm}>
                                <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                                  <FormField
                                    control={updateForm.control}
                                    name="quantity"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Nova Quantidade ({selectedItem?.unitOfMeasure})</FormLabel>
                                        <FormControl>
                                          <Input type="number" min="0" step="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={updateForm.control}
                                    name="reason"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Motivo (opcional)</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Razão para esta alteração" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <div className="flex justify-between items-center">
                                    <p className="text-sm">
                                      Quantidade atual: <span className="font-medium">{selectedItem?.quantity} {selectedItem?.unitOfMeasure}</span>
                                    </p>
                                    <div className="space-x-2">
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          if (selectedItem) {
                                            updateForm.setValue("quantity", selectedItem.quantity - 1);
                                          }
                                        }}
                                      >
                                        <ArrowDown className="h-4 w-4 mr-1" /> -1
                                      </Button>
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          if (selectedItem) {
                                            updateForm.setValue("quantity", selectedItem.quantity + 1);
                                          }
                                        }}
                                      >
                                        <ArrowUp className="h-4 w-4 mr-1" /> +1
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <DialogFooter>
                                    <Button type="submit">Atualizar Quantidade</Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                          
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setViewingItemId(item.id)}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                              <SheetHeader>
                                <SheetTitle>Histórico de {item.name}</SheetTitle>
                                <SheetDescription>
                                  Registro de todas as alterações de estoque deste item.
                                </SheetDescription>
                              </SheetHeader>
                              <div className="mt-6">
                                {isLoadingLogs ? (
                                  <div className="flex justify-center items-center h-64">
                                    <p>Carregando histórico...</p>
                                  </div>
                                ) : !itemLogs || itemLogs.length === 0 ? (
                                  <div className="text-center py-8">
                                    <p className="text-gray-500">Sem registros de alteração.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {itemLogs.map((log) => (
                                      <div key={log.id} className="border rounded p-4">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="font-medium">
                                              {log.previousQuantity} → {log.newQuantity} {item.unitOfMeasure}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              {log.changeReason || "Sem motivo registrado"}
                                            </p>
                                          </div>
                                          <Badge variant="outline">
                                            {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}
                                          </Badge>
                                        </div>
                                        <div className="mt-2">
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                              className={`${
                                                log.newQuantity > log.previousQuantity 
                                                  ? "bg-green-500" 
                                                  : "bg-red-500"
                                              } h-2 rounded-full`}
                                              style={{ 
                                                width: `${Math.min(100, Math.abs(log.newQuantity - log.previousQuantity) / Math.max(1, log.previousQuantity) * 100)}%` 
                                              }}
                                            ></div>
                                          </div>
                                          <p className="text-xs text-right mt-1 text-gray-500">
                                            {log.newQuantity > log.previousQuantity 
                                              ? `+${log.newQuantity - log.previousQuantity}` 
                                              : `-${log.previousQuantity - log.newQuantity}`
                                            } {item.unitOfMeasure}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </SheetContent>
                          </Sheet>
                          
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-slate-900 mb-2">Nenhum item encontrado</h3>
              <p className="text-sm text-slate-500">Nenhum item foi encontrado com os filtros atuais.</p>
            </div>
          )}
        </div>
      </div>
    </MembersLayout>
  );
};

export default Inventory;
