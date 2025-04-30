
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

interface AdministrationMember {
  id: number;
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

const mockAdministration: AdministrationMember[] = [
  { 
    id: 1, 
    nome: 'Ricardo Pereira', 
    memberNumber: '005',
    cargo: 'Presidente', 
    mandato: '2023-2025', 
    status: 'Ativo',
    email: 'ricardo@example.com',
    telefone: '912345680',
    inicioMandato: '2023-01-01',
    fimMandato: '2025-12-31'
  },
  { 
    id: 2, 
    nome: 'Mariana Costa', 
    memberNumber: '008',
    cargo: 'Vice-Presidente', 
    mandato: '2023-2025', 
    status: 'Ativo',
    email: 'mariana@example.com',
    telefone: '912345681',
    inicioMandato: '2023-01-01',
    fimMandato: '2025-12-31'
  },
  { 
    id: 3, 
    nome: 'Fernando Santos', 
    memberNumber: '012',
    cargo: 'Tesoureiro', 
    mandato: '2023-2025', 
    status: 'Ativo',
    email: 'fernando@example.com',
    telefone: '912345682',
    inicioMandato: '2023-01-01',
    fimMandato: '2025-12-31'
  },
  { 
    id: 4, 
    nome: 'Lucia Ferreira', 
    memberNumber: '015',
    cargo: 'Secretária', 
    mandato: '2023-2025', 
    status: 'Licença',
    email: 'lucia@example.com',
    telefone: '912345683',
    inicioMandato: '2023-01-01',
    fimMandato: '2025-12-31'
  },
  { 
    id: 5, 
    nome: 'Roberto Silva', 
    memberNumber: '020',
    cargo: 'Dir. Eventos', 
    mandato: '2023-2025', 
    status: 'Ativo',
    email: 'roberto@example.com',
    telefone: '912345684',
    inicioMandato: '2023-01-01',
    fimMandato: '2025-12-31'
  },
  { 
    id: 6, 
    nome: 'Ana Oliveira', 
    memberNumber: '025',
    cargo: 'Dir. Marketing', 
    mandato: '2023-2025', 
    status: 'Ativo',
    email: 'ana@example.com',
    telefone: '912345685',
    inicioMandato: '2023-01-01',
    fimMandato: '2025-12-31'
  },
  { 
    id: 7, 
    nome: 'Carlos Mendes', 
    memberNumber: '030',
    cargo: 'Dir. Patrimônio', 
    mandato: '2023-2025', 
    status: 'Inativo',
    email: 'carlos@example.com',
    telefone: '912345686',
    inicioMandato: '2023-01-01',
    fimMandato: '2025-12-31'
  }
];

const Administration = () => {
  const activeMembers = mockAdministration.filter(m => m.status === 'Ativo').length;
  const inactiveMembers = mockAdministration.filter(m => m.status === 'Inativo').length;
  const onLeaveMembers = mockAdministration.filter(m => m.status === 'Licença').length;
  
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
              <p className="text-xl font-semibold">2023 - 2025</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total de Dirigentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{mockAdministration.length}</p>
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
              <p className="text-xl font-semibold">Outubro de 2025</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow">
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
              {mockAdministration.map((item) => (
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
        </div>
      </div>
    </MembersLayout>
  );
};

export default Administration;
