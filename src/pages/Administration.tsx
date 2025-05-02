
import { useEffect, useState } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdministrationMember {
  id: string;
  nome: string;
  memberNumber: string;
  cargo: string;
  mandato: string;
  status: 'Ativo' | 'Inativo' | 'Licença';
  email: string;
  telefone: string;
  inicioMandato: string;
  fimMandato: string;
}

const getStatusColor = (status: AdministrationMember['status']) => {
  switch (status) {
    case 'Ativo': return 'bg-green-500';
    case 'Inativo': return 'bg-red-500';
    case 'Licença': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
};

const Administration = () => {
  const [administrationMembers, setAdministrationMembers] = useState<AdministrationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAdministration() {
      try {
        setIsLoading(true);
        
        // Fetch administration data with member details
        const { data: admins, error } = await supabase
          .from('administration')
          .select(`
            id,
            role,
            term,
            term_start,
            term_end,
            status,
            members (
              id,
              member_number,
              name,
              email,
              phone_main
            )
          `)
          .order('term_start', { ascending: false });
          
        if (error) {
          throw error;
        }
          
        if (admins) {
          // Transform the data to match our component's expected format
          const transformedData: AdministrationMember[] = admins.map(admin => ({
            id: admin.id,
            nome: admin.members?.name || 'Desconhecido',
            memberNumber: admin.members?.member_number || '-',
            cargo: admin.role,
            mandato: admin.term,
            status: admin.status as AdministrationMember['status'],
            email: admin.members?.email || '-',
            telefone: admin.members?.phone_main || '-',
            inicioMandato: admin.term_start,
            fimMandato: admin.term_end
          }));
          
          setAdministrationMembers(transformedData);
        }
      } catch (error) {
        console.error('Error fetching administration data:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da administração.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAdministration();
  }, [toast]);
  
  const activeMembers = administrationMembers.filter(m => m.status === 'Ativo').length;
  const inactiveMembers = administrationMembers.filter(m => m.status === 'Inativo').length;
  const onLeaveMembers = administrationMembers.filter(m => m.status === 'Licença').length;
  
  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-mouro-black">
            Administração do <span className="text-mouro-red">Clube</span>
          </h1>
          <Button className="bg-mouro-red hover:bg-mouro-red/90">
            <Plus className="mr-2 h-4 w-4" />
            Novo Administrador
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Mandato Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Período</p>
              <p className="text-xl font-semibold">
                {administrationMembers.length > 0 
                  ? administrationMembers[0].mandato 
                  : "2023 - 2025"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total de Dirigentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{administrationMembers.length}</p>
              <div className="text-sm text-gray-500 mt-1">
                <span className="text-green-600 mr-2">{activeMembers} ativos</span>
                <span className="text-amber-600 mr-2">{onLeaveMembers} licença</span>
                <span className="text-red-600">{inactiveMembers} inativos</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Próxima Eleição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Data</p>
              <p className="text-xl font-semibold">
                {administrationMembers.length > 0 
                  ? new Date(administrationMembers[0].fimMandato).toLocaleDateString('pt-PT', {month: 'long', year: 'numeric'})
                  : "Outubro de 2025"}
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>A carregar dados da administração...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {administrationMembers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Nº</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead>Mandato</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {administrationMembers.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>{item.memberNumber}</TableCell>
                      <TableCell>{item.cargo}</TableCell>
                      <TableCell className="hidden md:table-cell">{item.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{item.telefone}</TableCell>
                      <TableCell>{item.mandato}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-md">
                <h3 className="text-xl font-medium text-slate-900 mb-2">Sem membros da administração</h3>
                <p className="text-sm text-slate-500 mb-6">Não há membros registrados na administração do clube.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MembersLayout>
  );
};

export default Administration;
