import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Buyer, BuyerStatus } from '../types/buyer';
import { buyerService } from '../services/buyerService';
import { useAuth } from '../contexts/AuthContext';

const Buyers: React.FC = () => {
  const { user } = useAuth();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });
  
  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    try {
      setLoading(true);
      const data = await buyerService.getAll();
      setBuyers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load buyers');
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
      let filteredBuyers: Buyer[] = [];

      if (filters.status) {
        filteredBuyers = await buyerService.getByStatus(filters.status as BuyerStatus);
      } else if (filters.startDate && filters.endDate) {
        filteredBuyers = await buyerService.getByDateRange(
          new Date(filters.startDate),
          new Date(filters.endDate)
        );
      } else {
        filteredBuyers = await buyerService.getAll();
      }

      setBuyers(filteredBuyers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: BuyerStatus) => {
    try {
      await buyerService.update(id, { status: newStatus });
      setBuyers(buyers.map(buyer => 
        buyer.id === id ? { ...buyer, status: newStatus } : buyer
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this buyer?')) {
      try {
        await buyerService.delete(id);
        setBuyers(buyers.filter(buyer => buyer.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete buyer');
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
        <h1 className="text-2xl font-semibold">Buyers</h1>
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
            {Object.values(BuyerStatus).map(status => (
              <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
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
            
      {/* Buyers List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {buyers.map(buyer => (
            <li key={buyer.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {buyer.fullName}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {buyer.email} • {buyer.phone}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Interested in: {buyer.interestedApartmentId}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={buyer.status}
                      onChange={(e) => handleStatusChange(buyer.id, e.target.value as BuyerStatus)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {Object.values(BuyerStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    {user?.isAdmin && (
              <button
                        onClick={() => handleDelete(buyer.id)}
                        className="text-red-600 hover:text-red-800"
              >
                        Delete
              </button>
                    )}
                  </div>
            </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{buyer.message}</p>
          </div>
        </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Buyers;