import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Eye, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Monitor
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AuditLog, UserRole } from '@/types/audit';

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
  onViewDetails: (log: AuditLog) => void;
  userRole: UserRole;
  compact?: boolean;
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({ 
  logs, 
  loading, 
  onViewDetails, 
  userRole,
  compact = false 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      case 'medium':
        return <Info className="h-3 w-3" />;
      case 'low':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication': return 'bg-blue-100 text-blue-800';
      case 'member_management': return 'bg-green-100 text-green-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'data_access': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'authentication': 'Autenticação',
      'member_management': 'Gestão de Membros',
      'financial': 'Financeiro',
      'inventory': 'Inventário',
      'events': 'Eventos',
      'vehicles': 'Veículos',
      'system': 'Sistema',
      'security': 'Segurança',
      'data_access': 'Acesso a Dados',
      'communication': 'Comunicação',
      'compliance': 'Conformidade'
    };
    return categoryMap[category] || category;
  };

  const maskSensitiveData = (data: string, userRole: UserRole) => {
    // Verificar se o usuário tem permissão para ver dados sensíveis
    const canViewSensitiveData = ['super_admin', 'system_admin'].includes(userRole);
    
    if (!canViewSensitiveData && data.length > 10) {
      return data.substring(0, 4) + '****' + data.substring(data.length - 2);
    }
    
    return data;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(compact ? 5 : 10)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            {!compact && <Skeleton className="h-4 w-20" />}
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          Nenhum log de auditoria encontrado para os filtros selecionados.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Severidade</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Usuário</TableHead>
            {!compact && <TableHead>IP</TableHead>}
            {!compact && <TableHead>Recursos</TableHead>}
            <TableHead>Data/Hora</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="hover:bg-muted/50">
              <TableCell>
                <Badge 
                  variant={getSeverityColor(log.severity)}
                  className="flex items-center gap-1"
                >
                  {getSeverityIcon(log.severity)}
                  {log.severity}
                </Badge>
              </TableCell>
              
              <TableCell>
                <Badge 
                  className={`${getCategoryColor(log.category)} border-none`}
                >
                  {formatCategoryName(log.category)}
                </Badge>
              </TableCell>
              
              <TableCell className="font-medium">
                <div className="max-w-[200px] truncate" title={log.action}>
                  {log.action}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">
                    {log.userEmail ? maskSensitiveData(log.userEmail, userRole) : 'Sistema'}
                  </span>
                  {log.userRole && (
                    <Badge variant="outline" className="text-xs">
                      {log.userRole}
                    </Badge>
                  )}
                </div>
              </TableCell>
              
              {!compact && (
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-mono">
                      {log.ipAddress ? maskSensitiveData(log.ipAddress, userRole) : 'N/A'}
                    </span>
                  </div>
                </TableCell>
              )}
              
              {!compact && (
                <TableCell>
                  {log.resourceType && log.resourceId && (
                    <div className="text-sm">
                      <span className="font-medium">{log.resourceType}</span>
                      <span className="text-muted-foreground">:</span>
                      <span className="font-mono text-xs">
                        {maskSensitiveData(log.resourceId, userRole)}
                      </span>
                    </div>
                  )}
                </TableCell>
              )}
              
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(log.timestamp), 'dd/MM HH:mm', { locale: pt })}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(log)}
                >
                  <Eye className="h-3 w-3" />
                  {!compact && <span className="ml-1">Ver</span>}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuditLogTable;
