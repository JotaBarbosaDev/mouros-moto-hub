
import { Member as BaseMember, BloodType, MemberType as MemberTypeEnum, VehicleType } from '@/types/member';

// Extended Member type that includes properties from the database
export interface MemberExtended extends Omit<BaseMember, 'vehicles' | 'duesPayments'> {
  id: string;
  name: string;
  memberNumber: string;
  isAdmin: boolean;
  isActive: boolean;
  email: string;
  phoneMain: string;
  phoneAlternative?: string;
  nickname?: string;
  photoUrl?: string;
  joinDate: string;
  memberType: MemberTypeEnum;
  honoraryMember: boolean;
  legacyMember?: boolean; // Membro legado (importado de sistema anterior)
  registrationFeePaid?: boolean; // Pagamento de taxa de inscrição
  registrationFeeExempt?: boolean; // Isenção de taxa de inscrição
  username?: string; // Nome de usuário para login
  vehicles: { id: string; brand: string; model: string; type: string; displacement: number; nickname?: string; photoUrl?: string }[]; 
  duesPayments: { year: number; paid: boolean; exempt: boolean; date?: string }[]; 
}

// Supabase member response type
export interface MemberDbResponse {
  id: string;
  name: string;
  member_number: string;
  is_admin: boolean;
  is_active: boolean;
  email: string;
  phone_main: string;
  phone_alternative?: string;
  nickname?: string;
  photo_url?: string;
  join_date: string;
  member_type: MemberTypeEnum;
  honorary_member: boolean;
  blood_type?: BloodType;
  in_whatsapp_group?: boolean;
  received_member_kit?: boolean;
  username?: string; // Nome de usuário para login
  legacy_member?: boolean; // Membro legado (importado de sistema anterior)
  registration_fee_paid?: boolean; // Pagamento de taxa de inscrição
  registration_fee_exempt?: boolean; // Isenção de taxa de inscrição
}

// Tipo para dados de veículos conforme armazenados no Supabase
export interface VehicleData {
  id?: string;
  brand: string;
  model: string;
  type: string;
  displacement: string | number;
  nickname?: string | null;
  photo_url?: string | null;
  member_id: string;
  created_at?: string;
  updated_at?: string;
}

// Tipo para pagamentos de cotas conforme armazenados no Supabase
export interface DuesPaymentData {
  id?: string;
  member_id: string;
  year: number;
  paid: boolean;
  exempt: boolean;
  payment_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Tipo para endereços conforme armazenados no Supabase
export interface AddressData {
  id?: string;
  member_id: string;
  street: string;
  number: string;
  postal_code: string;
  city: string;
  district: string;
  country: string;
  created_at?: string;
  updated_at?: string;
}
