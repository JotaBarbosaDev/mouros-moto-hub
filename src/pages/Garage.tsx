import { useState, useEffect } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { VehicleFilters } from '@/components/garage/VehicleFilters';
import { VehiclesTable } from '@/components/garage/VehiclesTable';
import { Vehicle } from '@/types/member';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AddVehicleDialog } from '@/components/garage/AddVehicleDialog';

const Garage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [modelFilter, setModelFilter] = useState<string>('');
  const [displacementFilter, setDisplacementFilter] = useState<string>('');
  const [vehicles, setVehicles] = useState<Array<Vehicle & { owner: string; memberNumber: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
          owner: item.members ? item.members.name || 'Desconhecido' : 'Desconhecido',
          memberNumber: item.members ? item.members.member_number || '-' : '-'
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
  
  useEffect(() => {
    fetchVehicles();
  }, [toast]);
  
  const uniqueBrands = [...new Set(vehicles.map(v => v.brand))];
  const uniqueModels = [...new Set(vehicles.map(v => v.model))];
  const uniqueDisplacements = [...new Set(vehicles.map(v => v.displacement))];
  
  const filteredVehicles = vehicles.filter(vehicle => {
    
    const matchesSearch = 
      vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = brandFilter === '' || brandFilter === 'all-brands' ? true : vehicle.brand === brandFilter;
    const matchesModel = modelFilter === '' || modelFilter === 'all-models' ? true : vehicle.model === modelFilter;
    const matchesDisplacement = displacementFilter === '' || displacementFilter === 'all-displacements' ? true : vehicle.displacement.toString() === displacementFilter;
    
    return matchesSearch && matchesBrand && matchesModel && matchesDisplacement;
  });
  
  const clearFilters = () => {
    setBrandFilter('');
    setModelFilter('');
    setDisplacementFilter('');
  };

  const handleEditVehicle = (vehicle: Vehicle & { owner: string; memberNumber: string }) => {
    console.log('Edit vehicle:', vehicle);
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

  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-mouro-black">
            <span className="text-mouro-red">Garagem</span> do Clube
          </h1>
          <Button 
            className="bg-mouro-red hover:bg-mouro-red/90"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Veículo
          </Button>
        </div>

        <VehicleFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          brandFilter={brandFilter}
          setBrandFilter={setBrandFilter}
          modelFilter={modelFilter}
          setModelFilter={setModelFilter}
          displacementFilter={displacementFilter}
          setDisplacementFilter={setDisplacementFilter}
          uniqueBrands={uniqueBrands}
          uniqueModels={uniqueModels}
          uniqueDisplacements={uniqueDisplacements}
          clearFilters={clearFilters}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>A carregar veículos...</p>
          </div>
        ) : filteredVehicles.length > 0 ? (
          <VehiclesTable 
            vehicles={filteredVehicles}
            onEditClick={handleEditVehicle}
          />
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-md border border-slate-200 mt-4">
            <h3 className="text-xl font-medium text-slate-900 mb-2">Nenhum veículo encontrado</h3>
            <p className="text-sm text-slate-500">Nenhum veículo foi encontrado na base de dados ou com os filtros aplicados.</p>
          </div>
        )}
        
        <AddVehicleDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveVehicle}
        />
      </div>
    </MembersLayout>
  );
};

export default Garage;
