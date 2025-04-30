
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Member } from "@/types/member";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ViewMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewMemberDialog({ member, open, onOpenChange }: ViewMemberDialogProps) {
  if (!member) return null;

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Membro</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={member.photoUrl} alt={member.name} />
              <AvatarFallback>{getMemberInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-semibold">{member.name}</h3>
              {member.nickname && (
                <p className="text-gray-500">{member.nickname}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Informações Básicas</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Número de Sócio</dt>
                  <dd>{member.memberNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Tipo de Membro</dt>
                  <dd><Badge>{member.memberType}</Badge></dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Data de Entrada</dt>
                  <dd>{new Date(member.joinDate).toLocaleDateString('pt-BR')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Tipo Sanguíneo</dt>
                  <dd>{member.bloodType}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Contato</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd>{member.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Telefone Principal</dt>
                  <dd>{member.phoneMain}</dd>
                </div>
                {member.phoneAlternative && (
                  <div>
                    <dt className="text-sm text-gray-500">Telefone Alternativo</dt>
                    <dd>{member.phoneAlternative}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Morada</h4>
            <p>
              {member.address.street}, {member.address.number}<br />
              {member.address.postalCode} {member.address.city}<br />
              {member.address.district}, {member.address.country}
            </p>
          </div>

          {member.vehicles.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Veículos ({member.vehicles.length})</h4>
              <ul className="space-y-2">
                {member.vehicles.map((vehicle) => (
                  <li key={vehicle.id} className="flex items-center gap-2">
                    <Badge variant="outline">{vehicle.type}</Badge>
                    {vehicle.brand} {vehicle.model} ({vehicle.displacement}cc)
                    {vehicle.nickname && <span className="text-gray-500">- {vehicle.nickname}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Status</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Sócio Antigo</dt>
                  <dd>{member.legacyMember ? "Sim" : "Não"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Sócio Honorário</dt>
                  <dd>{member.honoraryMember ? "Sim" : "Não"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">No Grupo WhatsApp</dt>
                  <dd>{member.inWhatsAppGroup ? "Sim" : "Não"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Kit de Sócio</dt>
                  <dd>{member.receivedMemberKit ? "Recebido" : "Pendente"}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Pagamentos</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Jóia de Entrada</dt>
                  <dd>
                    {member.registrationFeeExempt
                      ? "Isento"
                      : member.registrationFeePaid
                      ? "Pago"
                      : "Pendente"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Cotas Anuais</dt>
                  <dd>
                    <ul className="space-y-1">
                      {member.duesPayments.map((payment) => (
                        <li key={payment.year}>
                          {payment.year}:{" "}
                          {payment.exempt
                            ? "Isento"
                            : payment.paid
                            ? `Pago (${new Date(payment.date!).toLocaleDateString('pt-BR')})`
                            : "Pendente"}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
