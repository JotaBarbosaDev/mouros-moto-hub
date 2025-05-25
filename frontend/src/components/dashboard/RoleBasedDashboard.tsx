import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Crown,
  Shield,
  Euro,
  Calendar,
  Car,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Settings,
  Bell,
  History,
  Target,
  Activity,
  DollarSign,
  Star,
  Award,
  UserCheck,
  CreditCard,
  Wrench,
  Coffee,
  Camera,
  Mail,
  MessageSquare,
  Calendar as CalendarIcon,
  Map,
  Flag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, subMonths, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Dashboard statistics interface
interface DashboardStats {
  // Member statistics
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  newMembersThisYear: number;
  
  // Financial statistics
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  pendingDues: number;
  paidDuesThisYear: number;
  exemptMembers: number;
  
  // Vehicle statistics
  totalVehicles: number;
  vehiclesByType: { [key: string]: number };
  averageDisplacement: number;
  
  // Event statistics
  totalEvents: number;
  upcomingEvents: number;
  eventsThisYear: number;
  totalParticipants: number;
  
  // Store statistics
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  revenueFromStore: number;
  
  // Administration
  adminMembers: number;
  honoraryMembers: number;
  legacyMembers: number;
  administrationPositions: number;
}

// Recent activity interface
interface RecentActivity {
  id: string;
  type: 'member_join' | 'payment' | 'event' | 'order' | 'admin_action';
  description: string;
  timestamp: string;
  user?: string;
  amount?: number;
}

