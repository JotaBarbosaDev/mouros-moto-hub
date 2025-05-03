
import { useState } from "react";
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
import { InventoryCategory, InventoryUseType } from "@/types/inventory";
import { FileUpload } from "@/components/common/FileUpload";

interface AddInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const inventoryItemSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  quantity: z.coerce.number().int().min(0, { message: "A quantidade deve ser um número inteiro não negativo" }),
  unitOfMeasure: z.string().min(1, { message: "A unidade de medida é obrigatória" }),
  category: z.string().min(1, { message: "A categoria é obrigatória" }),
  useType: z.string().min(1, { message: "O tipo de uso é obrigatório" }),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof inventoryItemSchema>;

export function AddInventoryItemDialog({ open, onOpenChange, onSubmit }: AddInventoryItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      unitOfMeasure: "",
      category: "Bebida",
      useType: "Bar",
      imageUrl: "",
    }
  });
  
  const handleSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o item.",
        variant: "destructive",
      });
      console.error("Error submitting inventory item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) form.reset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar um novo item ao inventário.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            
            <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="Kg">Quilograma (Kg)</SelectItem>
                          <SelectItem value="g">Grama (g)</SelectItem>
                          <SelectItem value="Caixa">Caixa</SelectItem>
                          <SelectItem value="Pacote">Pacote</SelectItem>
                          <SelectItem value="Garrafa">Garrafa</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bebida">Bebida</SelectItem>
                          <SelectItem value="Comida">Comida</SelectItem>
                          <SelectItem value="Roupa">Roupa</SelectItem>
                          <SelectItem value="Equipamento">Equipamento</SelectItem>
                          <SelectItem value="Material Promocional">Material Promocional</SelectItem>
                          <SelectItem value="Material de Limpeza">Material de Limpeza</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="useType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Uso</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de uso" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bar">Bar</SelectItem>
                          <SelectItem value="Loja">Loja</SelectItem>
                          <SelectItem value="Limpeza">Limpeza</SelectItem>
                          <SelectItem value="Eventos">Eventos</SelectItem>
                          <SelectItem value="Brinde">Brinde</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem do Item</FormLabel>
                  <FormControl>
                    <FileUpload
                      onUploadComplete={(url) => form.setValue("imageUrl", url)}
                      bucketName="inventory"
                      folderPath="items"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                {isSubmitting ? "A adicionar..." : "Adicionar Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
