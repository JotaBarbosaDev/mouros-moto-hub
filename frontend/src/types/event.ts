/**
 * Tipos relacionados a eventos
 */

// Mantendo compatibilidade com a tipagem existente
export type EventType = 'trail' | 'estrada' | 'encontro' | 'solidario' | 'visita' | 'visita_recebida' | 'concentracao' | 'interno';
export type EventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export interface Motorcycle {
  id?: string;
  make: string;
  model: string;
  engineSize: number;
}

export interface Participant {
  id: string;
  name: string;
  memberNumber?: number;
  motorcycle?: Motorcycle;
}

export interface ScheduleItem {
  time: string;
  description: string;
}

export interface StopPoint {
  name: string;
  description: string;
  image?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  type: EventType;
  imageUrl?: string;
  isPublic: boolean;
  status: EventStatus;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  participants?: EventParticipant[];
  
  // Campos adicionais para compatibilidade com o código existente
  date?: string; // Data formatada para exibição
  image?: string; // Imagem do evento
  thumbnail?: string; // Miniatura do evento
  isFeatured?: boolean;
  membersOnly?: boolean;
  registrationDeadline?: string;
  memberPrice?: number;
  nonMemberPrice?: number;
  minEngineSize?: number;
  schedule?: ScheduleItem[];
  startPoint?: string;
  endPoint?: string;
  stops?: StopPoint[];
  externalFormLink?: string;
  registeredParticipants?: Participant[];
  registrationOpen?: boolean;
  _isoDate?: string; // Propriedade para armazenar a data ISO para uso interno
  maxParticipants?: number;
}

export interface EventParticipant {
  eventId: string;
  memberId: string;
  memberName?: string;
  memberUsername?: string;
}
