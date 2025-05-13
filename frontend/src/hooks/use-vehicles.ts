
import { useState, useEffect, useCallback } from 'react';
import { Vehicle } from '@/types/member';
import { useToast } from '@/hooks/use-toast';
import { vehicleService, VehicleWithOwner } from '@/services/vehicle-service';

// Re-export VehicleWithOwner para compatibilidade
export type { VehicleWithOwner };

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<VehicleWithOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchVehicles = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Buscando veículos...');
      
      // Usando o serviço de veículos para fazer a chamada
      const data = await vehicleService.getAll();
      console.log('Veículos carregados:', data.length);
      
      setVehicles(data);
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
  }, [toast]);

  const handleSaveVehicle = async (vehicle: Omit<Vehicle, 'id'>, memberId?: string) => {
    try {
      // Verificar se o ID do membro foi fornecido
      if (!memberId) {
        throw new Error('É necessário fornecer um ID de membro para associar o veículo');
      }
      
      console.log('Salvando veículo...');
      console.log('Dados do veículo:', { ...vehicle, memberId });
      
      await vehicleService.create({
        ...vehicle,
        memberId
      });
      
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
  }, [fetchVehicles]);

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
