
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSystemSettings } from "@/hooks/use-system-settings";

interface DuesPayment {
  year: number;
  paid: boolean;
  exempt: boolean;
  registration_fee_paid?: boolean;
  payment_date?: string;
}

interface MemberDuesTabProps {
  duesPayments: DuesPayment[];
  handleDuesPaymentChange: (year: number, field: 'paid' | 'exempt' | 'registration_fee_paid', value: boolean) => void;
}

export function MemberDuesTab({
  duesPayments,
  handleDuesPaymentChange
}: MemberDuesTabProps) {
  const { settings, isLoading } = useSystemSettings();
  const [years, setYears] = useState<number[]>([]);
  
  // Generate years from founding date to current year
  useEffect(() => {
    if (settings?.foundingDate) {
      const foundingYear = new Date(settings.foundingDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const yearsRange = Array.from(
        { length: currentYear - foundingYear + 1 }, 
        (_, i) => currentYear - i
      );
      setYears(yearsRange);
    }
  }, [settings]);
  
  if (isLoading) {
    return <div className="py-4">A carregar dados...</div>;
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pagamento de Quotas</h3>
      
      <div className="space-y-3">
        {years.length > 0 ? (
          years.map(year => {
            const payment = duesPayments.find(p => p.year === year) || {
              year,
              paid: false,
              exempt: false,
              registration_fee_paid: false
            };
            
            return (
              <div 
                key={year} 
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div>
                  <p className="font-medium">{year}</p>
                  {payment.payment_date && (
                    <p className="text-xs text-gray-500">
                      Data: {new Date(payment.payment_date).toLocaleDateString('pt-PT')}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`paid-${year}`}
                      checked={payment.paid}
                      onCheckedChange={(checked) => 
                        handleDuesPaymentChange(year, 'paid', !!checked)
                      }
                      disabled={payment.exempt}
                    />
                    <label
                      htmlFor={`paid-${year}`}
                      className={`text-sm font-medium leading-none ${payment.exempt ? 'text-slate-400' : ''}`}
                    >
                      Paga
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`exempt-${year}`}
                      checked={payment.exempt}
                      onCheckedChange={(checked) => 
                        handleDuesPaymentChange(year, 'exempt', !!checked)
                      }
                    />
                    <label
                      htmlFor={`exempt-${year}`}
                      className="text-sm font-medium leading-none"
                    >
                      Isento
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`reg-fee-${year}`}
                      checked={payment.registration_fee_paid}
                      onCheckedChange={(checked) => 
                        handleDuesPaymentChange(year, 'registration_fee_paid', !!checked)
                      }
                    />
                    <label
                      htmlFor={`reg-fee-${year}`}
                      className="text-sm font-medium leading-none"
                    >
                      Joia
                    </label>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Nenhum ano de pagamento configurado. Verifique a data de fundação nas configurações.</p>
          </div>
        )}
      </div>
    </div>
  );
}
