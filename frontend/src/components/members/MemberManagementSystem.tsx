import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Mail,
  Phone,
  Calendar,
  Car,
  Euro,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  FileText,
  Settings,
  CreditCard,
  History,
  Star,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types based on the guide specifications
export interface MemberWithDetails {
  id: string;
  member_number: string;
  name: string;
  email: string;
  phone_main?: string;
  phone_alternative?: string;
  member_type: 'Sócio' | 'Criança' | 'Mulher' | 'Sócio Adulto' | 'Sócio Criança' | 'Administração' | 'Convidado';
  is_active: boolean;
  is_admin: boolean;
  honorary_member: boolean;
  legacy_member: boolean;
  join_date: string;
  registration_fee_paid: boolean;
  registration_fee_exempt: boolean;
  in_whatsapp_group: boolean;
  received_member_kit: boolean;
  nickname?: string;
  photo_url?: string;
  blood_type?: string;
  // Relational data
  vehicles?: Vehicle[];
  dues_payments?: DuesPayment[];
  administration?: AdministrationRole[];
  // Computed status
  status: 'Ativo' | 'Inativo' | 'Suspenso' | 'Pendente';
  dues_status: 'Em Dia' | 'Em Atraso' | 'Isento';
  last_activity?: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  displacement: number;
  type: string;
  nickname?: string;
  photo_url?: string;
}

interface DuesPayment {
  id: string;
  year: number;
  paid: boolean;
  exempt: boolean;
  payment_date?: string;
}

interface AdministrationRole {
  id: string;
  role: string;
  status: 'Ativo' | 'Inativo' | 'Licença';
  term: string;
  term_start?: string;
  term_end?: string;
}

interface MemberFilters {
  search: string;
  memberType: string;
  status: string;
  duesStatus: string;
  isAdmin: boolean | null;
  honoraryMember: boolean | null;
  legacyMember: boolean | null;
  hasWhatsApp: boolean | null;
  hasKit: boolean | null;
  registrationPaid: boolean | null;
}

interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  pending: number;
  withDuesUpToDate: number;
  withDuesOverdue: number;
  exempt: number;
  admins: number;
  honorary: number;
  legacy: number;
  avgAge: number;
  newThisMonth: number;
  newThisYear: number;
}

