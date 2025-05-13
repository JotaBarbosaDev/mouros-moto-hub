import { useState, useEffect } from 'react';
import { useSystemSettings } from '@/hooks/use-system-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Save, Plus, Trash, AlertCircle, CheckCircle, X, FileEdit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FeePayment, ExemptPeriod } from '@/types/settings';
import { cn } from "@/lib/utils";

interface MemberFeesManagerProps {
  memberId: string;
  memberName: string;
  memberJoinDate: string;
}

export default function MemberFeesManager({ memberId, memberName, memberJoinDate }: MemberFeesManagerProps) {
  const [isAddingExemption, setIsAddingExemption] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [exemptPeriods, setExemptPeriods] = useState<ExemptPeriod[]>([]);
  
  const { 
    useMemberFeeSettings,
    useMemberFeePayments,
    useMemberDueYears,
    updateMemberFeeSettings,
    updateFeePayment,
    isUpdatingMemberFeeSettings,
    isUpdatingFeePayment,
  } = useSystemSettings();
  
  // Buscar dados do membro
  const { data: memberSettings, isLoading: isLoadingSettings } = useMemberFeeSettings(memberId);
  const { data: feePayments, isLoading: isLoadingPayments } = useMemberFeePayments(memberId);
  const { data: dueYears, isLoading: isLoadingDueYears } = useMemberDueYears(memberId);
  
  // Esquemas de validação
  const exemptionSchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
    reason: z.string().min(1, "Motivo da isenção é obrigatório"),
  });

  const paymentSchema = z.object({
    amount: z.coerce.number().min(0, "O valor deve ser positivo"),
    paidDate: z.date(),
    receiptNumber: z.string().optional(),
    notes: z.string().optional(),
  });
  
  // Forms
  const exemptionForm = useForm<z.infer<typeof exemptionSchema>>({
    resolver: zodResolver(exemptionSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      reason: "",
    },
  });
  
  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paidDate: new Date(),
      receiptNumber: "",
      notes: "",
    },
  });
  
  // Atualizar dados quando carregados
  useEffect(() => {
    if (memberSettings) {
      setExemptPeriods(memberSettings.exemptPeriods.map(period => ({
        ...period,
        startDate: new Date(period.startDate).toISOString(),
        endDate: new Date(period.endDate).toISOString(),
      })));
    } else if (memberId) {
      // Se não existirem configurações, inicializar com valores padrão
      setExemptPeriods([]);
    }
  }, [memberSettings, memberId]);
  
  // Formato de data para exibição
  const formatDate = (date: string | Date) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };
  
  // Adicionar período de isenção
  const addExemption = (data: z.infer<typeof exemptionSchema>) => {
    const newExemption: ExemptPeriod = {
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      reason: data.reason,
    };
    
    const updatedExemptions = [...exemptPeriods, newExemption];
    setExemptPeriods(updatedExemptions);
    
    // Atualizar configurações do membro
    updateMemberFeeSettings({
      memberId,
      joinDate: memberJoinDate,
      exemptPeriods: updatedExemptions,
    });
    
    setIsAddingExemption(false);
    exemptionForm.reset();
  };
  
  // Remover período de isenção
  const removeExemption = (index: number) => {
    const updatedExemptions = [...exemptPeriods];
    updatedExemptions.splice(index, 1);
    setExemptPeriods(updatedExemptions);
    
    // Atualizar configurações do membro
    updateMemberFeeSettings({
      memberId,
      joinDate: memberJoinDate,
      exemptPeriods: updatedExemptions,
    });
  };
  
  // Registrar pagamento
  const registerPayment = (data: z.infer<typeof paymentSchema>) => {
    if (!selectedYear) return;
    
    const payment: FeePayment = {
      memberId,
      year: selectedYear,
      paid: true,
      paidDate: data.paidDate.toISOString(),
      amount: data.amount,
      receiptNumber: data.receiptNumber,
      notes: data.notes,
    };
    
    // Atualizar pagamento
    updateFeePayment(payment);
    
    setIsAddingPayment(false);
    paymentForm.reset();
    setSelectedYear(null);
  };
  
  // Iniciar pagamento para um ano específico
  const startPaymentForYear = (year: number, amount: number) => {
    setSelectedYear(year);
    paymentForm.setValue('amount', amount);
    setIsAddingPayment(true);
  };
  
  // Marcar pagamento como não pago
  const markAsUnpaid = (year: number) => {
    const payment: FeePayment = {
      memberId,
      year,
      paid: false,
      amount: 0,
    };
    
    // Atualizar pagamento
    updateFeePayment(payment);
  };
  
  if (isLoadingSettings || isLoadingPayments || isLoadingDueYears) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-mouro-red border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-lg font-medium">Carregando...</h2>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Encontrar pagamentos existentes por ano
  const paymentsByYear = feePayments?.reduce<Record<number, FeePayment>>((acc, payment) => {
    acc[payment.year] = payment;
    return acc;
  }, {}) || {};
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Cotas de {memberName}</CardTitle>
          <CardDescription>
            Gerencie as cotas anuais e períodos de isenção do membro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Informações Básicas</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Data de Adesão:</dt>
                <dd>{formatDate(memberJoinDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Estado:</dt>
                <dd>
                  <Badge variant="outline" className="mt-1">
                    Membro Ativo
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Períodos de Isenção</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingExemption(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Isenção
              </Button>
            </div>
            
            {exemptPeriods.length > 0 ? (
              <div className="border rounded-lg">
                <Accordion type="multiple">
                  {exemptPeriods.map((period, index) => (
                    <AccordionItem value={`exemption-${index}`} key={index}>
                      <AccordionTrigger className="px-4">
                        <div className="flex items-center space-x-2">
                          <span>
                            {formatDate(period.startDate)} até{" "}
                            {formatDate(period.endDate)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-2">
                          <p>
                            <strong>Período:</strong>{" "}
                            {formatDate(period.startDate)} até{" "}
                            {formatDate(period.endDate)}
                          </p>
                          <p>
                            <strong>Motivo:</strong> {period.reason}
                          </p>
                          <div className="flex justify-end">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeExemption(index)}
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
              <div className="text-center py-6 border rounded-lg bg-background">
                <p className="text-muted-foreground">
                  Não há períodos de isenção para este membro.
                </p>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Histórico de Cotas</h3>
            
            {dueYears && dueYears.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 bg-muted p-3 font-medium">
                  <div className="col-span-2">Ano</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-3">Pagamento</div>
                  <div className="col-span-3">Observações</div>
                  <div className="col-span-2 text-right">Ações</div>
                </div>
                
                <ScrollArea className="h-[400px]">
                  {dueYears.map((yearData) => {
                    const payment = paymentsByYear[yearData.year];
                    const isPaid = payment?.paid;
                    
                    let statusText = "";
                    let statusVariant = "";
                    
                    if (yearData.clubInactive) {
                      statusText = "Clube Inativo";
                      statusVariant = "outline";
                    } else if (yearData.exempt) {
                      statusText = "Isento";
                      statusVariant = "secondary";
                    } else if (isPaid) {
                      statusText = "Pago";
                      statusVariant = "default";
                    } else if (yearData.shouldPay) {
                      statusText = "Em Dívida";
                      statusVariant = "destructive";
                    } else {
                      statusText = "N/A";
                      statusVariant = "outline";
                    }
                    
                    return (
                      <div 
                        key={yearData.year}
                        className="grid grid-cols-12 p-3 border-b items-center"
                      >
                        <div className="col-span-2 font-medium">{yearData.year}</div>
                        <div className="col-span-2 text-center">
                          <Badge variant={statusVariant as any}>
                            {statusText}
                          </Badge>
                        </div>
                        <div className="col-span-3">
                          {isPaid ? (
                            <div>
                              <p>{payment.amount.toFixed(2)}€</p>
                              <p className="text-xs text-muted-foreground">
                                {payment.paidDate && formatDate(payment.paidDate)}
                              </p>
                              {payment.receiptNumber && (
                                <p className="text-xs text-muted-foreground">
                                  Recibo: {payment.receiptNumber}
                                </p>
                              )}
                            </div>
                          ) : yearData.shouldPay ? (
                            <span className="text-muted-foreground">Não pago</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                        <div className="col-span-3 text-sm">
                          {yearData.clubInactive && yearData.clubInactiveReason && (
                            <span className="text-muted-foreground">
                              {yearData.clubInactiveReason}
                            </span>
                          )}
                          {yearData.exempt && yearData.exemptReason && (
                            <span className="text-muted-foreground">
                              {yearData.exemptReason}
                            </span>
                          )}
                          {payment?.notes && (
                            <span className="text-muted-foreground">
                              {payment.notes}
                            </span>
                          )}
                        </div>
                        <div className="col-span-2 flex justify-end">
                          {yearData.shouldPay && !isPaid ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startPaymentForYear(yearData.year, 60)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Registrar
                            </Button>
                          ) : isPaid ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startPaymentForYear(yearData.year, payment.amount)}
                              >
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => markAsUnpaid(yearData.year)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-6 border rounded-lg bg-background">
                <p className="text-muted-foreground">
                  Não há histórico de cotas para este membro.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog para adicionar período de isenção */}
      <Dialog open={isAddingExemption} onOpenChange={setIsAddingExemption}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Período de Isenção</DialogTitle>
            <DialogDescription>
              Defina um período em que o membro está isento de pagamento de cotas.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...exemptionForm}>
            <form onSubmit={exemptionForm.handleSubmit(addExemption)} className="space-y-4">
              <FormField
                control={exemptionForm.control}
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
                            date > new Date() || date < new Date(memberJoinDate)
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
                control={exemptionForm.control}
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
                            date < exemptionForm.getValues().startDate
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
                control={exemptionForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo da Isenção</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: Direção, Doença prolongada, etc." 
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
                  onClick={() => setIsAddingExemption(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isUpdatingMemberFeeSettings}
                >
                  {isUpdatingMemberFeeSettings ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para adicionar pagamento */}
      <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento de Cota</DialogTitle>
            <DialogDescription>
              {selectedYear && `Registrar pagamento para o ano de ${selectedYear}`}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(registerPayment)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="60.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={paymentForm.control}
                name="paidDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Pagamento</FormLabel>
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
                            date > new Date() || date < new Date(memberJoinDate)
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
                control={paymentForm.control}
                name="receiptNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Recibo (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2025/123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={paymentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações adicionais sobre o pagamento" 
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
                  onClick={() => {
                    setIsAddingPayment(false);
                    setSelectedYear(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isUpdatingFeePayment}
                >
                  {isUpdatingFeePayment ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    "Registrar Pagamento"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
