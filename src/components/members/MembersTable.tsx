
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Member } from "@/hooks/use-members";
import { MemberAvatar } from "./MemberAvatar";
import { MemberTypeBadge } from "./MemberTypeBadge";
import { MemberDuesStatus } from "./MemberDuesStatus";
import { MemberActions } from "./MemberActions";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface MembersTableProps {
  members: Member[];
  onViewMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (member: Member) => void;
}

export function MembersTable({ 
  members, 
  onViewMember, 
  onEditMember, 
  onDeleteMember 
}: MembersTableProps) {
  return (
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
              <TableHead className="text-center">WhatsApp</TableHead>
              <TableHead className="text-center">Kit</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <MemberAvatar photoUrl={member.photoUrl} name={member.name} />
                </TableCell>
                <TableCell>{member.memberNumber}</TableCell>
                <TableCell className="font-medium">
                  {member.name}
                  {member.nickname && <div className="text-xs text-gray-500">{member.nickname}</div>}
                </TableCell>
                <TableCell>
                  <MemberTypeBadge 
                    type={member.memberType} 
                    isHonorary={member.honoraryMember} 
                  />
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phoneMain}</TableCell>
                <TableCell>
                  {member.vehicles.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {member.vehicles.map((vehicle, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {vehicle.brand} {vehicle.model}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Nenhum</span>
                  )}
                </TableCell>
                <TableCell>
                  <MemberDuesStatus member={member} />
                </TableCell>
                <TableCell className="text-center">
                  {member.inWhatsAppGroup ? (
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {member.receivedMemberKit ? (
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400 mx-auto" />
                  )}
                </TableCell>
                <TableCell>{new Date(member.joinDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <MemberActions 
                    member={member} 
                    onView={onViewMember}
                    onEdit={onEditMember}
                    onDelete={onDeleteMember}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
