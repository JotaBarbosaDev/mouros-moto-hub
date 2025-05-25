import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Shield,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { AuditStats } from '@/types/audit';

interface AuditStatsCardsProps {
  stats: AuditStats | null;
  loading: boolean;
}

const AuditStatsCards: React.FC<AuditStatsCardsProps> = ({ stats, loading }) => {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatTrend = (trend: number) => {
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">Dados não disponíveis</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: "Total de Logs",
      value: stats.totalLogs.toLocaleString(),
      trend: stats.trends?.totalLogs || 0,
      icon: Activity,
      description: "Eventos registrados"
    },
    {
      title: "Eventos Críticos",
      value: stats.criticalEvents.toLocaleString(),
      trend: stats.trends?.criticalEvents || 0,
      icon: AlertTriangle,
      description: "Requerem atenção",
      critical: stats.criticalEvents > 0
    },
    {
      title: "Usuários Únicos",
      value: stats.uniqueUsers.toLocaleString(),
      trend: stats.trends?.uniqueUsers || 0,
      icon: Users,
      description: "Usuários ativos"
    },
    {
      title: "Eventos Financeiros",
      value: stats.financialEvents.toLocaleString(),
      trend: stats.trends?.financialEvents || 0,
      icon: DollarSign,
      description: "Transações registradas"
    },
    {
      title: "Alertas de Segurança",
      value: stats.securityAlerts.toLocaleString(),
      trend: stats.trends?.securityAlerts || 0,
      icon: Shield,
      description: "Incidentes detectados",
      critical: stats.securityAlerts > 0
    },
    {
      title: "Falhas de Autenticação",
      value: stats.authFailures.toLocaleString(),
      trend: stats.trends?.authFailures || 0,
      icon: Shield,
      description: "Tentativas falhadas",
      warning: stats.authFailures > 10
    },
    {
      title: "Dados Pessoais",
      value: stats.personalDataAccess.toLocaleString(),
      trend: stats.trends?.personalDataAccess || 0,
      icon: FileText,
      description: "Acessos a dados pessoais"
    },
    {
      title: "Exportações",
      value: stats.dataExports.toLocaleString(),
      trend: stats.trends?.dataExports || 0,
      icon: FileText,
      description: "Exports realizados"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={card.critical ? 'border-red-200 bg-red-50' : card.warning ? 'border-orange-200 bg-orange-50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${
                card.critical ? 'text-red-500' : 
                card.warning ? 'text-orange-500' : 
                'text-muted-foreground'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                
                {stats.trends && (
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(card.trend)}
                    <span className={`text-xs font-medium ${getTrendColor(card.trend)}`}>
                      {formatTrend(card.trend)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Badges para alertas críticos */}
              {card.critical && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs">
                    Atenção Requerida
                  </Badge>
                </div>
              )}
              
              {card.warning && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    Monitorar
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AuditStatsCards;
