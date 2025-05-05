
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Vehicle } from "@/types/member";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface VehicleCardProps {
  vehicle: Vehicle;
  ownerName?: string;
}

export function VehicleCard({ vehicle, ownerName }: VehicleCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="bg-slate-100 h-32 flex items-center justify-center">
          {vehicle.photoUrl ? (
            <img 
              src={vehicle.photoUrl} 
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-slate-400 text-center">
              <p>{vehicle.brand} {vehicle.model}</p>
              <p className="text-sm">{vehicle.displacement}cc</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
          <Badge variant="outline">{vehicle.type}</Badge>
        </div>
        
        <div className="space-y-1 text-sm">
          <p><span className="text-slate-500">Cilindrada:</span> {vehicle.displacement}cc</p>
          {vehicle.nickname && (
            <p><span className="text-slate-500">Alcunha:</span> {vehicle.nickname}</p>
          )}
          {ownerName && (
            <p><span className="text-slate-500">Proprietário:</span> {ownerName}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
