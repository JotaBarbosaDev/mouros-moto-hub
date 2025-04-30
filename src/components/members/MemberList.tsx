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

const getMemberTypeColor = (type: MemberType) => {
  switch (type) {
    case 'Sócio Adulto': return 'bg-blue-500';
    case 'Sócio Criança': return 'bg-green-500';
    case 'Administração': return 'bg-purple-500';
    case 'Convidado': return 'bg-gray-500';
    default: return 'bg-slate-500';
  }
};

// Mock data com a estrutura expandida
const initialMembers: Member[] = [
  {
    id: '1',
    memberNumber: '001',
    name: 'João Silva',
    email: 'joao@example.com',
    phoneMain: '912345678',
    phoneAlternative: '213456789',
    address: {
      street: 'Rua das Flores',
      number: '123',
      postalCode: '1000-100',
      city: 'Lisboa',
      district: 'Lisboa',
      country: 'Portugal'
    },
    bloodType: 'A+',
    memberType: 'Sócio Adulto',
    joinDate: '2023-01-15',
    vehicles: [
      {
        id: 'm1',
        brand: 'Honda',
        model: 'Africa Twin',
        type: 'Mota',
        displacement: 1100,
        photoUrl: 'https://images.unsplash.com/photo-1558980394-da1f85d3b540?auto=format&fit=crop&q=80'
      },
      {
        id: 'm2',
        brand: 'Triumph',
        model: 'Street Triple',
        type: 'Mota',
        displacement: 765,
        nickname: 'Triúnfo'
      }
    ],
    legacyMember: true,
    honoraryMember: false,
    registrationFeePaid: true,
    registrationFeeExempt: false,
    duesPayments: [
      { year: 2023, paid: true, date: '2023-01-15', exempt: false },
      { year: 2024, paid: true, date: '2024-01-20', exempt: false },
      { year: 2025, paid: true, date: '2025-01-10', exempt: false }
    ],
    inWhatsAppGroup: true,
    receivedMemberKit: true,
    photoUrl: 'https://images.unsplash.com/photo-1527576539890-dfa815648363?auto=format&fit=crop&q=80',
    nickname: 'Joãozinho'
  },
  {
    id: '2',
    memberNumber: '002',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phoneMain: '912345679',
    address: {
      street: 'Avenida da Liberdade',
      number: '45',
      postalCode: '1250-146',
      city: 'Lisboa',
      district: 'Lisboa',
      country: 'Portugal'
    },
    bloodType: 'O-',
    memberType: 'Administração',
    joinDate: '2023-02-20',
    vehicles: [
      {
        id: 'm3',
        brand: 'Ducati',
        model: 'Monster',
        type: 'Mota',
        displacement: 937
      }
    ],
    legacyMember: false,
    honoraryMember: true,
    registrationFeePaid: true,
    registrationFeeExempt: false,
    duesPayments: [
      { year: 2023, paid: true, date: '2023-02-20', exempt: false },
      { year: 2024, paid: true, date: '2024-01-15', exempt: false },
      { year: 2025, paid: true, date: '2025-01-05', exempt: false }
    ],
    inWhatsAppGroup: true,
    receivedMemberKit: true,
    photoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80',
    nickname: 'Mari'
  },
  {
    id: '3',
    memberNumber: '003',
    name: 'Pedro Costa',
    email: 'pedro@example.com',
    phoneMain: '912345680',
    address: {
      street: 'Rua do Carmo',
      number: '78',
      postalCode: '1200-094',
      city: 'Lisboa',
      district: 'Lisboa',
      country: 'Portugal'
    },
    bloodType: 'B+',
    memberType: 'Sócio Criança',
    joinDate: '2023-03-10',
    vehicles: [],
    legacyMember: false,
    honoraryMember: false,
    registrationFeePaid: false,
    registrationFeeExempt: true,
    duesPayments: [
      { year: 2023, paid: false, exempt: true },
      { year: 2024, paid: false, exempt: true },
      { year: 2025, paid: false, exempt: true }
    ],
    inWhatsAppGroup: false,
    receivedMemberKit: true
  }
];

// Generate 11 admin members for testing scales
const generateAdminMembers = (): Member[] => {
  const admins: Member[] = [];
  for (let i = 1; i <= 11; i++) {
    admins.push({
      id: `admin-${i}`,
      memberNumber: `${i+10}`.padStart(3, '0'),
      name: `Admin ${i}`,
      email: `admin${i}@example.com`,
      phoneMain: `9${i}${i}${i}${i}${i}${i}${i}${i}${i}`,
      address: {
        street: 'Rua da Administração',
        number: `${i}`,
        postalCode: '1000-001',
        city: 'Lisboa',
        district: 'Lisboa',
        country: 'Portugal'
      },
      bloodType: 'O+',
      memberType: 'Administração',
      joinDate: `2023-01-0${i}`,
      vehicles: [],
      legacyMember: false,
      honoraryMember: false,
      registrationFeePaid: true,
      registrationFeeExempt: false,
      duesPayments: [
        { year: 2023, paid: true, date: '2023-01-15', exempt: false },
        { year: 2024, paid: true, date: '2024-01-15', exempt: false },
        { year: 2025, paid: true, date: '2025-01-15', exempt: false }
      ],
      inWhatsAppGroup: true,
      receivedMemberKit: true,
      nickname: `Admin ${i}`,
      photoUrl: i % 2 === 0 ? undefined : `https://randomuser.me/api/portraits/${i % 3 === 0 ? 'women' : 'men'}/${i}.jpg`
    });
  }
  return admins;
};

export function MemberList() {
  const { toast } = useToast();
  // Combine initial members with generated admin members
  const allMembers = [...initialMembers, ...generateAdminMembers()];
  const [members, setMembers] = useState<Member[]>(allMembers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleAddMember = (member: Partial<Member>) => {
    const newMember = {
      ...member,
      id: Math.random().toString(36).substr(2, 9),
      memberNumber: String(members.length + 1).padStart(3, '0'),
      vehicles: member.vehicles || [],
      duesPayments: [],
      legacyMember: false,
      honoraryMember: false,
      registrationFeePaid: false,
      registrationFeeExempt: false,
      inWhatsAppGroup: false,
      receivedMemberKit: false,
    } as Member;
    
    setMembers([...members, newMember]);
    setIsAddDialogOpen(false);
    toast({
      title: "Membro adicionado",
      description: "O novo membro foi adicionado com sucesso.",
    });
  };

  const handleEditMember = (editedMember: Member) => {
    setMembers(members.map(member => 
      member.id === editedMember.id ? editedMember : member
    ));
  };

  const handleDeleteMember = () => {
    if (!selectedMember) return;
    
    setMembers(members.filter(member => member.id !== selectedMember.id));
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
    toast({
      title: "Membro removido",
      description: "O membro foi removido com sucesso.",
    });
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
