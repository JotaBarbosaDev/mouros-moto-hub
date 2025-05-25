import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar as CalendarIcon, 
  Filter, 
  X, 
  Search,
  RotateCcw
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  AuditLogFilter, 
  AuditCategory, 
  AuditSeverity, 
  UserRole,
  ROLE_PERMISSIONS 
} from '@/types/audit';

interface AuditFiltersProps {
  filters: AuditLogFilter;
  onFiltersChange: (filters: Partial<AuditLogFilter>) => void;
  userRole: UserRole;
  advanced?: boolean;
}

const AuditFilters: React.FC<AuditFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  userRole,
  advanced = false 
}) => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: filters.startDate,
    to: filters.endDate
  });
  const [showAdvanced, setShowAdvanced] = useState(advanced);

  // Obter categorias permitidas para o role do usuário
  const allowedCategories = ROLE_PERMISSIONS[userRole]?.allowedCategories || [];
  const canViewPersonalData = ROLE_PERMISSIONS[userRole]?.canViewSensitive || false;

  // Opções de período rápido
  const quickPeriods = [
    { label: 'Última hora', value: 'last_hour', from: new Date(Date.now() - 60 * 60 * 1000) },
    { label: 'Últimas 24h', value: 'last_24h', from: subDays(new Date(), 1) },
    { label: 'Últimos 7 dias', value: 'last_7d', from: subDays(new Date(), 7) },
    { label: 'Últimos 30 dias', value: 'last_30d', from: subDays(new Date(), 30) },
    { label: 'Última semana', value: 'last_week', from: subWeeks(new Date(), 1) },
    { label: 'Último mês', value: 'last_month', from: subMonths(new Date(), 1) }
  ];

  // Categorias disponíveis
  const categoryOptions: { value: AuditCategory; label: string }[] = [
    { value: 'authentication' as AuditCategory, label: 'Autenticação' },
    { value: 'member_management' as AuditCategory, label: 'Gestão de Membros' },
    { value: 'financial' as AuditCategory, label: 'Financeiro' },
    { value: 'store' as AuditCategory, label: 'Loja' },
    { value: 'events' as AuditCategory, label: 'Eventos' },
    { value: 'vehicles' as AuditCategory, label: 'Veículos' },
    { value: 'system_config' as AuditCategory, label: 'Sistema' },
    { value: 'reports' as AuditCategory, label: 'Relatórios' },
    { value: 'communications' as AuditCategory, label: 'Comunicações' },
    { value: 'data_operations' as AuditCategory, label: 'Operações de Dados' },
    { value: 'maintenance' as AuditCategory, label: 'Manutenção' }
  ].filter(cat => allowedCategories.length === 0 || allowedCategories.includes(cat.value));

  // Severidades disponíveis
  const severityOptions: { value: AuditSeverity; label: string; color: string }[] = [
    { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Crítica', color: 'bg-red-100 text-red-800' }
  ];

  const handleQuickPeriod = (period: typeof quickPeriods[0]) => {
    const newRange = { from: period.from, to: new Date() };
    setDateRange(newRange);
    onFiltersChange({
      startDate: newRange.from,
      endDate: newRange.to
    });
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    if (range.from && range.to) {
      onFiltersChange({
        startDate: range.from,
        endDate: range.to
      });
    }
  };

  const handleClearFilters = () => {
    const clearedFilters: Partial<AuditLogFilter> = {
      category: undefined,
      severity: undefined,
      userId: undefined,
      searchTerm: undefined,
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      page: 1
    };
    
    setDateRange({ from: clearedFilters.startDate, to: clearedFilters.endDate });
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = [
    filters.category,
    filters.severity,
    filters.userId,
    filters.searchTerm
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Filtros básicos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Busca */}
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar em ações, descrições..."
              className="pl-8"
              value={filters.searchTerm || ''}
              onChange={(e) => onFiltersChange({ searchTerm: e.target.value || undefined })}
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select 
            value={filters.category?.[0] || ''} 
            onValueChange={(value) => onFiltersChange({ category: value ? [value as AuditCategory] : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Severidade */}
        <div className="space-y-2">
          <Label>Severidade</Label>
          <Select 
            value={filters.severity?.[0] || ''} 
            onValueChange={(value) => onFiltersChange({ severity: value ? [value as AuditSeverity] : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as severidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as severidades</SelectItem>
              {severityOptions.map((severity) => (
                <SelectItem key={severity.value} value={severity.value}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${severity.color}`} />
                    <span>{severity.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Período rápido */}
        <div className="space-y-2">
          <Label>Período</Label>
          <Select onValueChange={(value) => {
            const period = quickPeriods.find(p => p.value === value);
            if (period) handleQuickPeriod(period);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              {quickPeriods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Seletor de data personalizado */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Data de Início</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  format(dateRange.from, "dd/MM/yyyy", { locale: pt })
                ) : (
                  <span>Selecionar data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => handleDateRangeChange({ ...dateRange, from: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Data de Fim</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.to ? (
                  format(dateRange.to, "dd/MM/yyyy", { locale: pt })
                ) : (
                  <span>Selecionar data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) => handleDateRangeChange({ ...dateRange, to: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Botão para mostrar filtros avançados */}
      {!advanced && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros Avançados {showAdvanced ? '(Ocultar)' : '(Mostrar)'}
          </Button>
          
          {activeFiltersCount > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Limpar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Filtros avançados */}
      {(showAdvanced || advanced) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* ID do Usuário (só para admins) */}
              {canViewPersonalData && (
                <div className="space-y-2">
                  <Label htmlFor="userId">ID do Usuário</Label>
                  <Input
                    id="userId"
                    placeholder="UUID do usuário"
                    value={filters.userId || ''}
                    onChange={(e) => onFiltersChange({ userId: e.target.value || undefined })}
                  />
                </div>
              )}

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="tag1, tag2, tag3"
                  value={filters.tags?.join(', ') || ''}
                  onChange={(e) => onFiltersChange({ 
                    tags: e.target.value ? e.target.value.split(',').map(t => t.trim()).filter(Boolean) : undefined 
                  })}
                />
              </div>

              {/* Limitar resultados */}
              <div className="space-y-2">
                <Label htmlFor="limit">Registros por Página</Label>
                <Select 
                  value={filters.limit?.toString() || '20'} 
                  onValueChange={(value) => onFiltersChange({ limit: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 registros</SelectItem>
                    <SelectItem value="20">20 registros</SelectItem>
                    <SelectItem value="50">50 registros</SelectItem>
                    <SelectItem value="100">100 registros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditFilters;
