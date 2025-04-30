
import { useState } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { Save } from "lucide-react";

// Define types for our settings
interface ClubSettings {
  name: string;
  address: string;
  email: string;
  phone: string;
  logo?: string;
}

interface FeesSettings {
  registrationFee: number;
  annualDues: number;
  childDiscount: number;
  exemptHonoraryMembers: boolean;
  exemptAdminMembers: boolean;
}

interface ScaleSettings {
  defaultStartTime: string;
  defaultEndTime: string;
  autoCreateMonthlySchedule: boolean;
  notifyMembersBeforeDays: number;
  excludeHolidays: boolean;
}

interface DefaultSettings {
  defaultMemberPhoto: string;
  defaultMotorcyclePhoto: string;
  defaultQuadPhoto: string;
  defaultBuggyPhoto: string;
}

const Settings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Club Info Form
  const clubInfoSchema = z.object({
    name: z.string().min(1, "Nome do clube é obrigatório"),
    address: z.string().min(1, "Morada é obrigatória"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(1, "Telefone é obrigatório"),
  });

  const clubInfoForm = useForm<z.infer<typeof clubInfoSchema>>({
    resolver: zodResolver(clubInfoSchema),
    defaultValues: {
      name: "Os Mouros",
      address: "Rua Principal, 123, Lisboa",
      email: "contacto@osmouros.pt",
      phone: "212345678",
    },
  });

  // Fees & Dues Form
  const feesSchema = z.object({
    registrationFee: z.coerce.number().min(0, "Valor inválido"),
    annualDues: z.coerce.number().min(0, "Valor inválido"),
    childDiscount: z.coerce.number().min(0).max(100, "Desconto deve ser entre 0 e 100%"),
    exemptHonoraryMembers: z.boolean(),
    exemptAdminMembers: z.boolean(),
  });

  const feesForm = useForm<z.infer<typeof feesSchema>>({
    resolver: zodResolver(feesSchema),
    defaultValues: {
      registrationFee: 50,
      annualDues: 120,
      childDiscount: 50,
      exemptHonoraryMembers: true,
      exemptAdminMembers: false,
    },
  });

  // Scale Settings Form
  const scaleSchema = z.object({
    defaultStartTime: z.string(),
    defaultEndTime: z.string(),
    autoCreateMonthlySchedule: z.boolean(),
    notifyMembersBeforeDays: z.coerce.number().int().min(1, "Deve ser pelo menos 1 dia"),
    excludeHolidays: z.boolean(),
  });

  const scaleForm = useForm<z.infer<typeof scaleSchema>>({
    resolver: zodResolver(scaleSchema),
    defaultValues: {
      defaultStartTime: "18:00",
      defaultEndTime: "23:00",
      autoCreateMonthlySchedule: true,
      notifyMembersBeforeDays: 3,
      excludeHolidays: true,
    },
  });

  // Defaults & Customization Form
  const defaultsSchema = z.object({
    defaultMemberPhoto: z.string().url("URL inválido").optional(),
    defaultMotorcyclePhoto: z.string().url("URL inválido").optional(),
    defaultQuadPhoto: z.string().url("URL inválido").optional(),
    defaultBuggyPhoto: z.string().url("URL inválido").optional(),
  });

  const defaultsForm = useForm<z.infer<typeof defaultsSchema>>({
    resolver: zodResolver(defaultsSchema),
    defaultValues: {
      defaultMemberPhoto: "/placeholders/default-member.jpg",
      defaultMotorcyclePhoto: "/placeholders/default-motorcycle.jpg",
      defaultQuadPhoto: "/placeholders/default-quad.jpg",
      defaultBuggyPhoto: "/placeholders/default-buggy.jpg",
    },
  });

  // Handle form submissions
  const handleClubInfoSubmit = (values: z.infer<typeof clubInfoSchema>) => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Club info saved:", values);
      setIsSaving(false);
      toast({
        title: "Configurações salvas",
        description: "As informações do clube foram atualizadas com sucesso.",
      });
    }, 1000);
  };

  const handleFeesSubmit = (values: z.infer<typeof feesSchema>) => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Fee settings saved:", values);
      setIsSaving(false);
      toast({
        title: "Configurações salvas",
        description: "Os valores de cotas e joias foram atualizados com sucesso.",
      });
    }, 1000);
  };

  const handleScaleSubmit = (values: z.infer<typeof scaleSchema>) => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Scale settings saved:", values);
      setIsSaving(false);
      toast({
        title: "Configurações salvas",
        description: "As configurações de escalas foram atualizadas com sucesso.",
      });
    }, 1000);
  };

  const handleDefaultsSubmit = (values: z.infer<typeof defaultsSchema>) => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Default settings saved:", values);
      setIsSaving(false);
      toast({
        title: "Configurações salvas",
        description: "As configurações de personalização foram atualizadas com sucesso.",
      });
    }, 1000);
  };

  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display text-mouro-black mb-8">
          <span className="text-mouro-red">Configurações</span> do Clube
        </h1>

        <Tabs defaultValue="club-info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="club-info">Informações do Clube</TabsTrigger>
            <TabsTrigger value="fees">Cotas e Joias</TabsTrigger>
            <TabsTrigger value="scales">Escalas</TabsTrigger>
            <TabsTrigger value="defaults">Personalização</TabsTrigger>
          </TabsList>

          {/* Club Information Tab */}
          <TabsContent value="club-info">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Clube</CardTitle>
                <CardDescription>
                  Configure as informações básicas do clube que aparecerão em documentos oficiais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...clubInfoForm}>
                  <form onSubmit={clubInfoForm.handleSubmit(handleClubInfoSubmit)} className="space-y-4">
                    <FormField
                      control={clubInfoForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Clube</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={clubInfoForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Morada</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={clubInfoForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de Contato</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={clubInfoForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <Button type="submit" disabled={isSaving} className="bg-mouro-red hover:bg-mouro-red/90">
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "A guardar..." : "Guardar Alterações"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees & Dues Tab */}
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Cotas e Joias</CardTitle>
                <CardDescription>
                  Configure os valores de cotas anuais e jóias de inscrição para os diferentes tipos de membros.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...feesForm}>
                  <form onSubmit={feesForm.handleSubmit(handleFeesSubmit)} className="space-y-4">
                    <FormField
                      control={feesForm.control}
                      name="registrationFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jóia de Inscrição (€)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Valor a pagar no momento da inscrição como novo sócio.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={feesForm.control}
                      name="annualDues"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cota Anual (€)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Valor da cota anual para sócios adultos.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={feesForm.control}
                      name="childDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desconto para Crianças (%)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Desconto aplicado a sócios crianças.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <Separator className="my-4" />

                    <FormField
                      control={feesForm.control}
                      name="exemptHonoraryMembers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Isentar Membros Honorários</FormLabel>
                            <FormDescription>
                              Membros honorários não pagam cotas anuais.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={feesForm.control}
                      name="exemptAdminMembers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Isentar Membros da Administração</FormLabel>
                            <FormDescription>
                              Membros da administração não pagam cotas anuais.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <Button type="submit" disabled={isSaving} className="bg-mouro-red hover:bg-mouro-red/90">
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "A guardar..." : "Guardar Alterações"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scales Settings Tab */}
          <TabsContent value="scales">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Escalas</CardTitle>
                <CardDescription>
                  Configure os horários padrão e regras para criação automática de escalas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...scaleForm}>
                  <form onSubmit={scaleForm.handleSubmit(handleScaleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={scaleForm.control}
                        name="defaultStartTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário de Início Padrão</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={scaleForm.control}
                        name="defaultEndTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário de Fim Padrão</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={scaleForm.control}
                      name="notifyMembersBeforeDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notificar Membros com Antecedência (dias)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Número de dias de antecedência para notificar os membros escalados.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <Separator className="my-4" />

                    <FormField
                      control={scaleForm.control}
                      name="autoCreateMonthlySchedule"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Criar Escalas Automaticamente</FormLabel>
                            <FormDescription>
                              Gerar automaticamente as escalas para o próximo mês.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={scaleForm.control}
                      name="excludeHolidays"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Excluir Feriados</FormLabel>
                            <FormDescription>
                              Não criar escalas em feriados nacionais.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <Button type="submit" disabled={isSaving} className="bg-mouro-red hover:bg-mouro-red/90">
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "A guardar..." : "Guardar Alterações"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Default Settings & Customization Tab */}
          <TabsContent value="defaults">
            <Card>
              <CardHeader>
                <CardTitle>Personalização</CardTitle>
                <CardDescription>
                  Configure imagens padrão para membros e veículos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...defaultsForm}>
                  <form onSubmit={defaultsForm.handleSubmit(handleDefaultsSubmit)} className="space-y-4">
                    <FormField
                      control={defaultsForm.control}
                      name="defaultMemberPhoto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foto Padrão para Membros (URL)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Imagem padrão para membros sem foto.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={defaultsForm.control}
                      name="defaultMotorcyclePhoto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foto Padrão para Motas (URL)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={defaultsForm.control}
                      name="defaultQuadPhoto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foto Padrão para Moto-Quatros (URL)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={defaultsForm.control}
                      name="defaultBuggyPhoto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foto Padrão para Buggies (URL)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <Button type="submit" disabled={isSaving} className="bg-mouro-red hover:bg-mouro-red/90">
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "A guardar..." : "Guardar Alterações"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MembersLayout>
  );
};

export default Settings;
