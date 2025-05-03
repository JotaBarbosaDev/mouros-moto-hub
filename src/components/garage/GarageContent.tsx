
import { VehiclesTable } from '@/components/garage/VehiclesTable';
import { VehicleWithOwner } from '@/hooks/use-vehicles';

interface GarageContentProps {
  isLoading: boolean;
  filteredVehicles: VehicleWithOwner[];
  onEditClick: (vehicle: VehicleWithOwner) => void;
}

export const GarageContent = ({ 
  isLoading, 
  filteredVehicles, 
  onEditClick 
}: GarageContentProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>A carregar veículos...</p>
      </div>
    );
  }
  
  if (filteredVehicles.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-md border border-slate-200 mt-4">
        <h3 className="text-xl font-medium text-slate-900 mb-2">Nenhum veículo encontrado</h3>
        <p className="text-sm text-slate-500">Nenhum veículo foi encontrado na base de dados ou com os filtros aplicados.</p>
      </div>
    );
  }
  
  return (
    <VehiclesTable 
      vehicles={filteredVehicles}
      onEditClick={onEditClick}
    />
  );
};
