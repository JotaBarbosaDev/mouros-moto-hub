
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryItem } from "@/types/inventory";
import { FileUpload } from "@/components/common/FileUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface AddBarProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const barProductSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  price: z.coerce.number().min(0, { message: "O preço deve ser maior ou igual a zero" }),
  description: z.string().optional(),
  unitOfMeasure: z.string().min(1, { message: "A unidade de medida é obrigatória" }),
  stock: z.coerce.number().int().min(0, { message: "O stock deve ser um número inteiro não negativo" }),
  minStock: z.coerce.number().int().min(0, { message: "O stock mínimo deve ser um número inteiro não negativo" }),
  imageUrl: z.string().optional(),
  inventoryId: z.string().optional(),
  visibleInBar: z.boolean().default(true),
  visibleInRegister: z.boolean().default(true),
});

type FormValues = z.infer<typeof barProductSchema>;

export function AddBarProductDialog({ open, onOpenChange, onSubmit }: AddBarProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(barProductSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      unitOfMeasure: "Un",
      stock: 0,
      minStock: 10,
      inventoryId: undefined,
      visibleInBar: true,
      visibleInRegister: true,
    }
  });
  
  // Fetch inventory items that could be linked to bar products
  useEffect(() => {
    const fetchInventoryItems = async () => {
      if (!open) return;
      
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('use_type', 'Bar')
          .order('name');
          
        if (error) throw error;
        
        if (data) {
          const items = data.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unitOfMeasure: item.unit_of_measure,
            category: item.category,
            useType: item.use_type,
            imageUrl: item.image_url,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }));
          
          setInventoryItems(items);
        }
      } catch (error) {
        console.error("Error fetching inventory items:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os itens do inventário.",
          variant: "destructive",
        });
      }
    };
    
    fetchInventoryItems();
  }, [open, toast]);
  
  const handleInventoryItemChange = (inventoryId: string) => {
    if (inventoryId === "none") {
      form.setValue("inventoryId", undefined);
      return;
    }
    
    const selectedItem = inventoryItems.find(item => item.id === inventoryId);
    if (selectedItem) {
      form.setValue("name", selectedItem.name);
      form.setValue("unitOfMeasure", selectedItem.unitOfMeasure);
      form.setValue("stock", selectedItem.quantity);
      form.setValue("inventoryId", selectedItem.id);
      
      if (selectedItem.imageUrl) {
        form.setValue("imageUrl", selectedItem.imageUrl);
      }
    }
  };
  
  const handleSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      onSubmit({
        ...data,
        // If inventory ID is "none" or undefined, set it to null for the database
        inventoryId: data.inventoryId === "none" ? null : data.inventoryId,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o produto.",
        variant: "destructive",
      });
      console.error("Error submitting bar product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) form.reset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Produto ao Bar</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar um novo produto ao bar.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {inventoryItems.length > 0 && (
              <FormItem>
                <FormLabel>Item do Inventário</FormLabel>
                <Select
                  onValueChange={handleInventoryItemChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um item do inventário (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (Produto independente)</SelectItem>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.quantity} {item.unitOfMeasure})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Selecionar um item do inventário vinculará automaticamente o stock
                </FormDescription>
              </FormItem>
            )}
            
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
                      <Input type="number" min="0" step="0.01" {...field} />
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Un">Unidade (Un)</SelectItem>
                          <SelectItem value="L">Litro (L)</SelectItem>
                          <SelectItem value="mL">Mililitro (mL)</SelectItem>
                          <SelectItem value="cL">Centilitro (cL)</SelectItem>
                          <SelectItem value="Kg">Quilograma (Kg)</SelectItem>
                          <SelectItem value="g">Grama (g)</SelectItem>
                          <SelectItem value="Copo">Copo</SelectItem>
                          <SelectItem value="Garrafa">Garrafa</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
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
                    <Textarea 
                      placeholder="Descrição do produto (opcional)" 
                      {...field} 
                      value={field.value || ''}
                    />
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
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="1" 
                        {...field} 
                        disabled={!!form.getValues("inventoryId")}
                      />
                    </FormControl>
                    <FormMessage />
                    {form.getValues("inventoryId") && (
                      <FormDescription>
                        Stock controlado pelo inventário
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Mínimo</FormLabel>
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
                  <FormLabel>Imagem do Produto</FormLabel>
                  <FormControl>
                    <FileUpload
                      currentImageUrl={field.value}
                      onUploadComplete={(url) => form.setValue("imageUrl", url)}
                      bucketName="bar"
                      folderPath="products"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visibleInBar"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Visível no Bar
                      </FormLabel>
                      <FormDescription>
                        Mostrar na lista de produtos do bar
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="visibleInRegister"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Visível na Caixa
                      </FormLabel>
                      <FormDescription>
                        Mostrar na caixa registadora
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "A adicionar..." : "Adicionar Produto"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
