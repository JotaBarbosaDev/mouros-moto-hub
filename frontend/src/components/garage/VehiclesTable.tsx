
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bike, Image, Bug } from 'lucide-react';
import { VehicleWithOwner } from '@/hooks/use-vehicles';
import { getVehicleTypeColor, getDefaultVehiclePhoto } from '@/utils/vehicle-utils';

const getVehicleTypeIcon = (type: string) => {
  switch (type) {
    case 'Mota': return <Bike className="h-4 w-4" />;
    case 'Moto-quatro': return <Image className="h-4 w-4" />;
    case 'Buggy': return <Bug className="h-4 w-4" />;
    default: return <Image className="h-4 w-4" />;
  }
};

interface VehiclesTableProps {
  vehicles: VehicleWithOwner[];
  onEditClick: (vehicle: VehicleWithOwner) => void;
}

export const VehiclesTable = ({ vehicles, onEditClick }: VehiclesTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Foto</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cilindrada</TableHead>
            <TableHead>Alcunha</TableHead>
            <TableHead>Proprietário</TableHead>
            <TableHead>Nº Sócio</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage 
                      src={vehicle.photoUrl || getDefaultVehiclePhoto(vehicle.type)} 
                      alt={`${vehicle.brand} ${vehicle.model}`} 
                    />
                    <AvatarFallback>
                      {getVehicleTypeIcon(vehicle.type)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{vehicle.brand}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>
                  <Badge className={getVehicleTypeColor(vehicle.type)}>
                    {vehicle.type}
                  </Badge>
                </TableCell>
                <TableCell>{vehicle.displacement} cc</TableCell>
                <TableCell>{vehicle.nickname || '-'}</TableCell>
                <TableCell>{vehicle.owner}</TableCell>
                <TableCell>{vehicle.memberNumber}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onEditClick(vehicle)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                Nenhum veículo encontrado com os filtros selecionados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
