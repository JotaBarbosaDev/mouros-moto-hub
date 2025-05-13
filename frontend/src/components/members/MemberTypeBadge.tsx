
import { Badge } from "@/components/ui/badge";

interface MemberTypeBadgeProps {
  type: string;
  isHonorary?: boolean;
}

export function MemberTypeBadge({ type, isHonorary }: MemberTypeBadgeProps) {
  const getMemberTypeColor = (type: string) => {
    switch (type) {
      case 'Sócio Adulto': return 'bg-blue-500';
      case 'Sócio Criança': return 'bg-green-500';
      case 'Administração': return 'bg-purple-500';
      case 'Convidado': return 'bg-gray-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <>
      <Badge className={`${getMemberTypeColor(type)}`}>
        {type}
      </Badge>
      {isHonorary && (
        <Badge className="ml-2 bg-amber-500">Honorário</Badge>
      )}
    </>
  );
}
