
import { useState, useEffect } from 'react';
import { Vehicle } from '@/types/member';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VehicleWithOwner extends Vehicle {
  owner: string;
  memberNumber: string;
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
        // Transform data to match our component's expected format
        const transformedVehicles = data.map((item) => ({
          id: item.id,
          brand: item.brand,
          model: item.model,
          type: item.type,
          displacement: item.displacement,
          nickname: item.nickname || undefined,
          photoUrl: item.photo_url || undefined,
          owner: item.members?.name || 'Desconhecido',
          memberNumber: item.members?.member_number || '-'
        }));
        
        setVehicles(transformedVehicles);
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

  const handleSaveVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      // Get the first member as a default for now
      // In a real app, you'd have a member selector
      const { data: members } = await supabase.from('members').select('id').limit(1);
      const memberId = members && members.length > 0 ? members[0].id : null;
      
      if (!memberId) {
        throw new Error('No member found to associate with vehicle');
      }
      
      const { error } = await supabase.from('vehicles').insert({
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type,
        displacement: vehicle.displacement,
        nickname: vehicle.nickname || null,
        photo_url: vehicle.photoUrl || null,
        member_id: memberId
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
