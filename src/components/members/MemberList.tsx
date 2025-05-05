
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import { AddMemberDialog } from './AddMemberDialog';
import { EditMemberDialog } from './EditMemberDialog';
import { ViewMemberDialog } from './ViewMemberDialog';
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
import { useMembers, Member } from '@/hooks/use-members';
import { MembersTable } from './MembersTable';
import { MemberEmptyState } from './MemberEmptyState';
import { useToast } from '@/hooks/use-toast';

export function MemberList() {
  const { 
    members, 
    isLoading, 
    isError, 
    createMember, 
    updateMember, 
    deleteMember 
  } = useMembers();
  
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleAddMember = (member: Partial<Member>) => {
    createMember({
      ...member,
      memberNumber: member.memberNumber || String(Date.now()).substring(7), // Generate a unique number if not provided
      isActive: true,
      // Add required properties from MemberType
      address: {
        street: member.address?.street || '',
        number: member.address?.number || '',
        postalCode: member.address?.postalCode || '',
        city: member.address?.city || '',
        district: member.address?.district || '',
        country: member.address?.country || 'Portugal'
      },
      legacyMember: false,
      registrationFeePaid: false,
      registrationFeeExempt: false,
      inWhatsAppGroup: member.inWhatsAppGroup || false,
      receivedMemberKit: member.receivedMemberKit || false,
    } as any);
    
    toast({
      title: "Membro adicionado",
      description: "O membro foi adicionado com sucesso.",
    });
    
    setIsAddDialogOpen(false);
  };

  const handleEditMember = (editedMember: Member) => {
    updateMember(editedMember);
    setIsEditDialogOpen(false);
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
        <MemberEmptyState onAddClick={() => setIsAddDialogOpen(true)} />
      ) : (
        <MembersTable 
          members={members}
          onViewMember={handleViewMember}
          onEditMember={handleEditClick}
          onDeleteMember={handleDeleteClick}
        />
      )}

      <AddMemberDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddMember}
      />

      {selectedMember && (
        <>
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
        </>
      )}

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
            <AlertDialogAction 
              onClick={handleDeleteMember}
              className="bg-red-500 hover:bg-red-600"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
