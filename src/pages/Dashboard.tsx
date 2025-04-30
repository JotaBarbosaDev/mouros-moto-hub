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

// Mock data for the dashboard
const mockData = {
  events: {
    total: 24,
    active: 8,
    withOpenRegistrations: 5,
    past: 16,
    nextEvent: {
      title: "Passeio Serra da Estrela",
      date: "2025-05-15",
      minimumParticipants: 10,
      currentParticipants: 8,
    },
    eventsWithLowParticipation: 2,
    recentEvents: [
      { id: 1, title: "Almoço Mensal", date: "2025-05-02", status: "active" },
      { id: 2, title: "Passeio Serra da Estrela", date: "2025-05-15", status: "active" },
      { id: 3, title: "Moto Encontro Internacional", date: "2025-06-20", status: "active" },
    ]
  },
  members: {
    total: 86,
    inDirectorate: 7,
    newLastMonth: 4,
    recentMembers: [
      { id: 1, name: "João Silva", joinDate: "2025-04-15", role: "Membro" },
      { id: 2, name: "Ana Costa", joinDate: "2025-04-10", role: "Direção" },
      { id: 3, name: "Miguel Santos", joinDate: "2025-03-28", role: "Membro" },
    ]
  },
  bar: {
    totalProducts: 42,
    belowMinStock: 7,
    todaySales: {
      value: 387.50,
      count: 35,
    },
    recentProducts: [
      { id: 1, name: "Imperial Super Bock", stock: 58, minStock: 20, status: "ok" },
      { id: 2, name: "Whisky Jack Daniels", stock: 2, minStock: 5, status: "low" },
      { id: 3, name: "Água Mineral 0.5L", stock: 12, minStock: 24, status: "low" },
    ]
  },
  financial: {
    monthSales: 4750.25,
    todayChange: 125.75,
    topSeller: "Carlos Mendes",
    topSellerSales: 1245.50,
    dailySales: [
      { day: "01", sales: 150 },
      { day: "02", sales: 180 },
      { day: "03", sales: 200 },
      { day: "04", sales: 270 },
      { day: "05", sales: 250 },
      { day: "06", sales: 320 },
      { day: "07", sales: 380 },
      { day: "08", sales: 250 },
      { day: "09", sales: 200 },
      { day: "10", sales: 230 },
      { day: "11", sales: 280 },
      { day: "12", sales: 300 },
      { day: "13", sales: 320 },
      { day: "14", sales: 270 },
    ]
  },
  activities: {
    recentRegistrations: [
      { id: 1, member: "Pedro Oliveira", event: "Passeio Serra da Estrela", date: "2025-04-26" },
      { id: 2, member: "Sofia Santos", event: "Almoço Mensal", date: "2025-04-25" },
      { id: 3, member: "Ricardo Ferreira", event: "Passeio Serra da Estrela", date: "2025-04-24" }
    ]
  }
};

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
  const [salesData, setSalesData] = useState(mockData.financial.dailySales);

  if (loading) return null;
  
  const formattedDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-PT', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const daysUntilEvent = (dateString) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "low":
        return "text-red-500";
      case "active":
        return "text-green-600";
      default:
        return "text-blue-500";
    }
  };

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
              <Badge variant="outline">{mockData.events.active} ativos</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockData.events.total}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {mockData.events.withOpenRegistrations} com inscrições abertas
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-mouro-red" />
                <span className="text-sm">Próximo: </span> 
                <Badge className="bg-mouro-red">
                  {mockData.events.nextEvent.title} ({daysUntilEvent(mockData.events.nextEvent.date)} dias)
                </Badge>
              </div>
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
              <Badge variant="outline">{mockData.members.newLastMonth} novos</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockData.members.total}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {mockData.members.inDirectorate} na direção
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
              {mockData.bar.belowMinStock > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {mockData.bar.belowMinStock} baixo
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockData.bar.totalProducts}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Produtos no inventário
              </p>
              <div className="mt-4 flex items-center">
                <CreditCard className="h-4 w-4 text-mouro-red mr-2" />
                <span className="text-sm">{mockData.bar.todaySales.count} vendas hoje</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Link to="/bar-management">
                <Button variant="outline" size="sm" className="w-full">
                  <span>Gerir Bar</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Financial Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                <Coins className="mr-2 h-5 w-5 text-mouro-red inline" />
                Financeiro
              </CardTitle>
              <Badge className="bg-green-600">Hoje</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockData.bar.todaySales.value.toFixed(2)}€</div>
              <p className="text-sm text-muted-foreground mt-1">
                Vendas de hoje
              </p>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm">Mês: {mockData.financial.monthSales.toFixed(2)}€</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Link to="/bar-management?tab=history">
                <Button variant="outline" size="sm" className="w-full">
                  <span>Ver Histórico</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="activities">Atividades Recentes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Sales Chart - Ajustando o tamanho e margens */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Vendas Diárias (Últimos 14 dias)</CardTitle>
                  <CardDescription>Total: {mockData.financial.monthSales.toFixed(2)}€</CardDescription>
                </CardHeader>
                <CardContent className="pt-2 px-2">
                  <div className="w-full h-[200px]">
                    <ChartContainer config={salesChartConfig}>
                      <BarChart 
                        data={salesData} 
                        margin={{ top: 5, right: 20, left: 20, bottom: 20 }}
                      >
                        <XAxis dataKey="day" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="sales" name="sales" fill="var(--color-sales)" />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Next Event Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Próximo Evento</CardTitle>
                  <CardDescription>
                    {formattedDate(mockData.events.nextEvent.date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">{mockData.events.nextEvent.title}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Inscritos:</span>
                      <span className="font-medium">{mockData.events.nextEvent.currentParticipants}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Mínimo necessário: {mockData.events.nextEvent.minimumParticipants}</span>
                        <span>{Math.round((mockData.events.nextEvent.currentParticipants / mockData.events.nextEvent.minimumParticipants) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(mockData.events.nextEvent.currentParticipants / mockData.events.nextEvent.minimumParticipants) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    {mockData.events.nextEvent.currentParticipants < mockData.events.nextEvent.minimumParticipants && (
                      <div className="flex items-center text-amber-600 text-sm mt-2">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span>Abaixo do mínimo de participantes</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/eventos`}>
                    <Button variant="default" size="sm" className="w-full bg-mouro-red hover:bg-mouro-red/90">
                      Ver Detalhes
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Bar Stock Alert Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Produtos com Stock Baixo</CardTitle>
                  <CardDescription>
                    {mockData.bar.belowMinStock} produtos abaixo do mínimo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.bar.recentProducts
                      .filter(product => product.status === "low")
                      .map(product => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                            <span>{product.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm">
                              <span className="text-red-500 font-medium">{product.stock}</span>
                              <span className="text-muted-foreground">/{product.minStock}</span>
                            </div>
                            <Progress 
                              value={(product.stock / product.minStock) * 100} 
                              className="w-20 h-2"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/bar-management">
                    <Button variant="outline" size="sm" className="w-full">
                      Gerir Inventário
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Eventos</CardTitle>
                <CardDescription>Eventos ativos e próximos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.events.recentEvents.map(event => (
                    <div key={event.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">{formattedDate(event.date)}</div>
                      </div>
                      <div className="flex items-center">
                        {daysUntilEvent(event.date) < 0 ? (
                          <Badge variant="destructive" className="flex items-center">
                            <CircleX className="h-3 w-3 mr-1" />
                            Encerrado
                          </Badge>
                        ) : (
                          <Badge className="bg-green-600 flex items-center">
                            <CircleCheck className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/eventos">
                  <Button className="w-full bg-mouro-red hover:bg-mouro-red/90">
                    Ver Todos os Eventos
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>Últimas ações no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recent Event Registrations */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <UserCheck className="h-4 w-4 mr-2 text-mouro-red" />
                      Inscrições em Eventos
                    </h3>
                    <div className="space-y-3">
                      {mockData.activities.recentRegistrations.map(activity => (
                        <div key={activity.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                          <div>
                            <span className="font-medium">{activity.member}</span>
                            <span className="text-muted-foreground"> inscreveu-se em </span> 
                            <span>{activity.event}</span>
                          </div>
                          <div className="text-muted-foreground">{formattedDate(activity.date)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Member Additions */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-mouro-red" />
                      Novos Membros
                    </h3>
                    <div className="space-y-3">
                      {mockData.members.recentMembers.map(member => (
                        <div key={member.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                          <div>
                            <span className="font-medium">{member.name}</span>
                            <span className="text-muted-foreground"> juntou-se como </span>
                            <Badge variant={member.role === "Direção" ? "default" : "outline"} className={member.role === "Direção" ? "bg-mouro-red" : ""}>
                              {member.role}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground">{formattedDate(member.joinDate)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Product Additions */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Beer className="h-4 w-4 mr-2 text-mouro-red" />
                      Produtos do Bar
                    </h3>
                    <div className="space-y-3">
                      {mockData.bar.recentProducts.map(product => (
                        <div key={product.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                          <div className="flex items-center">
                            <span className="font-medium">{product.name}</span>
                            <span className="ml-2">
                              {product.status === "low" ? (
                                <Badge variant="destructive" className="text-xs">Stock Baixo</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-green-600">OK</Badge>
                              )}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            Stock: {product.stock}/{product.minStock}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MembersLayout>
  );
};

export default Dashboard;
