import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Activity, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  Eye,
  FileText,
  Settings,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AuditService } from '@/services/auditService';
import { 
  AuditLog, 
  AuditLogFilter, 
  AuditStats, 
  AuditCategory, 
  AuditSeverity,
  UserRole 
} from '@/types/audit';
import { useToast } from '@/hooks/use-toast';

// Subcomponentes
import AuditStatsCards from './AuditStatsCards.tsx';
import AuditLogTable from './AuditLogTable.tsx';
import AuditFilters from './AuditFilters.tsx';
import AuditExportDialog from './AuditExportDialog.tsx';

interface AuditDashboardProps {
  userRole: UserRole;
  userId?: string;
}

const AuditDashboard: React.FC<AuditDashboardProps> = ({ userRole, userId }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilter>({
    page: 1,
    limit: 20,
    startDate: subDays(new Date(), 7), // Últimos 7 dias por padrão
    endDate: new Date()
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();

  // Verificar permissões do usuário
  const auditService = new AuditService();
  const canViewAuditLogs = auditService.hasPermission(userRole, 'view_logs');
  const canExportLogs = auditService.hasPermission(userRole, 'export_data');
  const canConfigureAlerts = auditService.hasPermission(userRole, 'configure_alerts');

  useEffect(() => {
    const auditServiceInstance = new AuditService();
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        if (!canViewAuditLogs) {
          toast({
            title: "Acesso Negado",
            description: "Você não tem permissão para visualizar os logs de auditoria.",
            variant: "destructive",
          });
          return;
        }
        
        // Carregar logs e estatísticas em paralelo
        const [logsResult, statsResult] = await Promise.all([
          auditServiceInstance.getLogs(filters),
          auditServiceInstance.getStats({
            from: filters.startDate || new Date(),
            to: filters.endDate || new Date()
          })
        ]);

        setLogs(logsResult.data);
        setStats(statsResult);
        
      } catch (error) {
        console.error('Erro ao carregar dados de auditoria:', error);
        toast({
          title: "Erro ao Carregar Dados",
          description: "Não foi possível carregar os dados de auditoria.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [filters, canViewAuditLogs, toast]);

  const handleFiltersChange = (newFilters: Partial<AuditLogFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!canExportLogs) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para exportar logs de auditoria.",
        variant: "destructive",
      });
      return;
    }

    try {
      await auditService.exportLogs(filters, format);
      toast({
        title: "Exportação Iniciada",
        description: `Os logs estão sendo exportados em formato ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar os logs.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    // Implementar modal de detalhes do log
    console.log('Ver detalhes do log:', log);
  };

  if (!canViewAuditLogs) {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertTitle>Acesso Restrito</AlertTitle>
          <AlertDescription>
            Você não tem permissão para acessar os logs de auditoria do sistema.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Auditoria</h1>
          <p className="text-muted-foreground">
            Monitoramento e análise de atividades do sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {canExportLogs && (
            <Button 
              variant="outline" 
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
          
          {canConfigureAlerts && (
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
          )}
        </div>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="logs">Logs Detalhados</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
        </TabsList>

        {/* Aba: Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          {/* Cards de estatísticas */}
          <AuditStatsCards stats={stats} loading={loading} />
          
          {/* Filtros rápidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filtros Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AuditFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                userRole={userRole}
              />
            </CardContent>
          </Card>

          {/* Logs recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Últimos {logs.length} eventos de auditoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogTable
                logs={logs.slice(0, 10)} // Mostrar apenas os 10 mais recentes
                loading={loading}
                onViewDetails={handleViewDetails}
                userRole={userRole}
                compact={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Logs Detalhados */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria Completos</CardTitle>
              <CardDescription>
                Visualização detalhada de todos os eventos de auditoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filtros avançados */}
                <AuditFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  userRole={userRole}
                  advanced={true}
                />
                
                <Separator />
                
                {/* Tabela completa */}
                <AuditLogTable
                  logs={logs}
                  loading={loading}
                  onViewDetails={handleViewDetails}
                  userRole={userRole}
                  compact={false}
                />
                
                {/* Paginação */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {Math.min(filters.limit || 20, logs.length)} de {stats?.totalLogs || 0} registros
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFiltersChange({ page: (filters.page || 1) - 1 })}
                      disabled={!filters.page || filters.page <= 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFiltersChange({ page: (filters.page || 1) + 1 })}
                      disabled={logs.length < (filters.limit || 20)}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Segurança */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Alertas de segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                  Alertas de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Implementar lista de alertas de segurança */}
                <div className="text-center text-muted-foreground py-8">
                  Nenhum alerta crítico no momento
                </div>
              </CardContent>
            </Card>

            {/* Atividade suspeita */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-red-500" />
                  Atividade Suspeita
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Implementar detecção de atividade suspeita */}
                <div className="text-center text-muted-foreground py-8">
                  Sistema funcionando normalmente
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba: Conformidade */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status GDPR */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-blue-500" />
                  Conformidade GDPR
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Implementar status de conformidade GDPR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Políticas de Retenção</span>
                    <Badge variant="outline" className="text-green-600">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Anonimização Automática</span>
                    <Badge variant="outline" className="text-green-600">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Direitos do Titular</span>
                    <Badge variant="outline" className="text-green-600">Suportado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Relatórios de conformidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-purple-500" />
                  Relatórios de Conformidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Relatório Mensal GDPR
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Análise de Retenção de Dados
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Log de Acessos Sensíveis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de exportação */}
      <AuditExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExport}
        filters={filters}
      />
    </div>
  );
};

export default AuditDashboard;
