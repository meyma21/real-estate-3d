import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Floor } from '../types/floor';
import { Apartment } from '../types/apartment';
import { Buyer } from '../types/buyer';
import { floorService } from '../services/floorService';
import { apartmentService } from '../services/apartmentService';
import { buyerService } from '../services/buyerService';

// Only define types that are specific to DataContext
export interface ThreeDPlan {
  id: string;
  floorId: string;
  modelUrl: string;
  name: string;
}

interface DataContextType {
  apartments: Apartment[];
  floors: Floor[];
  threeDPlans: ThreeDPlan[];
  buyers: Buyer[];
  loading: boolean;
  error: string | null;
  // CRUD operations
  addApartment: (apartment: Omit<Apartment, 'id'>) => Promise<Apartment>;
  updateApartment: (id: string, apartment: Partial<Apartment>) => Promise<Apartment>;
  deleteApartment: (id: string) => Promise<void>;
  getApartment: (id: string) => Apartment | undefined;
  
  addFloor: (floor: Omit<Floor, 'id'>) => Promise<Floor>;
  updateFloor: (id: string, floor: Partial<Floor>) => Promise<Floor>;
  deleteFloor: (id: string) => Promise<void>;
  
  addThreeDPlan: (plan: Omit<ThreeDPlan, 'id'>) => Promise<ThreeDPlan>;
  updateThreeDPlan: (id: string, plan: Partial<ThreeDPlan>) => Promise<ThreeDPlan>;
  deleteThreeDPlan: (id: string) => Promise<void>;
  
  addBuyer: (buyer: Omit<Buyer, 'id'>) => Promise<Buyer>;
  updateBuyer: (id: string, buyer: Partial<Buyer>) => Promise<Buyer>;
  deleteBuyer: (id: string) => Promise<void>;
}

// Create the context with default values
const DataContext = createContext<DataContextType>({
  apartments: [],
  floors: [],
  threeDPlans: [],
  buyers: [],
  loading: false,
  error: null,
  addApartment: async () => ({ id: '', lotNumber: '', floorId: '', type: '', area: 0, status: 'AVAILABLE', price: 0 }),
  updateApartment: async () => ({ id: '', lotNumber: '', floorId: '', type: '', area: 0, status: 'AVAILABLE', price: 0 }),
  deleteApartment: async () => {},
  getApartment: () => undefined,
  
  addFloor: async () => ({ id: '', name: '', level: 0 }),
  updateFloor: async () => ({ id: '', name: '', level: 0 }),
  deleteFloor: async () => {},
  
  addThreeDPlan: async () => ({ id: '', floorId: '', modelUrl: '', name: '' }),
  updateThreeDPlan: async () => ({ id: '', floorId: '', modelUrl: '', name: '' }),
  deleteThreeDPlan: async () => {},
  
  addBuyer: async () => ({ id: '', name: '', email: '', phone: '', apartmentId: '', createdAt: new Date().toISOString() }),
  updateBuyer: async () => ({ id: '', name: '', email: '', phone: '', apartmentId: '', createdAt: '' }),
  deleteBuyer: async () => {}
});

// Mock data
const mockFloors: Floor[] = [
  { 
    id: 'f0', 
    name: 'Ground Floor', 
    level: 0, 
    description: 'Ground level with main entrance',
    totalApartments: 4,
    buildingId: 'main-building',
    floorNumber: 0,
    area: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrls: [],
    apartmentIds: [],
    topViewHotspots: [],
    angleHotspots: {}
  },
  { 
    id: 'f1', 
    name: 'First Floor', 
    level: 1, 
    description: 'First residential floor',
    totalApartments: 6,
    buildingId: 'main-building',
    floorNumber: 1,
    area: 600,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrls: [],
    apartmentIds: [],
    topViewHotspots: [],
    angleHotspots: {}
  },
  { 
    id: 'f3', 
    name: 'Second Floor', 
    level: 2, 
    description: 'Second residential floor',
    totalApartments: 6,
    buildingId: 'main-building',
    floorNumber: 2,
    area: 600,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrls: [],
    apartmentIds: [],
    topViewHotspots: [],
    angleHotspots: {}
  },
  { 
    id: 'f4', 
    name: 'Third Floor', 
    level: 3, 
    description: 'Third residential floor',
    totalApartments: 4,
    buildingId: 'main-building',
    floorNumber: 3,
    area: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrls: [],
    apartmentIds: [],
    topViewHotspots: [],
    angleHotspots: {}
  }
];

