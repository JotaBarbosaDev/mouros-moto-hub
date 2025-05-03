
import { useState } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { VehicleFilters } from '@/components/garage/VehicleFilters';
import { VehiclesTable } from '@/components/garage/VehiclesTable';
import { Vehicle } from '@/types/member';
import { AddVehicleDialog } from '@/components/garage/AddVehicleDialog';
import { useVehicles, VehicleWithOwner } from '@/hooks/use-vehicles';

const Garage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [modelFilter, setModelFilter] = useState<string>('');
  const [displacementFilter, setDisplacementFilter] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { vehicles, isLoading, handleSaveVehicle, getFilters } = useVehicles();
  const { uniqueBrands, uniqueModels, uniqueDisplacements } = getFilters();
  
  const handleEditVehicle = (vehicle: VehicleWithOwner) => {
    console.log('Edit vehicle:', vehicle);
  };

  const clearFilters = () => {
    setBrandFilter('');
    setModelFilter('');
    setDisplacementFilter('');
  };

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

        <GarageContent 
          isLoading={isLoading} 
          filteredVehicles={filteredVehicles} 
          onEditClick={handleEditVehicle} 
        />
        
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
