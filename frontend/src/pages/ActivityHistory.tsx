import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ActivityHistory } from "@/components/ActivityHistory";
import { Helmet } from "react-helmet-async";

/**
 * Página de Histórico de Atividades do Sistema
 * Permite visualizar e filtrar todos os logs de atividades registrados
 */
const ActivityHistoryPage = () => {
  const [filter, setFilter] = useState({
    action: "",
    entityType: "",
    fromDate: "",
    toDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Opções para filtros
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

  // Função para aplicar filtros
  const applyFilters = () => {
    // Os filtros são aplicados automaticamente pelo componente ActivityHistory
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setFilter({
      action: "",
      entityType: "",
      fromDate: "",
      toDate: "",
    });
  };

  return (
    <>
      <Helmet>
        <title>Histórico de Atividades | Mouros Moto Hub</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Histórico de Atividades</h1>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Registro de Atividades</CardTitle>
                <CardDescription>
                  Visualize todas as ações realizadas no sistema
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>
            </div>
          </CardHeader>

          {showFilters && (
            <CardContent className="border-b pb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Ação:</label>
                  <Select
                    value={filter.action}
                    onValueChange={(value) =>
                      setFilter({ ...filter, action: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma ação" />
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

                <div className="space-y-1">
                  <label className="text-sm font-medium">Tipo de Entidade:</label>
                  <Select
                    value={filter.entityType}
                    onValueChange={(value) =>
                      setFilter({ ...filter, entityType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
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

                <div className="space-y-1">
                  <label className="text-sm font-medium">Data Inicial:</label>
                  <Input
                    type="date"
                    value={filter.fromDate}
                    onChange={(e) =>
                      setFilter({ ...filter, fromDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Data Final:</label>
                  <Input
                    type="date"
                    value={filter.toDate}
                    onChange={(e) =>
                      setFilter({ ...filter, toDate: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2 col-span-1 md:col-span-4">
                  <Button onClick={applyFilters}>Aplicar Filtros</Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          )}

          <CardContent className="pt-6">
            <ActivityHistory 
              entityType={filter.entityType || undefined} 
              fromDate={filter.fromDate || undefined}
              toDate={filter.toDate || undefined}
              action={filter.action || undefined}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ActivityHistoryPage;
