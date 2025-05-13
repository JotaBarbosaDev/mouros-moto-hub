import { MembersLayout } from '@/components/layouts/MembersLayout';
import { CardHeader, CardContent, CardTitle, Card, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useMembers } from '@/hooks/use-members';
import { useEvents } from '@/hooks/use-events';
import { useVehicles } from '@/hooks/use-vehicles';
import { useBarSales } from '@/hooks/use-bar-sales';
import { useTreasury } from '@/hooks/use-treasury';
import { useInventory } from '@/hooks/use-inventory';
import {
  Calendar,
  Clock,
  CreditCard,
  FileBarChart,
  Settings,
  ShoppingCart,
  Users,
  AlertCircle,
  BarChart2,
  Beer,
  Package,
  PlusCircle,
  MinusCircle,
  Bike
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useState } from 'react';

// Cores para gráficos
const COLORS = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'];
const CHART_COLORS = {
  primary: '#e11d48',
  secondary: '#f43f5e',
  tertiary: '#22c55e',
  quaternary: '#3b82f6',
  negative: '#ef4444',
};

// Limiar para considerar um item em estoque baixo (menos de 30% do estoque ideal)
const LOW_STOCK_THRESHOLD = 30; // porcentagem

const Dashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  
  // Carregando dados de várias fontes
  const { members, isLoading: isLoadingMembers, isError: isErrorMembers } = useMembers();
  const { events, isLoading: isLoadingEvents } = useEvents();
  const { vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const { sales: barSales = [], isLoading: isLoadingBarSales } = useBarSales();
  
  // Usando o hook de tesouraria - ajustado porque parece que o hook retorna uma função
  const { useTransactions, useFinancialSummary } = useTreasury();
  const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactions();
  
  // Dados de inventário
  const { items: inventoryItems = [], isLoading: isLoadingInventory } = useInventory();
  
  const isLoading = isLoadingMembers || isLoadingEvents || isLoadingVehicles || 
                   isLoadingBarSales || isLoadingTransactions || isLoadingInventory;
  
  // DADOS DE MEMBROS
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.isActive !== false).length;
  const inactiveMembers = totalMembers - activeMembers;
  
  // Membros por tipo
  const memberTypes = members.reduce<Record<string, number>>((acc, member) => {
    const type = member.memberType || 'Desconhecido';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  // DADOS DE VEÍCULOS
  const totalVehicles = vehicles.length;
  const vehiclesByType = vehicles.reduce<Record<string, number>>((acc, vehicle) => {
    const type = vehicle.type || 'Desconhecido';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  const vehicleChartData = Object.entries(vehiclesByType).map(([type, count]) => ({
    name: type,
    value: count
  }));
  
  // DADOS DE EVENTOS
  const today = new Date();
  const upcomingEvents = events
    .filter(event => {
      if (!event.date) return false;
      try {
        // Tenta converter para Date se for string
        const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
        return isAfter(eventDate, today);
      } catch (e) {
        return false;
      }
    })
    .sort((a, b) => {
      const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
      const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);
    
  const pastEvents = events
    .filter(event => {
      if (!event.date) return false;
      try {
        const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
        return isBefore(eventDate, today);
      } catch (e) {
        return false;
      }
    }).length;

  // DADOS FINANCEIROS
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Filtro baseado na range selecionada
  const getDateRangeStart = () => {
    switch(timeRange) {
      case 'week':
        return addDays(today, -7);
      case 'month':
        return new Date(today.getFullYear(), today.getMonth(), 1);
      case 'year':
        return new Date(today.getFullYear(), 0, 1);
      default:
        return addDays(today, -30);
    }
  };
  
  const dateRangeStart = getDateRangeStart();
  
  const filteredTransactions = transactions.filter(t => {
    if (!t.date) return false;
    const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
    return isAfter(transactionDate, dateRangeStart) || transactionDate.getTime() === dateRangeStart.getTime();
  });
  
  const revenue = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
    
  const expenses = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
    
  const balance = revenue - expenses;
  
  // Dados de vendas do bar
  const recentBarSales = barSales
    .slice(0, 3)
    .map(sale => ({
      ...sale,
      total: sale.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0)
    }));
    
  const barSalesValue = barSales.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => itemSum + ((item.price || 0) * (item.quantity || 1)), 0);
  }, 0);
  
  // Estoque baixo no inventário - considerando baixo quando tiver menos de 5 unidades
  // ou menos de 30% do esperado para aquele item (estimativa)
  const LOW_STOCK_QUANTITY = 5;
  const lowStockItems = inventoryItems
    .filter(item => {
      const quantity = item.quantity || 0;
      // Considera baixo se tiver menos de 5 unidades
      return quantity < LOW_STOCK_QUANTITY;
    })
    .slice(0, 3);
  
  // Cálculo para membros por mês
  const joinedThisYear = members.filter(member => {
    if (!member.joinDate) return false;
    const joinDate = new Date(member.joinDate);
    return joinDate.getFullYear() === currentYear;
  });
  
  const membersByMonth = Array(12).fill(0);
  joinedThisYear.forEach(member => {
    if (!member.joinDate) return;
    const joinDate = new Date(member.joinDate);
    const month = joinDate.getMonth();
    membersByMonth[month] += 1;
  });
  
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  
  const memberChartData = membersByMonth.map((count, index) => ({
    month: monthNames[index],
    membros: count
  }));
  
  // Gráfico financeiro por categoria
  const financialByCategory = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Outros';
    if (!acc[category]) {
      acc[category] = {
        receitas: 0,
        despesas: 0
      };
    }
    
    if (transaction.type === 'receita') {
      acc[category].receitas += transaction.amount || 0;
    } else {
      acc[category].despesas += transaction.amount || 0;
    }
    
    return acc;
  }, {} as Record<string, { receitas: number, despesas: number }>);
  
  const financialChartData = Object.entries(financialByCategory).map(([category, values]) => ({
    name: category,
    receitas: values.receitas,
    despesas: values.despesas,
  }));
  
  if (isLoading) {
    return (
      <MembersLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <div className="flex justify-center items-center h-64">
            <p>Carregando dados...</p>
          </div>
        </div>
      </MembersLayout>
    );
  }
  
  if (isErrorMembers) {
    return (
      <MembersLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <p className="text-red-800">
              Ocorreu um erro ao carregar os dados. Por favor, tente novamente mais tarde.
            </p>
          </div>
        </div>
      </MembersLayout>
    );
  }
  
  return (
    <MembersLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-4xl font-display text-mouro-black mb-2 md:mb-0">
            <span className="text-mouro-red">Dashboard</span> do Clube
          </h1>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant={timeRange === 'week' ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Semana
            </Button>
            <Button 
              variant={timeRange === 'month' ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Mês
            </Button>
            <Button 
              variant={timeRange === 'year' ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('year')}
            >
              Ano
            </Button>
          </div>
        </div>
        
        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card de Membros */}
          <Card className="hover:border-mouro-red/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Membros</CardTitle>
                <Users className="h-4 w-4 text-mouro-red" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Ativos: {activeMembers} ({totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0}%)
              </p>
              <Progress
                value={totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0}
                className="h-2 mt-2"
              />
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/membros')}>
                Ver membros
                <span className="sr-only">Ver todos os membros</span>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card de Eventos */}
          <Card className="hover:border-mouro-red/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Eventos</CardTitle>
                <Calendar className="h-4 w-4 text-mouro-red" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">
                Próximos: {upcomingEvents.length} | Passados: {pastEvents}
              </p>
              <Progress
                value={events.length > 0 ? (upcomingEvents.length / events.length) * 100 : 0}
                className="h-2 mt-2"
              />
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/eventos')}>
                Ver eventos
                <span className="sr-only">Ver todos os eventos</span>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card de Veículos */}
          <Card className="hover:border-mouro-red/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Veículos</CardTitle>
                <Bike className="h-4 w-4 text-mouro-red" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVehicles}</div>
              <div className="text-xs space-y-1">
                {Object.entries(vehiclesByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span>{type}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/garagem')}>
                Ver garagem
                <span className="sr-only">Ver todos os veículos</span>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card Financeiro */}
          <Card className="hover:border-mouro-red/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Financeiro</CardTitle>
                <CreditCard className="h-4 w-4 text-mouro-red" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{balance.toLocaleString('pt-BR', { style: 'currency', currency: 'EUR' })}</div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-xs">
                  <span className="text-emerald-500 flex items-center">
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Receitas
                  </span>
                  <span className="font-medium">{revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="text-xs">
                  <span className="text-red-500 flex items-center">
                    <MinusCircle className="h-3 w-3 mr-1" />
                    Despesas
                  </span>
                  <span className="font-medium">{expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/tesouraria')}>
                Ver tesouraria
                <span className="sr-only">Ver tesouraria</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* SEÇÃO DE GRÁFICOS E TABELAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Novos Membros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Novos Membros (Este Ano)</CardTitle>
              <CardDescription>Evolução mensal de adesões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={memberChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value) => [value, 'Membros']} />
                    <Line
                      type="monotone"
                      dataKey="membros"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Gráfico Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financeiro por Categoria</CardTitle>
              <CardDescription>
                {timeRange === 'week' ? 'Últimos 7 dias' : 
                 timeRange === 'month' ? 'Mês atual' : 'Ano atual'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={financialChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => value.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      })}
                    />
                    <Legend />
                    <Bar name="Receitas" dataKey="receitas" fill={CHART_COLORS.tertiary} />
                    <Bar name="Despesas" dataKey="despesas" fill={CHART_COLORS.negative} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* DADOS DOS PRINCIPAIS MÓDULOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Próximos Eventos */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Próximos Eventos</CardTitle>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/eventos')}>
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-mouro-red" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium leading-none mb-1 truncate">{event.title}</h3>
                        <p className="text-xs text-muted-foreground mb-1">
                          {event.date && format(
                            typeof event.date === 'string' ? new Date(event.date) : event.date,
                            "dd 'de' MMMM",
                            { locale: pt }
                          )}
                        </p>
                        <p className="text-xs truncate">{event.location || "Local não definido"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-muted-foreground">Sem eventos futuros agendados</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate('/eventos?action=new')}
                  >
                    Criar evento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Últimas Vendas do Bar */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Vendas do Bar</CardTitle>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/bar-management')}>
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentBarSales.length > 0 ? (
                <div className="space-y-4">
                  {recentBarSales.map(sale => (
                    <div key={sale.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                        <Beer className="h-6 w-6 text-mouro-red" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium leading-none mb-1">
                            Venda #{typeof sale.id === 'string' ? sale.id.substring(0, 6) : sale.id}
                          </h3>
                          <span className="text-sm font-semibold">
                            {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'EUR' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(new Date(sale.timestamp), "dd/MM/yyyy • HH:mm")}
                        </p>
                        <p className="text-xs">{sale.items.length} itens</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Beer className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-muted-foreground">Sem vendas registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Alertas de Inventário / Estoque */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Alertas de Estoque</CardTitle>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/inventario')}>
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-4">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className="h-12 w-12 rounded-md bg-red-50 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium leading-none mb-1 truncate">{item.name}</h3>
                        <div className="flex justify-between">
                          <p className="text-xs text-muted-foreground">Estoque atual:</p>
                          <p className="text-xs font-medium text-red-500">
                            {item.quantity || 0} unidades (baixo)
                          </p>
                        </div>
                        <Progress
                          value={(item.quantity / LOW_STOCK_QUANTITY) * 100}
                          className="h-2 mt-2 bg-red-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-muted-foreground">Nenhum alerta de estoque</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MembersLayout>
  );
};

export default Dashboard;
