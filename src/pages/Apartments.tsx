import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Eye, Edit, Trash, Search } from 'lucide-react';
import { useData, Apartment, Floor } from '../contexts/DataContext';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Apartments: React.FC = () => {
  const { apartments, floors, loading, addApartment, deleteApartment } = useData();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState<Apartment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newApartment, setNewApartment] = useState<Omit<Apartment, 'id'>>({
    lotNumber: '',
    floorId: '',
    type: '',
    area: 0,
    status: 'AVAILABLE',
    price: 0,
    description: ''
  });
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setNewApartment(prev => ({
      ...prev,
      [name]: name === 'area' || name === 'price' ? parseFloat(value) || 0 : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addApartment(newApartment);
      setIsAddModalOpen(false);
      toast.success('Apartment added successfully');
      
      // Reset form
      setNewApartment({
        lotNumber: '',
        floorId: '',
        type: '',
        area: 0,
        status: 'AVAILABLE',
        price: 0,
        description: ''
      });
    } catch (error) {
      toast.error('Failed to add apartment');
    }
  };
  
  // Handle delete
  const openDeleteModal = (apartment: Apartment) => {
    setApartmentToDelete(apartment);
    setIsDeleteModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (!apartmentToDelete) return;
    
    try {
      await deleteApartment(apartmentToDelete.id);
      setIsDeleteModalOpen(false);
      toast.success('Apartment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete apartment');
    }
  };
  
  // Filter apartments by search term
  const filteredApartments = apartments.filter(apartment => 
    apartment.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apartment.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">Apartments</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Add New Apartment
        </button>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search apartments..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </div>
      </div>
      
      {/* Apartments list */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : filteredApartments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">No apartments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Lot Number</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Floor</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Area (m²)</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApartments.map((apartment) => {
                  const floor = floors.find(f => f.id === apartment.floorId);
                  
                  return (
                    <tr key={apartment.id} className="table-row border-t border-slate-200">
                      <td className="px-4 py-3 font-medium text-slate-700">
                        <Link 
                          to={`/admin/apartments/${apartment.id}`}
                          className="text-teal-600 hover:underline"
                        >
                          {apartment.lotNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{apartment.type}</td>
                      <td className="px-4 py-3 text-slate-700">{floor?.name || '-'}</td>
                      <td className="px-4 py-3 text-slate-700">{apartment.area}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(apartment.price)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={apartment.status} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Link
                          to={`/admin/apartments/${apartment.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/admin/apartments/${apartment.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(apartment)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add Apartment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Apartment"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lotNumber" className="label">Lot Number *</label>
                <input
                  id="lotNumber"
                  name="lotNumber"
                  type="text"
                  className="input"
                  value={newApartment.lotNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="type" className="label">Type *</label>
                <input
                  id="type"
                  name="type"
                  type="text"
                  className="input"
                  placeholder="e.g., 1BR, 2BR, Studio"
                  value={newApartment.type}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="floorId" className="label">Floor *</label>
                <select
                  id="floorId"
                  name="floorId"
                  className="select"
                  value={newApartment.floorId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Floor</option>
                  {floors.map((floor: Floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="label">Status *</label>
                <select
                  id="status"
                  name="status"
                  className="select"
                  value={newApartment.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD">Sold</option>
                  <option value="UNDER_CONSTRUCTION">Under Construction</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="area" className="label">Area (m²) *</label>
                <input
                  id="area"
                  name="area"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={newApartment.area || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="price" className="label">Price *</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="1000"
                  min="0"
                  className="input"
                  value={newApartment.price || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="label">Image URL</label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                className="input"
                placeholder="https://example.com/image.jpg"
                value={newApartment.imageUrl || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label htmlFor="plan2DUrl" className="label">2D Plan URL</label>
              <input
                id="plan2DUrl"
                name="plan2DUrl"
                type="url"
                className="input"
                placeholder="https://example.com/plan.jpg"
                value={newApartment.plan2DUrl || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="input"
                placeholder="Enter apartment description..."
                value={newApartment.description || ''}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Add Apartment'}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Are you sure you want to delete apartment <strong>{apartmentToDelete?.lotNumber}</strong>?
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Apartments;