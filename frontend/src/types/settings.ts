// Tipos para configurações do sistema
export interface ClubSettings {
  // Informações básicas do clube
  name: string;
  shortName: string;
  foundingDate: string; // Data de fundação (ISO String)
  logoUrl: string;
  bannerUrl?: string;
  
  // Cores e tema
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  
  // Configurações de cotas
  annualFee: number;
  feeStartDate: string; // Data para início da contagem de cotas (ISO String)
  inactivePeriods: InactivePeriod[]; // Períodos em que o clube esteve inativo
  
  // Contactos
  address?: string;
  email?: string;
  phone?: string;
  socialMedia?: SocialMedia;
  
  // Outros
  description?: string;
  welcomeMessage?: string;
}

// Períodos em que o clube esteve inativo/fechado
export interface InactivePeriod {
  startDate: string; // ISO String
  endDate: string; // ISO String
  reason?: string;
}

// Links para redes sociais
export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  website?: string;
  youtube?: string;
  twitter?: string;
}

// Tipo para configurações de um membro específico
export interface MemberFeeSettings {
  memberId: string;
  joinDate: string; // ISO String
  exemptPeriods: ExemptPeriod[]; // Períodos em que este membro está isento de cotas
}

// Períodos em que o membro está isento de cotas
export interface ExemptPeriod {
  startDate: string; // ISO String
  endDate: string; // ISO String
  reason?: string;
}

// Status de pagamento de cotas
export interface FeePayment {
  memberId: string;
  year: number;
  paid: boolean;
  paidDate?: string; // ISO String
  amount: number;
  receiptNumber?: string;
  notes?: string;
}
