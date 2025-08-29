import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Apartment, ApartmentStatus, ApartmentType } from '../../types/apartment';
import { apartmentService } from '../../services/apartmentService';
import { useAuth } from '../../contexts/AuthContext';

const PropertyList: React.FC = () => {
  const { user } = useAuth();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: ''
  });

  useEffect(() => {
    loadApartments();
  }, []);

  const loadApartments = async () => {
    try {
      setLoading(true);
      const data = await apartmentService.getAll();
      setApartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      let filteredApartments: Apartment[] = [];

      // Apply status filter
      if (filters.status) {
        filteredApartments = await apartmentService.getByStatus(filters.status as ApartmentStatus);
      } else {
        filteredApartments = await apartmentService.getAll();
      }

      // Apply type filter
      if (filters.type) {
        filteredApartments = filteredApartments.filter(apt => apt.type === filters.type);
      }

      // Apply price range filter
      if (filters.minPrice || filters.maxPrice) {
        const minPrice = Number(filters.minPrice) || 0;
        const maxPrice = Number(filters.maxPrice) || Infinity;
        filteredApartments = filteredApartments.filter(
          apt => apt.price >= minPrice && apt.price <= maxPrice
        );
      }

      // Apply area range filter
      if (filters.minArea || filters.maxArea) {
        const minArea = Number(filters.minArea) || 0;
        const maxArea = Number(filters.maxArea) || Infinity;
        filteredApartments = filteredApartments.filter(
          apt => apt.area >= minArea && apt.area <= maxArea
        );
      }

      setApartments(filteredApartments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await apartmentService.delete(id);
        setApartments(apartments.filter(apt => apt.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete property');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Properties</h1>
        {user?.isAdmin && (
          <Link
            to="/properties/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add New Property
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All</option>
            {Object.values(ApartmentStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All</option>
            {Object.values(ApartmentType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Price</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Price</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Area</label>
            <input
              type="number"
              name="minArea"
              value={filters.minArea}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Area</label>
            <input
              type="number"
              name="maxArea"
              value={filters.maxArea}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <button
            onClick={applyFilters}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Property List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartments.map(apartment => (
          <div key={apartment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {apartment.images && apartment.images.length > 0 && (
              <img
                src={apartment.images[0]}
                alt={apartment.number}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{apartment.number}</h2>
              <p className="text-gray-600">{apartment.type}</p>
              <p className="text-gray-600">Status: {apartment.status}</p>
              <p className="text-gray-600">Price: ${apartment.price.toLocaleString()}</p>
              <p className="text-gray-600">Area: {apartment.area}m²</p>
              <div className="mt-4 flex justify-between">
                <Link
                  to={`/properties/${apartment.id}`}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  View Details
                </Link>
                {user?.isAdmin && (
                  <div className="space-x-2">
                    <Link
                      to={`/properties/${apartment.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(apartment.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyList; 