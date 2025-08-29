export interface Apartment {
  id: string;
  floorId: string;
  lotNumber: string;
  type: string;
  area: number;
  price: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'UNDER_CONSTRUCTION';
  description: string;
  mediaUrls?: string[];
  model3dUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ApartmentStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'UNDER_CONSTRUCTION';

export interface ApartmentFormData {
  floorId: string;
  lotNumber: string;
  type: string;
  area: number;
  price: number;
  status: ApartmentStatus;
  description: string;
  mediaUrls: string[];
  model3dUrl?: string;
}
