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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { activityLogService, ActivityLog, LogFilters } from "@/services/activity-log-service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityHistoryProps {
  entityType?: string;
  entityId?: string;
  fromDate?: string;
  toDate?: string;
  action?: string;
}

export function ActivityHistory({ entityType, entityId, fromDate, toDate, action }: ActivityHistoryProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogFilters>({
    action: action || undefined,
    entityType: entityType || undefined,
    entityId: entityId || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    userId: undefined,
    limit: 10,
    offset: 0,
  });
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const actionOptions = [
    { value: "", label: "Todas as ações" },
    { value: "CREATE", label: "Criação" },
    { value: "UPDATE", label: "Atualização" },
    { value: "DELETE", label: "Exclusão" },
    { value: "VIEW", label: "Visualização" },
  ];

  const entityTypeOptions = [
    { value: "", label: "Todos os tipos" },
    { value: "MEMBER", label: "Membro" },
    { value: "VEHICLE", label: "Veículo" },
    { value: "SETTINGS", label: "Configurações" },
    { value: "EVENT", label: "Evento" },
  ];

  // Carregar logs quando os filtros mudarem
  // Atualiza os filtros quando as props mudarem
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      action: action || undefined,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }));
  }, [entityType, entityId, fromDate, toDate, action]);

  // Carrega logs quando os filtros ou página mudar
  useEffect(() => {
    loadLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular offset com base na página
      const offset = (page - 1) * (filters.limit || 10);
      
      const result = await activityLogService.getLogs({
        ...filters,
        offset,
      });

      setLogs(result);

      // Estimativa simples de páginas totais
      // Em uma implementação real, você precisaria de um endpoint que retorne a contagem total
      setTotalPages(Math.max(1, Math.ceil(result.length / (filters.limit || 10))));
    } catch (err) {
      console.error("Erro ao carregar logs:", err);
      setError("Não foi possível carregar o histórico de atividades.");
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    setPage(1); // Resetar para primeira página
    loadLogs();
  };

  // Resetar filtros
  const resetFilters = () => {
    setFilters({
      action: undefined,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      fromDate: undefined,
      toDate: undefined,
      userId: undefined,
      limit: 10,
      offset: 0,
    });
    setPage(1);
    loadLogs();
  };

  // Navegar entre páginas
  const goToPage = (newPage: number) => {
    setPage(newPage);
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

  const formatEntityType = (type: string) => {
    const typeMap: Record<string, string> = {
      MEMBER: "membro",
      VEHICLE: "veículo",
      SETTINGS: "configurações",
      EVENT: "evento",
    };
    return typeMap[type] || type;
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
    <div className="activity-history w-full">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="filters">
              <AccordionTrigger>Filtros</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ação</label>
                    <Select
                      onValueChange={(value) =>
                        setFilters({ ...filters, action: value || undefined })
                      }
                      value={filters.action || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as ações" />
                      </SelectTrigger>
                      <SelectContent>
                        {actionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!entityType && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de Entidade</label>
                      <Select
                        onValueChange={(value) =>
                          setFilters({ ...filters, entityType: value || undefined })
                        }
                        value={filters.entityType || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          {entityTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Inicial</label>
                    <Input
                      type="date"
                      value={filters.fromDate || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, fromDate: e.target.value || undefined })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Final</label>
                    <Input
                      type="date"
                      value={filters.toDate || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, toDate: e.target.value || undefined })
                      }
                    />
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-3 flex gap-2">
                    <Button onClick={applyFilters}>Aplicar Filtros</Button>
                    <Button variant="outline" onClick={resetFilters}>
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Tabela de Logs */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Esqueeleto de carregamento
                  Array.from({ length: 5 }).map((_, i) => (
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
                        <Skeleton className="h-4 w-[90px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[120px]" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                      <TableCell>{log.username || "Sistema"}</TableCell>
                      <TableCell>
                        <span className={getActionClass(log.action)}>
                          {formatAction(log.action)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatEntityType(log.entity_type)}
                        {log.details?.memberName && (
                          <span className="block text-xs text-gray-500">
                            {log.details.memberName}
                          </span>
                        )}
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
                    <TableCell colSpan={5} className="text-center py-4">
                      {error ? (
                        <p className="text-red-500">{error}</p>
                      ) : (
                        <p className="text-gray-500">
                          Nenhum registro de atividade encontrado.
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && goToPage(page - 1)}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <Button
                      variant={page === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages && goToPage(page + 1)}
                    className={
                      page === totalPages ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
