import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Transaction, Budget, FinancialReport, FinancialSummary, TransactionCategory } from '@/types/treasury';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

// Dados mock para desenvolvimento
const mockTransactions: Transaction[] = [
  { 
    id: '1',
    date: new Date('2025-05-01'),
    description: 'Venda de produtos da loja',
    type: 'receita',
    amount: 325.50,
    category: 'Loja',
    paymentMethod: 'dinheiro',
    createdAt: new Date('2025-05-01')
  },
  { 
    id: '2',
    date: new Date('2025-05-02'),
    description: 'Venda do Bar',
    type: 'receita',
    amount: 750.25,
    category: 'Bar',
    paymentMethod: 'dinheiro',
    createdAt: new Date('2025-05-02')
  },
  { 
    id: '3',
    date: new Date('2025-05-03'),
    description: 'Compra de estoque para o bar',
    type: 'despesa',
    amount: 450.75,
    category: 'Bar',
    paymentMethod: 'transferencia',
    createdAt: new Date('2025-05-03')
  },
  { 
    id: '4',
    date: new Date('2025-05-04'),
    description: 'Pagamento de aluguel',
    type: 'despesa',
    amount: 800.00,
    category: 'Infraestrutura',
    paymentMethod: 'transferencia',
    createdAt: new Date('2025-05-04')
  },
  { 
    id: '5',
    date: new Date('2025-05-05'),
    description: 'Cobrança de mensalidades',
    type: 'receita',
    amount: 1200.00,
    category: 'Mensalidade',
    paymentMethod: 'transferencia',
    createdAt: new Date('2025-05-05')
  }
];

// Hook principal para gerenciar as transações financeiras
export const useTreasury = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Buscar todas as transações
  const getTransactions = async (): Promise<Transaction[]> => {
    // Em um ambiente de produção, isso seria substituído por uma chamada real ao Supabase
    try {
      // Mock: retorna dados de exemplo
      return Promise.resolve([...mockTransactions]);

      // Implementação real:
      /*
      const { data, error } = await supabase
        .from('treasury_transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        return [];
      }

      return data.map(transaction => ({
        id: transaction.id,
        date: new Date(transaction.date),
        description: transaction.description,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        paymentMethod: transaction.payment_method,
        notes: transaction.notes,
        createdBy: transaction.created_by,
        createdAt: new Date(transaction.created_at),
        updatedAt: transaction.updated_at ? new Date(transaction.updated_at) : undefined,
        attachments: transaction.attachments
      }));
      */
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as transações.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Adicionar uma nova transação
  const createTransaction = async (newTransaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    try {
      // Mock: simula a adição de uma nova transação
      const transaction: Transaction = {
        ...newTransaction,
        id: `${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date(),
      };

      // Implementação real:
      /*
      const { data, error } = await supabase
        .from('treasury_transactions')
        .insert({
          date: newTransaction.date.toISOString(),
          description: newTransaction.description,
          type: newTransaction.type,
          amount: newTransaction.amount,
          category: newTransaction.category,
          payment_method: newTransaction.paymentMethod,
          notes: newTransaction.notes,
          created_by: user?.id,
          attachments: newTransaction.attachments
        })
        .select()
        .single();

      if (error) throw error;

      const transaction: Transaction = {
        id: data.id,
        date: new Date(data.date),
        description: data.description,
        type: data.type,
        amount: data.amount,
        category: data.category,
        paymentMethod: data.payment_method,
        notes: data.notes,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        attachments: data.attachments
      };
      */

      // Atualiza o cache com a nova transação
      queryClient.setQueryData<Transaction[]>(['treasury', 'transactions'], (old) => 
        old ? [transaction, ...old] : [transaction]
      );

      toast({
        title: 'Sucesso',
        description: 'Transação adicionada com sucesso.',
      });

      return transaction;
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a transação.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Calcular resumo financeiro
  const calculateFinancialSummary = (
    transactions: Transaction[],
    startDate?: Date,
    endDate?: Date
  ): FinancialSummary => {
    // Filtra as transações pelo período
    const filteredTransactions = transactions.filter(transaction => {
      if (startDate && transaction.date < startDate) return false;
      if (endDate && transaction.date > endDate) return false;
      return true;
    });

    // Inicializa o resumo financeiro
    const summary: FinancialSummary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      period: {
        start: startDate || new Date(Math.min(...filteredTransactions.map(t => t.date.getTime()))),
        end: endDate || new Date(Math.max(...filteredTransactions.map(t => t.date.getTime()))),
      },
      categorySummary: {}
    };

    // Calcula os totais
    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'receita') {
        summary.totalIncome += transaction.amount;
      } else {
        summary.totalExpenses += transaction.amount;
      }

      // Calcula os totais por categoria
      if (!summary.categorySummary[transaction.category]) {
        summary.categorySummary[transaction.category] = {
          income: 0,
          expenses: 0,
          balance: 0
        };
      }

      if (transaction.type === 'receita') {
        summary.categorySummary[transaction.category]!.income += transaction.amount;
      } else {
        summary.categorySummary[transaction.category]!.expenses += transaction.amount;
      }

      summary.categorySummary[transaction.category]!.balance = 
        summary.categorySummary[transaction.category]!.income - 
        summary.categorySummary[transaction.category]!.expenses;
    });

    summary.balance = summary.totalIncome - summary.totalExpenses;

    return summary;
  };

  // Hook para obter transações
  const useTransactions = (options: { startDate?: Date; endDate?: Date } = {}) => {
    const { startDate, endDate } = options;

    return useQuery({
      queryKey: ['treasury', 'transactions', { startDate, endDate }],
      queryFn: getTransactions,
      select: (data) => {
        if (!startDate && !endDate) return data;
        
        return data.filter(transaction => {
          if (startDate && transaction.date < startDate) return false;
          if (endDate && transaction.date > endDate) return false;
          return true;
        });
      },
    });
  };

  // Hook para criar uma transação
  const useCreateTransaction = () => {
    return useMutation({
      mutationFn: createTransaction,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['treasury', 'transactions'] });
      },
    });
  };

  // Hook para obter resumo financeiro
  const useFinancialSummary = (options: { startDate?: Date; endDate?: Date } = {}) => {
    const { startDate, endDate } = options;

    return useQuery({
      queryKey: ['treasury', 'summary', { startDate, endDate }],
      queryFn: () => getTransactions(),
      select: (data) => calculateFinancialSummary(data, startDate, endDate),
    });
  };

  return {
    useTransactions,
    useCreateTransaction,
    useFinancialSummary,
  };
};
