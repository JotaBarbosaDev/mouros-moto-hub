/**
 * SERVIÇO DE APROVAÇÃO FINANCEIRA
 * Sistema completo de workflow de aprovações para itens financeiros
 */

import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Tipos para o Sistema de Aprovação Financeira baseados no schema do Supabase
export type FinancialApproval = Database['public']['Tables']['financial_approvals']['Row'];
export type FinancialApprovalInsert = Database['public']['Tables']['financial_approvals']['Insert'];
export type FinancialApprovalUpdate = Database['public']['Tables']['financial_approvals']['Update'];

export type ApprovalComment = Database['public']['Tables']['approval_comments']['Row'];
export type ApprovalCommentInsert = Database['public']['Tables']['approval_comments']['Insert'];
export type ApprovalCommentUpdate = Database['public']['Tables']['approval_comments']['Update'];

export type FinancialApprovalStatus = Database['public']['Enums']['financial_approval_status'];
export type ApprovalCommentType = Database['public']['Enums']['approval_comment_type'];
export type UserRole = Database['public']['Enums']['user_role_type'];

// Interface estendida para aprovações com informações relacionadas
export interface FinancialApprovalWithDetails extends FinancialApproval {
  creator?: {
    id: string;
    name: string;
    email?: string;
  };
  current_values?: Record<string, unknown>;
  current_round?: number;
  max_rounds?: number;
  approved_values?: Record<string, unknown>;
}

// Interface estendida para comentários com informações do usuário
export interface ApprovalCommentWithUser extends ApprovalComment {
  user?: {
    id: string;
    name: string;
    email?: string;
  };
  content?: string;
  suggested_values?: Record<string, unknown>;
}

export interface CreateApprovalRequest {
  title: string;
  description?: string;
  total_amount: number;
  currency?: string;
  item_type: string;
  item_id?: string;
  requires_president_approval?: boolean;
  priority_level?: number;
  due_date?: string;
  item_details?: Record<string, unknown>;
}

export interface UpdateApprovalRequest {
  title?: string;
  description?: string;
  total_amount?: number;
  currency?: string;
  priority_level?: number;
  due_date?: string;
  item_details?: Record<string, unknown>;
}

export interface AddCommentRequest {
  message: string;
  comment_type?: ApprovalCommentType;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
  proposed_amount?: number;
  proposed_changes?: Record<string, unknown>;
}

export interface ReviewApprovalRequest {
  action: 'approve' | 'request_changes' | 'reject';
  comment?: string;
  suggested_values?: Record<string, unknown>;
}

export interface RespondToApprovalRequest {
  updated_values?: Record<string, unknown>;
  response_comment: string;
  action: 'accept_changes' | 'counteroffer' | 'cancel';
}

export interface DashboardMetrics {
  pending_count: number;
  approved_today: number;
  approved_this_week: number;
  total_pending_value: number;
  average_approval_time: number;
  approval_rate: number;
}

export interface TreasurerDashboard {
  pending_count: number;
  approved_today: number;
  approved_this_week: number;
  total_pending_value: number;
  average_approval_time: number;
  approval_rate: number;
}

export interface CreatorDashboard {
  my_pending: number;
  my_approved: number;
  my_rejected: number;
  needs_response: number;
  success_rate: number;
}

class FinancialApprovalService {
  
  /**
   * CRIAR NOVA APROVAÇÃO FINANCEIRA
   */
  async createApproval(request: CreateApprovalRequest): Promise<FinancialApproval> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const insertData: FinancialApprovalInsert = {
      title: request.title,
      description: request.description,
      total_amount: request.total_amount,
      currency: request.currency || 'EUR',
      item_type: request.item_type,
      item_id: request.item_id,
      creator_id: user.id,
      requires_president_approval: request.requires_president_approval || false,
      priority_level: request.priority_level || 1,
      due_date: request.due_date,
      item_details: request.item_details ? JSON.parse(JSON.stringify(request.item_details)) : null,
      status: 'draft'
    };

    const { data, error } = await supabase
      .from('financial_approvals')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * SUBMETER PARA APROVAÇÃO
   */
  async submitForApproval(approvalId: string): Promise<void> {
    const { error } = await supabase
      .from('financial_approvals')
      .update({
        status: 'awaiting_approval',
        submitted_at: new Date().toISOString()
      })
      .eq('id', approvalId);

    if (error) throw error;
  }

