
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl
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
import { useMembers } from "@/hooks/use-members";
import { Member } from "@/types/member";
import { supabase } from "@/integrations/supabase/client";

interface AddAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const addAdminSchema = z.object({
  memberId: z.string().min(1, "Membro é obrigatório"),
  role: z.string().min(1, "Cargo é obrigatório"),
  term: z.string().min(1, "Mandato é obrigatório"),
  termStart: z.string().min(1, "Data de início é obrigatória"),
  termEnd: z.string().min(1, "Data de fim é obrigatória"),
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;

export function AddAdminDialog({ open, onOpenChange, onSuccess }: AddAdminDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { members } = useMembers();
  
  // Filter members that are not already administrators
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  
  useEffect(() => {
    const fetchAdminIds = async () => {
      const { data } = await supabase
        .from('administration')
        .select('member_id')
        .eq('status', 'Ativo');
        
      if (data) {
        const adminIds = data.map(admin => admin.member_id);
        setAvailableMembers(members.filter(member => !adminIds.includes(member.id)));
      } else {
        setAvailableMembers(members);
      }
    };
    
    if (open) {
      fetchAdminIds();
    }
  }, [open, members]);
  
  const form = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      memberId: "",
      role: "",
      term: "",
      termStart: new Date().toISOString().split('T')[0],
      termEnd: new Date(new Date().getFullYear() + 2, 0, 1).toISOString().split('T')[0]
    }
  });

  const handleSubmit = async (values: AddAdminFormValues) => {
    setIsSubmitting(true);
    
    try {
      // 1. Add record to administration table
      const { error } = await supabase
        .from('administration')
        .insert({
          member_id: values.memberId,
          role: values.role,
          term: values.term,
          term_start: values.termStart,
          term_end: values.termEnd,
          status: 'Ativo'
        });
        
      if (error) throw error;

      // 2. Update member type to 'Administração'
      const { error: updateError } = await supabase
        .from('members')
        .update({ member_type: 'Administração' })
        .eq('id', values.memberId);
        
      if (updateError) throw updateError;

      toast({
        title: "Administrador adicionado",
        description: "O membro foi adicionado à administração com sucesso.",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding administrator:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o administrador.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Administrador</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membro</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um membro" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMembers.length > 0 ? (
                          availableMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.memberNumber})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-members" disabled>
                            Não há membros disponíveis
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Presidente">Presidente</SelectItem>
                        <SelectItem value="Vice-Presidente">Vice-Presidente</SelectItem>
                        <SelectItem value="Tesoureiro">Tesoureiro</SelectItem>
                        <SelectItem value="Secretário">Secretário</SelectItem>
                        <SelectItem value="Vogal">Vogal</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
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
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mandato" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <SelectItem key={year} value={`${year} - ${year + 2}`}>
                              {year} - {year + 2}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="termStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início do Mandato</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="termEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim do Mandato</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                type="button"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "A adicionar..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
