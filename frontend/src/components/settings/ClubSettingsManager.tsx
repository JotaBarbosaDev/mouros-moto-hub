import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  CreditCard,
  Users,
  Shield,
  Bell,
  Image,
  Save,
  RefreshCw
} from 'lucide-react';

// Interface para tipos de dados específicos
interface InactivePeriod {
  startDate?: string;
  endDate?: string;
  reason?: string;
}

interface SocialMediaData {
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

// Schema de validação das configurações do clube (baseado na estrutura real do banco)
const clubSettingsSchema = z.object({
  // Informações básicas
  name: z.string().min(1, 'Nome do clube é obrigatório'),
  shortName: z.string().optional(),
  description: z.string().optional(),
  foundingDate: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  welcomeMessage: z.string().optional(),
  
  // Contato
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  
  // Cores
  primaryColor: z.string().min(1, 'Cor primária é obrigatória'),
  secondaryColor: z.string().min(1, 'Cor secundária é obrigatória'),
  accentColor: z.string().min(1, 'Cor de destaque é obrigatória'),
  textColor: z.string().min(1, 'Cor do texto é obrigatória'),
  
  // Configurações financeiras
  annualFee: z.number().min(0, 'Taxa anual deve ser positiva'),
  feeStartDate: z.string().min(1, 'Data de início das taxas é obrigatória'),
  inactivePeriods: z.array(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    reason: z.string().optional()
  })).optional(),
  
  // Redes sociais (será armazenado em social_media como JSON)
  socialMedia: z.object({
    whatsapp: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    website: z.string().optional()
  }).optional(),
});

type ClubSettingsFormData = z.infer<typeof clubSettingsSchema>;

interface ClubSettings extends ClubSettingsFormData {
  id: string;
  created_at: string;
  updated_at: string;
}

// Interface que mapeia para a estrutura real do banco de dados
interface ClubSettingsDb {
  id: string;
  name: string;
  short_name?: string;
  description?: string;
  founding_date?: string;
  logo_url?: string;
  banner_url?: string;
  welcome_message?: string;
  email?: string;
  phone?: string;
  address?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  text_color?: string;
  annual_fee?: number;
  fee_start_date?: string;
  is_active?: boolean;
  inactive_periods: InactivePeriod[] | null;
  social_media: SocialMediaData | null;
  created_at?: string;
  updated_at?: string;
}

