
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Vehicle } from "@/types/member";
import { VehicleForm } from "./VehicleForm";
import { vehicleSchema, VehicleFormValues, defaultVehicleValues } from "./schemas/vehicle-schema";
import { MemberSelect } from "../members/MemberSelect";

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (vehicle: Omit<Vehicle, 'id'>, memberId?: string) => void;
  memberId?: string; // Id do membro opcional
  hideOwnerSelect?: boolean; // Se deve esconder o seletor de membro
}

export function AddVehicleDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  memberId, 
  hideOwnerSelect = false 
}: AddVehicleDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(memberId);
  
  // Atualiza o ID do membro selecionado quando as props mudam
  useEffect(() => {
    setSelectedMemberId(memberId);
  }, [memberId]);
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: defaultVehicleValues
  });
  
  const handleSubmit = async (values: VehicleFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Validar se o membro está selecionado
      if (!selectedMemberId && !hideOwnerSelect) {
        toast({
          title: "Erro de validação",
          description: "Por favor, selecione o proprietário do veículo.",
          variant: "destructive",
        });
        return;
      }
      
      // Validação adicional dos campos
      if (!values.brand.trim()) {
        toast({
          title: "Erro de validação",
          description: "A marca do veículo é obrigatória.",
          variant: "destructive",
        });
        return;
      }
      
      if (!values.model.trim()) {
        toast({
          title: "Erro de validação",
          description: "O modelo do veículo é obrigatório.",
          variant: "destructive",
        });
        return;
      }
      
      if (!values.type) {
        toast({
          title: "Erro de validação",
          description: "O tipo do veículo é obrigatório.",
          variant: "destructive",
        });
        return;
      }
      
      if (values.displacement <= 0) {
        toast({
          title: "Erro de validação",
          description: "A cilindrada deve ser maior que zero.",
          variant: "destructive",
        });
        return;
      }
      
      // Passar o ID do membro quando salvar o veículo
      await onSave({
        brand: values.brand,
        model: values.model,
        type: values.type,
        displacement: values.displacement,
        nickname: values.nickname,
        photoUrl: values.photoUrl,
      }, selectedMemberId);
      
      form.reset();
      onOpenChange(false);
      
      toast({
        title: "Sucesso",
        description: "Veículo adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Error saving vehicle:', error);
      
      let errorMessage = "Não foi possível adicionar o veículo.";
      
      if (error instanceof Error) {
        if (error.message.includes("Membro não encontrado")) {
          errorMessage = "Membro não encontrado. Verifique se o membro existe.";
        } else if (error.message.includes("engine_size")) {
          errorMessage = "Erro no formato de cilindrada. Verifique se está informando um número válido.";
        } else if (error.message.includes("foreign key")) {
          errorMessage = "Erro de relacionamento. Verifique se o membro existe.";
        } else if (error.message.includes("HTTP error! Status: 500")) {
          errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) form.reset();
      onOpenChange(isOpen);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Veículo</DialogTitle>
          <DialogDescription>Preencha os detalhes do veículo a ser adicionado.</DialogDescription>
        </DialogHeader>
        
        {!hideOwnerSelect && (
          <div className="mb-4">
            <MemberSelect
              label="Proprietário"
              value={selectedMemberId}
              onChange={setSelectedMemberId}
              required
            />
          </div>
        )}
        
        <VehicleForm 
          form={form}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
