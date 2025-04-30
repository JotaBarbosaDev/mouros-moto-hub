
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type MemberType = 'Sócio Adulto' | 'Sócio Criança' | 'Administração' | 'Convidado';
export type VehicleType = 'Mota' | 'Moto-quatro' | 'Buggy';

export interface Address {
  street: string;
  number: string;
  postalCode: string;
  city: string;
  district: string;
  country: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  type: VehicleType;
  displacement: number;
  photoUrl?: string;
  nickname?: string;
}

export interface DuesPayment {
  year: number;
  paid: boolean;
  date?: string;
  exempt: boolean;
}

export interface Member {
  id: string;
  memberNumber: string;
  name: string;
  email: string;
  phoneMain: string;
  phoneAlternative?: string;
  address: Address;
  bloodType?: BloodType;
  memberType: MemberType;
  joinDate: string;
  vehicles: Vehicle[];
  legacyMember: boolean;
  honoraryMember: boolean;
  registrationFeePaid: boolean;
  registrationFeeExempt: boolean;
  duesPayments: DuesPayment[];
  inWhatsAppGroup: boolean;
  receivedMemberKit: boolean;
  photoUrl?: string; // Added photoUrl field
  nickname?: string; // Added nickname field
}

// Default placeholder images for members and vehicles
export const DEFAULT_MEMBER_PHOTO = "/placeholders/default-member.jpg";
export const DEFAULT_VEHICLE_PHOTOS = {
  "Mota": "/placeholders/default-motorcycle.jpg",
  "Moto-quatro": "/placeholders/default-quad.jpg", 
  "Buggy": "/placeholders/default-buggy.jpg"
};
