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
  MapPin,
  Building2,
  Target,
  Calendar,
  X,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Floor } from '../../types/floor';
import Modal from '../../components/common/Modal';
import { Link } from 'react-router-dom';
import FloorImageManager from './FloorImageManager';

interface FloorFormData {
  name: string;
  level: number;
  description: string;
  totalApartments: number;
  floorNumber: number;
  area: number;
  buildingId: string;
  floorPlanUrl?: string;
  model3dUrl?: string;
}

const FloorManagement: React.FC = () => {
  const { floors, apartments, addFloor, updateFloor, deleteFloor } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [imageManagerFloor, setImageManagerFloor] = useState<Floor | null>(null);
  const [formData, setFormData] = useState<FloorFormData>({
    name: '',
    level: 0,
    description: '',
    totalApartments: 0,
    floorNumber: 0,
    area: 0,
    buildingId: '',
    floorPlanUrl: '',
    model3dUrl: ''
  });

  const filteredFloors = floors.filter(floor => 
    floor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    floor.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (floor?: Floor) => {
    if (floor) {
      setEditingFloor(floor);
      setFormData({
        name: floor.name,
        level: floor.level,
        description: floor.description,
        totalApartments: floor.totalApartments || 0,
        floorNumber: floor.floorNumber,
        area: floor.area,
        buildingId: floor.buildingId,
        floorPlanUrl: floor.floorPlanUrl || '',
        model3dUrl: floor.model3dUrl || ''
      });
    } else {
      setEditingFloor(null);
      setFormData({
        name: '',
        level: 0,
        description: '',
        totalApartments: 0,
        floorNumber: 0,
        area: 0,
        buildingId: '',
        floorPlanUrl: '',
        model3dUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFloor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const floorData: Omit<Floor, 'id' | 'createdAt' | 'updatedAt' | 'imageUrls' | 'apartmentIds' | 'topViewHotspots' | 'angleHotspots'> = {
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingFloor) {
        await updateFloor(editingFloor.id, {
          ...floorData,
          imageUrls: editingFloor.imageUrls,
          apartmentIds: editingFloor.apartmentIds,
          topViewHotspots: editingFloor.topViewHotspots,
          angleHotspots: editingFloor.angleHotspots
        });
      } else {
        await addFloor({
          ...floorData,
          imageUrls: [],
          apartmentIds: [],
          topViewHotspots: [],
          angleHotspots: {}
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving floor:', error);
      alert('Error saving floor. Please try again.');
    }
  };

  const handleDelete = async (floorId: string) => {
    const floorApartments = apartments.filter(apt => apt.floorId === floorId);
    
    if (floorApartments.length > 0) {
      alert(`Cannot delete floor. It has ${floorApartments.length} apartments associated with it. Please move or delete the apartments first.`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this floor?')) {
      try {
        await deleteFloor(floorId);
      } catch (error) {
        console.error('Error deleting floor:', error);
        alert('Error deleting floor. Please try again.');
      }
    }
  };

  const handleOpenImageManager = (floor: Floor) => {
    setImageManagerFloor(floor);
    setIsImageManagerOpen(true);
  };

  const handleCloseImageManager = () => {
    setIsImageManagerOpen(false);
    setImageManagerFloor(null);
  };

  const getFloorStats = (floor: Floor) => {
    const floorApartments = apartments.filter(apt => apt.floorId === floor.id);
    const totalHotspots = (floor.topViewHotspots?.length || 0) + 
      Object.values(floor.angleHotspots || {}).reduce((sum, hotspots) => sum + hotspots.length, 0);
    
    return {
      apartments: floorApartments.length,
      images: floor.imageUrls?.length || 0,
      hotspots: totalHotspots
    };
  };

  return (
    <div className="bg-gray-50 min-h-full py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Floors Management
            </h1>
            <p className="text-gray-600">
              Manage floor plans, images, and layout configurations
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus size={20} />
            Add Floor
          </motion.button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search floors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center text-gray-600">
              <Filter size={16} className="mr-2" />
              {filteredFloors.length} of {floors.length} floors
            </div>
          </div>
        </div>

        {/* Floors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredFloors.map((floor) => {
              const stats = getFloorStats(floor);
              return (
                <motion.div
                  key={floor.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold">{floor.name}</h3>
                        <p className="text-green-100 text-sm flex items-center gap-1">
                          <MapPin size={14} />
                          Level {floor.level} • Floor {floor.floorNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{stats.apartments}</div>
                        <div className="text-green-100 text-xs">Apartments</div>
                      </div>
                    </div>
                    <p className="text-green-100 text-sm line-clamp-2">
                      {floor.description}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{stats.images}</div>
                        <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                          <ImageIcon size={12} />
                          Images
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{stats.hotspots}</div>
                        <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                          <Target size={12} />
                          Hotspots
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{floor.area}m²</div>
                        <div className="text-xs text-gray-600">Area</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Building ID:</span>
                        <span className="font-medium">{floor.buildingId}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(floor.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenModal(floor)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit size={14} />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDelete(floor.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </motion.button>
                    </div>

                    {/* Additional Actions */}
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenImageManager(floor)}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <ImageIcon size={14} />
                        Images
                      </motion.button>
                      <Link to={`/admin/floors/${floor.id}/annotate`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                        >
                          <Target size={14} />
                          Annotate
                        </motion.button>
                      </Link>
                      <Link to={`/viewer/floors/${floor.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredFloors.length === 0 && (
          <div className="text-center py-12">
            <Building2 size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No floors found
            </h3>
            <p className="text-gray-600 mb-6">
              {floors.length === 0 
                ? "Get started by adding your first floor." 
                : "Try adjusting your search."}
            </p>
            {floors.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenModal()}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add First Floor
              </motion.button>
            )}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingFloor ? 'Edit Floor' : 'Add Floor'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Ground Floor, First Floor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.buildingId}
                  onChange={(e) => setFormData(prev => ({ ...prev, buildingId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., BLDG-001"
                />
              </div>
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <input
                  type="number"
                  required
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor Number *
                </label>
                <input
                  type="number"
                  required
                  value={formData.floorNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, floorNumber: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Total Apartments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Apartments
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalApartments}
                onChange={(e) => setFormData(prev => ({ ...prev, totalApartments: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Floor description..."
              />
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor Plan URL
                </label>
                <input
                  type="url"
                  value={formData.floorPlanUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, floorPlanUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com/floorplan.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3D Model URL
                </label>
                <input
                  type="url"
                  value={formData.model3dUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, model3dUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com/model.glb"
                />
              </div>
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {editingFloor ? 'Update' : 'Create'} Floor
              </motion.button>
            </div>
          </form>
        </Modal>

        {/* Floor Image Manager */}
        {isImageManagerOpen && imageManagerFloor && (
          <FloorImageManager
            floorId={imageManagerFloor.id}
            floorName={imageManagerFloor.name}
            onClose={handleCloseImageManager}
          />
        )}
      </div>
    </div>
  );
};

export default FloorManagement;
