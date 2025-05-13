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
import { supabase } from '@/integrations/supabase/client';

export function MemberList() {
  const { 
    members, 
    isLoading, 
    isError, 
    createMember, 
    updateMember, 
    deleteMember,
    refetch 
  } = useMembers();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMember = async (member: Partial<Member>) => {
    setIsSubmitting(true);
    try {
      // Definir username e password
      let username = member.username || '';
      if (!username) {
        // Se não foi fornecido username, gera um baseado no email
        const emailParts = member.email?.split('@') || [];
        username = emailParts[0] || `membro${Date.now().toString().substring(7)}`;
      }
      
      // Se não foi fornecida senha, usar o username como senha
      const password = member.password || username;
      
      // Tenta criar o usuário na autenticação do Supabase
      try {
        const { error } = await supabase.auth.signUp({
          email: member.email || '',
          password: password,
          options: {
            data: {
              member_type: member.memberType,
              is_admin: member.memberType === "Administração"
            }
          }
        });
        
        if (error) {
          console.warn("Erro ao criar usuário na autenticação:", error.message);
          // Continua mesmo com erro, usuário poderá ser associado manualmente depois
        } else {
          console.log("Usuário criado com sucesso na autenticação");
        }
      } catch (authError) {
        console.error("Falha ao criar usuário:", authError);
        // Continua mesmo com erro
      }
      
      // Criar o membro no banco
      // Criar o membro no banco usando a interface MemberExtended
      await createMember({
        ...member,
        name: member.name || '', // Nome é obrigatório
        email: member.email || '', // Email é obrigatório
        phoneMain: member.phoneMain || '', // Telefone principal é obrigatório
        memberNumber: member.memberNumber || String(Date.now()).substring(7), // Generate a unique number if not provided
        isActive: true,
        isAdmin: member.memberType === "Administração",
        joinDate: member.joinDate || new Date().toISOString(),
        honoraryMember: member.honoraryMember || false,
        legacyMember: false,
        registrationFeePaid: false,
        registrationFeeExempt: false,
        inWhatsAppGroup: member.inWhatsAppGroup || false,
        receivedMemberKit: member.receivedMemberKit || false,
        username: username,
        duesPayments: [], // Inicializa com array vazio em vez de any
        vehicles: member.vehicles || [] // Usa os veículos do membro ou array vazio
      });
    } finally {
      setIsSubmitting(false);
      setIsAddDialogOpen(false);
    }
  };

  const handleEditMember = async (editedMember: Member) => {
    try {
      await updateMember(editedMember);
      setIsEditDialogOpen(false);
      
      // Forçar o estado local a refletir o membro editado
      if (selectedMember && selectedMember.id === editedMember.id) {
        setSelectedMember(editedMember);
      }
      
      // Forçar uma atualização da lista após editar com sucesso
      setTimeout(() => {
        refetch();
      }, 300);
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      // O erro é registrado aqui e também em use-members.ts pela configuração de onError 
      // não fechamos o diálogo em caso de erro para permitir que o usuário corrija
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    
    try {
      await deleteMember(selectedMember.id);
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
      
      // Força uma atualização da lista após excluir com sucesso
      setTimeout(() => {
        refetch();
      }, 300);
    } catch (error) {
      console.error('Erro ao excluir membro:', error);
      // Mantemos o diálogo aberto em caso de erro para dar feedback ao usuário
      // O erro detalhado já é registrado no log por use-members.ts
    }
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
        isSubmitting={isSubmitting}
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
            <AlertDialogAction onClick={handleDeleteMember}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
