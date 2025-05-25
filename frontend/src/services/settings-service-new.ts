import { supabase } from '@/integrations/supabase/client';
import { ClubSettings, MemberFeeSettings, FeePayment } from '@/types/settings';

const SETTINGS_TABLE = 'club_settings';
const MEMBER_FEE_SETTINGS_TABLE = 'member_fee_settings';
const FEE_PAYMENTS_TABLE = 'fee_payments';

/**
 * Interface para dados de configurações no formato snake_case do banco de dados
 */
interface ClubSettingsDbResponse {
  id?: string;
  name?: string;
  short_name?: string;
  founding_date?: string;
  logo_url?: string;
  banner_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  text_color?: string;
  annual_fee?: number;
  fee_start_date?: string;
  inactive_periods?: Array<{
    start_date?: string;
    startDate?: string;
    end_date?: string;
    endDate?: string;
    reason?: string;
  }>;
  social_media?: Record<string, string>;
  address?: string;
  email?: string;
  phone?: string;
  description?: string;
  welcome_message?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para períodos inativos/isentos no formato correto
 */
interface PeriodData {
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  reason?: string;
}

/**
 * Interface para dados de pagamentos no formato snake_case do banco de dados
 */
interface FeePaymentDbResponse {
  id: string;
  member_id: string;
  year: number;
  payment_date: string;
  amount: number;
  payment_method: string;
  notes: string;
  receipt_url: string;
  created_at: string;
  updated_at: string;
}

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
   * Converte camelCase para snake_case para operações do banco de dados
   */
  camelToSnakeCase(settings: Partial<ClubSettings>): Partial<ClubSettingsDbResponse> {
    const result: Partial<ClubSettingsDbResponse> = {};
    
    if (settings.name !== undefined) result.name = settings.name;
    if (settings.shortName !== undefined) result.short_name = settings.shortName;
    if (settings.foundingDate !== undefined) result.founding_date = settings.foundingDate;
    if (settings.logoUrl !== undefined) result.logo_url = settings.logoUrl;
    if (settings.bannerUrl !== undefined) result.banner_url = settings.bannerUrl;
    if (settings.primaryColor !== undefined) result.primary_color = settings.primaryColor;
    if (settings.secondaryColor !== undefined) result.secondary_color = settings.secondaryColor;
    if (settings.accentColor !== undefined) result.accent_color = settings.accentColor;
    if (settings.textColor !== undefined) result.text_color = settings.textColor;
    if (settings.annualFee !== undefined) result.annual_fee = settings.annualFee;
    if (settings.feeStartDate !== undefined) result.fee_start_date = settings.feeStartDate;
    if (settings.address !== undefined) result.address = settings.address;
    if (settings.email !== undefined) result.email = settings.email;
    if (settings.phone !== undefined) result.phone = settings.phone;
    if (settings.description !== undefined) result.description = settings.description;
    if (settings.welcomeMessage !== undefined) result.welcome_message = settings.welcomeMessage;
    
    // Converter inactivePeriods
    if (settings.inactivePeriods) {
      result.inactive_periods = settings.inactivePeriods.map(period => ({
        start_date: period.startDate,
        end_date: period.endDate,
        reason: period.reason
      }));
    }
    
    // Converter socialMedia
    if (settings.socialMedia) {
      result.social_media = settings.socialMedia as Record<string, string>;
    }
    
    return result;
  },

  /**
   * Converte snake_case para camelCase para a interface do cliente
   */
  snakeToCamelCase(data: ClubSettingsDbResponse): Partial<ClubSettings> {
    if (!data) return {};
    
    const result: Partial<ClubSettings> = {
      name: data.name,
      shortName: data.short_name,
      foundingDate: data.founding_date,
      logoUrl: data.logo_url,
      bannerUrl: data.banner_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      accentColor: data.accent_color,
      textColor: data.text_color,
      annualFee: data.annual_fee,
      feeStartDate: data.fee_start_date,
      address: data.address,
      email: data.email,
      phone: data.phone,
      description: data.description,
      welcomeMessage: data.welcome_message
    };
    
    // Converter inactivePeriods específicamente
    if (data.inactive_periods && Array.isArray(data.inactive_periods)) {
      result.inactivePeriods = data.inactive_periods.map((period: PeriodData) => ({
        startDate: period.start_date || period.startDate,
        endDate: period.end_date || period.endDate,
        reason: period.reason
      }));
    }
    
    // Converter socialMedia se existir
    if (data.social_media) {
      result.socialMedia = data.social_media;
    }
    
    return result;
  },
  
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
      
      if (!data) {
        return DEFAULT_SETTINGS;
      }
      
      // Converter de snake_case para camelCase
      const convertedData = this.snakeToCamelCase(data);
      
