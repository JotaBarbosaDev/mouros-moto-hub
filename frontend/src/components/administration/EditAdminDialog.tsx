
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon, Check, X, Loader2 } from 'lucide-react';
import { AdministrationMember } from './AdministrationTable';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  role: z.string().min(1, 'O cargo é obrigatório'),
  term: z.string().min(1, 'O mandato é obrigatório'),
  termStart: z.date({
    required_error: 'Data de início é obrigatória',
  }),
  termEnd: z.date({
    required_error: 'Data de fim é obrigatória',
  }).refine(date => date > new Date(), {
    message: "Data de fim deve ser no futuro",
  }),
  status: z.enum(['Ativo', 'Inativo', 'Licença']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditAdminDialogProps {
  admin: AdministrationMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditAdminDialog({
  admin,
  open,
  onOpenChange,
  onSuccess,
}: EditAdminDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Parse dates from string to Date objects
  const defaultValues: FormValues = {
    role: admin.cargo || '',
    term: admin.mandato || '2024-2026',
    termStart: admin.inicioMandato ? new Date(admin.inicioMandato) : new Date(),
    termEnd: admin.fimMandato ? new Date(admin.fimMandato) : new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
    status: admin.status || 'Ativo',
    notes: '',
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Check if there's already an administration record
      const { data: existingAdmin, error: fetchError } = await supabase
        .from('administration')
        .select('*')
        .eq('member_id', admin.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;

      let updateError;
      
      if (existingAdmin) {
        // Update existing record
        const { error } = await supabase
          .from('administration')
          .update({
            role: values.role,
            status: values.status,
            term: values.term,
            term_start: format(values.termStart, 'yyyy-MM-dd'),
            term_end: format(values.termEnd, 'yyyy-MM-dd'),
          })
          .eq('member_id', admin.id);
        
        updateError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('administration')
          .insert({
            member_id: admin.id,
            role: values.role,
            status: values.status,
            term: values.term,
            term_start: format(values.termStart, 'yyyy-MM-dd'),
            term_end: format(values.termEnd, 'yyyy-MM-dd'),
          });
        
        updateError = error;
      }
      
      if (updateError) throw updateError;
      
      toast({
        title: "Administrador atualizado",
        description: `Os dados de ${admin.nome} foram atualizados com sucesso.`,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating administrator:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os dados do administrador.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Administrador</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-lg">{admin.nome}</span>
                <span className="text-sm text-muted-foreground">#{admin.memberNumber}</span>
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Presidente">Presidente</SelectItem>
                        <SelectItem value="Vice-Presidente">Vice-Presidente</SelectItem>
                        <SelectItem value="Tesoureiro">Tesoureiro</SelectItem>
                        <SelectItem value="Secretário">Secretário</SelectItem>
                        <SelectItem value="Vogal">Vogal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mandato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2024-2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="termStart"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Início do Mandato</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: pt })
                              ) : (
                                <span>Selecionar data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="termEnd"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fim do Mandato</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: pt })
                              ) : (
                                <span>Selecionar data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span>Ativo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Inativo">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            <span>Inativo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Licença">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                            <span>Licença</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notas adicionais sobre este administrador..." 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
