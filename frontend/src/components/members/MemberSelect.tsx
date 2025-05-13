import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MemberSelectProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

interface Member {
  id: string;
  name: string;
  memberNumber?: string;
  [key: string]: string | number | boolean | undefined; // Para campos adicionais com tipo mais específico
}

interface MemberOption {
  id: string;
  name: string;
  memberNumber: string;
}

export function MemberSelect({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: MemberSelectProps) {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        // Importando o serviço dinamicamente para evitar dependência circular
        const { memberService } = await import('@/services/member-service');
        
        const data = await memberService.getAll();
        
        // Formato os dados como opções para o select
        const options = data.map((member: Member) => ({
          id: member.id,
          name: member.name,
          memberNumber: member.memberNumber || "S/N",
        }));
        
        setMembers(options);
        
        // Se não houver valor selecionado e tivermos opções, seleciona o primeiro
        if (!value && options.length > 0 && required) {
          onChange(options[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar membros:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de membros.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [onChange, required, toast, value]);

  return (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Carregando membros..." : "Selecione um membro"} />
        </SelectTrigger>
        <SelectContent>
          {members.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.name} (#{member.memberNumber})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
