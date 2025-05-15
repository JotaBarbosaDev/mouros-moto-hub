import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { activityLogService, ActivityLog } from "@/services/activity-log-service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MemberActivityHistoryProps {
  memberId: string;
  memberName?: string;
  limit?: number;
}

/**
 * Componente para exibir o histórico de atividades de um membro específico
 */
export function MemberActivityHistory({
  memberId,
  memberName,
  limit = 10,
}: MemberActivityHistoryProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  // Carregar logs relacionados ao membro
  useEffect(() => {
    loadMemberLogs();
  }, [memberId, showMore]);

  const loadMemberLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar logs relacionados ao membro
      const result = await activityLogService.getLogs({
        entityType: 'MEMBER',
        entityId: memberId,
        limit: showMore ? 50 : limit,
      });

      setLogs(result);
    } catch (err) {
      console.error("Erro ao carregar logs do membro:", err);
      setError("Não foi possível carregar o histórico de atividades deste membro.");
    } finally {
      setLoading(false);
    }
  };

  // Formatadores
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      CREATE: "criou",
      UPDATE: "atualizou",
      DELETE: "excluiu",
      VIEW: "visualizou",
    };
    return actionMap[action] || action;
  };

  // Classes para ações
  const getActionClass = (action: string) => {
    const actionClasses: Record<string, string> = {
      CREATE: "text-green-600",
      UPDATE: "text-blue-600",
      DELETE: "text-red-600",
      VIEW: "text-gray-600",
    };
    return actionClasses[action] || "";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Histórico de {memberName ? `${memberName}` : "Membro"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Esqueleto de carregamento
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[70px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>{log.username || "Sistema"}</TableCell>
                    <TableCell>
                      <span className={getActionClass(log.action)}>
                        {formatAction(log.action)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="details">
                          <AccordionTrigger className="text-blue-600 py-0">
                            <span className="text-sm">Ver detalhes</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded-md overflow-auto max-h-[200px]">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    {error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                      <p className="text-gray-500">
                        Nenhum registro de atividade encontrado para este membro.
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {logs.length >= limit && !showMore && (
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowMore(true)}
            >
              Ver mais atividades
            </Button>
          </div>
        )}

        {showMore && logs.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowMore(false)}
            >
              Ver menos atividades
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
