
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Member, BloodType, MemberType, Vehicle } from "@/types/member";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/common/FileUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Trash } from "lucide-react";
import { AddVehicleDialog } from "@/components/garage/AddVehicleDialog";

interface EditMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (editedMember: Member) => void;
}

// Create a Zod schema that matches the BloodType type
const bloodTypeSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional();
const memberTypeSchema = z.enum(['Sócio Adulto', 'Sócio Criança', 'Administração', 'Convidado']);

const editMemberSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phoneMain: z.string().min(1, "Telefone principal é obrigatório"),
  phoneAlternative: z.string().optional(),
  nickname: z.string().optional(),
  bloodType: bloodTypeSchema,
  memberType: memberTypeSchema,
  inWhatsAppGroup: z.boolean().optional(),
  receivedMemberKit: z.boolean().optional(),
  photoUrl: z.string().optional(),
});

type EditMemberFormValues = z.infer<typeof editMemberSchema>;

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
  
  if (!member) return null;

  const handleSubmit = async (values: EditMemberFormValues) => {
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
  
  const getMemberInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Membro</DialogTitle>
        </DialogHeader>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="vehicles">Veículos</TabsTrigger>
            <TabsTrigger value="dues">Quotas</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <TabsContent value="basic">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="photoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foto de Perfil</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-20 w-20">
                                {field.value ? (
                                  <AvatarImage src={field.value} alt={member.name} />
                                ) : (
                                  <AvatarFallback>{getMemberInitials(member.name)}</AvatarFallback>
                                )}
                              </Avatar>
                              <FileUpload
                                currentImageUrl={field.value}
                                onUploadComplete={(url) => form.setValue("photoUrl", url)}
                                bucketName="members"
                                folderPath="photos"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alcunha</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneMain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Principal</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneAlternative"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Alternativo</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Sanguíneo</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo sanguíneo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="status">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="memberType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Membro</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de membro" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sócio Adulto">Sócio Adulto</SelectItem>
                                <SelectItem value="Sócio Criança">Sócio Criança</SelectItem>
                                <SelectItem value="Administração">Administração</SelectItem>
                                <SelectItem value="Convidado">Convidado</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="inWhatsAppGroup"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Grupo WhatsApp
                            </FormLabel>
                            <FormDescription>
                              O membro está incluído no grupo de WhatsApp
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="receivedMemberKit"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Kit de Membro
                            </FormLabel>
                            <FormDescription>
                              O membro recebeu o kit completo
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="vehicles">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Veículos</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddVehicleOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Veículo
                    </Button>
                  </div>
                  
                  {vehicles.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500">Nenhum veículo registado para este membro.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {vehicles.map(vehicle => (
                        <div 
                          key={vehicle.id} 
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{vehicle.type}</Badge>
                            <div>
                              <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                              <p className="text-sm text-slate-500">
                                {vehicle.displacement}cc
                                {vehicle.nickname && ` - ${vehicle.nickname}`}
                              </p>
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="dues">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pagamento de Quotas</h3>
                  
                  <div className="space-y-3">
                    {duesPayments.map(payment => (
                      <div 
                        key={payment.year} 
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{payment.year}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`paid-${payment.year}`}
                              checked={payment.paid}
                              onCheckedChange={(checked) => 
                                handleDuesPaymentChange(payment.year, 'paid', !!checked)
                              }
                              disabled={payment.exempt}
                            />
                            <label
                              htmlFor={`paid-${payment.year}`}
                              className={`text-sm font-medium leading-none ${payment.exempt ? 'text-slate-400' : ''}`}
                            >
                              Paga
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`exempt-${payment.year}`}
                              checked={payment.exempt}
                              onCheckedChange={(checked) => 
                                handleDuesPaymentChange(payment.year, 'exempt', !!checked)
                              }
                            />
                            <label
                              htmlFor={`exempt-${payment.year}`}
                              className="text-sm font-medium leading-none"
                            >
                              Isento
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
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
        </Tabs>
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
