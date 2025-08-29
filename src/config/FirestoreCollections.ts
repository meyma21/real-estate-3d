import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Collection Names
export const COLLECTIONS = {
  FLOORS: 'floors',
  APARTMENTS: 'apartments',
  BUYERS: 'buyers',
  PICTURES: 'pictures',
  USERS: 'users',
} as const;

// Type Definitions
export interface Floor {
  id: string;
  number: number;
  name: string;
  modelUrl?: string;
  status: 'ACTIVE' | 'UNDER_CONSTRUCTION';
  apartmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Picture {
  id: string;
  apartmentId: string;
  url: string;
  type: 'MAIN' | 'INTERIOR' | 'EXTERIOR' | 'FLOOR_PLAN';
  order: number;
  createdAt: Date;
}

export interface Buyer {
  id: string;
  name: string;
  contact: {
    email: string;
    phone: string;
    address?: string;
  };
  interestedApartments: string[];
  status: 'INTERESTED' | 'VIEWING_SCHEDULED' | 'NEGOTIATING' | 'CONTRACTED';
  notes: string;
  assignedAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Collection References
export const floorsCollection = collection(db, COLLECTIONS.FLOORS);
export const apartmentsCollection = collection(db, COLLECTIONS.APARTMENTS);
export const buyersCollection = collection(db, COLLECTIONS.BUYERS);
export const picturesCollection = collection(db, COLLECTIONS.PICTURES);
export const usersCollection = collection(db, COLLECTIONS.USERS);

// Helper Functions
export const createFloor = async (floor: Omit<Floor, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = doc(floorsCollection);
  const timestamp = new Date();
  await setDoc(docRef, {
    ...floor,
    id: docRef.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return docRef.id;
};

export const createApartment = async (apartment: Omit<Apartment, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = doc(apartmentsCollection);
  const timestamp = new Date();
  await setDoc(docRef, {
    ...apartment,
    id: docRef.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return docRef.id;
};

export const createBuyer = async (buyer: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = doc(buyersCollection);
  const timestamp = new Date();
  await setDoc(docRef, {
    ...buyer,
    id: docRef.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return docRef.id;
};

export const createPicture = async (picture: Omit<Picture, 'id' | 'createdAt'>) => {
  const docRef = doc(picturesCollection);
  const timestamp = new Date();
  await setDoc(docRef, {
    ...picture,
    id: docRef.id,
    createdAt: timestamp,
  });
  return docRef.id;
};

export const getApartmentsByFloor = async (floorId: string) => {
  const q = query(apartmentsCollection, where('floorId', '==', floorId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Apartment);
};

export const getBuyersByApartment = async (apartmentId: string) => {
  const q = query(buyersCollection, where('interestedApartments', 'array-contains', apartmentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Buyer);
};

export const getPicturesByApartment = async (apartmentId: string) => {
  const q = query(picturesCollection, where('apartmentId', '==', apartmentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Picture);
}; 