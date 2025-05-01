
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
  id: string | number;
  title: string;
  date: string;
  location: string;
  image: string;
  thumbnail?: string;
  type: 'trail' | 'estrada' | 'encontro' | 'solidario';
  description: string;
  participants?: number;
  maxParticipants?: number;
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
}
