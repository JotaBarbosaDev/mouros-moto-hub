
import { Member, Vehicle, VehicleType, DEFAULT_VEHICLE_PHOTOS } from '@/types/member';

export const getAllVehicles = (members: Member[]): Array<Vehicle & { owner: string, memberNumber: string }> => {
  const vehicles: Array<Vehicle & { owner: string, memberNumber: string }> = [];
  members.forEach(member => {
    member.vehicles.forEach(vehicle => {
      vehicles.push({
        ...vehicle,
        owner: member.name,
        memberNumber: member.memberNumber
      });
    });
  });
  return vehicles;
};

export const getVehicleTypeColor = (type: VehicleType) => {
  switch (type) {
    case 'Mota': return 'bg-blue-500';
    case 'Moto-quatro': return 'bg-green-500';
    case 'Buggy': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
};

export const getDefaultVehiclePhoto = (type: VehicleType): string => {
  return DEFAULT_VEHICLE_PHOTOS[type] || '/placeholder.svg';
};
