import { supabase } from '@/integrations/supabase/client';
import { ClubSettings, MemberFeeSettings, FeePayment } from '@/types/settings';

const SETTINGS_TABLE = 'club_settings';
const MEMBER_FEE_SETTINGS_TABLE = 'member_fee_settings';
const FEE_PAYMENTS_TABLE = 'fee_payments';

// Valor padrão para configurações do clube
const DEFAULT_SETTINGS: ClubSettings = {
  name: 'Mouros Moto Hub',
  shortName: 'Mouros MC',
  foundingDate: '2015-01-01',
  logoUrl: '/assets/logo-default.png',
  bannerUrl: '/assets/banner-default.jpg',
  
  primaryColor: '#e11d48', // Mouro Red
  secondaryColor: '#27272a', // Mouro Black
  accentColor: '#f59e0b', // Amber
  textColor: '#27272a',
  
  annualFee: 60.00,
  feeStartDate: '2015-01-01',
  inactivePeriods: [],
  
  address: 'Rua Principal, 123 - Centro, Mouros',
  email: 'info@mourosmotohub.pt',
  phone: '+351 123 456 789',
  
  description: 'Associação motociclística dedicada à paixão pelas duas rodas e ao companheirismo.',
  welcomeMessage: 'Bem-vindo ao Mouros Moto Hub! Junte-se a nós nesta viagem.'
};

/**
 * Serviço para gerenciar configurações do clube
 */
