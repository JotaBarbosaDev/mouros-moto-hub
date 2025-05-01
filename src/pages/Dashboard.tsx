import { useState, useEffect } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  CalendarDays, 
  Users, 
  UserCheck, 
  Clock, 
  Beer, 
  AlertTriangle, 
  CreditCard, 
  TrendingUp, 
  Activity,
  ChevronRight,
  CircleCheck,
  CircleX,
  Badge as BadgeIcon,
  Coins,
  History
} from 'lucide-react';
import { useEvents } from '@/hooks/use-events';
import { useMembers } from '@/hooks/use-members';
import { useBarProducts } from '@/hooks/use-bar-products';
import { useBarSales } from '@/hooks/use-bar-sales';

const salesChartConfig = {
  sales: {
    label: "Vendas",
    theme: {
      light: "#cc0000",
      dark: "#e11d48"
    }
  }
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  
  const { events, isLoading: eventsLoading } = useEvents();
  const { members, isLoading: membersLoading } = useMembers();
  const { products, isLoading: productsLoading } = useBarProducts();
  const { sales, isLoading: salesLoading } = useBarSales();
  
  const isLoading = eventsLoading || membersLoading || productsLoading || salesLoading;
  
  // Calculate dashboard metrics
  const activeEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= new Date();
  }).length;
  
  const eventsWithOpenRegistrations = events.filter(event => event.registrationDeadline).length;
  
  const nextEvent = events
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= new Date();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  
  const directorsCount = members.filter(member => member.memberType === 'Administração').length;
  const newLastMonth = members.filter(member => {
    const joinDate = new Date(member.joinDate);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return joinDate >= oneMonthAgo;
  }).length;
  
  const belowMinStockCount = products.filter(product => product.stock <= (product.minStock || 10)).length;
  
  // Calculate total sales today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.timestamp);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === today.getTime();
  });
  
  const todaySalesTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const todaySalesCount = todaySales.length;
  
  // Process sales data for chart
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });
  
  const dailySalesData = last14Days.map(day => {
    const dayStr = day.getDate().toString().padStart(2, '0');
    
    const daySales = sales.filter(sale => {
      const saleDay = new Date(sale.timestamp);
      saleDay.setHours(0, 0, 0, 0);
      return saleDay.getTime() === day.getTime();
    });
    
    return {
      day: dayStr,
      sales: daySales.reduce((sum, sale) => sum + sale.total, 0)
    };
  });
  
  // Recent registrations
  const recentRegistrations = events
    .flatMap(event => 
      (event.registeredParticipants || []).map(participant => ({
        id: participant.id,
        member: participant.name,
        event: event.title,
        date: new Date(event.date).toISOString().split('T')[0]
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (loading || isLoading) return null;
  
  const formattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-PT', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const daysUntilEvent = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Fix for sales total display in the Financial Card
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const formattedTotalSales = totalSales.toFixed(2);
  const formattedTodaySalesTotal = todaySalesTotal.toFixed(2);

  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display text-mouro-black mb-8">
          <span className="text-mouro-red">Dashboard</span> Os Mouros MC
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {/* Events Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                <CalendarDays className="mr-2 h-5 w-5 text-mouro-red inline" />
                Eventos
              </CardTitle>
              <Badge variant="outline">{activeEvents} ativos</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{events.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {eventsWithOpenRegistrations} com inscrições abertas
              </p>
              {nextEvent && (
                <div className="mt-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-mouro-red" />
                  <span className="text-sm">Próximo: </span> 
                  <Badge className="bg-mouro-red">
                    {nextEvent.title} ({daysUntilEvent(nextEvent.date)} dias)
                  </Badge>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Link to="/eventos">
                <Button variant="outline" size="sm" className="w-full">
                  <span>Ver Eventos</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Members Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                <Users className="mr-2 h-5 w-5 text-mouro-red inline" />
                Membros
              </CardTitle>
              <Badge variant="outline">{newLastMonth} novos</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{members.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {directorsCount} na direção
              </p>
              <div className="mt-4 flex items-center">
                <BadgeIcon className="h-4 w-4 text-mouro-red mr-2" />
                <span className="text-sm">Taxa de renovação anual: 95%</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Link to="/membros">
                <Button variant="outline" size="sm" className="w-full">
                  <span>Ver Membros</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Bar Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                <Beer className="mr-2 h-5 w-5 text-mouro-red inline" />
                Bar
              </CardTitle>
              {belowMinStockCount > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {belowMinStockCount} baixo
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{products.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Produtos no inventário
              </p>
              <div className="mt-4 flex items-center">
                <CreditCard className="h-4 w-4 text-mouro-red mr-2" />
                <span className="text-sm">{todaySalesCount} vendas hoje</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Link to="/bar">
                <Button variant="outline" size="sm" className="w-full">
                  <span>Gerir Bar</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Financial Card - with fixed toFixed issue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                <Coins className="mr-2 h-5 w-5 text-mouro-red inline" />
                Vendas
              </CardTitle>
              <Badge variant="secondary">Este mês</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">€{formattedTotalSales}</div>
              <p className="text-sm text-muted-foreground mt-1">
                €{formattedTodaySalesTotal} hoje
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link to="/bar">
                <Button variant="outline" size="sm" className="w-full">
                  <span>Ver Vendas</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="sales">Vendas</TabsTrigger>
                <TabsTrigger value="events">Eventos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sales">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendas Diárias</CardTitle>
                    <CardDescription>
                      Últimos 14 dias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailySalesData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                          Dia
                                        </span>
                                        <span className="font-bold text-muted-foreground">
                                          {payload[0].payload.day}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                          Vendas
                                        </span>
                                        <span className="font-bold text-muted-foreground">
                                          €{payload[0].value.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="sales"
                            fill="#cc0000"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="events">
                <Card>
                  <CardHeader>
                    <CardTitle>Próximos Eventos</CardTitle>
                    <CardDescription>
                      Eventos agendados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {events.filter(event => {
                      const eventDate = new Date(event.date);
                      return eventDate >= new Date();
                    }).length === 0 ? (
                      <div className="text-center py-8">
                        <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhum evento agendado</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {events
                          .filter(event => {
                            const eventDate = new Date(event.date);
                            return eventDate >= new Date();
                          })
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .slice(0, 3)
                          .map((event) => (
                            <div key={event.id} className="flex items-center p-4 border rounded-md">
                              <div className="h-12 w-12 bg-slate-100 rounded-md flex items-center justify-center mr-4">
                                {event.image ? (
                                  <img 
                                    src={event.image} 
                                    alt={event.title} 
                                    className="h-12 w-12 object-cover rounded-md"
                                  />
                                ) : (
                                  <CalendarDays className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium">{event.title}</h4>
                                <p className="text-sm text-muted-foreground">{event.date}</p>
                              </div>
                              <Badge variant={event.registrationDeadline ? "default" : "outline"}>
                                {event.participants || 0}/{event.maxParticipants || '∞'}
                              </Badge>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Low Stock Products */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produtos com Baixo Estoque</CardTitle>
                <Link to="/bar">
                  <Button variant="ghost" size="sm">Ver todos</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {products.filter(p => p.stock <= (p.minStock || 10)).length === 0 ? (
                  <div className="text-center py-6">
                    <CircleCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Todos os produtos estão com estoque adequado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products
                      .filter(p => p.stock <= (p.minStock || 10))
                      .sort((a, b) => a.stock - b.stock)
                      .slice(0, 4)
                      .map(product => (
                        <div key={product.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-slate-100 rounded-md flex items-center justify-center mr-4">
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name} 
                                  className="h-8 w-8 object-cover rounded-md"
                                />
                              ) : (
                                <Beer className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Estoque: {product.stock} / Mínimo: {product.minStock || 10}
                              </p>
                            </div>
                          </div>
                          {/* Fix for Progress component by removing indicatorColor and using class instead */}
                          <Progress 
                            value={(product.stock / (product.minStock || 10)) * 100} 
                            className={`w-24 ${product.stock === 0 ? "bg-red-500" : "bg-amber-500"}`}
                          />
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
              {products.filter(p => p.stock <= (p.minStock || 10)).length > 0 && (
                <CardFooter>
                  <Link to="/bar" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      <span>Gerenciar Estoque</span>
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>Últimas inscrições em eventos</CardDescription>
              </CardHeader>
              <CardContent>
                {recentRegistrations.length === 0 ? (
                  <div className="text-center py-6">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma atividade recente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentRegistrations.map((registration) => (
                      <div key={registration.id} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-mouro-red" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{registration.member}</p>
                          <p className="text-xs text-muted-foreground">
                            inscreveu-se em {registration.event}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground ml-auto">
                          {formattedDate(registration.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
                <CardDescription>Últimas transações no bar</CardDescription>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <div className="text-center py-6">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma venda registrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sales.slice(0, 4).map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-mouro-red" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Venda #{sale.id.substring(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {sale.seller} • {sale.items.length} itens
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">€{sale.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link to="/bar" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <span>Ver Histórico</span>
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MembersLayout>
  );
};

export default Dashboard;
