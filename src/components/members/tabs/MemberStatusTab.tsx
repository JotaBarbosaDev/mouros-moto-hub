
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormProps } from "../MemberFormTypes";

export function MemberStatusTab({ form, member }: FormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
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
        
        {form.watch("memberType") === "Administração" && (
          <FormField
            control={form.control}
            name="adminStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Administrativo</FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || "Ativo"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Licença">Licença</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Status do membro dentro da administração
                </FormDescription>
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="inWhatsAppGroup"
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
                  Grupo WhatsApp
                </FormLabel>
                <FormDescription>
                  O membro está incluído no grupo de WhatsApp
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="receivedMemberKit"
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
                  Kit de Membro
                </FormLabel>
                <FormDescription>
                  O membro recebeu o kit completo
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