const MemberManagementSystem: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // State
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberWithDetails[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberWithDetails | null>(null);
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  // Filters
  const [filters, setFilters] = useState<MemberFilters>({
    search: searchParams.get('search') || '',
    memberType: searchParams.get('type') || '',
    status: searchParams.get('status') || '',
    duesStatus: searchParams.get('dues') || '',
    isAdmin: null,
    honoraryMember: null,
    legacyMember: null,
    hasWhatsApp: null,
    hasKit: null,
    registrationPaid: null,
  });

  // Fetch members data
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select(`
          *,
          vehicles:vehicles(id, brand, model, displacement, type, nickname, photo_url),
          dues_payments:dues_payments(id, year, paid, exempt, payment_date),
          administration:administration(id, role, status, term, term_start, term_end)
        `)
        .order('member_number', { ascending: true });

      if (membersError) throw membersError;

      // Transform and enhance data
      const transformedMembers = (membersData || []).map(member => {
        // Calculate status
        let status: MemberWithDetails['status'] = 'Ativo';
        if (!member.is_active) status = 'Inativo';
        
        // Calculate dues status
        const currentYear = new Date().getFullYear();
        const currentYearPayment = member.dues_payments?.find((payment: DuesPayment) => payment.year === currentYear);
        let duesStatus: MemberWithDetails['dues_status'] = 'Em Atraso';
        
        if (currentYearPayment?.exempt) {
          duesStatus = 'Isento';
        } else if (currentYearPayment?.paid) {
          duesStatus = 'Em Dia';
        }

        return {
          ...member,
          status,
          dues_status: duesStatus,
        } as MemberWithDetails;
      });

      setMembers(transformedMembers);
      calculateStats(transformedMembers);
      
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados dos membros',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Calculate statistics
  const calculateStats = (membersList: MemberWithDetails[]) => {
    const total = membersList.length;
    const active = membersList.filter(m => m.status === 'Ativo').length;
    const inactive = membersList.filter(m => m.status === 'Inativo').length;
    const suspended = membersList.filter(m => m.status === 'Suspenso').length;
    const pending = membersList.filter(m => m.status === 'Pendente').length;
    
    const withDuesUpToDate = membersList.filter(m => m.dues_status === 'Em Dia').length;
    const withDuesOverdue = membersList.filter(m => m.dues_status === 'Em Atraso').length;
    const exempt = membersList.filter(m => m.dues_status === 'Isento').length;
    
    const admins = membersList.filter(m => m.is_admin).length;
    const honorary = membersList.filter(m => m.honorary_member).length;
    const legacy = membersList.filter(m => m.legacy_member).length;
    
    // Calculate new members this month/year
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    
    const newThisMonth = membersList.filter(m => 
      new Date(m.join_date) >= thisMonthStart
    ).length;
    
    const newThisYear = membersList.filter(m => 
      new Date(m.join_date) >= thisYearStart
    ).length;

    setStats({
      total,
      active,
      inactive,
      suspended,
      pending,
      withDuesUpToDate,
      withDuesOverdue,
      exempt,
      admins,
      honorary,
      legacy,
      avgAge: 0, // Would need birthdate calculation
      newThisMonth,
      newThisYear,
    });
  };

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...members];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.member_number.toLowerCase().includes(searchLower) ||
        member.phone_main?.toLowerCase().includes(searchLower) ||
        member.nickname?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.memberType) {
      filtered = filtered.filter(member => member.member_type === filters.memberType);
    }

    if (filters.status) {
      filtered = filtered.filter(member => member.status === filters.status);
    }

    if (filters.duesStatus) {
      filtered = filtered.filter(member => member.dues_status === filters.duesStatus);
    }

    if (filters.isAdmin !== null) {
      filtered = filtered.filter(member => member.is_admin === filters.isAdmin);
    }

    if (filters.honoraryMember !== null) {
      filtered = filtered.filter(member => member.honorary_member === filters.honoraryMember);
    }

    if (filters.legacyMember !== null) {
      filtered = filtered.filter(member => member.legacy_member === filters.legacyMember);
    }

    if (filters.hasWhatsApp !== null) {
      filtered = filtered.filter(member => member.in_whatsapp_group === filters.hasWhatsApp);
    }

    if (filters.hasKit !== null) {
      filtered = filtered.filter(member => member.received_member_kit === filters.hasKit);
    }

    if (filters.registrationPaid !== null) {
      filtered = filtered.filter(member => member.registration_fee_paid === filters.registrationPaid);
    }

    setFilteredMembers(filtered);

    // Update URL params
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.memberType) params.set('type', filters.memberType);
    if (filters.status) params.set('status', filters.status);
    if (filters.duesStatus) params.set('dues', filters.duesStatus);
    setSearchParams(params);
  }, [members, filters, setSearchParams]);

  // Member status helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
      case 'Inativo':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Inativo</Badge>;
      case 'Suspenso':
        return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1" />Suspenso</Badge>;
      case 'Pendente':
        return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDuesBadge = (status: string) => {
    switch (status) {
      case 'Em Dia':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Em Dia</Badge>;
      case 'Em Atraso':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Em Atraso</Badge>;
      case 'Isento':
        return <Badge variant="secondary"><Star className="h-3 w-3 mr-1" />Isento</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Effects
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Membros</h1>
          <p className="text-muted-foreground">
            Sistema completo de gestão de sócios e membros do clube
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowBulkActions(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowCreateMember(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Membro
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newThisMonth} este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.active / stats.total) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quotas em Dia</CardTitle>
              <Euro className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.withDuesUpToDate}</div>
              <p className="text-xs text-muted-foreground">
                {stats.withDuesOverdue} em atraso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.admins}</div>
              <p className="text-xs text-muted-foreground">
                Com acesso total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Honorários</CardTitle>
              <Crown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.honorary}</div>
              <p className="text-xs text-muted-foreground">
                Status especial
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legacy</CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.legacy}</div>
              <p className="text-xs text-muted-foreground">
                Membros fundadores
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros e Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, email, número..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Membro</Label>
              <Select value={filters.memberType} onValueChange={(value) => setFilters({ ...filters, memberType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="Sócio">Sócio</SelectItem>
                  <SelectItem value="Criança">Criança</SelectItem>
                  <SelectItem value="Mulher">Mulher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Suspenso">Suspenso</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quotas</Label>
              <Select value={filters.duesStatus} onValueChange={(value) => setFilters({ ...filters, duesStatus: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado das quotas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os estados</SelectItem>
                  <SelectItem value="Em Dia">Em Dia</SelectItem>
                  <SelectItem value="Em Atraso">Em Atraso</SelectItem>
                  <SelectItem value="Isento">Isento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          <Separator className="my-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="admin-filter"
                checked={filters.isAdmin === true}
                onCheckedChange={(checked) => setFilters({ ...filters, isAdmin: checked ? true : null })}
              />
              <Label htmlFor="admin-filter" className="text-sm">Apenas Admins</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="honorary-filter"
                checked={filters.honoraryMember === true}
                onCheckedChange={(checked) => setFilters({ ...filters, honoraryMember: checked ? true : null })}
              />
              <Label htmlFor="honorary-filter" className="text-sm">Honorários</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="legacy-filter"
                checked={filters.legacyMember === true}
                onCheckedChange={(checked) => setFilters({ ...filters, legacyMember: checked ? true : null })}
              />
              <Label htmlFor="legacy-filter" className="text-sm">Legacy</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="whatsapp-filter"
                checked={filters.hasWhatsApp === true}
                onCheckedChange={(checked) => setFilters({ ...filters, hasWhatsApp: checked ? true : null })}
              />
              <Label htmlFor="whatsapp-filter" className="text-sm">No WhatsApp</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="kit-filter"
                checked={filters.hasKit === true}
                onCheckedChange={(checked) => setFilters({ ...filters, hasKit: checked ? true : null })}
              />
              <Label htmlFor="kit-filter" className="text-sm">Kit Recebido</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="registration-filter"
                checked={filters.registrationPaid === true}
                onCheckedChange={(checked) => setFilters({ ...filters, registrationPaid: checked ? true : null })}
              />
              <Label htmlFor="registration-filter" className="text-sm">Inscrição Paga</Label>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredMembers.length} de {members.length} membros
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({
                  search: '',
                  memberType: '',
                  status: '',
                  duesStatus: '',
                  isAdmin: null,
                  honoraryMember: null,
                  legacyMember: null,
                  hasWhatsApp: null,
                  hasKit: null,
                  registrationPaid: null,
                });
                setSearchParams(new URLSearchParams());
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Membros</CardTitle>
            {selectedMembers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedMembers.length} selecionados
                </span>
                <Button variant="outline" size="sm">
                  Ações em Lote
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMembers(filteredMembers.map(m => m.id));
                        } else {
                          setSelectedMembers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Nº</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quotas</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Adesão</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">Carregando membros...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum membro encontrado</p>
                        <p className="text-sm">Tente ajustar os filtros ou criar um novo membro</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMembers([...selectedMembers, member.id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-mono">
                        #{member.member_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {member.photo_url ? (
                            <img 
                              src={member.photo_url} 
                              alt={member.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{member.name}</div>
                            {member.nickname && (
                              <div className="text-sm text-muted-foreground">"{member.nickname}"</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.member_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(member.status)}
                      </TableCell>
                      <TableCell>
                        {getDuesBadge(member.dues_status)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </div>
                          {member.phone_main && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {member.phone_main}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(member.join_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {member.is_admin && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {member.honorary_member && (
                            <Badge variant="secondary" className="text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Hon.
                            </Badge>
                          )}
                          {member.legacy_member && (
                            <Badge variant="secondary" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              Legacy
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMember(member);
                                setShowMemberDetail(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMember(member);
                                setShowEditMember(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Gerir Quotas
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Car className="h-4 w-4 mr-2" />
                              Gerir Veículos
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <History className="h-4 w-4 mr-2" />
                              Histórico
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {member.is_active ? (
                              <DropdownMenuItem className="text-red-600">
                                <UserX className="h-4 w-4 mr-2" />
                                Desativar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600">
                                <UserCheck className="h-4 w-4 mr-2" />
                                Ativar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Member Detail Dialog */}
      <Dialog open={showMemberDetail} onOpenChange={setShowMemberDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Detalhes do Membro
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMember && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal">Pessoal</TabsTrigger>
                <TabsTrigger value="vehicles">Veículos</TabsTrigger>
                <TabsTrigger value="dues">Quotas</TabsTrigger>
                <TabsTrigger value="administration">Cargos</TabsTrigger>
                <TabsTrigger value="activity">Atividade</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo</Label>
                    <p className="font-medium">{selectedMember.name}</p>
                  </div>
                  <div>
                    <Label>Número de Sócio</Label>
                    <p className="font-mono">#{selectedMember.member_number}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p>{selectedMember.email}</p>
                  </div>
                  <div>
                    <Label>Telefone Principal</Label>
                    <p>{selectedMember.phone_main || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label>Tipo de Membro</Label>
                    <Badge variant="outline">{selectedMember.member_type}</Badge>
                  </div>
                  <div>
                    <Label>Data de Adesão</Label>
                    <p>{format(new Date(selectedMember.join_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={selectedMember.is_active} disabled />
                    <Label>Membro Ativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={selectedMember.is_admin} disabled />
                    <Label>Administrador</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={selectedMember.honorary_member} disabled />
                    <Label>Membro Honorário</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={selectedMember.legacy_member} disabled />
                    <Label>Membro Legacy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={selectedMember.in_whatsapp_group} disabled />
                    <Label>Grupo WhatsApp</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={selectedMember.received_member_kit} disabled />
                    <Label>Kit Recebido</Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="vehicles">
                <div className="space-y-4">
                  {selectedMember.vehicles && selectedMember.vehicles.length > 0 ? (
                    selectedMember.vehicles.map((vehicle) => (
                      <Card key={vehicle.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center space-x-4">
                            {vehicle.photo_url && (
                              <img 
                                src={vehicle.photo_url} 
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium">{vehicle.brand} {vehicle.model}</h4>
                              <p className="text-sm text-muted-foreground">
                                {vehicle.type} • {vehicle.displacement}cc
                              </p>
                              {vehicle.nickname && (
                                <p className="text-sm italic">"{vehicle.nickname}"</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum veículo registado</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="dues">
                <div className="space-y-4">
                  {selectedMember.dues_payments && selectedMember.dues_payments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMember.dues_payments
                        .sort((a, b) => b.year - a.year)
                        .map((payment) => (
                          <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <span className="font-medium">{payment.year}</span>
                              {payment.payment_date && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  • Pago em {format(new Date(payment.payment_date), 'dd/MM/yyyy', { locale: ptBR })}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {payment.exempt ? (
                                <Badge variant="secondary">Isento</Badge>
                              ) : payment.paid ? (
                                <Badge variant="default" className="bg-green-500">Pago</Badge>
                              ) : (
                                <Badge variant="destructive">Pendente</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Euro className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum pagamento registado</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="administration">
                <div className="space-y-4">
                  {selectedMember.administration && selectedMember.administration.length > 0 ? (
                    selectedMember.administration.map((role) => (
                      <Card key={role.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{role.role}</h4>
                              <p className="text-sm text-muted-foreground">Mandato: {role.term}</p>
                              {role.term_start && role.term_end && (
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(role.term_start), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(role.term_end), 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                              )}
                            </div>
                            <Badge variant={role.status === 'Ativo' ? 'default' : 'secondary'}>
                              {role.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Sem cargos administrativos</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="activity">
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Histórico de atividades</p>
                  <p className="text-sm">Funcionalidade a implementar</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberManagementSystem;
