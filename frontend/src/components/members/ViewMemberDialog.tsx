import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "./MemberAvatar";
import { MemberTypeBadge } from "./MemberTypeBadge";
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs";
import { MemberVehiclesTab } from "./tabs/MemberVehiclesTab";
import { MemberActivityHistory } from "@/components/MemberActivityHistory";
import { Member } from "@/hooks/use-members";
import { Vehicle, VehicleType } from "@/types/member";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ViewMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Interface para mapear os dados de veículos retornados pela API
interface VehicleApiData {
  id: string;
  brand: string;
  model: string;
  type: string;
  displacement?: number;
  engineSize?: number;
  nickname?: string | null;
  photoUrl?: string | null;
}

export function ViewMemberDialog({ member, open, onOpenChange }: ViewMemberDialogProps) {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Adaptar veículos da API para o tipo Vehicle correto
  const adaptVehicles = useCallback((vehiclesData: VehicleApiData[]): Vehicle[] => {
    if (!vehiclesData || !Array.isArray(vehiclesData)) return [];
    
    return vehiclesData.map(v => {
      // Garantir que o tipo é uma string válida do tipo VehicleType
      let validType: VehicleType = 'Mota'; // Valor padrão
      
      // Verificar se já é um tipo válido do VehicleType
      if (v.type === 'Mota' || v.type === 'Moto-quatro' || v.type === 'Buggy') {
        validType = v.type as VehicleType;
      } else {
        // Mapeamento dos tipos possíveis para os valores aceitos pelo tipo VehicleType
        switch(v.type?.toUpperCase()) {
          case 'MOTORCYCLE':
          case 'CUSTOM':
          case 'CRUISER':
          case 'SPORT':
          case 'TOURING':
          case 'TRAIL':
            validType = 'Mota';
            break;
          case 'QUAD':
          case 'SCOOTER':
            validType = 'Moto-quatro';
            break;
          default:
            validType = 'Buggy';
        }
      }
      
      return {
        id: v.id,
        brand: v.brand,
        model: v.model,
        type: validType,
        displacement: v.displacement || v.engineSize || 0,
        nickname: v.nickname || undefined,
        photoUrl: v.photoUrl || undefined
      };
    });
  }, []);

  const fetchVehicles = useCallback(async () => {
    if (!member?.id) return;

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
        setVehicles(adaptVehicles(data));
      }
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast({
        title: "Erro ao buscar veículos",
        description: "Ocorreu um erro inesperado ao buscar os veículos do membro.",
        variant: "destructive",
      });
    }
  }, [member?.id, toast, adaptVehicles]);

  useEffect(() => {
    if (open && member) {
      fetchVehicles();
    }
  }, [open, member, fetchVehicles]);
  
  if (!member) return null;

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('pt-PT', options);
  };

  // Format address for display
  const formatAddress = () => {
    if (!member.address) return 'Sem morada registada';
    
    const parts = [];
    if (member.address.street) {
      parts.push(`${member.address.street}${member.address.number ? ', ' + member.address.number : ''}`);
    }
    if (member.address.postalCode || member.address.city) {
      parts.push(`${member.address.postalCode || ''}${member.address.city ? ' ' + member.address.city : ''}`);
    }
    if (member.address.district) {
      parts.push(member.address.district);
    }
    if (member.address.country) {
      parts.push(member.address.country);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Morada incompleta';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Membro</DialogTitle>
          <DialogDescription>Informações completas do membro selecionado</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <MemberAvatar 
              photoUrl={member.photoUrl} 
              name={member.name}
              size="lg"
            />
            <div>
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <MemberTypeBadge 
                  type={member.memberType} 
                  isHonorary={member.honoraryMember} 
                />
                <span className="text-sm text-gray-500">#{member.memberNumber}</span>
              </div>
              {member.nickname && (
                <p className="text-sm text-gray-600 italic">"{member.nickname}"</p>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="info">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="vehicles">
                Veículos
                {vehicles.length > 0 && (
                  <span className="ml-1 bg-gray-200 text-gray-800 rounded-full px-1.5 py-0.5 text-xs">
                    {vehicles.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="dues">Quotas</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{member.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p>{member.phoneMain}</p>
                  {member.phoneAlternative && (
                    <p className="text-sm text-gray-500">{member.phoneAlternative}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Entrada</p>
                  <p>{formatDate(member.joinDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo Sanguíneo</p>
                  <p>{member.bloodType || 'Não registado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nome de Usuário</p>
                  <p>{member.username || 'Não definido'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Morada</p>
                  <p>{formatAddress()}</p>
                </div>
                <div className="col-span-2">
                  <div className="flex gap-8">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${member.inWhatsAppGroup ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Grupo WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${member.receivedMemberKit ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Kit de Membro</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="vehicles" className="pt-4">
              <MemberVehiclesTab 
                vehicles={vehicles}
                setIsAddVehicleOpen={() => {}}
                handleDeleteVehicle={() => {}}
              />
            </TabsContent>
            
            <TabsContent value="dues" className="pt-4">
              <p className="text-center text-gray-500 py-4">
                Informações sobre quotas estarão disponíveis em breve.
              </p>
            </TabsContent>
            
            <TabsContent value="history" className="pt-4">
              <MemberActivityHistory 
                memberId={member.id}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
