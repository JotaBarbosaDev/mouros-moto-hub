
import { Member } from '@/types/member';

export const mockMembers: Member[] = [
  {
    id: "1",
    memberNumber: "001",
    name: "João Silva",
    email: "joao.silva@example.com",
    phoneMain: "912345678",
    address: {
      street: "Rua Principal",
      number: "123",
      postalCode: "1000-100",
      city: "Lisboa",
      district: "Lisboa",
      country: "Portugal"
    },
    memberType: "Sócio Adulto",
    joinDate: "2020-01-15",
    vehicles: [
      {
        id: "v1",
        brand: "Honda",
        model: "CBR 600RR",
        type: "Mota",
        displacement: 600,
        photoUrl: "https://images.unsplash.com/photo-1473225071450-1f1462d5aa92?auto=format&fit=crop&q=80",
        nickname: "Águia Negra"
      },
      {
        id: "v2",
        brand: "Yamaha",
        model: "YFZ 450",
        type: "Moto-quatro",
        displacement: 450,
        photoUrl: "https://images.unsplash.com/photo-1533490266601-acbdfa2f63e9?auto=format&fit=crop&q=80"
      }
    ],
    legacyMember: true,
    honoraryMember: false,
    registrationFeePaid: true,
    registrationFeeExempt: false,
    duesPayments: [
      { year: 2023, paid: true, date: "2023-01-10", exempt: false },
      { year: 2024, paid: true, date: "2024-01-15", exempt: false },
      { year: 2025, paid: true, date: "2025-02-01", exempt: false }
    ],
    inWhatsAppGroup: true,
    receivedMemberKit: true
  },
  {
    id: "2",
    memberNumber: "002",
    name: "Ana Santos",
    email: "ana.santos@example.com",
    phoneMain: "913456789",
    address: {
      street: "Avenida República",
      number: "45",
      postalCode: "4000-300",
      city: "Porto",
      district: "Porto",
      country: "Portugal"
    },
    memberType: "Sócio Adulto",
    joinDate: "2021-03-20",
    vehicles: [
      {
        id: "v3",
        brand: "Ducati",
        model: "Monster 821",
        type: "Mota",
        displacement: 821,
        photoUrl: "https://images.unsplash.com/photo-1604515438635-3326bc391d70?auto=format&fit=crop&q=80",
        nickname: "Vermelha"
      }
    ],
    legacyMember: false,
    honoraryMember: false,
    registrationFeePaid: true,
    registrationFeeExempt: false,
    duesPayments: [
      { year: 2023, paid: true, date: "2023-02-15", exempt: false },
      { year: 2024, paid: true, date: "2024-02-10", exempt: false },
      { year: 2025, paid: true, date: "2025-01-20", exempt: false }
    ],
    inWhatsAppGroup: true,
    receivedMemberKit: true
  },
  {
    id: "3",
    memberNumber: "003",
    name: "Miguel Costa",
    email: "miguel.costa@example.com",
    phoneMain: "914567890",
    address: {
      street: "Rua do Comércio",
      number: "78",
      postalCode: "3000-200",
      city: "Coimbra",
      district: "Coimbra",
      country: "Portugal"
    },
    memberType: "Administração",
    joinDate: "2019-06-10",
    vehicles: [
      {
        id: "v4",
        brand: "Polaris",
        model: "RZR 1000",
        type: "Buggy",
        displacement: 1000,
        nickname: "Fera"
      },
      {
        id: "v5",
        brand: "BMW",
        model: "R 1250 GS",
        type: "Mota",
        displacement: 1250
      }
    ],
    legacyMember: true,
    honoraryMember: true,
    registrationFeePaid: true,
    registrationFeeExempt: true,
    duesPayments: [
      { year: 2023, paid: true, date: "2023-01-05", exempt: true },
      { year: 2024, paid: true, date: "2024-01-05", exempt: true },
      { year: 2025, paid: true, date: "2025-01-10", exempt: true }
    ],
    inWhatsAppGroup: true,
    receivedMemberKit: true
  }
];
