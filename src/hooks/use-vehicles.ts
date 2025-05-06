
import { useState, useEffect } from 'react';
import { Vehicle, VehicleType } from '@/types/member';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VehicleWithOwner extends Vehicle {
  owner: string;
  memberNumber: string;
}

// Define the type for the Supabase response
interface VehicleResponse {
  id: string;
  brand: string;
  model: string;
  type: string;
  displacement: number;
  nickname: string | null;
  photo_url: string | null;
  members: {
    id: string;
    name: string;
    member_number: string;
  } | null;
}

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<VehicleWithOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id,
          brand,
          model,
          type,
          displacement,
          nickname,
          photo_url,
          members (
            id,
            name,
            member_number
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Cast to unknown first then to the expected type
        const vehicleData = data as unknown as VehicleResponse[];
        
        // Transform data to match our component's expected format
        const transformedVehicles = vehicleData.map((item) => ({
          id: item.id,
          brand: item.brand,
          model: item.model,
          type: item.type as VehicleType, // Cast string to VehicleType enum
          displacement: item.displacement,
          nickname: item.nickname || undefined,
          photoUrl: item.photo_url || undefined,
          owner: item.members ? item.members.name || 'Desconhecido' : 'Desconhecido',
          memberNumber: item.members ? item.members.member_number || '-' : '-'
        }));
        
        // Cast the transformed vehicles to VehicleWithOwner[]
        setVehicles(transformedVehicles as VehicleWithOwner[]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os veículos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVehicle = async (vehicle: Omit<Vehicle, 'id'>, memberId?: string) => {
    try {
      // If memberId is provided, use it; otherwise get the first member
      let targetMemberId = memberId;
      
      if (!targetMemberId) {
        // Get the first member as a default for now
        const { data: members } = await supabase.from('members').select('id').limit(1);
        targetMemberId = members && members.length > 0 ? members[0].id : null;
      }
      
      if (!targetMemberId) {
        throw new Error('No member found to associate with vehicle');
      }
      
      const { error } = await supabase.from('vehicles').insert({
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type,
        displacement: vehicle.displacement,
        nickname: vehicle.nickname || null,
        photo_url: vehicle.photoUrl || null,
        member_id: targetMemberId
      });
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Veículo adicionado com sucesso.',
      });
      
      // Refresh the vehicles list
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o veículo.',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  useEffect(() => {
    fetchVehicles();
  }, []);

  const getFilters = () => {
    const uniqueBrands = [...new Set(vehicles.map(v => v.brand))];
    const uniqueModels = [...new Set(vehicles.map(v => v.model))];
    const uniqueDisplacements = [...new Set(vehicles.map(v => v.displacement))];
    
    return {
      uniqueBrands,
      uniqueModels,
      uniqueDisplacements
    };
  };
  
  return {
    vehicles,
    isLoading,
    fetchVehicles,
    handleSaveVehicle,
    getFilters
  };
};
