
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
  
  const handleSubmit = (values: VehicleFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Passar o ID do membro quando salvar o veículo
      onSave({
        brand: values.brand,
        model: values.model,
        type: values.type,
        displacement: values.displacement,
        nickname: values.nickname,
        photoUrl: values.photoUrl,
      }, selectedMemberId);
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o veículo.",
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
