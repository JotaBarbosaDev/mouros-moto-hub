
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface AdministrationMember {
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

interface AdministrationTableProps {
  members: AdministrationMember[];
}

export const getStatusColor = (status: AdministrationMember['status']) => {
  switch (status) {
    case 'Ativo': return 'bg-green-500';
    case 'Inativo': return 'bg-red-500';
    case 'Licença': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
};

export function AdministrationTable({ members }: AdministrationTableProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-md">
        <h3 className="text-xl font-medium text-slate-900 mb-2">Sem membros da administração</h3>
        <p className="text-sm text-slate-500 mb-6">Não há membros registrados na administração do clube.</p>
      </div>
    );
  }

  return (
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
          {members.map((item) => (
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
  );
}
