
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Vehicle } from "@/types/member";

interface MemberVehiclesTabProps {
  vehicles: Vehicle[];
  setIsAddVehicleOpen: (isOpen: boolean) => void;
  handleDeleteVehicle: (vehicleId: string) => void;
}

export function MemberVehiclesTab({
  vehicles,
  setIsAddVehicleOpen,
  handleDeleteVehicle
}: MemberVehiclesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Veículos</h3>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsAddVehicleOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Veículo
        </Button>
      </div>
      
      {vehicles.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500">Nenhum veículo registado para este membro.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vehicles.map(vehicle => (
            <div 
              key={vehicle.id} 
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center space-x-3">
                <Badge variant="outline">{vehicle.type}</Badge>
                <div>
                  <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                  <p className="text-sm text-slate-500">
                    {vehicle.displacement}cc
                    {vehicle.nickname && ` - ${vehicle.nickname}`}
                  </p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDeleteVehicle(vehicle.id)}
              >
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
