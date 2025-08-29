import api from './api';
import { Buyer, BuyerStatus } from '../types/buyer';

export const buyerService = {
  // Get all buyers
  getAll: async (): Promise<Buyer[]> => {
    const response = await api.get('/buyers');
    return response.data;
  },

  // Get buyer by ID
  getById: async (id: string): Promise<Buyer> => {
    const response = await api.get(`/buyers/${id}`);
    return response.data;
  },

  // Create new buyer
  create: async (buyer: Omit<Buyer, 'id'>): Promise<Buyer> => {
    const response = await api.post('/buyers', buyer);
    const id = response.data; // Backend returns string ID
    return { ...buyer, id, createdAt: new Date(), updatedAt: new Date() } as Buyer;
  },

  // Update buyer
  update: async (id: string, buyer: Partial<Buyer>): Promise<Buyer> => {
    await api.put(`/buyers/${id}`, buyer);
    // Backend returns void, so we need to fetch the updated buyer
    const response = await api.get(`/buyers/${id}`);
    return response.data;
  },

  // Delete buyer
  delete: async (id: string): Promise<void> => {
    await api.delete(`/buyers/${id}`);
  },

  // Get buyers by status
  getByStatus: async (status: BuyerStatus): Promise<Buyer[]> => {
    const response = await api.get(`/buyers/status/${status}`);
    return response.data;
  },

  // Get buyers by apartment
  getByApartment: async (apartmentId: string): Promise<Buyer[]> => {
    const response = await api.get(`/buyers/apartment/${apartmentId}`);
    return response.data;
  },

  // Get buyers by date range
  getByDateRange: async (startDate: Date, endDate: Date): Promise<Buyer[]> => {
    const response = await api.get('/buyers/date-range', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    return response.data;
  }
}; 