export const settingsService = {
  /**
   * Obtém as configurações atuais do clube
   */
  async getClubSettings(): Promise<ClubSettings> {
    try {
      const { data, error } = await supabase
        .from(SETTINGS_TABLE)
        .select('*')
        .single();
      
      if (error) {
        console.error('Erro ao buscar configurações:', error);
        return DEFAULT_SETTINGS;
      }
      
      return data || DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Erro ao processar configurações:', error);
      return DEFAULT_SETTINGS;
    }
  },
  
  /**
   * Atualiza as configurações do clube
   */
  async updateClubSettings(settings: Partial<ClubSettings>): Promise<ClubSettings> {
    try {
      // Verificar se já existem configurações
      const { data: existingData } = await supabase
        .from(SETTINGS_TABLE)
        .select('*')
        .single();
      
      if (existingData) {
        // Atualizar configurações existentes
        const { data, error } = await supabase
          .from(SETTINGS_TABLE)
          .update(settings)
          .eq('id', existingData.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Criar novas configurações
        const { data, error } = await supabase
          .from(SETTINGS_TABLE)
          .insert({ ...DEFAULT_SETTINGS, ...settings })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  },
  
  /**
   * Obtém configurações de cotas de um membro específico
   */
  async getMemberFeeSettings(memberId: string): Promise<MemberFeeSettings | null> {
    try {
      const { data, error } = await supabase
        .from(MEMBER_FEE_SETTINGS_TABLE)
        .select('*')
        .eq('memberId', memberId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Código de registro não encontrado
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar configurações de cota para o membro ${memberId}:`, error);
      throw error;
    }
  },
  
  /**
   * Define ou atualiza as configurações de cotas de um membro
   */
  async setMemberFeeSettings(settings: MemberFeeSettings): Promise<MemberFeeSettings> {
    try {
      const existing = await this.getMemberFeeSettings(settings.memberId);
      
      if (existing) {
        // Atualizar configuração existente
        const { data, error } = await supabase
          .from(MEMBER_FEE_SETTINGS_TABLE)
          .update(settings)
          .eq('memberId', settings.memberId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from(MEMBER_FEE_SETTINGS_TABLE)
          .insert(settings)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error(`Erro ao atualizar configurações de cota para o membro ${settings.memberId}:`, error);
      throw error;
    }
  },
  
  /**
   * Obtém pagamentos de cotas de um membro
   */
  async getMemberFeePayments(memberId: string): Promise<FeePayment[]> {
    try {
      const { data, error } = await supabase
        .from(FEE_PAYMENTS_TABLE)
        .select('*')
        .eq('memberId', memberId)
        .order('year', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar pagamentos de cotas do membro ${memberId}:`, error);
      throw error;
    }
  },
  
  /**
   * Registra ou atualiza o pagamento de cota de um membro para um ano específico
   */
  async updateFeePayment(payment: FeePayment): Promise<FeePayment> {
    try {
      // Verificar se já existe um pagamento para este membro/ano
      const { data: existingPayment } = await supabase
        .from(FEE_PAYMENTS_TABLE)
        .select('*')
        .eq('memberId', payment.memberId)
        .eq('year', payment.year)
        .single();
      
      if (existingPayment) {
        // Atualizar pagamento existente
        const { data, error } = await supabase
          .from(FEE_PAYMENTS_TABLE)
          .update(payment)
          .eq('id', existingPayment.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Criar novo registro de pagamento
        const { data, error } = await supabase
          .from(FEE_PAYMENTS_TABLE)
          .insert(payment)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error(`Erro ao atualizar pagamento de cota do membro ${payment.memberId} para o ano ${payment.year}:`, error);
      throw error;
    }
  },
  
  /**
   * Calcula todos os anos de cotas devidos para um membro
   * Considera data de fundação do clube, períodos inativos e isenções do membro
   */
  async calculateMemberDueYears(memberId: string): Promise<{ 
    year: number; 
    shouldPay: boolean; 
    exempt: boolean;
    exemptReason?: string;
    clubInactive?: boolean;
    clubInactiveReason?: string;
  }[]> {
    try {
      // Obter configurações do clube
      const clubSettings = await this.getClubSettings();
      
      // Obter configurações de cotas do membro
      const memberSettings = await this.getMemberFeeSettings(memberId);
      
      // Obter pagamentos já realizados
      const payments = await this.getMemberFeePayments(memberId);
      
      // Data de início para cálculo das cotas
      const clubStartDate = new Date(clubSettings.feeStartDate);
      const startYear = clubStartDate.getFullYear();
      
      // Data de ingresso do membro
      let memberJoinDate: Date;
      if (memberSettings?.joinDate) {
        memberJoinDate = new Date(memberSettings.joinDate);
      } else {
        // Buscar informações do membro na tabela de membros
        const { data: memberData } = await supabase
          .from('members')
          .select('joinDate')
          .eq('id', memberId)
          .single();
        
        memberJoinDate = memberData?.joinDate 
          ? new Date(memberData.joinDate) 
          : new Date(); // Fallback para data atual
      }
      
      const memberJoinYear = memberJoinDate.getFullYear();
      
      // Ano atual
      const currentYear = new Date().getFullYear();
      
      // Processar cada ano desde a fundação do clube ou ingresso do membro (o que for mais recente)
      const startingYear = Math.max(startYear, memberJoinYear);
      const dueYears = [];
      
      for (let year = startingYear; year <= currentYear; year++) {
        // Verificar se o clube estava inativo neste ano
        const clubInactive = clubSettings.inactivePeriods.some(period => {
          const periodStart = new Date(period.startDate).getFullYear();
          const periodEnd = new Date(period.endDate).getFullYear();
          return year >= periodStart && year <= periodEnd;
        });
        
        const clubInactivePeriod = clubSettings.inactivePeriods.find(period => {
          const periodStart = new Date(period.startDate).getFullYear();
          const periodEnd = new Date(period.endDate).getFullYear();
          return year >= periodStart && year <= periodEnd;
        });
        
        // Verificar se o membro está isento neste ano
        const memberExempt = memberSettings?.exemptPeriods?.some(period => {
          const periodStart = new Date(period.startDate).getFullYear();
          const periodEnd = new Date(period.endDate).getFullYear();
          return year >= periodStart && year <= periodEnd;
        }) || false;
        
        const exemptPeriod = memberSettings?.exemptPeriods?.find(period => {
          const periodStart = new Date(period.startDate).getFullYear();
          const periodEnd = new Date(period.endDate).getFullYear();
          return year >= periodStart && year <= periodEnd;
        });
        
        // Determinar se o membro deve pagar a cota neste ano
        const shouldPay = !clubInactive && !memberExempt;
        
        // Adicionar à lista de anos
        dueYears.push({
          year,
          shouldPay,
          exempt: memberExempt,
          exemptReason: exemptPeriod?.reason,
          clubInactive: clubInactive,
          clubInactiveReason: clubInactivePeriod?.reason
        });
      }
      
      return dueYears;
    } catch (error) {
      console.error(`Erro ao calcular anos de cotas para o membro ${memberId}:`, error);
      throw error;
    }
  }
};
