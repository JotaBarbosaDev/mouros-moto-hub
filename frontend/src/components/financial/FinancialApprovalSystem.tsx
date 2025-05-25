import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  MessageSquare,
  ArrowUpCircle,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  financialApprovalService,
  type FinancialApproval,
  type ApprovalComment,
  type UserRole,
  type DashboardMetrics,
  type FinancialApprovalWithDetails,
  type ApprovalCommentWithUser
} from '@/services/financial-approval-service';

export const FinancialApprovalSystem: React.FC = () => {
  const [approvals, setApprovals] = useState<FinancialApprovalWithDetails[]>([]);
  const [comments, setComments] = useState<{ [key: string]: ApprovalCommentWithUser[] }>({});
  const [selectedApproval, setSelectedApproval] = useState<FinancialApprovalWithDetails | null>(null);
  const [newComment, setNewComment] = useState('');
  const [suggestedValues, setSuggestedValues] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const { toast } = useToast();

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar role do usuário
      const role = await financialApprovalService.getUserRole();
      setUserRole(role);

      // Carregar aprovações
      await fetchApprovals();

      // Carregar métricas se for tesoureiro
      if (role === 'treasurer') {
        const metrics = await financialApprovalService.getTreasurerDashboard();
        setDashboardMetrics(metrics);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados iniciais.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApprovals = async () => {
    try {
      const data = await financialApprovalService.getApprovals();
      setApprovals(data);
    } catch (error) {
      console.error('Erro ao carregar aprovações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as aprovações financeiras.',
        variant: 'destructive'
      });
    }
  };

  const fetchComments = async (approvalId: string) => {
    try {
      const data = await financialApprovalService.getApprovalComments(approvalId);
      setComments(prev => ({ ...prev, [approvalId]: data }));
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      await financialApprovalService.reviewApproval(approvalId, {
        action: 'approve',
        comment: newComment.trim() || undefined
      });

      toast({
        title: 'Sucesso',
        description: 'Item aprovado com sucesso!',
        variant: 'default'
      });

      fetchApprovals();
      setNewComment('');
      setSelectedApproval(null);
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao aprovar o item.',
        variant: 'destructive'
      });
    }
  };

  const handleRequestChanges = async (approvalId: string) => {
    if (!newComment.trim()) {
      toast({
        title: 'Erro',
        description: 'Comentário é obrigatório para solicitar alterações.',
        variant: 'destructive'
      });
      return;
    }

    try {
      let parsedSuggestedValues;
      if (suggestedValues.trim()) {
        try {
          parsedSuggestedValues = JSON.parse(suggestedValues);
        } catch {
          toast({
            title: 'Erro',
            description: 'Valores sugeridos devem estar em formato JSON válido.',
            variant: 'destructive'
          });
          return;
        }
      }

      await financialApprovalService.reviewApproval(approvalId, {
        action: 'request_changes',
        comment: newComment,
        suggested_values: parsedSuggestedValues
      });

      toast({
        title: 'Sucesso',
        description: 'Solicitação de alterações enviada!',
        variant: 'default'
      });

      fetchApprovals();
      setNewComment('');
      setSuggestedValues('');
      setSelectedApproval(null);
    } catch (error) {
      console.error('Erro ao solicitar alterações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao solicitar alterações.',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (approvalId: string) => {
    if (!newComment.trim()) {
      toast({
        title: 'Erro',
        description: 'Comentário é obrigatório para rejeitar item.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await financialApprovalService.reviewApproval(approvalId, {
        action: 'reject',
        comment: newComment
      });

      toast({
        title: 'Sucesso',
        description: 'Item rejeitado.',
        variant: 'default'
      });

      fetchApprovals();
      setNewComment('');
      setSelectedApproval(null);
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao rejeitar o item.',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { variant: 'secondary' as const, icon: Clock, label: 'Rascunho' },
      'awaiting_approval': { variant: 'default' as const, icon: Clock, label: 'Aguardando Aprovação' },
      'in_revision': { variant: 'destructive' as const, icon: AlertCircle, label: 'Em Revisão' },
      'awaiting_reevaluation': { variant: 'default' as const, icon: Clock, label: 'Aguardando Reavaliação' },
      'escalated': { variant: 'destructive' as const, icon: ArrowUpCircle, label: 'Escalado' },
      'approved': { variant: 'default' as const, icon: CheckCircle, label: 'Aprovado' },
      'rejected': { variant: 'destructive' as const, icon: XCircle, label: 'Rejeitado' },
      'cancelled': { variant: 'secondary' as const, icon: XCircle, label: 'Cancelado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p>Carregando aprovações financeiras...</p>
        </div>
      </div>
    );
  }

  const renderDashboardMetrics = () => {
    if (userRole !== 'treasurer' || !dashboardMetrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="text-orange-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">{dashboardMetrics.pending_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold">{dashboardMetrics.approved_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold">{dashboardMetrics.approved_this_week}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Valor Pendente</p>
                <p className="text-2xl font-bold">€{dashboardMetrics.total_pending_value}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-purple-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Taxa Aprovação</p>
                <p className="text-2xl font-bold">{dashboardMetrics.approval_rate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sistema de Aprovação Financeira</h2>
        <Badge variant="outline" className="text-sm">
          {userRole === 'treasurer' && 'Tesoureiro'}
          {userRole === 'president' && 'Presidente'}
          {userRole === 'creator' && 'Membro'}
        </Badge>
      </div>

      {/* Dashboard Metrics para Tesoureiro */}
      {renderDashboardMetrics()}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {approvals.filter(a => ['awaiting_approval', 'in_revision', 'awaiting_reevaluation', 'escalated'].includes(a.status)).map(approval => (
              <Card key={approval.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedApproval(approval);
                      fetchComments(approval.id);
                    }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign size={20} />
                      {approval.item_type} - ID: {approval.item_id.slice(0, 8)}...
                    </CardTitle>
                    {getStatusBadge(approval.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Criador:</strong> {approval.creator.name}</p>
                    <p><strong>Valores:</strong> {JSON.stringify(approval.current_values, null, 2)}</p>
                    <p><strong>Rodada:</strong> {approval.current_round}/{approval.max_rounds}</p>
                    <p className="text-sm text-gray-500">
                      Criado em: {new Date(approval.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid gap-4">
            {approvals.filter(a => a.status === 'approved').map(approval => (
              <Card key={approval.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {approval.item_type} - ID: {approval.item_id.slice(0, 8)}...
                    </CardTitle>
                    {getStatusBadge(approval.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Criador:</strong> {approval.creator.name}</p>
                    <p><strong>Valores Aprovados:</strong> {JSON.stringify(approval.approved_values, null, 2)}</p>
                    <p className="text-sm text-gray-500">
                      Aprovado em: {approval.approved_at ? new Date(approval.approved_at).toLocaleDateString('pt-PT') : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid gap-4">
            {approvals.filter(a => ['rejected', 'cancelled'].includes(a.status)).map(approval => (
              <Card key={approval.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {approval.item_type} - ID: {approval.item_id.slice(0, 8)}...
                    </CardTitle>
                    {getStatusBadge(approval.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Criador:</strong> {approval.creator.name}</p>
                    <p><strong>Valores:</strong> {JSON.stringify(approval.current_values, null, 2)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid gap-4">
            {approvals.map(approval => (
              <Card key={approval.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {approval.item_type} - ID: {approval.item_id.slice(0, 8)}...
                    </CardTitle>
                    {getStatusBadge(approval.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Criador:</strong> {approval.creator.name}</p>
                    <p><strong>Valores:</strong> {JSON.stringify(approval.current_values, null, 2)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes da aprovação */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Detalhes da Aprovação</h3>
                <Button variant="ghost" onClick={() => setSelectedApproval(null)}>×</Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    {getStatusBadge(selectedApproval.status)}
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <p>{selectedApproval.item_type}</p>
                  </div>
                  <div>
                    <Label>Criador</Label>
                    <p>{selectedApproval.creator.name}</p>
                  </div>
                  <div>
                    <Label>Rodada</Label>
                    <p>{selectedApproval.current_round}/{selectedApproval.max_rounds}</p>
                  </div>
                </div>

                <div>
                  <Label>Valores Atuais</Label>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedApproval.current_values, null, 2)}
                  </pre>
                </div>

                {/* Comentários */}
                <div>
                  <Label>Histórico de Comentários</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {comments[selectedApproval.id]?.map(comment => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <strong>{comment.user.name}</strong>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('pt-PT')}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        {comment.suggested_values && (
                          <pre className="text-xs bg-white p-2 mt-2 rounded">
                            {JSON.stringify(comment.suggested_values, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações do Tesoureiro */}
                {userRole === 'treasurer' && ['awaiting_approval', 'awaiting_reevaluation'].includes(selectedApproval.status) && (
                  <div className="space-y-4 border-t pt-4">
                    <Label>Ações do Tesoureiro</Label>
                    
                    <div>
                      <Label htmlFor="comment">Comentário</Label>
                      <Textarea
                        id="comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Adicione seus comentários..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="suggested-values">Valores Sugeridos (JSON - opcional)</Label>
                      <Textarea
                        id="suggested-values"
                        value={suggestedValues}
                        onChange={(e) => setSuggestedValues(e.target.value)}
                        placeholder='{"price": 100, "discount": 10}'
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApprove(selectedApproval.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Aprovar
                      </Button>
                      <Button 
                        onClick={() => handleRequestChanges(selectedApproval.id)}
                        variant="destructive"
                      >
                        <MessageSquare size={16} className="mr-1" />
                        Solicitar Alterações
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
