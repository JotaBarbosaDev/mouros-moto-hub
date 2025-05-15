import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Member } from "@/hooks/use-members";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { AddVehicleDialog } from "@/components/garage/AddVehicleDialog";
import { Vehicle, VehicleType } from "@/types/member";
import { MemberFormTabs } from "./MemberFormTabs";
import { EditMemberFormValues, editMemberSchema } from "./MemberFormTypes";
import { CustomSupabaseClient } from "@/types/custom-supabase";
// Importamos o serviço diretamente para evitar importação dinâmica
import { userAuthService } from "@/services/user-auth-service";
import { UsernameDebugger } from '../debug/UsernameDebugger';

interface EditMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (editedMember: Member) => void;
}

// Interfaces para mapear os dados do Supabase
interface VehicleData {
  id: string;
  brand: string;
  model: string;
  type: string;
  displacement: string | number;
  nickname: string | null;
  photo_url: string | null;
  member_id: string;
}

interface DuesPaymentData {
  id: string;
  member_id: string;
  year: number;
  paid: boolean;
  exempt: boolean;
  payment_date?: string | null;
}

export function EditMemberDialog({ member, open, onOpenChange, onSave }: EditMemberDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [duesPayments, setDuesPayments] = useState<{year: number, paid: boolean, exempt: boolean}[]>([]);
  const [memberAddress, setMemberAddress] = useState<{
    street: string;
    number: string;
    postalCode: string;
    city: string;
    district: string;
    country: string;
  } | null>(null);
  
  // Fetch member's address - usando useCallback para evitar recriações desnecessárias
  const fetchAddress = useCallback(async () => {
    if (!member) return;
    
    try {
      const customSupabase = supabase as CustomSupabaseClient;
      // Usando maybeSingle em vez de single para evitar erro 406
      const { data, error } = await customSupabase
        .from('addresses')
        .select('*')
        .eq('member_id', member.id)
        .maybeSingle();
        
      if (error) {
        // Apenas registra o erro mas não impede a operação
        console.warn('Erro ao buscar endereço do membro:', error);
        return;
      }
      
      if (data) {
        setMemberAddress({
          street: data.street || '',
          number: data.number || '',
          postalCode: data.postal_code || '',
          city: data.city || '',
          district: data.district || '',
          country: data.country || '',
        });
      }
    } catch (err) {
      console.error('Error in fetchAddress:', err);
      // Não exibimos toast de erro para não interromper a experiência do usuário
    }
  }, [member]);
  
  // Fetch member's vehicles - usando useCallback para evitar recriações desnecessárias e API REST
  const fetchVehicles = useCallback(async () => {
    if (!member) return;
    
    try {
      // Usar a API REST para buscar veículos do membro
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      console.log(`Buscando veículos do membro na URL: ${baseUrl}/vehicles/member/${member.id}`);
      
      const response = await fetch(`${baseUrl}/vehicles/member/${member.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data) {
        console.log('Dados de veículos recebidos para o membro:', data);
        
        // Transform to match our Vehicle type
        const vehiclesData = data.map((v: {
          id: string;
          brand: string;
          model: string;
          type: string;
          displacement?: number | string;
          engineSize?: number | string;
          nickname?: string | null;
          photoUrl?: string | null;
        }) => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          type: v.type as VehicleType,
          displacement: v.displacement ? 
            (typeof v.displacement === 'string' ? parseInt(v.displacement, 10) : v.displacement) :
            (typeof v.engineSize === 'string' ? parseInt(v.engineSize, 10) : (v.engineSize as number || 0)),
          nickname: v.nickname || undefined,
          photoUrl: v.photoUrl || undefined,
        }));
        
        setVehicles(vehiclesData);
      }
    } catch (err) {
      console.error('Error in fetchVehicles:', err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os veículos do membro.",
        variant: "destructive",
      });
    }
  }, [member, toast]);

  // Fetch dues payments - usando useCallback para evitar recriações desnecessárias
  const fetchDuesPayments = useCallback(async () => {
    if (!member) return;
    
    try {
      const customSupabase = supabase as CustomSupabaseClient;
      const { data, error } = await customSupabase
        .from('dues_payments')
        .select('*')
        .eq('member_id', member.id)
        .order('year', { ascending: false });
        
      if (error) {
        console.error('Error fetching dues payments:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setDuesPayments((data as unknown as DuesPaymentData[]).map(p => ({
          year: p.year,
          paid: p.paid,
          exempt: p.exempt
        })));
      } else {
        // Create default dues payments for last 3 years
        const currentYear = new Date().getFullYear();
        const defaults = Array.from({length: 3}, (_, i) => ({
          year: currentYear - i,
          paid: false,
          exempt: false
        }));
        setDuesPayments(defaults);
      }
    } catch (err) {
      console.error('Error in fetchDuesPayments:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar as informações de pagamento.",
        variant: "destructive",
      });
    }
  }, [member, toast]);
  
  const form = useForm<EditMemberFormValues>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      name: member?.name || "",
      email: member?.email || "",
      phoneMain: member?.phoneMain || "",
      phoneAlternative: member?.phoneAlternative || "",
      nickname: member?.nickname || "",
      username: member?.username || "",
      bloodType: member?.bloodType,
      memberType: member?.memberType || "Sócio Adulto",
      inWhatsAppGroup: member?.inWhatsAppGroup || false,
      receivedMemberKit: member?.receivedMemberKit || false,
      photoUrl: member?.photoUrl || "",
      // Adicionando os valores padrão para os novos campos
      isActive: member?.isActive ?? true,
      honoraryMember: member?.honoraryMember ?? false,
      legacyMember: member?.legacyMember ?? false,
      registrationFeePaid: member?.registrationFeePaid ?? false,
      registrationFeeExempt: member?.registrationFeeExempt ?? false,
      isAdmin: member?.isAdmin ?? false,
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
        username: member.username || "",
        bloodType: member.bloodType,
        memberType: member.memberType,
        inWhatsAppGroup: member.inWhatsAppGroup || false,
        receivedMemberKit: member.receivedMemberKit || false,
        photoUrl: member.photoUrl || "",
        // Adicionando os campos de status do membro
        isActive: member.isActive ?? true,
        honoraryMember: member.honoraryMember ?? false,
        legacyMember: member.legacyMember ?? false,
        registrationFeePaid: member.registrationFeePaid ?? false,
        registrationFeeExempt: member.registrationFeeExempt ?? false,
        isAdmin: member.isAdmin ?? false,
      });
      
      // Load member vehicles
      fetchVehicles();
      
      // Load dues payments or create defaults for the last 3 years
      fetchDuesPayments();
      
      // Load member address
      fetchAddress();
    }
  }, [member, form, fetchVehicles, fetchDuesPayments, fetchAddress]);
  
  // Handle adding new vehicle
  const handleAddVehicle = async (vehicle: Omit<Vehicle, 'id'>, memberId?: string) => {
    if (!member) return;
    
    // Usamos o memberId passado como parâmetro ou o ID do membro atual
    const targetMemberId = memberId || member.id;
    
    try {
      // Verifica se a URL da foto é uma string Base64 (data:image/...)
      const photoUrl = vehicle.photoUrl && vehicle.photoUrl.startsWith('data:') 
        ? null // Não envia dados Base64 diretamente
        : vehicle.photoUrl;
      
      // Add vehicle to database usando a API REST
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      // Preparar os dados para envio
      const vehicleData = {
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type,
        displacement: vehicle.displacement,
        nickname: vehicle.nickname || null,
        photo_url: photoUrl,
        member_id: targetMemberId
      };
      
      console.log('Enviando dados do veículo para API:', vehicleData);
      
      const response = await fetch(`${baseUrl}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        },
        body: JSON.stringify(vehicleData)
      });
        
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Obter o veículo criado da resposta
      const responseData = await response.json();
      
      // Criar o objeto de veículo para o estado local
      const newVehicle: Vehicle = {
        id: responseData.id,
        brand: responseData.brand,
        model: responseData.model,
        type: responseData.type as VehicleType,
        displacement: responseData.engineSize,
        nickname: responseData.nickname || undefined,
        photoUrl: responseData.photoUrl || undefined,
      };
      
      // Adicionar ao estado local
      setVehicles(prev => [...prev, newVehicle]);
      
      toast({
        title: "Veículo adicionado",
        description: "O veículo foi adicionado com sucesso.",
      });
      
      // Atualiza a lista de veículos do membro
      fetchVehicles();
      
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o veículo.",
        variant: "destructive",
      });
    }
  };
  
  // Handle deleting a vehicle
  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      // Usar a API REST para excluir o veículo
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      console.log(`Excluindo veículo na URL: ${baseUrl}/vehicles/${vehicleId}`);
      
      const response = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        }
      });
        
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      
      toast({
        title: "Veículo removido",
        description: "O veículo foi removido com sucesso.",
      });
      
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o veículo.",
        variant: "destructive",
      });
    }
  };
  
  // Handle updating dues payment status
  const handleDuesPaymentChange = async (year: number, field: 'paid' | 'exempt', value: boolean) => {
    if (!member) return;
    
    try {
      // Check if payment record exists
      const customSupabase = supabase as CustomSupabaseClient;
      const { data: existingPayment } = await customSupabase
        .from('dues_payments')
        .select('id')
        .eq('member_id', member.id)
        .eq('year', year)
        .maybeSingle();
        
      if (existingPayment) {
        // Update existing record
        const customSupabase = supabase as CustomSupabaseClient;
        await customSupabase
          .from('dues_payments')
          .update({ 
            [field]: value,
            // If marking as paid, set payment date
            ...(field === 'paid' && value ? { payment_date: new Date().toISOString() } : {})
          })
          .eq('id', existingPayment.id);
      } else {
        // Create new record
        const customSupabase = supabase as CustomSupabaseClient;
        await customSupabase
          .from('dues_payments')
          .insert({
            member_id: member.id,
            year: year,
            [field]: value,
            ...(field === 'paid' && value ? { payment_date: new Date().toISOString() } : {})
          });
      }
      
      // Update local state
      setDuesPayments(prev => 
        prev.map(p => p.year === year ? { ...p, [field]: value } : p)
      );
      
      toast({
        title: "Atualizado",
        description: `Status da cota de ${year} atualizado.`,
      });
      
    } catch (error) {
      console.error('Error updating dues payment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o pagamento.",
        variant: "destructive",
      });
    }
  };

  // Verifica se é seguro usar a coluna username
  // Função melhorada para verificar se a coluna username existe na tabela members
  const isUsernameColumnAvailable = async () => {
    try {
      const customSupabase = supabase as CustomSupabaseClient;
      
      // Método mais seguro: verificar nos dados retornados
      const { data: membersData } = await customSupabase
        .from('members')
        .select()
        .limit(1);
        
      // Verifica se retornou algum dado e se o primeiro item tem a propriedade username
      if (membersData && membersData.length > 0) {
        return 'username' in membersData[0];
      }
      
      // Se não temos dados, fazemos um teste mais específico
      try {
        // Tenta selecionar apenas a coluna username
        const { error } = await customSupabase
          .from('members')
          .select('username')
          .limit(1);
          
        // Se não der erro, a coluna provavelmente existe
        return !error;
      } catch (e) {
        // Se deu erro, provavelmente a coluna não existe
        console.warn('Erro ao tentar consultar a coluna username:', e);
        return false;
      }
    } catch (error) {
      console.warn('A coluna username não parece existir:', error);
      return false;
    }
    
    // Se chegamos aqui, assumimos que a coluna não existe por segurança
    return false;
  };

  const handleSubmit = async (values: EditMemberFormValues) => {
    if (!member) return;
    setIsSubmitting(true);
    
    try {
      // Prepara os dados de atualização
      const updateData: Record<string, unknown> = {
        name: values.name,
        email: values.email,
        phone_main: values.phoneMain || "", // Garantir que phoneMain nunca seja undefined
        phone_alternative: values.phoneAlternative || null, // Pode ser null se não informado
        nickname: values.nickname || null,
        blood_type: values.bloodType,
        member_type: values.memberType,
        in_whatsapp_group: values.inWhatsAppGroup || false,
        received_member_kit: values.receivedMemberKit || false,
        photo_url: values.photoUrl && values.photoUrl.startsWith('data:') ? null : values.photoUrl,
      };
      
      // Se temos um username, atualizamos os metadados do usuário na auth
      if (values.username && values.username !== member.username) {
        console.info("Username original:", member.username);
        console.info("Novo username fornecido:", values.username);
        console.info("Comparação:", { original: member.username, novo: values.username, sãoIguais: values.username === member.username });
        
        try {
          // Log detalhado para verificação do formato
          console.log("DIAGNÓSTICO DE USERNAME:");
          console.log("- Username original:", JSON.stringify(member.username));
          console.log("- Novo username:", JSON.stringify(values.username));
          console.log("- Contém pontos?", values.username.includes("."));
          console.log("- Caracteres:", [...values.username].join(", "));
          
          // Tenta até 3 vezes atualizar os metadados do usuário
          for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`Tentativa ${attempt} de atualizar username nos metadados...`);
            
            const { error: metadataError } = await userAuthService.updateUserMetadata(
              member.id, 
              {
                username: values.username,
                // Mantém outros metadados que podem existir
                name: member.name
              }
            );
            
            if (!metadataError) {
              console.log("Username atualizado com sucesso nos metadados");
              break; // Se não houve erro, sai do loop
            } else {
              console.error(`Erro na tentativa ${attempt} de atualizar username:`, metadataError);
              
              // Se foi a última tentativa, avisa o usuário
              if (attempt === 3) {
                toast({
                  title: "Aviso",
                  description: "Não foi possível atualizar o nome de usuário após várias tentativas.",
                  variant: "destructive",
                });
              } else {
                // Espera um segundo antes da próxima tentativa
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
        } catch (err) {
          console.warn("Erro ao atualizar username nos metadados:", err);
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao tentar atualizar o nome de usuário.",
            variant: "destructive",
          });
          // Continuamos mesmo se falhar a atualização dos metadados
        }
      }
      
      // Se temos uma senha nova, atualizamos a senha do usuário usando a função Edge
      if (values.password) {
        console.info("Senha fornecida, atualizando...");
        try {
          // Tenta até 3 vezes atualizar a senha do usuário
          for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`Tentativa ${attempt} de atualizar a senha...`);
            
            const { error: resetError } = await userAuthService.updateUserPassword(
              member.id,
              values.password
            );
            
            if (!resetError) {
              toast({
                title: "Sucesso",
                description: "Senha atualizada com sucesso.",
                variant: "default",
              });
              break; // Se não houve erro, sai do loop
            } else {
              console.error(`Erro na tentativa ${attempt} de atualizar senha:`, resetError);
              
              // Se foi a última tentativa, avisa o usuário
              if (attempt === 3) {
                toast({
                  title: "Erro",
                  description: "Não foi possível atualizar a senha após várias tentativas.",
                  variant: "destructive",
                });
              } else {
                // Espera um segundo antes da próxima tentativa
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
        } catch (err) {
          console.warn("Erro ao atualizar senha:", err);
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao tentar atualizar a senha.",
            variant: "destructive",
          });
        }
      }
      
      // Update member in database
      const customSupabase = supabase as CustomSupabaseClient;
      const { error } = await customSupabase
        .from('members')
        .update(updateData)
        .eq('id', member.id);
        
      if (error) {
        // Verifica se é um erro de restrição de unicidade (unique constraint)
        if (error.message && 
            typeof error.message === 'string' && 
            error.message.includes('unique constraint') && 
            error.message.includes('username')) {
          throw new Error('Este username já está sendo usado por outro membro. Por favor, escolha um username diferente.');
        }
        
        // Se não for erro de username, verifica se é um erro sobre coluna inexistente
        if (error.message && 
            typeof error.message === 'string' && 
            error.message.includes('column') && 
            error.message.includes('not exist')) {
          console.warn('Erro de coluna inexistente:', error.message);
          // Continuamos a execução para não bloquear toda a atualização
        } else {
          throw error;
        }
      }
      
      // Atualiza o endereço se o membro tiver um
      if (memberAddress) {
        try {
          // Verifica se o endereço já existe
          const { data: existingAddress, error: addressQueryError } = await customSupabase
            .from('addresses')
            .select('id')
            .eq('member_id', member.id)
            .maybeSingle();
            
          if (addressQueryError) {
            console.warn('Erro ao verificar endereço existente:', addressQueryError);
          } else {
            if (existingAddress) {
              // Atualiza o endereço existente
              const { error: updateAddressError } = await customSupabase
                .from('addresses')
                .update({
                  street: memberAddress.street,
                  number: memberAddress.number,
                  postal_code: memberAddress.postalCode,
                  city: memberAddress.city,
                  district: memberAddress.district,
                  country: memberAddress.country
                })
                .eq('id', existingAddress.id);
                
              if (updateAddressError) {
                console.warn('Erro ao atualizar endereço:', updateAddressError);
              }
            } else {
              // Cria um novo endereço
              const { error: insertAddressError } = await customSupabase
                .from('addresses')
                .insert({
                  member_id: member.id,
                  street: memberAddress.street,
                  number: memberAddress.number,
                  postal_code: memberAddress.postalCode,
                  city: memberAddress.city,
                  district: memberAddress.district,
                  country: memberAddress.country
                });
                
              if (insertAddressError) {
                console.warn('Erro ao inserir endereço:', insertAddressError);
              }
            }
          }
        } catch (addressError) {
          console.error('Exceção ao atualizar endereço:', addressError);
          // Não interrompe o fluxo principal em caso de erro no endereço
        }
      }
      
      // Update only the edited fields
      const editedMember: Member = {
        ...member,
        name: values.name,
        email: values.email,
        phoneMain: values.phoneMain || "", // Garantir que não seja undefined
        phoneAlternative: values.phoneAlternative || undefined, // Manter undefined se não presente
        nickname: values.nickname,
        username: values.username,
        bloodType: values.bloodType,
        memberType: values.memberType,
        inWhatsAppGroup: values.inWhatsAppGroup || false,
        receivedMemberKit: values.receivedMemberKit || false,
        photoUrl: values.photoUrl,
        // Adicionar campos de status do membro
        isActive: values.isActive ?? true,
        honoraryMember: values.honoraryMember ?? false,
        legacyMember: values.legacyMember ?? false,
        registrationFeePaid: values.registrationFeePaid ?? false,
        registrationFeeExempt: values.registrationFeeExempt ?? false,
        isAdmin: values.isAdmin ?? false,
        vehicles: vehicles, // Include updated vehicles
        // Usar o endereço atualizado se disponível, ou manter o atual
        address: memberAddress || member.address
      };
  
      onSave(editedMember);
      
      toast({
        title: "Membro atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating member:', error);
      
      // Exibe mensagem de erro mais específica se disponível
      const errorMessage = error instanceof Error ? error.message : "Não foi possível atualizar o membro.";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Membro</DialogTitle>
          <DialogDescription>Edite as informações do membro selecionado</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <MemberFormTabs 
              form={form}
              member={member}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              vehicles={vehicles}
              setVehicles={setVehicles}
              duesPayments={duesPayments}
              setDuesPayments={setDuesPayments}
              isAddVehicleOpen={isAddVehicleOpen}
              setIsAddVehicleOpen={setIsAddVehicleOpen}
              handleDeleteVehicle={handleDeleteVehicle}
              handleDuesPaymentChange={handleDuesPaymentChange}
            />
            
            <div className="flex justify-end mt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-24"
              >
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
        
        {/* Componente de Debug de Username */}
        <UsernameDebugger userId={member.id} originalUsername={member.username || ''} />
        
        {/* Dialog para adicionar um novo veículo */}
        <AddVehicleDialog 
          open={isAddVehicleOpen} 
          onOpenChange={setIsAddVehicleOpen} 
          onSave={handleAddVehicle}
          memberId={member.id}
          hideOwnerSelect={true}
        />
      </DialogContent>
      </Dialog>
    );
  };