      // Mesclar com valores padrão para garantir que todos os campos estejam presentes
      return { ...DEFAULT_SETTINGS, ...convertedData };
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
      // Converter para snake_case
      const snakeSettings = this.camelToSnakeCase(settings);
      
      // Verificar se já existem configurações
      const { data: existingData } = await supabase
        .from(SETTINGS_TABLE)
        .select('*')
        .single();
      
      if (existingData) {
        // Atualizar configurações existentes
        const { data, error } = await supabase
          .from(SETTINGS_TABLE)
          .update(snakeSettings)
          .eq('id', existingData.id)
          .select()
          .single();
        
        if (error) throw error;
        return this.snakeToCamelCase(data) as ClubSettings;
      } else {
        // Criar novas configurações - converter DEFAULT_SETTINGS para snake_case
        const defaultSnakeSettings = this.camelToSnakeCase(DEFAULT_SETTINGS);
        const newSettings = { ...defaultSnakeSettings, ...snakeSettings };
        
        const { data, error } = await supabase
          .from(SETTINGS_TABLE)
          .insert(newSettings)
          .select()
          .single();
        
        if (error) throw error;
        return this.snakeToCamelCase(data) as ClubSettings;
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
        .eq('member_id', memberId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Código de registro não encontrado
          return null;
        }
        throw error;
      }
      
      if (!data) return null;
      
      // Converter de snake_case para camelCase
      return {
        memberId: data.member_id,
        joinDate: data.join_date,
        exemptPeriods: Array.isArray(data.exempt_periods) 
          ? (data.exempt_periods as PeriodData[]).map((p: PeriodData) => ({
              startDate: p.start_date || p.startDate,
              endDate: p.end_date || p.endDate,
              reason: p.reason
            }))
          : []
      };
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
      // Converter de camelCase para snake_case
      const snakeSettings = {
        member_id: settings.memberId,
        join_date: settings.joinDate,
        exempt_periods: settings.exemptPeriods.map(p => ({
          start_date: p.startDate,
          end_date: p.endDate,
          reason: p.reason
        }))
      };
      
      const existing = await this.getMemberFeeSettings(settings.memberId);
      
      if (existing) {
        // Atualizar configuração existente
        const { data, error } = await supabase
          .from(MEMBER_FEE_SETTINGS_TABLE)
          .update(snakeSettings)
          .eq('member_id', settings.memberId)
          .select()
          .single();
        
        if (error) throw error;
        return this.getMemberFeeSettings(settings.memberId) as Promise<MemberFeeSettings>;
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from(MEMBER_FEE_SETTINGS_TABLE)
          .insert(snakeSettings)
          .select()
          .single();
        
        if (error) throw error;
        return this.getMemberFeeSettings(settings.memberId) as Promise<MemberFeeSettings>;
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
        .eq('member_id', memberId)
        .order('year', { ascending: true });
      
      if (error) throw error;
      
      if (!data || !Array.isArray(data)) return [];
      
      // Converter de snake_case para camelCase
      return data.map((payment: FeePaymentDbResponse) => ({
        memberId: payment.member_id,
        year: payment.year,
        paid: true, // Se existe registro, foi pago
        paidDate: payment.payment_date,
        amount: payment.amount,
        receiptNumber: payment.receipt_url, // Usando receipt_url como receiptNumber
        notes: payment.notes
      }));
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
      // Converter de camelCase para snake_case
      const snakePayment = {
        member_id: payment.memberId,
        year: payment.year,
        payment_date: payment.paidDate,
        amount: payment.amount,
        payment_method: 'Transferência', // Valor padrão se não fornecido
        notes: payment.notes,
        receipt_url: payment.receiptNumber
      };
      
      // Verificar se já existe um pagamento para este membro/ano
      const { data: existingPayment } = await supabase
        .from(FEE_PAYMENTS_TABLE)
        .select('*')
        .eq('member_id', payment.memberId)
        .eq('year', payment.year)
        .single();
      
      if (existingPayment) {
        // Atualizar pagamento existente
        const { data, error } = await supabase
          .from(FEE_PAYMENTS_TABLE)
          .update(snakePayment)
          .eq('id', existingPayment.id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          memberId: data.member_id,
          year: data.year,
          paid: true,
          paidDate: data.payment_date,
          amount: data.amount,
          receiptNumber: data.receipt_url,
          notes: data.notes
        };
      } else {
        // Criar novo registro de pagamento
        const { data, error } = await supabase
          .from(FEE_PAYMENTS_TABLE)
          .insert(snakePayment)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          memberId: data.member_id,
          year: data.year,
          paid: true,
          paidDate: data.payment_date,
          amount: data.amount,
          receiptNumber: data.receipt_url,
          notes: data.notes
        };
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
          .select('join_date')
          .eq('id', memberId)
          .single();
        
        memberJoinDate = memberData?.join_date 
          ? new Date(memberData.join_date) 
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
