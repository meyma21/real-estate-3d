import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Upload,
  Eye,
  DollarSign,
  Home,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Apartment } from '../../types/apartment';
import { Floor } from '../../types/floor';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

interface ApartmentFormData {
  floorId: string;
  lotNumber: string;
  type: string;
  area: number;
  price: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'UNDER_CONSTRUCTION';
  description: string;
  mediaUrls: string[];
  model3dUrl?: string;
}

const ApartmentManagement: React.FC = () => {
  const { apartments, floors, addApartment, updateApartment, deleteApartment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [floorFilter, setFloorFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [formData, setFormData] = useState<ApartmentFormData>({
    floorId: '',
    lotNumber: '',
    type: '',
    area: 0,
    price: 0,
    status: 'AVAILABLE',
    description: '',
    mediaUrls: [],
    model3dUrl: ''
  });

  const filteredApartments = apartments.filter(apartment => {
    const matchesSearch = 
      apartment.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apartment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apartment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || apartment.status === statusFilter;
    const matchesFloor = floorFilter === 'ALL' || apartment.floorId === floorFilter;

    return matchesSearch && matchesStatus && matchesFloor;
  });

  const handleOpenModal = (apartment?: Apartment) => {
    if (apartment) {
      setEditingApartment(apartment);
      setFormData({
        floorId: apartment.floorId,
        lotNumber: apartment.lotNumber,
        type: apartment.type,
        area: apartment.area,
        price: apartment.price,
        status: apartment.status,
        description: apartment.description,
        mediaUrls: apartment.mediaUrls || [],
        model3dUrl: apartment.model3dUrl || ''
      });
    } else {
      setEditingApartment(null);
      setFormData({
        floorId: '',
        lotNumber: '',
        type: '',
        area: 0,
        price: 0,
        status: 'AVAILABLE',
        description: '',
        mediaUrls: [],
        model3dUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingApartment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const apartmentData: Omit<Apartment, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      if (editingApartment) {
        await updateApartment(editingApartment.id, apartmentData);
      } else {
        await addApartment(apartmentData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving apartment:', error);
      alert('Error saving apartment. Please try again.');
    }
  };

  const handleDelete = async (apartmentId: string) => {
    if (window.confirm('Are you sure you want to delete this apartment?')) {
      try {
        await deleteApartment(apartmentId);
      } catch (error) {
        console.error('Error deleting apartment:', error);
        alert('Error deleting apartment. Please try again.');
      }
    }
  };

  const addMediaUrl = () => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: [...prev.mediaUrls, '']
    }));
  };

  const updateMediaUrl = (index: number, url: string) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.map((mediaUrl, i) => i === index ? url : mediaUrl)
    }));
  };

  const removeMediaUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index)
    }));
  };

  const getFloorName = (floorId: string) => {
    const floor = floors.find(f => f.id === floorId);
    return floor ? floor.name : 'Unknown Floor';
  };

  return (
    <div className="bg-gray-50 min-h-full py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Apartments Management
            </h1>
            <p className="text-gray-600">
              Manage apartment listings, details, and media
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus size={20} />
            Add Apartment
          </motion.button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search apartments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="UNDER_CONSTRUCTION">Under Construction</option>
            </select>

            {/* Floor Filter */}
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Floors</option>
              {floors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center text-gray-600">
              <Filter size={16} className="mr-2" />
              {filteredApartments.length} of {apartments.length} apartments
            </div>
          </div>
        </div>

        {/* Apartments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredApartments.map((apartment) => (
              <motion.div
                key={apartment.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  {apartment.mediaUrls && apartment.mediaUrls.length > 0 ? (
                    <img
                      src={apartment.mediaUrls[0]}
                      alt={`Apartment ${apartment.lotNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Home size={48} className="text-blue-400" />
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Apt {apartment.lotNumber}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={14} />
                        {getFloorName(apartment.floorId)}
                      </p>
                    </div>
                    <StatusBadge status={apartment.status} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{apartment.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">{apartment.area}m²</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-bold text-green-600 flex items-center gap-1">
                        <DollarSign size={14} />
                        {apartment.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {apartment.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {apartment.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenModal(apartment)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit size={14} />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(apartment.id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredApartments.length === 0 && (
          <div className="text-center py-12">
            <Home size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No apartments found
            </h3>
            <p className="text-gray-600 mb-6">
              {apartments.length === 0 
                ? "Get started by adding your first apartment." 
                : "Try adjusting your search or filters."}
            </p>
            {apartments.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add First Apartment
              </motion.button>
            )}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingApartment ? 'Edit Apartment' : 'Add Apartment'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Floor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Floor *
              </label>
              <select
                required
                value={formData.floorId}
                onChange={(e) => setFormData(prev => ({ ...prev, floorId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Floor</option>
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Basic Info Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lot Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lotNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, lotNumber: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., A101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Studio, 1BR, 2BR"
                />
              </div>
            </div>

            {/* Area and Price Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (m²) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Apartment description..."
              />
            </div>

            {/* Media URLs */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Media URLs
                </label>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addMediaUrl}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Media
                </motion.button>
              </div>
              <div className="space-y-2">
                {formData.mediaUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateMediaUrl(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeMediaUrl(index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Model URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3D Model URL
              </label>
              <input
                type="url"
                value={formData.model3dUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, model3dUrl: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/model.glb"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCloseModal}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {editingApartment ? 'Update' : 'Create'} Apartment
              </motion.button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ApartmentManagement;
