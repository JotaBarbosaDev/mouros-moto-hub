
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Member } from "@/hooks/use-members";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { AddVehicleDialog } from "@/components/garage/AddVehicleDialog";
import { Vehicle } from "@/types/member";
import { MemberFormTabs } from "./MemberFormTabs";
import { EditMemberFormValues, editMemberSchema } from "./MemberFormTypes";

interface EditMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (editedMember: Member) => void;
}

export function EditMemberDialog({ member, open, onOpenChange, onSave }: EditMemberDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [duesPayments, setDuesPayments] = useState<{year: number, paid: boolean, exempt: boolean}[]>([]);
  
  const form = useForm<EditMemberFormValues>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      name: member?.name || "",
      email: member?.email || "",
      phoneMain: member?.phoneMain || "",
      phoneAlternative: member?.phoneAlternative || "",
      nickname: member?.nickname || "",
      bloodType: member?.bloodType,
      memberType: member?.memberType || "Sócio Adulto",
      inWhatsAppGroup: member?.inWhatsAppGroup || false,
      receivedMemberKit: member?.receivedMemberKit || false,
      photoUrl: member?.photoUrl || "",
    }
  });

  // Update form when member changes
  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        email: member.email,
        phoneMain: member.phoneMain,
        phoneAlternative: member.phoneAlternative || "",
        nickname: member.nickname || "",
        bloodType: member.bloodType,
        memberType: member.memberType,
        inWhatsAppGroup: member.inWhatsAppGroup || false,
        receivedMemberKit: member.receivedMemberKit || false,
        photoUrl: member.photoUrl || "",
      });
      
      // Load member vehicles
      fetchVehicles();
      
      // Load dues payments or create defaults for the last 3 years
      fetchDuesPayments();
    }
  }, [member, form]);
  
  // Fetch member's vehicles from the database
  const fetchVehicles = async () => {
    if (!member) return;
    
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('member_id', member.id);
      
    if (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os veículos do membro.",
        variant: "destructive",
      });
      return;
    }
    
    if (data) {
      // Transform to match our Vehicle type
      const vehiclesData: Vehicle[] = data.map(v => ({
        id: v.id,
        brand: v.brand,
        model: v.model,
        type: v.type,
        displacement: v.displacement,
        nickname: v.nickname || undefined,
        photoUrl: v.photo_url || undefined,
      }));
      
      setVehicles(vehiclesData);
    }
  };
  
  // Fetch dues payments or create defaults
  const fetchDuesPayments = async () => {
    if (!member) return;
    
    const { data, error } = await supabase
      .from('dues_payments')
      .select('*')
      .eq('member_id', member.id)
      .order('year', { ascending: false });
      
    if (error) {
      console.error('Error fetching dues payments:', error);
      return;
    }
    
    if (data && data.length > 0) {
      setDuesPayments(data.map(p => ({
        year: p.year,
        paid: p.paid,
        exempt: p.exempt
      })));
    } else {
      // Create default dues payments for last 3 years
      const currentYear = new Date().getFullYear();
      const defaults = Array.from({length: 3}, (_, i) => ({
        year: currentYear - i,
        paid: false,
        exempt: false
      }));
      setDuesPayments(defaults);
    }
  };
  
  // Handle adding new vehicle
  const handleAddVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    if (!member) return;
    
    try {
      // Add vehicle to database
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type,
          displacement: vehicle.displacement,
          nickname: vehicle.nickname || null,
          photo_url: vehicle.photoUrl || null,
          member_id: member.id
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Add to local state
      const newVehicle: Vehicle = {
        id: data.id,
        brand: data.brand,
        model: data.model,
        type: data.type,
        displacement: data.displacement,
        nickname: data.nickname || undefined,
        photoUrl: data.photo_url || undefined,
      };
      
      setVehicles(prev => [...prev, newVehicle]);
      
      toast({
        title: "Veículo adicionado",
        description: "O veículo foi adicionado com sucesso.",
      });
      
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o veículo.",
        variant: "destructive",
      });
    }
  };
  
  // Handle deleting a vehicle
  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);
        
      if (error) throw error;
      
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      
      toast({
        title: "Veículo removido",
        description: "O veículo foi removido com sucesso.",
      });
      
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o veículo.",
        variant: "destructive",
      });
    }
  };
  
  // Handle updating dues payment status
  const handleDuesPaymentChange = async (year: number, field: 'paid' | 'exempt', value: boolean) => {
    if (!member) return;
    
    try {
      // Check if payment record exists
      const { data: existingPayment } = await supabase
        .from('dues_payments')
        .select('id')
        .eq('member_id', member.id)
        .eq('year', year)
        .maybeSingle();
        
      if (existingPayment) {
        // Update existing record
        await supabase
          .from('dues_payments')
          .update({ 
            [field]: value,
            // If marking as paid, set payment date
            ...(field === 'paid' && value ? { payment_date: new Date().toISOString() } : {})
          })
          .eq('id', existingPayment.id);
      } else {
        // Create new record
        await supabase
          .from('dues_payments')
          .insert({
            member_id: member.id,
            year: year,
            [field]: value,
            ...(field === 'paid' && value ? { payment_date: new Date().toISOString() } : {})
          });
      }
      
      // Update local state
      setDuesPayments(prev => 
        prev.map(p => p.year === year ? { ...p, [field]: value } : p)
      );
      
      toast({
        title: "Atualizado",
        description: `Status da cota de ${year} atualizado.`,
      });
      
    } catch (error) {
      console.error('Error updating dues payment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o pagamento.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (values: EditMemberFormValues) => {
    if (!member) return;
    setIsSubmitting(true);
    
    try {
      // Update member in database
      const { error } = await supabase
        .from('members')
        .update({
          name: values.name,
          email: values.email,
          phone_main: values.phoneMain,
          phone_alternative: values.phoneAlternative || null,
          nickname: values.nickname || null,
          blood_type: values.bloodType,
          member_type: values.memberType,
          in_whatsapp_group: values.inWhatsAppGroup || false,
          received_member_kit: values.receivedMemberKit || false,
          photo_url: values.photoUrl || null,
        })
        .eq('id', member.id);
        
      if (error) throw error;
    
      // Update only the edited fields
      const editedMember: Member = {
        ...member,
        name: values.name,
        email: values.email,
        phoneMain: values.phoneMain,
        phoneAlternative: values.phoneAlternative,
        nickname: values.nickname,
        bloodType: values.bloodType,
        memberType: values.memberType,
        inWhatsAppGroup: values.inWhatsAppGroup || false,
        receivedMemberKit: values.receivedMemberKit || false,
        photoUrl: values.photoUrl,
        vehicles: vehicles // Include updated vehicles
      };
  
      onSave(editedMember);
      
      toast({
        title: "Membro atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o membro.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Membro</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <MemberFormTabs 
              form={form}
              member={member}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              vehicles={vehicles}
              setVehicles={setVehicles}
              duesPayments={duesPayments}
              setDuesPayments={setDuesPayments}
              isAddVehicleOpen={isAddVehicleOpen}
              setIsAddVehicleOpen={setIsAddVehicleOpen}
              handleDeleteVehicle={handleDeleteVehicle}
              handleDuesPaymentChange={handleDuesPaymentChange}
            />
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                type="button"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "A guardar..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      
      {isAddVehicleOpen && (
        <AddVehicleDialog
          open={isAddVehicleOpen}
          onOpenChange={setIsAddVehicleOpen}
          onSave={handleAddVehicle}
        />
      )}
    </Dialog>
  );
}
