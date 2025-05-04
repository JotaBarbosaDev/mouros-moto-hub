
import { Member } from '@/hooks/use-members';

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

  const getDuesStatusClass = (status: string) => {
    switch (status) {
      case "Paga": return "text-green-600";
      case "Pendente": return "text-red-600";
      case "Isento": return "text-blue-600";
      default: return "";
    }
  };

  const status = getDuesStatus(member);
  
  return (
    <span className={getDuesStatusClass(status)}>
      {status}
    </span>
  );
}
