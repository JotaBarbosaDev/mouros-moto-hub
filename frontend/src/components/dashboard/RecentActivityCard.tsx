import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { activityLogService, ActivityLog } from "@/services/activity-log-service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  ActivityIcon,
  AlertCircleIcon,
  ClockIcon,
  EyeIcon,
  FilePlusIcon, 
  FileEditIcon,
  TrashIcon,
  UserIcon,
  BikeIcon
} from "lucide-react";

interface RecentActivityCardProps {
  limit?: number;
}

export function RecentActivityCard({ limit = 5 }: RecentActivityCardProps) {
  const navigate = useNavigate();
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar logs recentes
  useEffect(() => {
    const fetchRecentLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const logs = await activityLogService.getRecentLogs(limit);
        setRecentLogs(logs);
      } catch (err) {
        console.error("Erro ao carregar logs recentes:", err);
        setError("Falha ao carregar atividades recentes");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentLogs();
  }, [limit]);

  // Formatadores
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM - HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  // Ícone baseado na ação
  const getActionIcon = (log: ActivityLog) => {
    switch (log.action) {
      case "CREATE":
        return <FilePlusIcon className="h-4 w-4 text-green-500" />;
      case "UPDATE":
        return <FileEditIcon className="h-4 w-4 text-blue-500" />;
      case "DELETE":
        return <TrashIcon className="h-4 w-4 text-red-500" />;
      case "VIEW":
        return <EyeIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Ícone baseado no tipo de entidade
  const getEntityIcon = (log: ActivityLog) => {
    switch (log.entity_type) {
      case "MEMBER":
        return <UserIcon className="h-4 w-4 text-mouro-red" />;
      case "VEHICLE":
        return <BikeIcon className="h-4 w-4 text-mouro-red" />;
      default:
        return <ClockIcon className="h-4 w-4 text-mouro-red" />;
    }
  };

  // Texto resumido para a atividade
  const getActionText = (log: ActivityLog) => {
    const actionMap: Record<string, string> = {
      CREATE: "criou",
      UPDATE: "atualizou",
      DELETE: "excluiu",
      VIEW: "visualizou",
    };
    
    const entityMap: Record<string, string> = {
      MEMBER: "membro",
      VEHICLE: "veículo",
      EVENT: "evento",
      SETTINGS: "configurações",
    };
    
    const action = actionMap[log.action] || log.action.toLowerCase();
    const entityType = entityMap[log.entity_type] || log.entity_type.toLowerCase();
    
    return `${action} ${entityType}`;
  };

  // Ir para a página de logs completa
  const goToFullHistory = () => {
    navigate('/activity-history');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <ActivityIcon className="mr-2 h-5 w-5 text-mouro-red" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            // Esqueleto de carregamento
            Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="flex items-center justify-center py-4 text-red-500">
              <AlertCircleIcon className="mr-2 h-5 w-5" />
              {error}
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhuma atividade recente registrada
            </div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 border-b border-gray-100 pb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  {getActionIcon(log)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="font-medium text-sm">
                      {log.username || "Sistema"}
                    </span>
                    <span className="mx-1 text-xs text-gray-500">
                      {getActionText(log)}
                    </span>
                    {getEntityIcon(log)}
                  </div>
                  {(log.details?.updatedBy || 
                    log.details?.createdBy || 
                    log.details?.deletedBy) && 
                    (log.details?.updatedBy !== log.username || 
                     log.details?.createdBy !== log.username || 
                     log.details?.deletedBy !== log.username) && (
                    <span className="text-xs text-gray-500 italic">
                      por {log.details?.updatedBy || log.details?.createdBy || log.details?.deletedBy}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
          
          <div className="pt-2 text-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToFullHistory}
            >
              Ver histórico completo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
