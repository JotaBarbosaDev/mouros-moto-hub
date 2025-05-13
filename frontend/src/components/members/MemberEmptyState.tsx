
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface MemberEmptyStateProps {
  onAddClick: () => void;
}

export function MemberEmptyState({ onAddClick }: MemberEmptyStateProps) {
  return (
    <div className="text-center py-12 bg-slate-50 rounded-md border border-slate-200">
      <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum membro encontrado</h3>
      <p className="text-sm text-slate-500 mb-4">Crie um novo membro para começar.</p>
      <Button 
        onClick={onAddClick}
        variant="outline"
        className="mx-auto"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Adicionar Membro
      </Button>
    </div>
  );
}
