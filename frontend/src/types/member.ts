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
  legacyMember?: boolean; // Agora pode ser opcional
  honoraryMember: boolean;
  registrationFeePaid?: boolean; // Agora pode ser opcional
  registrationFeeExempt?: boolean; // Agora pode ser opcional
  duesPayments: DuesPayment[];
  inWhatsAppGroup?: boolean; // Já era opcional em MemberDbResponse
  receivedMemberKit?: boolean; // Já era opcional em MemberDbResponse
  photoUrl?: string; // Added photoUrl field
  nickname?: string; // Added nickname field
  username?: string; // Username para login
  password?: string; // Senha para login
  isAdmin?: boolean; // Adiciona o campo isAdmin que existia apenas em MemberExtended
  isActive?: boolean; // Adiciona o campo isActive que existia apenas em MemberExtended
}

// Default placeholder images for members and vehicles
export const DEFAULT_MEMBER_PHOTO = "/placeholders/default-member.jpg";
export const DEFAULT_VEHICLE_PHOTOS = {
  "Mota": "/placeholders/default-motorcycle.jpg",
  "Moto-quatro": "/placeholders/default-quad.jpg", 
  "Buggy": "/placeholders/default-buggy.jpg"
};
