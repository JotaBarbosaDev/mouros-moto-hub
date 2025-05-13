
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Member } from "@/hooks/use-members";

interface MemberActionsProps {
  member: Member;
  onView: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export function MemberActions({ member, onView, onEdit, onDelete }: MemberActionsProps) {
  // Verifica se o objeto member é válido antes de permitir ações
  const isValidMember = member && member.id;

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => isValidMember && onView(member)}
        disabled={!isValidMember}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => isValidMember && onEdit(member)}
        disabled={!isValidMember}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => isValidMember && onDelete(member)}
        disabled={!isValidMember}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}
