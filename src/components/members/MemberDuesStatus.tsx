
import { Member } from '@/hooks/use-members';
import { Badge } from '@/components/ui/badge';

interface MemberDuesStatusProps {
  member: Member;
}

export function MemberDuesStatus({ member }: MemberDuesStatusProps) {
  const currentYear = new Date().getFullYear();

  const getDuesStatus = (member: Member) => {
    const currentYearPayment = member.duesPayments.find(payment => payment.year === currentYear);
    if (currentYearPayment?.exempt) return "Isento";
    return currentYearPayment?.paid ? "Paga" : "Pendente";
  };

  const getDuesStatusVariant = (status: string) => {
    switch (status) {
      case "Paga": return "success";
      case "Pendente": return "destructive";
      case "Isento": return "secondary";
      default: return "outline";
    }
  };

  const status = getDuesStatus(member);
  const variant = getDuesStatusVariant(status);
  
  return (
    <Badge variant={variant as any}>
      {status}
    </Badge>
  );
}