// User role interface based on guide
interface UserRole {
  role: 'visitor' | 'client' | 'member' | 'admin' | 'direction';
  direction_role?: 'Presidente' | 'Vice-Presidente' | 'Tesoureiro' | 'Secretário' | 'Dir. Eventos' | 'Dir. Marketing' | 'Dir. Património';
  permissions: string[];
}

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch member statistics
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*');

      if (membersError) throw membersError;

      // Fetch dues payments
      const { data: duesData, error: duesError } = await supabase
        .from('dues_payments')
        .select('*');

      if (duesError) throw duesError;

      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*');

      if (vehiclesError) {
        console.warn('Erro ao buscar veículos:', vehiclesError);
        // Usar array vazio se houver erro para evitar quebra do dashboard
      }

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*');

      if (eventsError) throw eventsError;

      // Calculate statistics
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisYear = startOfYear(now);

      const totalMembers = membersData?.length || 0;
      const activeMembers = membersData?.filter(m => m.is_active).length || 0;
      const newMembersThisMonth = membersData?.filter(m => 
        new Date(m.join_date) >= thisMonth
      ).length || 0;
      const newMembersThisYear = membersData?.filter(m => 
        new Date(m.join_date) >= thisYear
      ).length || 0;

      // Financial calculations
      const currentYear = now.getFullYear();
      const currentYearDues = duesData?.filter(d => d.year === currentYear) || [];
      const paidDuesThisYear = currentYearDues.filter(d => d.paid).length;
      const pendingDues = currentYearDues.filter(d => !d.paid && !d.exempt).length;
      const exemptMembers = currentYearDues.filter(d => d.exempt).length;

      // Vehicle statistics
      const safeVehiclesData = vehiclesData || [];
      const totalVehicles = safeVehiclesData.length;
      
      const vehiclesByType = safeVehiclesData.reduce((acc: { [key: string]: number }, vehicle) => {
        const type = vehicle.type || 'Outros';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      // Calculate average displacement from vehicles
      const totalDisplacement = safeVehiclesData.reduce((sum: number, vehicle) => {
        return sum + (vehicle.displacement || 0);
      }, 0);
      const averageDisplacement = totalVehicles > 0 ? Math.round(totalDisplacement / totalVehicles) : 0;

      // Event statistics
      const totalEvents = eventsData?.length || 0;
      const upcomingEvents = eventsData?.filter(e => 
        new Date(e.start_date) > now
      ).length || 0;
      const eventsThisYear = eventsData?.filter(e => 
        new Date(e.start_date) >= thisYear
      ).length || 0;

      // Admin statistics
      const adminMembers = membersData?.filter(m => m.is_admin).length || 0;
      const honoraryMembers = membersData?.filter(m => m.honorary_member).length || 0;
      const legacyMembers = membersData?.filter(m => m.legacy_member).length || 0;

      setStats({
        totalMembers,
        activeMembers,
        newMembersThisMonth,
        newMembersThisYear,
        totalRevenue: 0, // Would need to calculate from payments
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        pendingDues,
        paidDuesThisYear,
        exemptMembers,
        totalVehicles,
        vehiclesByType,
        averageDisplacement,
        totalEvents,
        upcomingEvents,
        eventsThisYear,
        totalParticipants: 0,
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        revenueFromStore: 0,
        adminMembers,
        honoraryMembers,
        legacyMembers,
        administrationPositions: 0,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user role and permissions
  const fetchUserRole = useCallback(async () => {
    if (!user) return;

    try {
      // Check if user is admin
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('is_admin, member_type')
        .eq('id', user.id)
        .single();

      if (memberError) throw memberError;

      // Check administration roles
      const { data: adminData, error: adminError } = await supabase
        .from('administration')
        .select('role, status')
        .eq('member_id', user.id)
        .eq('status', 'Ativo');

      if (adminError) throw adminError;

      let role: UserRole = {
        role: 'member',
        permissions: ['view_own_data', 'edit_own_data', 'view_events', 'register_events']
      };

      if (memberData?.is_admin) {
        role = {
          role: 'admin',
          permissions: ['full_access', 'manage_users', 'manage_settings', 'view_all_data']
        };
      } else if (adminData && adminData.length > 0) {
        const adminRole = adminData[0];
        role = {
          role: 'direction',
          direction_role: adminRole.role as 'Presidente' | 'Vice-Presidente' | 'Tesoureiro' | 'Secretário' | 'Dir. Eventos' | 'Dir. Marketing' | 'Dir. Património',
          permissions: getDirectionPermissions(adminRole.role)
        };
      }

      setUserRole(role);

    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  }, [user]);

  // Get permissions based on direction role
  const getDirectionPermissions = (directionRole: string): string[] => {
    const basePermissions = ['view_members', 'view_events', 'view_reports'];
    
    switch (directionRole) {
      case 'Presidente':
      case 'Vice-Presidente':
        return [...basePermissions, 'approve_all', 'manage_administration', 'executive_reports'];
      case 'Tesoureiro':
        return [...basePermissions, 'manage_finances', 'approve_payments', 'financial_reports', 'manage_dues'];
      case 'Secretário':
        return [...basePermissions, 'manage_members', 'manage_documentation', 'member_reports'];
      case 'Dir. Eventos':
        return [...basePermissions, 'manage_events', 'event_reports'];
      case 'Dir. Marketing':
        return [...basePermissions, 'manage_content', 'manage_communications'];
      case 'Dir. Património':
        return [...basePermissions, 'manage_inventory', 'manage_maintenance'];
      default:
        return basePermissions;
    }
  };

  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!userRole) return false;
    return userRole.permissions.includes(permission) || userRole.permissions.includes('full_access');
  };

  // Render statistics card
  const renderStatCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    change?: number,
    changeType?: 'increase' | 'decrease',
    description?: string
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`text-xs flex items-center ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  // Render quick actions based on role
  const renderQuickActions = () => {
    const actions = [];

    if (hasPermission('manage_members')) {
      actions.push(
        <Button key="new-member" className="w-full justify-start">
          <Users className="h-4 w-4 mr-2" />
          Novo Membro
        </Button>
      );
    }

    if (hasPermission('manage_events')) {
      actions.push(
        <Button key="new-event" variant="outline" className="w-full justify-start">
          <Calendar className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      );
    }

    if (hasPermission('manage_finances')) {
      actions.push(
        <Button key="financial-approval" variant="outline" className="w-full justify-start">
          <Euro className="h-4 w-4 mr-2" />
          Aprovações Financeiras
        </Button>
      );
    }

    if (hasPermission('full_access')) {
      actions.push(
        <Button key="system-settings" variant="outline" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      );
    }

    return actions;
  };

  // Effects
  useEffect(() => {
    fetchDashboardData();
    fetchUserRole();
  }, [user, fetchUserRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {userRole?.direction_role 
              ? `Bem-vindo, ${userRole.direction_role}` 
              : userRole?.role === 'admin' 
                ? 'Painel de Administração' 
                : 'Painel do Membro'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            Histórico
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </Button>
        </div>
      </div>

      {/* Role-based alerts */}
      {userRole?.direction_role === 'Tesoureiro' && stats && stats.pendingDues > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h4 className="font-medium text-yellow-800">Atenção: Quotas Pendentes</h4>
                <p className="text-sm text-yellow-700">
                  Existem {stats.pendingDues} quotas pendentes de pagamento que requerem sua atenção.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Member Statistics */}
        {hasPermission('view_members') && stats && (
          <>
            {renderStatCard(
              'Total de Membros',
              stats.totalMembers,
              <Users className="h-4 w-4 text-muted-foreground" />,
              stats.newMembersThisMonth > 0 ? 5 : undefined,
              'increase',
              `${stats.newMembersThisMonth} novos este mês`
            )}
            
            {renderStatCard(
              'Membros Ativos',
              stats.activeMembers,
              <UserCheck className="h-4 w-4 text-green-500" />,
              undefined,
              undefined,
              `${((stats.activeMembers / stats.totalMembers) * 100).toFixed(1)}% do total`
            )}
          </>
        )}

        {/* Financial Statistics - Treasurer and above */}
        {hasPermission('manage_finances') && stats && (
          <>
            {renderStatCard(
              'Quotas Pagas',
              stats.paidDuesThisYear,
              <CreditCard className="h-4 w-4 text-green-500" />,
              undefined,
              undefined,
              `${stats.pendingDues} pendentes`
            )}
            
            {renderStatCard(
              'Receita Anual',
              `€${(stats.paidDuesThisYear * 60).toFixed(0)}`, // Assuming €60 per member
              <DollarSign className="h-4 w-4 text-green-500" />,
              undefined,
              undefined,
              'Estimativa baseada nas quotas'
            )}
          </>
        )}

        {/* Event Statistics */}
        {hasPermission('manage_events') && stats && (
          <>
            {renderStatCard(
              'Total de Eventos',
              stats.totalEvents,
              <Calendar className="h-4 w-4 text-blue-500" />,
              undefined,
              undefined,
              `${stats.upcomingEvents} próximos`
            )}
            
            {renderStatCard(
              'Eventos Este Ano',
              stats.eventsThisYear,
              <CalendarIcon className="h-4 w-4 text-blue-500" />
            )}
          </>
        )}

        {/* Vehicle Statistics */}
        {hasPermission('view_members') && stats && (
          <>
            {renderStatCard(
              'Total de Veículos',
              stats.totalVehicles,
              <Car className="h-4 w-4 text-purple-500" />,
              undefined,
              undefined,
              'Registados no sistema'
            )}
            
            {stats.totalVehicles > 0 && renderStatCard(
              'Cilindrada Média',
              `${stats.averageDisplacement}cc`,
              <Wrench className="h-4 w-4 text-blue-500" />,
              undefined,
              undefined,
              'Dos veículos registados'
            )}
          </>
        )}

        {/* Admin Statistics */}
        {hasPermission('full_access') && stats && (
          <>
            {renderStatCard(
              'Administradores',
              stats.adminMembers,
              <Shield className="h-4 w-4 text-red-500" />
            )}
            
            {renderStatCard(
              'Membros Honorários',
              stats.honoraryMembers,
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
            
            {renderStatCard(
              'Membros Legacy',
              stats.legacyMembers,
              <Award className="h-4 w-4 text-purple-500" />
            )}
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          {hasPermission('view_members') && <TabsTrigger value="members">Membros</TabsTrigger>}
          {hasPermission('manage_finances') && <TabsTrigger value="financial">Financeiro</TabsTrigger>}
          {hasPermission('manage_events') && <TabsTrigger value="events">Eventos</TabsTrigger>}
          {hasPermission('full_access') && <TabsTrigger value="admin">Administração</TabsTrigger>}
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {renderQuickActions()}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p>Exemplo de atividade {index + 1}</p>
                        <p className="text-muted-foreground">há 2 horas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {hasPermission('view_members') && (
          <TabsContent value="members" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Novos Membros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.newMembersThisMonth || 0}</div>
                  <p className="text-sm text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Crescimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+12%</div>
                  <p className="text-sm text-muted-foreground">Comparado ao mês anterior</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Membros Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeMembers || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    {stats && stats.totalMembers > 0 
                      ? `${((stats.activeMembers / stats.totalMembers) * 100).toFixed(1)}% do total`
                      : '0% do total'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {hasPermission('manage_finances') && (
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quotas Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats?.pendingDues || 0}</div>
                  <p className="text-sm text-muted-foreground">Requerem atenção</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quotas Pagas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.paidDuesThisYear || 0}</div>
                  <p className="text-sm text-muted-foreground">Este ano</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Membros Isentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.exemptMembers || 0}</div>
                  <p className="text-sm text-muted-foreground">Isenção ativa</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Cobrança</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats && (stats.paidDuesThisYear + stats.pendingDues) > 0
                      ? `${((stats.paidDuesThisYear / (stats.paidDuesThisYear + stats.pendingDues)) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">Eficiência de cobrança</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {hasPermission('manage_events') && (
          <TabsContent value="events" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Próximos Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.upcomingEvents || 0}</div>
                  <p className="text-sm text-muted-foreground">Agendados</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Eventos Este Ano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.eventsThisYear || 0}</div>
                  <p className="text-sm text-muted-foreground">Realizados</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Participação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">75%</div>
                  <p className="text-sm text-muted-foreground">Média de presença</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {hasPermission('full_access') && (
          <TabsContent value="admin" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Administradores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.adminMembers || 0}</div>
                  <p className="text-sm text-muted-foreground">Com acesso total</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Cargos Direção</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.administrationPositions || 0}</div>
                  <p className="text-sm text-muted-foreground">Posições ativas</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Membros Honorários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.honoraryMembers || 0}</div>
                  <p className="text-sm text-muted-foreground">Status especial</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Membros Legacy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.legacyMembers || 0}</div>
                  <p className="text-sm text-muted-foreground">Fundadores</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
              <CardDescription>Últimas ações no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Histórico de atividades em desenvolvimento</p>
                <p className="text-sm">Esta funcionalidade será implementada em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleBasedDashboard;
