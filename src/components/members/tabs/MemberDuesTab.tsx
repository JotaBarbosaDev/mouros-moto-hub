
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [foundingDate, setFoundingDate] = useState<string>('2000-01-01');
  const [years, setYears] = useState<number[]>([]);
  
  // Fetch founding date from settings
  useEffect(() => {
    const fetchFoundingDate = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('founding_date')
        .single();
        
      if (!error && data) {
        setFoundingDate(data.founding_date);
        
        // Generate years from founding date to current year
        const foundingYear = new Date(data.founding_date).getFullYear();
        const currentYear = new Date().getFullYear();
        const yearsRange = Array.from(
          { length: currentYear - foundingYear + 1 }, 
          (_, i) => currentYear - i
        );
        setYears(yearsRange);
      }
    };
    
    fetchFoundingDate();
  }, []);
  
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
                  
                  {year === parseInt(foundingDate.split('-')[0]) && (
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
                  )}
                </div>
              </div>
            );
          })
        ) : (
          duesPayments.map(payment => (
            <div 
              key={payment.year} 
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div>
                <p className="font-medium">{payment.year}</p>
                {payment.payment_date && (
                  <p className="text-xs text-gray-500">
                    Data: {new Date(payment.payment_date).toLocaleDateString('pt-PT')}
                  </p>
                )}
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
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`reg-fee-${payment.year}`}
                    checked={payment.registration_fee_paid}
                    onCheckedChange={(checked) => 
                      handleDuesPaymentChange(payment.year, 'registration_fee_paid', !!checked)
                    }
                  />
                  <label
                    htmlFor={`reg-fee-${payment.year}`}
                    className="text-sm font-medium leading-none"
                  >
                    Joia
                  </label>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
