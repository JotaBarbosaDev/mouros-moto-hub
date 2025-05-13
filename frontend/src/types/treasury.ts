
export type TransactionType = 'receita' | 'despesa';

export type PaymentMethod = 'dinheiro' | 'cartao' | 'transferencia' | 'mbway' | 'outro';

export type TransactionCategory = 
  | 'Bar' 
  | 'Loja' 
  | 'Evento' 
  | 'Mensalidade'
  | 'Infraestrutura'
  | 'Marketing'
  | 'Equipamento'
  | 'Manutenção'
  | 'Outro';

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: string[];
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  amount: number;
  period: 'mensal' | 'anual';
  year: number;
  month?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface FinancialReport {
  id: string;
  name: string;
  type: 'vendas' | 'despesas' | 'fluxo' | 'estoque' | 'lucro';
  period: 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'anual' | 'personalizado';
  startDate: Date;
  endDate: Date;
  fileUrl?: string;
  createdBy: string;
  createdAt: Date;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  period: {
    start: Date;
    end: Date;
  };
  categorySummary: {
    [key in TransactionCategory]?: {
      income: number;
      expenses: number;
      balance: number;
    }
  };
}