const mockApartments: Apartment[] = [
  { 
    id: 'a1', 
    lotNumber: 'A101', 
    floorId: 'f0', 
    type: '2BR', 
    area: 85, 
    status: 'AVAILABLE', 
    mediaUrls: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
    price: 250000,
    description: 'Spacious 2-bedroom apartment with modern amenities and a beautiful view.',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'a2', 
    lotNumber: 'A102', 
    floorId: 'f0', 
    type: '1BR', 
    area: 65, 
    status: 'SOLD', 
    mediaUrls: ['https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg'],
    price: 180000,
    description: 'Cozy 1-bedroom apartment perfect for singles or couples.',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'a3', 
    lotNumber: 'B201', 
    floorId: 'f1', 
    type: '3BR', 
    area: 110, 
    status: 'UNDER_CONSTRUCTION', 
    mediaUrls: ['https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg'],
    price: 350000,
    description: 'Luxurious 3-bedroom apartment with premium finishes and a large balcony.',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'a4', 
    lotNumber: 'B202', 
    floorId: 'f1', 
    type: '2BR', 
    area: 90, 
    status: 'AVAILABLE', 
    mediaUrls: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'],
    price: 260000,
    description: 'Modern 2-bedroom apartment with an open floor plan and high ceilings.',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'a5', 
    lotNumber: 'C301', 
    floorId: 'f3', 
    type: 'Studio', 
    area: 45, 
    status: 'AVAILABLE', 
    mediaUrls: ['https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'],
    price: 150000,
    description: 'Compact and efficient studio apartment, perfect for city living.',
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

const mockThreeDPlans: ThreeDPlan[] = [
  { id: 'p1', floorId: 'f0', modelUrl: '/models/ground-floor.glb', name: 'Ground Floor 3D Model' },
  { id: 'p2', floorId: 'f1', modelUrl: '/models/ground-floor.glb', name: 'First Floor 3D Model' },
  { id: 'p3', floorId: 'f3', modelUrl: '/models/ground-floor.glb', name: 'Second Floor 3D Model' },
];

// Removed mock buyers - now using real Firestore database via buyerService

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [apartments, setApartments] = useState<Apartment[]>(mockApartments);
  const [floors, setFloors] = useState<Floor[]>(mockFloors);
  const [threeDPlans, setThreeDPlans] = useState<ThreeDPlan[]>(mockThreeDPlans);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from backend API on initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('DataProvider: Loading data from backend API...');
        
        // Load floors from backend
        const backendFloors = await floorService.getAll();
        console.log('DataProvider: Loaded floors from backend:', backendFloors);
        setFloors(backendFloors);
        
        // Load apartments from backend
        const backendApartments = await apartmentService.getAll();
        console.log('DataProvider: Loaded apartments from backend:', backendApartments);
        setApartments(backendApartments);
        
        // Load buyers from backend (real Firestore database)
        const backendBuyers = await buyerService.getAll();
        console.log('DataProvider: Loaded buyers from backend:', backendBuyers);
        setBuyers(backendBuyers);
        
        // Keep 3D plans from localStorage for now
        const storedThreeDPlans = localStorage.getItem('threeDPlans');
        
        if (storedThreeDPlans) {
          const parsedThreeDPlans = JSON.parse(storedThreeDPlans);
          if (Array.isArray(parsedThreeDPlans) && parsedThreeDPlans.length > 0) {
            setThreeDPlans(parsedThreeDPlans);
          } else {
            setThreeDPlans(mockThreeDPlans);
          }
        } else {
          setThreeDPlans(mockThreeDPlans);
        }
        
        console.log('DataProvider: Data loading completed successfully');
      } catch (err) {
        console.error('DataProvider: Error loading data from backend:', err);
        setError('Failed to load data from server');
        
        // Fallback to mock data if backend fails
        setFloors(mockFloors);
        setApartments(mockApartments);
        setThreeDPlans(mockThreeDPlans);
        setBuyers([]); // Start with empty buyers if API fails
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save 3D plans to localStorage whenever they change (buyers now managed via API)
  useEffect(() => {
    try {
      localStorage.setItem('threeDPlans', JSON.stringify(threeDPlans));
    } catch (err) {
      console.error('Error saving data to localStorage:', err);
    }
  }, [threeDPlans]);



  // CRUD operations for Apartments
  const addApartment = async (apartment: Omit<Apartment, 'id'>) => {
    setLoading(true);
    try {
      const newApartment = await apartmentService.create(apartment);
      setApartments(prev => [...prev, newApartment]);
      return newApartment;
    } catch (err) {
      console.error('Error adding apartment:', err);
      setError('Failed to add apartment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateApartment = async (id: string, apartmentUpdate: Partial<Apartment>) => {
    setLoading(true);
    try {
      const updatedApartment = await apartmentService.update(id, apartmentUpdate);
      setApartments(prev => prev.map(apt => 
        apt.id === id ? updatedApartment : apt
      ));
      return updatedApartment;
    } catch (err) {
      console.error('Error updating apartment:', err);
      setError('Failed to update apartment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteApartment = async (id: string) => {
    setLoading(true);
    try {
      await apartmentService.delete(id);
      setApartments(prev => prev.filter(apt => apt.id !== id));
    } catch (err) {
      console.error('Error deleting apartment:', err);
      setError('Failed to delete apartment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getApartment = (id: string) => {
    return apartments.find(apt => apt.id === id);
  };

  // CRUD operations for Floors
  const addFloor = async (floor: Omit<Floor, 'id'>) => {
    setLoading(true);
    try {
      const newFloor = await floorService.create(floor);
      setFloors(prev => [...prev, newFloor]);
      return newFloor;
    } catch (err) {
      console.error('Error adding floor:', err);
      setError('Failed to add floor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFloor = async (id: string, floorUpdate: Partial<Floor>) => {
    setLoading(true);
    try {
      const updatedFloor = await floorService.update(id, floorUpdate);
      setFloors(prev => prev.map(flr => 
        flr.id === id ? updatedFloor : flr
      ));
      return updatedFloor;
    } catch (err) {
      console.error('Error updating floor:', err);
      setError('Failed to update floor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFloor = async (id: string) => {
    setLoading(true);
    try {
      await floorService.delete(id);
      setFloors(prev => prev.filter(flr => flr.id !== id));
    } catch (err) {
      console.error('Error deleting floor:', err);
      setError('Failed to delete floor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for 3D Plans
  const addThreeDPlan = async (plan: Omit<ThreeDPlan, 'id'>) => {
    setLoading(true);
    try {
      const newPlan = { ...plan, id: `p${Date.now()}` };
      setThreeDPlans(prev => [...prev, newPlan]);
      return newPlan;
    } catch (err) {
      setError('Failed to add 3D plan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateThreeDPlan = async (id: string, planUpdate: Partial<ThreeDPlan>) => {
    setLoading(true);
    try {
      const updatedPlans = threeDPlans.map(plan => 
        plan.id === id ? { ...plan, ...planUpdate } : plan
      );
      setThreeDPlans(updatedPlans);
      const updatedPlan = updatedPlans.find(plan => plan.id === id);
      if (!updatedPlan) throw new Error('3D plan not found');
      return updatedPlan;
    } catch (err) {
      setError('Failed to update 3D plan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteThreeDPlan = async (id: string) => {
    setLoading(true);
    try {
      setThreeDPlans(prev => prev.filter(plan => plan.id !== id));
    } catch (err) {
      setError('Failed to delete 3D plan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for Buyers (real Firestore database)  
  const addBuyer = async (buyer: Omit<Buyer, 'id'>) => {
    setLoading(true);
    try {
      console.log('DataProvider: Creating buyer via API...', buyer);
      const newBuyer = await buyerService.create(buyer);
      console.log('DataProvider: Created buyer:', newBuyer);
      setBuyers(prev => [...prev, newBuyer]);
      return newBuyer;
    } catch (err) {
      console.error('DataProvider: Error creating buyer:', err);
      setError('Failed to add buyer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBuyer = async (id: string, buyerUpdate: Partial<Buyer>) => {
    setLoading(true);
    try {
      console.log('DataProvider: Updating buyer via API...', id, buyerUpdate);
      const updatedBuyer = await buyerService.update(id, buyerUpdate);
      console.log('DataProvider: Updated buyer:', updatedBuyer);
      setBuyers(prev => prev.map(byr => byr.id === id ? updatedBuyer : byr));
      return updatedBuyer;
    } catch (err) {
      console.error('DataProvider: Error updating buyer:', err);
      setError('Failed to update buyer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBuyer = async (id: string) => {
    setLoading(true);
    try {
      console.log('DataProvider: Deleting buyer via API...', id);
      await buyerService.delete(id);
      console.log('DataProvider: Deleted buyer:', id);
      setBuyers(prev => prev.filter(byr => byr.id !== id));
    } catch (err) {
      console.error('DataProvider: Error deleting buyer:', err);
      setError('Failed to delete buyer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        apartments,
        floors,
        threeDPlans,
        buyers,
        loading,
        error,
        addApartment,
        updateApartment,
        deleteApartment,
        getApartment,
        addFloor,
        updateFloor,
        deleteFloor,
        addThreeDPlan,
        updateThreeDPlan,
        deleteThreeDPlan,
        addBuyer,
        updateBuyer,
        deleteBuyer
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => useContext(DataContext);