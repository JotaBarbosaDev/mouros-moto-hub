
import { Checkbox } from "@/components/ui/checkbox";

interface MemberDuesTabProps {
  duesPayments: {year: number, paid: boolean, exempt: boolean}[];
  handleDuesPaymentChange: (year: number, field: 'paid' | 'exempt', value: boolean) => void;
}

export function MemberDuesTab({
  duesPayments,
  handleDuesPaymentChange
}: MemberDuesTabProps) {
  return (
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
  );
}
