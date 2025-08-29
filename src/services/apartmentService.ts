import api from './api';
import { Apartment, ApartmentStatus } from '../types/apartment';

export const apartmentService = {
  // Get all apartments
  getAll: async (): Promise<Apartment[]> => {
    const response = await api.get('/apartments');
    return response.data;
  },

  // Get apartment by ID
  getById: async (id: string): Promise<Apartment> => {
    const response = await api.get(`/apartments/${id}`);
    return response.data;
  },

  // Create new apartment
  create: async (apartment: Omit<Apartment, 'id'>): Promise<Apartment> => {
    const response = await api.post('/apartments/simple', apartment);
    return response.data;
  },

  // Update apartment
  update: async (id: string, apartment: Partial<Apartment>): Promise<Apartment> => {
    const response = await api.put(`/apartments/${id}/simple`, apartment);
    return response.data;
  },

  // Delete apartment
  delete: async (id: string): Promise<void> => {
    await api.delete(`/apartments/${id}`);
  },

  // Get apartments by status
  getByStatus: async (status: ApartmentStatus): Promise<Apartment[]> => {
    const response = await api.get(`/apartments/status/${status}`);
    return response.data;
  },

  // Get apartments by type
  getByType: async (type: string): Promise<Apartment[]> => {
    const response = await api.get(`/apartments/type/${type}`);
    return response.data;
  },

  // Get apartments by floor
  getByFloor: async (floorId: string): Promise<Apartment[]> => {
    const response = await api.get(`/apartments/floor/${floorId}`);
    return response.data;
  },

  // Get apartments by price range
  getByPriceRange: async (minPrice: number, maxPrice: number): Promise<Apartment[]> => {
    const response = await api.get('/apartments/price-range', {
      params: { minPrice, maxPrice }
    });
    return response.data;
  },

  // Get apartments by area range
  getByAreaRange: async (minArea: number, maxArea: number): Promise<Apartment[]> => {
    const response = await api.get('/apartments/area-range', {
      params: { minArea, maxArea }
    });
    return response.data;
  }
}; 