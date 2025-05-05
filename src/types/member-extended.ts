
import { Member as BaseMember, BloodType, MemberType as MemberTypeEnum } from '@/types/member';

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
  vehicles: any[];
  duesPayments: any[];
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
}
