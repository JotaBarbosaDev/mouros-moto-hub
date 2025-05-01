
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AddMemberDialog } from './AddMemberDialog';
import { EditMemberDialog } from './EditMemberDialog';
import { ViewMemberDialog } from './ViewMemberDialog';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Member, MemberType } from '@/types/member';
import { useMembers } from '@/hooks/use-members';

const getMemberTypeColor = (type: MemberType) => {
  switch (type) {
    case 'Sócio Adulto': return 'bg-blue-500';
    case 'Sócio Criança': return 'bg-green-500';
    case 'Administração': return 'bg-purple-500';
    case 'Convidado': return 'bg-gray-500';
    default: return 'bg-slate-500';
  }
};

export function MemberList() {
  const { toast } = useToast();
  const { 
    members, 
    isLoading, 
    isError, 
    createMember, 
    updateMember, 
    deleteMember 
  } = useMembers();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleAddMember = (member: Partial<Member>) => {
    createMember({
      ...member,
      memberNumber: member.memberNumber || String(Date.now()).substring(7), // Generate a unique number if not provided
      vehicles: [],
      duesPayments: [],
    } as any);
    setIsAddDialogOpen(false);
  };

  const handleEditMember = (editedMember: Member) => {
    updateMember(editedMember);
  };

  const handleDeleteMember = () => {
    if (!selectedMember) return;
    
    deleteMember(selectedMember.id);
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
  };

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (member: Member) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const currentYear = new Date().getFullYear();
  const getDuesStatus = (member: Member) => {
    const currentYearPayment = member.duesPayments.find(payment => payment.year === currentYear);
    if (currentYearPayment?.exempt) return "Isento";
    return currentYearPayment?.paid ? "Paga" : "Pendente";
  };

  const getDuesStatusClass = (status: string) => {
    switch (status) {
      case "Paga": return "text-green-600";
      case "Pendente": return "text-red-600";
      case "Isento": return "text-blue-600";
      default: return "";
    }
  };

  const getMemberInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">A carregar membros...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500">Erro ao carregar membros.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Lista de Membros</h2>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-mouro-red hover:bg-mouro-red/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Membro
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-md border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum membro cadastrado</h3>
          <p className="text-sm text-slate-500 mb-4">Clique no botão acima para adicionar o primeiro membro.</p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            variant="outline"
            className="mx-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Membro
          </Button>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nº</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Veículos</TableHead>
                  <TableHead>Cota Anual</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Avatar>
                        {member.photoUrl ? (
                          <AvatarImage src={member.photoUrl} alt={member.name} />
                        ) : (
                          <AvatarFallback>{getMemberInitials(member.name)}</AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell>{member.memberNumber}</TableCell>
                    <TableCell className="font-medium">
                      {member.name}
                      {member.nickname && <div className="text-xs text-gray-500">{member.nickname}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getMemberTypeColor(member.memberType)}`}>
                        {member.memberType}
                      </Badge>
                      {member.honoraryMember && (
                        <Badge className="ml-2 bg-amber-500">Honorário</Badge>
                      )}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phoneMain}</TableCell>
                    <TableCell>{member.vehicles.length}</TableCell>
                    <TableCell className={getDuesStatusClass(getDuesStatus(member))}>
                      {getDuesStatus(member)}
                    </TableCell>
                    <TableCell>{new Date(member.joinDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleViewMember(member)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditClick(member)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDeleteClick(member)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <AddMemberDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddMember}
      />

      <EditMemberDialog
        member={selectedMember}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleEditMember}
      />

      <ViewMemberDialog
        member={selectedMember}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o membro {selectedMember?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