  /**
   * LISTAR APROVAÇÕES (com filtros)
   */
  async getApprovals(filters?: {
    status?: FinancialApprovalStatus[];
    item_type?: string;
    creator_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<FinancialApprovalWithDetails[]> {
    let query = supabase
      .from('financial_approvals')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.item_type) {
      query = query.eq('item_type', filters.item_type);
    }

    if (filters?.creator_id) {
      query = query.eq('creator_id', filters.creator_id);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transformar dados para incluir campos estendidos e criar dados simulados para creator
    return (data || []).map(approval => ({
      ...approval,
      current_values: (typeof approval.item_details === 'object' && approval.item_details !== null && !Array.isArray(approval.item_details)) 
        ? approval.item_details as Record<string, unknown>
        : {},
      current_round: 1, // Simular rounds por enquanto
      max_rounds: 3,
      approved_values: approval.status === 'approved' 
        ? (typeof approval.item_details === 'object' && approval.item_details !== null && !Array.isArray(approval.item_details)
           ? approval.item_details as Record<string, unknown>
           : {})
        : undefined,
      creator: {
        id: approval.creator_id,
        name: `Usuário ${approval.creator_id.slice(0, 8)}`, // Nome simulado
        email: `user@company.com` // Email simulado
      }
    }));
  }

  /**
   * OBTER APROVAÇÃO POR ID
   */
  async getApprovalById(id: string): Promise<FinancialApproval | null> {
    const { data, error } = await supabase
      .from('financial_approvals')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * TESOUREIRO REVISAR APROVAÇÃO
   */
  async reviewApproval(approvalId: string, request: ReviewApprovalRequest): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const approval = await this.getApprovalById(approvalId);
    if (!approval) throw new Error('Aprovação não encontrada');

    const updateData: Partial<FinancialApprovalUpdate> = {
      assigned_treasurer_id: user.id,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    if (!approval.reviewed_at) {
      updateData.reviewed_at = new Date().toISOString();
    }

    // Definir novo status baseado na ação
    switch (request.action) {
      case 'approve':
        updateData.status = 'approved';
        updateData.approved_at = new Date().toISOString();
        updateData.final_approver_id = user.id;
        break;
      case 'request_changes':
        updateData.status = 'in_revision';
        break;
      case 'reject':
        updateData.status = 'rejected';
        updateData.final_approver_id = user.id;
        break;
    }

    // Atualizar aprovação
    const { error: updateError } = await supabase
      .from('financial_approvals')
      .update(updateData)
      .eq('id', approvalId);

    if (updateError) throw updateError;

    // Adicionar comentário se fornecido
    if (request.comment || request.suggested_values) {
      await this.addComment(approvalId, {
        message: request.comment || '',
        comment_type: request.action === 'approve' ? 'approval_note' : 'request_changes',
        proposed_changes: request.suggested_values
      });
    }
  }

  /**
   * ATUALIZAR APROVAÇÃO
   */
  async updateApproval(approvalId: string, request: UpdateApprovalRequest): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const updateData: Record<string, unknown> = {
      ...request,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    // Converter item_details para JSON se existir
    if (request.item_details) {
      updateData.item_details = JSON.parse(JSON.stringify(request.item_details));
    }

    const { error } = await supabase
      .from('financial_approvals')
      .update(updateData)
      .eq('id', approvalId);

    if (error) throw error;
  }

  /**
   * ESCALAR APROVAÇÃO
   */
  async escalateApproval(approvalId: string, reason: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('financial_approvals')
      .update({
        status: 'escalated',
        is_escalated: true,
        escalation_reason: reason,
        escalation_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: user.id
      })
      .eq('id', approvalId);

    if (error) throw error;

    // Adicionar comentário de escalação
    await this.addComment(approvalId, {
      message: reason,
      comment_type: 'escalation_note'
    });
  }

  /**
   * PRESIDENTE TOMAR DECISÃO FINAL
   */
  async makeFinalDecision(
    approvalId: string, 
    decision: 'approve' | 'reject', 
    comment?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const updateData: Partial<FinancialApprovalUpdate> = {
      status: decision === 'approve' ? 'approved' : 'rejected',
      final_approver_id: user.id,
      approved_at: decision === 'approve' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    const { error } = await supabase
      .from('financial_approvals')
      .update(updateData)
      .eq('id', approvalId);

    if (error) throw error;

    // Adicionar comentário da decisão final
    if (comment) {
      await this.addComment(approvalId, {
        message: comment,
        comment_type: 'escalation_note'
      });
    }
  }

  /**
   * ADICIONAR COMENTÁRIO
   */
  async addComment(approvalId: string, request: AddCommentRequest): Promise<ApprovalComment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const insertData: ApprovalCommentInsert = {
      approval_id: approvalId,
      author_id: user.id,
      message: request.message,
      comment_type: request.comment_type || 'approval_note',
      is_active: request.is_active !== false,
      metadata: request.metadata ? JSON.parse(JSON.stringify(request.metadata)) : null,
      proposed_amount: request.proposed_amount,
      proposed_changes: request.proposed_changes ? JSON.parse(JSON.stringify(request.proposed_changes)) : null
    };

    const { data, error } = await supabase
      .from('approval_comments')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * LISTAR COMENTÁRIOS DE UMA APROVAÇÃO
   */
  async getComments(approvalId: string): Promise<ApprovalComment[]> {
    const { data, error } = await supabase
      .from('approval_comments')
      .select('*')
      .eq('approval_id', approvalId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * BUSCAR COMENTÁRIOS DE UMA APROVAÇÃO
   */
  async getApprovalComments(approvalId: string): Promise<ApprovalCommentWithUser[]> {
    const { data, error } = await supabase
      .from('approval_comments')
      .select(`
        *,
        user:author_id(id, name, email)
      `)
      .eq('approval_id', approvalId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Transformar dados para incluir campos estendidos
    return (data || []).map(comment => ({
      ...comment,
      content: comment.message,
      suggested_values: (comment.proposed_changes && typeof comment.proposed_changes === 'object') 
        ? comment.proposed_changes as Record<string, unknown>
        : {}
    }));
  }

  /**
   * OBTER MÉTRICAS DASHBOARD TESOUREIRO
   */
  async getTreasurerDashboard(): Promise<TreasurerDashboard> {
    // Contar pendentes
    const { count: pendingCount } = await supabase
      .from('financial_approvals')
      .select('*', { count: 'exact', head: true })
      .in('status', ['awaiting_approval', 'awaiting_reevaluation']);

    // Aprovados hoje
    const today = new Date().toISOString().split('T')[0];
    const { count: approvedToday } = await supabase
      .from('financial_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('approved_at', today);

    // Aprovados esta semana
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: approvedThisWeek } = await supabase
      .from('financial_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('approved_at', weekAgo);

    return {
      pending_count: pendingCount || 0,
      approved_today: approvedToday || 0,
      approved_this_week: approvedThisWeek || 0,
      total_pending_value: 0, // Calcular baseado nos valores
      average_approval_time: 0, // Calcular tempo médio
      approval_rate: 0 // Calcular taxa de aprovação
    };
  }

  /**
   * OBTER MÉTRICAS DASHBOARD CRIADOR
   */
  async getCreatorDashboard(): Promise<CreatorDashboard> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { count: myPending } = await supabase
      .from('financial_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id)
      .in('status', ['awaiting_approval', 'awaiting_reevaluation', 'escalated']);

    const { count: myApproved } = await supabase
      .from('financial_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id)
      .eq('status', 'approved');

    const { count: myRejected } = await supabase
      .from('financial_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id)
      .in('status', ['rejected', 'cancelled']);

    const { count: needsResponse } = await supabase
      .from('financial_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id)
      .eq('status', 'in_revision');

    return {
      my_pending: myPending || 0,
      my_approved: myApproved || 0,
      my_rejected: myRejected || 0,
      needs_response: needsResponse || 0,
      success_rate: myApproved ? (myApproved / (myApproved + (myRejected || 1))) * 100 : 0
    };
  }

  /**
   * CANCELAR APROVAÇÃO
   */
  async cancelApproval(approvalId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('financial_approvals')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        updated_by: user.id
      })
      .eq('id', approvalId);

    if (error) throw error;
  }

  /**
   * NOTIFICAÇÕES AUTOMÁTICAS
   */
  async sendNotification(
    approvalId: string, 
    type: 'submitted' | 'approved' | 'rejected' | 'needs_changes' | 'escalated',
    recipients: string[]
  ): Promise<void> {
    // TODO: Implementar sistema de notificações
    // Pode usar email, push notifications, ou notificações in-app
    console.log(`Enviando notificação ${type} para aprovação ${approvalId} para:`, recipients);
  }

  /**
   * OBTER PAPEL DO USUÁRIO
   */
  async getUserRole(): Promise<UserRole> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Por enquanto, simulamos baseado no email ou ID do usuário
    // Em produção, isso deveria vir de uma tabela de usuários ou perfis
    if (user.email?.includes('admin') || user.email?.includes('president')) {
      return 'president';
    } else if (user.email?.includes('treasurer') || user.email?.includes('tesoureiro')) {
      return 'treasurer';
    } else {
      return 'creator';
    }
  }
}

export const financialApprovalService = new FinancialApprovalService();
export { FinancialApprovalService };
export default financialApprovalService;
