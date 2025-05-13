
import { VehicleType, DEFAULT_VEHICLE_PHOTOS } from '@/types/member';

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
