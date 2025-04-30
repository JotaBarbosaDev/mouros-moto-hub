
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Member, BloodType, MemberType } from "@/types/member";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (editedMember: Member) => void;
}

// Create a Zod schema that matches the BloodType type
const bloodTypeSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional();
const memberTypeSchema = z.enum(['Sócio Adulto', 'Sócio Criança', 'Administração', 'Convidado']);

const editMemberSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phoneMain: z.string().min(1, "Telefone principal é obrigatório"),
  phoneAlternative: z.string().optional(),
  nickname: z.string().optional(),
  bloodType: bloodTypeSchema,
  memberType: memberTypeSchema,
});

type EditMemberFormValues = z.infer<typeof editMemberSchema>;

export function EditMemberDialog({ member, open, onOpenChange, onSave }: EditMemberDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EditMemberFormValues>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      name: member?.name || "",
      email: member?.email || "",
      phoneMain: member?.phoneMain || "",
      phoneAlternative: member?.phoneAlternative || "",
      nickname: member?.nickname || "",
      bloodType: member?.bloodType,
      memberType: member?.memberType || "Sócio Adulto",
    }
  });

  // Update form when member changes
  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        email: member.email,
        phoneMain: member.phoneMain,
        phoneAlternative: member.phoneAlternative || "",
        nickname: member.nickname || "",
        bloodType: member.bloodType,
        memberType: member.memberType,
      });
    }
  }, [member, form]);
  
  if (!member) return null;

  const handleSubmit = (values: EditMemberFormValues) => {
    setIsSubmitting(true);
    
    // Update only the edited fields
    const editedMember: Member = {
      ...member,
      ...values
    };

    // Simulate API call delay
    setTimeout(() => {
      onSave(editedMember);
      setIsSubmitting(false);
      onOpenChange(false);
      toast({
        title: "Membro atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Membro</DialogTitle>
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
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneMain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone Principal</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneAlternative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone Alternativo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alcunha</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bloodType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo Sanguíneo</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo sanguíneo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memberType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Membro</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de membro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sócio Adulto">Sócio Adulto</SelectItem>
                        <SelectItem value="Sócio Criança">Sócio Criança</SelectItem>
                        <SelectItem value="Administração">Administração</SelectItem>
                        <SelectItem value="Convidado">Convidado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            
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
                {isSubmitting ? "A guardar..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