export function ClubSettingsManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ClubSettings | null>(null);
  
  const form = useForm<ClubSettingsFormData>({
    resolver: zodResolver(clubSettingsSchema),
    defaultValues: {
      name: '',
      shortName: '',
      description: '',
      foundingDate: new Date().getFullYear().toString() + '-01-01',
      logoUrl: '',
      bannerUrl: '',
      welcomeMessage: '',
      email: '',
      phone: '',
      address: '',
      primaryColor: '#e11d48',
      secondaryColor: '#27272a',
      accentColor: '#f59e0b',
      textColor: '#27272a',
      annualFee: 60,
      feeStartDate: new Date().getFullYear().toString() + '-01-01',
      inactivePeriods: [],
      socialMedia: {
        whatsapp: '',
        facebook: '',
        instagram: '',
        website: ''
      }
    }
  });

  // Carregar configurações existentes
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('club_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as configurações do clube.',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        const dbData = data as ClubSettingsDb;
        setSettings({
          ...dbData,
          created_at: dbData.created_at || '',
          updated_at: dbData.updated_at || ''
        } as ClubSettings);
        
        // Mapear dados do banco para o formato do formulário
        const formData: ClubSettingsFormData = {
          name: dbData.name || '',
          shortName: dbData.short_name || '',
          description: dbData.description || '',
          foundingDate: dbData.founding_date ? dbData.founding_date.split('T')[0] : '',
          logoUrl: dbData.logo_url || '',
          bannerUrl: dbData.banner_url || '',
          welcomeMessage: dbData.welcome_message || '',
          email: dbData.email || '',
          phone: dbData.phone || '',
          address: dbData.address || '',
          primaryColor: dbData.primary_color || '#e11d48',
          secondaryColor: dbData.secondary_color || '#27272a',
          accentColor: dbData.accent_color || '#f59e0b',
          textColor: dbData.text_color || '#27272a',
          annualFee: dbData.annual_fee || 60,
          feeStartDate: dbData.fee_start_date ? dbData.fee_start_date.split('T')[0] : '',
          inactivePeriods: Array.isArray(dbData.inactive_periods) ? dbData.inactive_periods : [],
          socialMedia: (dbData.social_media as SocialMediaData) || {
            whatsapp: '',
            facebook: '',
            instagram: '',
            website: ''
          }
        };
        
        form.reset(formData);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao carregar configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [form, toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const onSubmit = async (data: ClubSettingsFormData) => {
    try {
      setIsSaving(true);

      // Mapear dados do formulário para a estrutura do banco
      const settingsData = {
        name: data.name,
        short_name: data.shortName || '',
        description: data.description || null,
        founding_date: data.foundingDate ? data.foundingDate + 'T00:00:00Z' : null,
        logo_url: data.logoUrl || null,
        banner_url: data.bannerUrl || null,
        welcome_message: data.welcomeMessage || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        primary_color: data.primaryColor,
        secondary_color: data.secondaryColor,
        accent_color: data.accentColor,
        text_color: data.textColor,
        annual_fee: data.annualFee,
        fee_start_date: data.feeStartDate ? data.feeStartDate + 'T00:00:00Z' : null,
        inactive_periods: data.inactivePeriods || [],
        social_media: data.socialMedia || {},
        updated_at: new Date().toISOString(),
      };

      let result;
      
      if (settings) {
        // Atualizar configurações existentes
        result = await supabase
          .from('club_settings')
          .update(settingsData)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Criar novas configurações
        result = await supabase
          .from('club_settings')
          .insert({
            ...settingsData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setSettings(result.data as ClubSettings);
      
      toast({
        title: 'Sucesso',
        description: 'Configurações do clube salvas com sucesso.',
      });

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-gray-400 mb-2 animate-spin" />
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações do Clube</h2>
          <p className="text-gray-600">Gerir as configurações gerais do Mouros Moto Hub</p>
        </div>
        {settings && (
          <Badge variant="outline" className="text-sm">
            Última atualização: {new Date(settings.updated_at).toLocaleDateString('pt-PT')}
          </Badge>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">
                <Settings className="w-4 h-4 mr-2" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="contact">
                <Mail className="w-4 h-4 mr-2" />
                Contacto
              </TabsTrigger>
              <TabsTrigger value="financial">
                <CreditCard className="w-4 h-4 mr-2" />
                Financeiro
              </TabsTrigger>
            </TabsList>

            {/* Aba Geral */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>
                    Configurações básicas do clube
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Clube *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Mouros Moto Hub" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shortName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Abreviado</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="MMH" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="foundingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Fundação</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Descrição do clube..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo (URL)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/logo.png" />
                        </FormControl>
                        <FormDescription>
                          URL da imagem do logo do clube
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bannerUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner (URL)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/banner.png" />
                        </FormControl>
                        <FormDescription>
                          URL da imagem do banner do clube
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="welcomeMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem de Boas-vindas</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Bem-vindos ao Mouros Moto Hub..."
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cores do Tema</CardTitle>
                  <CardDescription>
                    Configurar as cores da aplicação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Primária</FormLabel>
                          <FormControl>
                            <Input {...field} type="color" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Secundária</FormLabel>
                          <FormControl>
                            <Input {...field} type="color" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor de Destaque</FormLabel>
                          <FormControl>
                            <Input {...field} type="color" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="textColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor do Texto</FormLabel>
                          <FormControl>
                            <Input {...field} type="color" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Contacto */}
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contacto</CardTitle>
                  <CardDescription>
                    Dados de contacto e localização do clube
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="contato@mourosmotohub.pt" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+351 912 345 678" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Rua das Flores, 123, Lisboa, Portugal"
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Redes Sociais</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="socialMedia.whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://chat.whatsapp.com/..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialMedia.facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://facebook.com/..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialMedia.instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://instagram.com/..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialMedia.website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://mourosmotohub.pt" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Financeiro */}
            <TabsContent value="financial" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Financeiras</CardTitle>
                  <CardDescription>
                    Taxas e configurações de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="annualFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa Anual (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="feeStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início das Taxas</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={loadSettings}
              disabled={isSaving}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configurações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
