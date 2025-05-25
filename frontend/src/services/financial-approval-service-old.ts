/**
 * SERVIÇO DE APROVAÇÃO FINANCEIRA
 * Sistema completo de workflow de aprovações para itens financeiros
 */

import { supabase } from '@/integrations/supabase/client';

// Tipos TypeScript
export type FinancialApprovalStatus = 
  | 'draft' 
  | 'awaiting_approval' 
  | 'in_revision' 
  | 'awaiting_reevaluation' 
  | 'escalated' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled';

export type ApprovalItemType = 'product' | 'event' | 'fee' | 'transaction';

export type UserRole = 'creator' | 'treasurer' | 'president' | 'admin';

export type CommentType = 
  | 'request_changes' 
  | 'counteroffer' 
  | 'justification' 
  | 'approval_note' 
  | 'escalation_note';

export interface FinancialApproval {
  id: string;
  item_type: ApprovalItemType;
  item_id: string;
  creator_id: string;
  treasurer_id?: string;
  president_id?: string;
  status: FinancialApprovalStatus;
  current_round: number;
  max_rounds: number;
  original_values: Record<string, any>;
  current_values: Record<string, any>;
  approved_values?: Record<string, any>;
  created_at: string;
  submitted_at?: string;
  first_response_at?: string;
  approved_at?: string;
  escalated_at?: string;
  updated_at: string;
  escalation_reason?: string;
  final_decision_by?: string;
  creator?: { name: string; email: string };
  treasurer?: { name: string; email: string };
  president?: { name: string; email: string };
}

export interface ApprovalComment {
  id: string;
  approval_id: string;
  user_id: string;
  user_role: UserRole;
  comment_type: CommentType;
  content: string;
  suggested_values?: Record<string, any>;
  round_number: number;
  created_at: string;
  user?: { name: string };
}

export interface CreateApprovalRequest {
  item_type: ApprovalItemType;
  item_id: string;
  values: Record<string, any>;
}

export interface ReviewApprovalRequest {
  action: 'approve' | 'request_changes' | 'reject';
  comment?: string;
  suggested_values?: Record<string, any>;
}

export interface RespondToApprovalRequest {
  updated_values?: Record<string, any>;
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

class FinancialApprovalService {
  
  /**
   * CRIAR NOVA APROVAÇÃO FINANCEIRA
   */
  async createApproval(request: CreateApprovalRequest): Promise<FinancialApproval> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('financial_approvals')
      .insert({
        item_type: request.item_type,
        item_id: request.item_id,
        creator_id: user.id,
        original_values: request.values,
        current_values: request.values,
        status: 'draft'
      })
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
    item_type?: ApprovalItemType;
    creator_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<FinancialApproval[]> {
    let query = supabase
      .from('financial_approvals')
      .select(`
        *,
        creator:creator_id(name, email),
        treasurer:treasurer_id(name, email),
        president:president_id(name, email)
      `)
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
    return data || [];
  }

