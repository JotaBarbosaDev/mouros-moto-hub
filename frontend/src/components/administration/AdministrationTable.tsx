
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Check, X, Edit } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EditAdminDialog } from './EditAdminDialog';

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
  onRefresh: () => void;
}

export const getStatusColor = (status: AdministrationMember['status']) => {
  switch (status) {
    case 'Ativo': return 'bg-green-500';
    case 'Inativo': return 'bg-red-500';
    case 'Licença': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
};

export function AdministrationTable({ members, onRefresh }: AdministrationTableProps) {
  const [statuses, setStatuses] = useState<Record<string, AdministrationMember['status']>>(
    members.reduce((acc, member) => ({ ...acc, [member.id]: member.status }), {})
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [editingAdmin, setEditingAdmin] = useState<AdministrationMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const updateMemberStatus = async (memberId: string, status: AdministrationMember['status']) => {
    setLoading(prev => ({ ...prev, [memberId]: true }));
    try {
      // First update the administration table
      const { error: adminError } = await supabase
        .from('administration')
        .update({ status })
        .eq('member_id', memberId);

      if (adminError) throw adminError;
      
      // Update local state
      setStatuses(prev => ({ ...prev, [memberId]: status }));
      
      toast({
        title: "Status atualizado",
        description: "O status do administrador foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do administrador.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleEditClick = (admin: AdministrationMember) => {
    setEditingAdmin(admin);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    onRefresh();
    setEditingAdmin(null);
  };

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
            <TableHead className="text-right">Ações</TableHead>
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
                <Select 
                  value={statuses[item.id]} 
                  onValueChange={(value) => updateMemberStatus(item.id, value as AdministrationMember['status'])}
                  disabled={loading[item.id]}
                >
                  <SelectTrigger className={`w-28 ${loading[item.id] ? 'opacity-50' : ''}`}>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(statuses[item.id])}>
                          {loading[item.id] ? '...' : statuses[item.id]}
                        </Badge>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <span>Ativo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Inativo">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        <span>Inativo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Licença">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        <span>Licença</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingAdmin && (
        <EditAdminDialog
          admin={editingAdmin}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
