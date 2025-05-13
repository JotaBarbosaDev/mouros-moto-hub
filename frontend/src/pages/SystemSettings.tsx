import { useState, useEffect } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Save, Plus, Trash, AlertCircle, CheckCircle, X, FileImage } from "lucide-react";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { ClubSettings, InactivePeriod } from "@/types/settings";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const SystemSettings = () => {
  const { toast } = useToast();
  const { 
    clubSettings,
    isLoadingClubSettings,
    updateClubSettings,
    isUpdatingClubSettings
  } = useSystemSettings();
  
  const [activeTab, setActiveTab] = useState("club-identity");
  const [isAddingInactivePeriod, setIsAddingInactivePeriod] = useState(false);
  const [inactivePeriods, setInactivePeriods] = useState<InactivePeriod[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // Form schema for club identity
  const clubIdentitySchema = z.object({
    name: z.string().min(1, "Nome do clube é obrigatório"),
    shortName: z.string().min(1, "Nome curto é obrigatório"),
    foundingDate: z.date(),
    logoUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
    primaryColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, "Formato de cor inválido"),
    secondaryColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, "Formato de cor inválido"),
    accentColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, "Formato de cor inválido"),
    textColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, "Formato de cor inválido"),
    address: z.string().optional(),
    email: z.string().email("Email inválido").optional(),
    phone: z.string().optional(),
    description: z.string().optional(),
    welcomeMessage: z.string().optional(),
  });
  
  // Form schema for membership fees
  const membershipFeesSchema = z.object({
    annualFee: z.coerce.number().min(0, "O valor da cota anual não pode ser negativo"),
    feeStartDate: z.date(),
  });
  
  // Form schema for inactive period
  const inactivePeriodSchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
    reason: z.string().optional(),
  });
  
  // Initialize forms with resolver
  const clubIdentityForm = useForm<z.infer<typeof clubIdentitySchema>>({
    resolver: zodResolver(clubIdentitySchema),
    defaultValues: {
      name: "",
      shortName: "",
      foundingDate: new Date(),
      primaryColor: "#e11d48",
      secondaryColor: "#27272a",
      accentColor: "#f59e0b",
      textColor: "#27272a",
    },
  });
  
  const membershipFeesForm = useForm<z.infer<typeof membershipFeesSchema>>({
    resolver: zodResolver(membershipFeesSchema),
    defaultValues: {
      annualFee: 60,
      feeStartDate: new Date(),
    },
  });
  
  const inactivePeriodForm = useForm<z.infer<typeof inactivePeriodSchema>>({
    resolver: zodResolver(inactivePeriodSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      reason: "",
    },
  });
  
  // Update forms when data is loaded
  useEffect(() => {
    if (clubSettings) {
      clubIdentityForm.reset({
        name: clubSettings.name,
        shortName: clubSettings.shortName,
        foundingDate: new Date(clubSettings.foundingDate),
        logoUrl: clubSettings.logoUrl,
        bannerUrl: clubSettings.bannerUrl,
        primaryColor: clubSettings.primaryColor,
        secondaryColor: clubSettings.secondaryColor,
        accentColor: clubSettings.accentColor,
        textColor: clubSettings.textColor,
        address: clubSettings.address,
        email: clubSettings.email,
        phone: clubSettings.phone,
        description: clubSettings.description,
        welcomeMessage: clubSettings.welcomeMessage,
      });
      
      membershipFeesForm.reset({
        annualFee: clubSettings.annualFee,
        feeStartDate: new Date(clubSettings.feeStartDate),
      });
      
      if (clubSettings.inactivePeriods) {
        const formattedPeriods = clubSettings.inactivePeriods.map(period => ({
          ...period,
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate),
        }));
        setInactivePeriods(formattedPeriods);
      }
      
      setLogoPreview(clubSettings.logoUrl);
      setBannerPreview(clubSettings.bannerUrl);
    }
  }, [clubSettings]);
  
  // Handle form submissions
  const onSubmitIdentity = (data: z.infer<typeof clubIdentitySchema>) => {
    updateClubSettings({
      name: data.name,
      shortName: data.shortName,
      foundingDate: data.foundingDate.toISOString(),
      logoUrl: data.logoUrl,
      bannerUrl: data.bannerUrl,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      accentColor: data.accentColor,
      textColor: data.textColor,
      address: data.address,
      email: data.email,
      phone: data.phone,
      description: data.description,
      welcomeMessage: data.welcomeMessage,
    });
  };
  
  const onSubmitMembershipFees = (data: z.infer<typeof membershipFeesSchema>) => {
    updateClubSettings({
      annualFee: data.annualFee,
      feeStartDate: data.feeStartDate.toISOString(),
    });
  };
  
  // Handle inactive periods
  const addInactivePeriod = (data: z.infer<typeof inactivePeriodSchema>) => {
    const newInactivePeriod: InactivePeriod = {
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      reason: data.reason,
    };
    
    const updatedPeriods = [...inactivePeriods, newInactivePeriod];
    setInactivePeriods(updatedPeriods);
    
    // Update club settings with new inactive periods
    updateClubSettings({
      inactivePeriods: updatedPeriods,
    });
    
    setIsAddingInactivePeriod(false);
    inactivePeriodForm.reset();
  };
  
  const removeInactivePeriod = (index: number) => {
    const updatedPeriods = [...inactivePeriods];
    updatedPeriods.splice(index, 1);
    setInactivePeriods(updatedPeriods);
    
    // Update club settings with updated inactive periods
    updateClubSettings({
      inactivePeriods: updatedPeriods,
    });
  };
  
  // Handle file uploads for logo and banner
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        clubIdentityForm.setValue("logoUrl", base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBannerPreview(base64String);
        clubIdentityForm.setValue("bannerUrl", base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };
  
  if (isLoadingClubSettings) {
    return (
      <MembersLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-mouro-red border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-medium">Carregando configurações...</h2>
          </div>
        </div>
      </MembersLayout>
    );
  }

  return (
    <MembersLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Configurações do Sistema</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-2">
            <TabsTrigger value="club-identity">Identidade do Clube</TabsTrigger>
            <TabsTrigger value="membership-fees">Cotas e Períodos</TabsTrigger>
          </TabsList>
          
          {/* Identidade do Clube */}
          <TabsContent value="club-identity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Configure as informações básicas do clube como nome e data de fundação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...clubIdentityForm}>
                  <form onSubmit={clubIdentityForm.handleSubmit(onSubmitIdentity)} className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <FormField
                        control={clubIdentityForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Clube</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome completo do clube" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={clubIdentityForm.control}
                        name="shortName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Curto</FormLabel>
                            <FormControl>
                              <Input placeholder="Abreviação ou nome curto" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={clubIdentityForm.control}
                        name="foundingDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data de Fundação</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      formatDate(field.value)
                                    ) : (
                                      <span>Selecione uma data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-xl font-semibold mb-4">Logo e Banner</h3>
                    
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-4">
                        <Label htmlFor="logo" className="block">Logo do Clube</Label>
                        <div className="flex flex-col space-y-2">
                          <div className="border border-input bg-background flex items-center justify-center w-full h-40 rounded-md overflow-hidden">
                            {logoPreview ? (
                              <img 
                                src={logoPreview} 
                                alt="Logo do clube" 
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <FileImage className="h-16 w-16 text-muted-foreground opacity-50" />
                            )}
                          </div>
                          <input 
                            type="file" 
                            id="logo"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => document.getElementById('logo')?.click()}
                          >
                            Carregar Logo
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label htmlFor="banner" className="block">Banner</Label>
                        <div className="flex flex-col space-y-2">
                          <div className="border border-input bg-background flex items-center justify-center w-full h-40 rounded-md overflow-hidden">
                            {bannerPreview ? (
                              <img 
                                src={bannerPreview} 
                                alt="Banner do clube" 
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <FileImage className="h-16 w-16 text-muted-foreground opacity-50" />
                            )}
                          </div>
                          <input 
                            type="file" 
                            id="banner"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="hidden"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => document.getElementById('banner')?.click()}
                          >
                            Carregar Banner
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-xl font-semibold mb-4">Cores e Tema</h3>
                    
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <FormField
                        control={clubIdentityForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor Primária</FormLabel>
                            <div className="flex space-x-2">
                              <input 
                                type="color"
                                onChange={(e) => field.onChange(e.target.value)}
                                value={field.value}
                                className="w-8 h-8 cursor-pointer"
                              />
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={clubIdentityForm.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor Secundária</FormLabel>
                            <div className="flex space-x-2">
                              <input 
                                type="color"
                                onChange={(e) => field.onChange(e.target.value)}
                                value={field.value}
                                className="w-8 h-8 cursor-pointer"
                              />
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={clubIdentityForm.control}
                        name="accentColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor de Destaque</FormLabel>
                            <div className="flex space-x-2">
                              <input 
                                type="color"
                                onChange={(e) => field.onChange(e.target.value)}
                                value={field.value}
                                className="w-8 h-8 cursor-pointer"
                              />
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={clubIdentityForm.control}
                        name="textColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor do Texto</FormLabel>
                            <div className="flex space-x-2">
                              <input 
                                type="color"
                                onChange={(e) => field.onChange(e.target.value)}
                                value={field.value}
                                className="w-8 h-8 cursor-pointer"
                              />
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-xl font-semibold mb-4">Informações de Contato</h3>
                    
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <FormField
                        control={clubIdentityForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Morada</FormLabel>
                            <FormControl>
                              <Input placeholder="Morada do clube" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={clubIdentityForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Email do clube" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={clubIdentityForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="Telefone do clube" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-xl font-semibold mb-4">Descrições</h3>
                    
                    <div className="space-y-6">
                      <FormField
                        control={clubIdentityForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição do Clube</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Breve descrição do clube" 
                                className="min-h-24"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={clubIdentityForm.control}
                        name="welcomeMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensagem de Boas-vindas</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Mensagem de boas-vindas para novos membros" 
                                className="min-h-24"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={isUpdatingClubSettings}
                    >
                      {isUpdatingClubSettings ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Cotas e Períodos */}
          <TabsContent value="membership-fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Cotas</CardTitle>
                <CardDescription>
                  Configure os valores das cotas anuais e data de início
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...membershipFeesForm}>
                  <form onSubmit={membershipFeesForm.handleSubmit(onSubmitMembershipFees)} className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <FormField
                        control={membershipFeesForm.control}
                        name="annualFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor da Cota Anual (€)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0"
                                placeholder="60.00" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              O valor padrão que cada membro deve pagar anualmente.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={membershipFeesForm.control}
                        name="feeStartDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data de Início das Cotas</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      formatDate(field.value)
                                    ) : (
                                      <span>Selecione uma data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Data a partir da qual começamos a contabilizar as cotas.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={isUpdatingClubSettings}
                    >
                      {isUpdatingClubSettings ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Configurações de Cotas
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Períodos de Inatividade</CardTitle>
                <CardDescription>
                  Adicione períodos em que o clube esteve inativo e não são cobradas cotas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingInactivePeriod(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Período Inativo
                  </Button>
                  
                  {inactivePeriods.length > 0 ? (
                    <div className="border rounded-lg">
                      <Accordion type="multiple">
                        {inactivePeriods.map((period, index) => (
                          <AccordionItem value={`period-${index}`} key={index}>
                            <AccordionTrigger className="px-4">
                              <div className="flex items-center space-x-2">
                                <span>
                                  {format(new Date(period.startDate), "dd/MM/yyyy", { locale: ptBR })} até{" "}
                                  {format(new Date(period.endDate), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="space-y-2">
                                <p>
                                  <strong>Período:</strong>{" "}
                                  {format(new Date(period.startDate), "dd/MM/yyyy", { locale: ptBR })} até{" "}
                                  {format(new Date(period.endDate), "dd/MM/yyyy", { locale: ptBR })}
                                </p>
                                {period.reason && (
                                  <p>
                                    <strong>Motivo:</strong> {period.reason}
                                  </p>
                                )}
                                <div className="flex justify-end">
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => removeInactivePeriod(index)}
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-lg bg-background">
                      <p className="text-muted-foreground">
                        Não há períodos de inatividade registrados.
                      </p>
                    </div>
                  )}
                  
                  <Dialog open={isAddingInactivePeriod} onOpenChange={setIsAddingInactivePeriod}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Adicionar Período de Inatividade</DialogTitle>
                        <DialogDescription>
                          Defina um período em que o clube esteve inativo e não cobrou cotas.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...inactivePeriodForm}>
                        <form onSubmit={inactivePeriodForm.handleSubmit(addInactivePeriod)} className="space-y-4">
                          <FormField
                            control={inactivePeriodForm.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Data de Início</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          formatDate(field.value)
                                        ) : (
                                          <span>Selecione uma data</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={inactivePeriodForm.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Data de Fim</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          formatDate(field.value)
                                        ) : (
                                          <span>Selecione uma data</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date < inactivePeriodForm.getValues().startDate || 
                                        date > new Date()
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={inactivePeriodForm.control}
                            name="reason"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Motivo (Opcional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Descreva o motivo do período de inatividade" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter className="sm:justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsAddingInactivePeriod(false)}
                            >
                              Cancelar
                            </Button>
                            <Button type="submit">
                              Adicionar Período
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MembersLayout>
  );
};

export default SystemSettings;