  /**
   * OBTER APROVAÇÃO POR ID
   */
  async getApprovalById(id: string): Promise<FinancialApproval | null> {
    const { data, error } = await supabase
      .from('financial_approvals')
      .select(`
        *,
        creator:creator_id(name, email),
        treasurer:treasurer_id(name, email),
        president:president_id(name, email)
      `)
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

    let updateData: Partial<FinancialApproval> = {
      treasurer_id: user.id,
      updated_at: new Date().toISOString()
    };

    if (!approval.first_response_at) {
      updateData.first_response_at = new Date().toISOString();
    }

    // Definir novo status baseado na ação
    switch (request.action) {
      case 'approve':
        updateData.status = 'approved';
        updateData.approved_at = new Date().toISOString();
        updateData.approved_values = approval.current_values;
        break;
      case 'request_changes':
        updateData.status = 'in_revision';
        break;
      case 'reject':
        updateData.status = 'rejected';
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
        comment_type: request.action === 'approve' ? 'approval_note' : 'request_changes',
        content: request.comment || '',
        suggested_values: request.suggested_values,
        round_number: approval.current_round
      });
    }
  }

  /**
   * CRIADOR RESPONDER À SOLICITAÇÃO
   */
  async respondToApproval(approvalId: string, request: RespondToApprovalRequest): Promise<void> {
    const approval = await this.getApprovalById(approvalId);
    if (!approval) throw new Error('Aprovação não encontrada');

    let updateData: Partial<FinancialApproval> = {
      updated_at: new Date().toISOString()
    };

    switch (request.action) {
      case 'accept_changes':
        updateData.current_values = request.updated_values || approval.current_values;
        updateData.status = 'awaiting_reevaluation';
        updateData.current_round = approval.current_round + 1;
        break;
      case 'counteroffer':
        updateData.status = 'awaiting_reevaluation';
        updateData.current_round = approval.current_round + 1;
        break;
      case 'cancel':
        updateData.status = 'cancelled';
        break;
    }

    // Verificar se deve escalar
    if (updateData.current_round && updateData.current_round > approval.max_rounds) {
      updateData.status = 'escalated';
      updateData.escalated_at = new Date().toISOString();
      updateData.escalation_reason = 'Máximo de rondas de negociação atingido';
    }

    // Atualizar aprovação
    const { error: updateError } = await supabase
      .from('financial_approvals')
      .update(updateData)
      .eq('id', approvalId);

    if (updateError) throw updateError;

    // Adicionar comentário de resposta
    await this.addComment(approvalId, {
      comment_type: request.action === 'counteroffer' ? 'counteroffer' : 'justification',
      content: request.response_comment,
      round_number: updateData.current_round || approval.current_round
    });
  }

  /**
   * PRESIDENTE TOMAR DECISÃO FINAL
   */
  async makeFinalDecision(
    approvalId: string, 
    decision: 'approve' | 'reject', 
    finalValues?: Record<string, any>,
    comment?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const updateData: Partial<FinancialApproval> = {
      status: decision === 'approve' ? 'approved' : 'rejected',
      president_id: user.id,
      final_decision_by: user.id,
      approved_at: decision === 'approve' ? new Date().toISOString() : undefined,
      approved_values: decision === 'approve' ? finalValues : undefined,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('financial_approvals')
      .update(updateData)
      .eq('id', approvalId);

    if (error) throw error;

    // Adicionar comentário da decisão final
    if (comment) {
      await this.addComment(approvalId, {
        comment_type: 'escalation_note',
        content: comment,
        round_number: 999 // Marca como decisão final
      });
    }
  }

  /**
   * ADICIONAR COMENTÁRIO
   */
  async addComment(approvalId: string, comment: {
    comment_type: CommentType;
    content: string;
    suggested_values?: Record<string, any>;
    round_number: number;
  }): Promise<ApprovalComment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Determinar role do usuário
    const userRole = await this.getUserRole();

    const { data, error } = await supabase
      .from('approval_comments')
      .insert({
        approval_id: approvalId,
        user_id: user.id,
        user_role: userRole,
        comment_type: comment.comment_type,
        content: comment.content,
        suggested_values: comment.suggested_values,
        round_number: comment.round_number
      })
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
      .select(`
        *,
        user:user_id(name)
      `)
      .eq('approval_id', approvalId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * OBTER MÉTRICAS DASHBOARD TESOUREIRO
   */
  async getTreasurerDashboard(): Promise<DashboardMetrics> {
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
  async getCreatorDashboard(): Promise<{
    my_pending: number;
    my_approved: number;
    my_rejected: number;
    needs_response: number;
    success_rate: number;
  }> {
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
   * DETERMINAR ROLE DO USUÁRIO ATUAL
   */
  async getUserRole(): Promise<UserRole> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se é admin/tesoureiro/presidente
    const { data: member } = await supabase
      .from('members')
      .select('is_admin')
      .eq('email', user.email)
      .single();

    if (member?.is_admin) {
      // Verificar cargo específico
      const { data: admin } = await supabase
        .from('administration')
        .select('role')
        .eq('member_id', member.id)
        .eq('status', 'Ativo')
        .single();

      if (admin?.role === 'Tesoureiro') return 'treasurer';
      if (admin?.role === 'Presidente') return 'president';
      return 'admin';
    }

    return 'creator';
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
}

export const financialApprovalService = new FinancialApprovalService();
export default financialApprovalService;
