
import { useState } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { VehicleFilters } from '@/components/garage/VehicleFilters';
import { VehiclesTable } from '@/components/garage/VehiclesTable';
import { getAllVehicles } from '@/utils/vehicle-utils';
import { Vehicle } from '@/types/member';
import { mockMembers } from '@/data/mock-data';

const Garage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [modelFilter, setModelFilter] = useState<string>('');
  const [displacementFilter, setDisplacementFilter] = useState<string>('');
  
  const vehicles = getAllVehicles(mockMembers);
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

  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-mouro-black">
            <span className="text-mouro-red">Garagem</span> do Clube
          </h1>
          <Button className="bg-mouro-red hover:bg-mouro-red/90">
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

        <VehiclesTable 
          vehicles={filteredVehicles}
          onEditClick={handleEditVehicle}
        />
      </div>
    </MembersLayout>
  );
};

export default Garage;
