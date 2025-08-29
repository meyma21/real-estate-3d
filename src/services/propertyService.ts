import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Property {
  id?: string;
  title: string;
  description: string;
  price: number;
  surfaceArea: number;
  numberOfRooms: number;
  numberOfBathrooms: number;
  propertyType: string;
  status: 'available' | 'sold' | 'rented';
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

const COLLECTION_NAME = 'properties';

export const propertyService = {
  // Créer une nouvelle propriété
  async create(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...property,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  },

  // Mettre à jour une propriété
  async update(id: string, property: Partial<Property>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...property,
      updatedAt: new Date()
    });
  },

  // Supprimer une propriété
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  // Obtenir une propriété par son ID
  async getById(id: string): Promise<Property | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Property;
    }
    return null;
  },

  // Rechercher des propriétés avec des filtres
  async search(filters: {
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    city?: string;
  }): Promise<Property[]> {
    const constraints: QueryConstraint[] = [];

    if (filters.propertyType) {
      constraints.push(where('propertyType', '==', filters.propertyType));
    }
    if (filters.minPrice) {
      constraints.push(where('price', '>=', filters.minPrice));
    }
    if (filters.maxPrice) {
      constraints.push(where('price', '<=', filters.maxPrice));
    }
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters.city) {
      constraints.push(where('address.city', '==', filters.city));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(20));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Property[];
  }
}; 