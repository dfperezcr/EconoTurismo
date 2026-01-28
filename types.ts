
export interface TourismService {
  id: string;
  name: string;
  basePrice: number;
  durationSeconds: number;
  category: 'accommodation' | 'tour' | 'transport';
  ecoImpact: number;
  requirements: Record<string, number>;
}

export interface ServiceSlot {
  id: number;
  serviceId: string | null;
  startTime: number | null;
  endTime: number | null;
  guestName: string | null;
}

export interface BookingRequest {
  id: string;
  groupName: string;
  servicesNeeded: Record<string, number>;
  totalPay: number;
  urgency: 'low' | 'high';
}

export interface Peer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  ecoScore: number;
  contribution: number;
}

export interface CommunityStats {
  projectGoal: number;
  projectCurrent: number;
  globalEcoStatus: number;
  peers: Peer[];
}

export interface PlayerStats {
  money: number;
  ecoScore: number; // 0-100
  reputation: number;
  inventory: Record<string, number>; 
  upgrades: Record<string, number>; 
  activeBookings: number;
  totalDonated: number;
}

export interface EconomicEvent {
  title: string;
  description: string;
  impact: string;
  concept: string;
  scope: 'local' | 'community';
}

export interface HistoryData {
  time: string;
  revenue: number;
  ecoScore: number;
}
