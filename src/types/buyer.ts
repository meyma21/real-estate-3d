export enum BuyerStatus {
  INTERESTED = 'INTERESTED',
  NEGOTIATING = 'NEGOTIATING', 
  PURCHASED = 'PURCHASED',
  CANCELLED = 'CANCELLED'
}

export interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'INTERESTED' | 'NEGOTIATING' | 'PURCHASED' | 'CANCELLED';
  interestedApartmentIds?: string[];
  budget?: number;
  notes?: string;
  contactDate?: Date;
  createdAt: Date;
  updatedAt: Date;
} 