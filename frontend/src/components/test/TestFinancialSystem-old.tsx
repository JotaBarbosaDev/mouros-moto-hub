/**
 * COMPONENTE DE TESTE - SISTEMA DE APROVAÇÃO FINANCEIRA
 * Este componente serve para testar se o sistema está funcionando corretamente
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { 
  FinancialApprovalService, 
  type FinancialApproval,
  type FinancialApprovalStatus,
  type TreasurerDashboard 
} from '@/services/financial-approval-service';

interface TestFinancialSystemProps {
  className?: string;
}

const statusIcons = {
  draft: <Clock className="w-4 h-4" />,
  awaiting_approval: <AlertTriangle className="w-4 h-4" />,
  in_revision: <AlertTriangle className="w-4 h-4" />,
  awaiting_reevaluation: <AlertTriangle className="w-4 h-4" />,
  escalated: <XCircle className="w-4 h-4" />,
  approved: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  awaiting_approval: 'bg-yellow-100 text-yellow-800',
  in_revision: 'bg-orange-100 text-orange-800',
  awaiting_reevaluation: 'bg-orange-100 text-orange-800',
  escalated: 'bg-red-100 text-red-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

export default function TestFinancialSystem({ className }: TestFinancialSystemProps) {
  const [approvals, setApprovals] = useState<FinancialApproval[]>([]);
  const [dashboard, setDashboard] = useState<TreasurerDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state para criar nova aprovação
  const [newApproval, setNewApproval] = useState({
    title: '',
    description: '',
    amount: '',
    item_type: 'product' as const
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar aprovações
      const approvalsResult = await FinancialApprovalService.getApprovals();
      if (approvalsResult.success) {
        setApprovals(approvalsResult.data || []);
      }

      // Carregar dashboard (se for tesoureiro)
      const dashboardResult = await FinancialApprovalService.getTreasurerDashboard();
      if (dashboardResult.success) {
        setDashboard(dashboardResult.data || null);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const createTestApproval = async () => {
    if (!newApproval.title || !newApproval.amount) {
      setError('Por favor, preencha o título e o valor');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await FinancialApprovalService.createApproval({
        item_type: newApproval.item_type,
        item_id: `test-${Date.now()}`,
        title: newApproval.title,
        description: newApproval.description,
        total_amount: parseFloat(newApproval.amount),
        item_details: {
          category: 'test',
          created_by_test: true
        }
      });

      if (result.success) {
        setSuccess('Aprovação criada com sucesso!');
        setNewApproval({ title: '', description: '', amount: '', item_type: 'product' });
        await loadData(); // Recarregar dados
      } else {
        setError(result.error || 'Erro ao criar aprovação');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async (approvalId: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await FinancialApprovalService.submitForApproval(approvalId);
      
      if (result.success) {
        setSuccess('Aprovação submetida com sucesso!');
        await loadData();
      } else {
        setError(result.error || 'Erro ao submeter aprovação');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: FinancialApprovalStatus }) => (
    <Badge className={statusColors[status]}>
      {statusIcons[status]}
      <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
    </Badge>
  );

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sistema de Aprovação Financeira - Teste</h1>
        <Button onClick={loadData} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Atualizar'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Dashboard de Métricas */}
      {dashboard && (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard do Tesoureiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {dashboard.pending_approvals}
                </div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {dashboard.in_revision}
                </div>
                <div className="text-sm text-gray-600">Em Revisão</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dashboard.approved_today}
                </div>
                <div className="text-sm text-gray-600">Aprovadas Hoje</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  €{dashboard.total_approved_today?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-600">Total Aprovado Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário para criar nova aprovação */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Aprovação de Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <Input
                value={newApproval.title}
                onChange={(e) => setNewApproval({ ...newApproval, title: e.target.value })}
                placeholder="Ex: Compra de equipamentos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valor (€)</label>
              <Input
                type="number"
                step="0.01"
                value={newApproval.amount}
                onChange={(e) => setNewApproval({ ...newApproval, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <Textarea
              value={newApproval.description}
              onChange={(e) => setNewApproval({ ...newApproval, description: e.target.value })}
              placeholder="Descreva o que está sendo aprovado..."
              rows={3}
            />
          </div>
          <Button onClick={createTestApproval} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Criar Aprovação
          </Button>
        </CardContent>
      </Card>

      {/* Lista de aprovações */}
      <Card>
        <CardHeader>
          <CardTitle>Aprovações Existentes ({approvals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma aprovação encontrada. Crie uma para testar o sistema.
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div key={approval.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{approval.title}</h3>
                        <StatusBadge status={approval.status} />
                      </div>
                      <p className="text-sm text-gray-600">{approval.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>€{approval.total_amount}</span>
                        <span>{approval.item_type}</span>
                        <span>{approval.reference_number}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Criado em: {new Date(approval.created_at).toLocaleString('pt-PT')}
                      </div>
                    </div>
                    <div className="space-x-2">
                      {approval.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => submitForApproval(approval.id)}
                          disabled={loading}
                        >
                          Submeter
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações de debug */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Total de aprovações carregadas:</strong> {approvals.length}</div>
            <div><strong>Dashboard carregado:</strong> {dashboard ? 'Sim' : 'Não'}</div>
            <div><strong>Estado do loading:</strong> {loading ? 'Carregando...' : 'Pronto'}</div>
            <div><strong>Último erro:</strong> {error || 'Nenhum'}</div>
            <div><strong>Última ação bem-sucedida:</strong> {success || 'Nenhuma'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
