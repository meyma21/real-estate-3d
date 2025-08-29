import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Search, 
  Filter,
  Edit,
  Trash2,
  MapPin,
  Building2,
  Eye,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Floor, Hotspot } from '../../types/floor';
import { Link } from 'react-router-dom';

const HotspotManagement: React.FC = () => {
  const { floors, apartments } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState<string>('ALL');

  const filteredFloors = floors.filter(floor => {
    const matchesSearch = floor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = floorFilter === 'ALL' || floor.id === floorFilter;
    return matchesSearch && matchesFloor;
  });

  const getFloorHotspotStats = (floor: Floor) => {
    const topViewCount = floor.topViewHotspots?.length || 0;
    const angleHotspotsCount = Object.values(floor.angleHotspots || {}).reduce(
      (sum, hotspots) => sum + hotspots.length, 
      0
    );
    return {
      topView: topViewCount,
      angles: angleHotspotsCount,
      total: topViewCount + angleHotspotsCount,
      imageCount: floor.imageUrls?.length || 0
    };
  };

  const getApartmentName = (apartmentId: string) => {
    const apartment = apartments.find(apt => apt.id === apartmentId);
    return apartment ? `${apartment.lotNumber} (${apartment.type})` : 'Unknown Apartment';
  };

  const getAllHotspots = (floor: Floor): Array<{hotspot: Hotspot, type: 'topView' | 'angle', imageNumber?: string}> => {
    const result: Array<{hotspot: Hotspot, type: 'topView' | 'angle', imageNumber?: string}> = [];
    
    // Add top view hotspots
    (floor.topViewHotspots || []).forEach(hotspot => {
      result.push({ hotspot, type: 'topView' });
    });

    // Add angle hotspots
    Object.entries(floor.angleHotspots || {}).forEach(([imageNumber, hotspots]) => {
      hotspots.forEach(hotspot => {
        result.push({ hotspot, type: 'angle', imageNumber });
      });
    });

    return result;
  };

  const totalHotspots = floors.reduce((sum, floor) => {
    const stats = getFloorHotspotStats(floor);
    return sum + stats.total;
  }, 0);

  return (
    <div className="bg-gray-50 min-h-full py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hotspots Management
            </h1>
            <p className="text-gray-600">
              Configure interactive hotspots and apartment mappings
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{totalHotspots}</div>
            <div className="text-sm text-gray-600">Total Hotspots</div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-purple-500" size={20} />
              <span className="text-sm font-medium text-gray-600">Total Hotspots</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalHotspots}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="text-blue-500" size={20} />
              <span className="text-sm font-medium text-gray-600">Top View</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {floors.reduce((sum, floor) => sum + (floor.topViewHotspots?.length || 0), 0)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="text-green-500" size={20} />
              <span className="text-sm font-medium text-gray-600">Angle Views</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {floors.reduce((sum, floor) => 
                sum + Object.values(floor.angleHotspots || {}).reduce((angleSum, hotspots) => angleSum + hotspots.length, 0), 0
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="text-orange-500" size={20} />
              <span className="text-sm font-medium text-gray-600">Active Floors</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {floors.filter(floor => getFloorHotspotStats(floor).total > 0).length}
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search floors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Floor Filter */}
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              {filteredFloors.length} of {floors.length} floors
            </div>
          </div>
        </div>

        {/* Floors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredFloors.map((floor) => {
              const stats = getFloorHotspotStats(floor);
              const allHotspots = getAllHotspots(floor);
              
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
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold">{floor.name}</h3>
                        <p className="text-purple-100 text-sm flex items-center gap-1">
                          <MapPin size={14} />
                          Level {floor.level} • {stats.imageCount} images
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-purple-100 text-xs">Hotspots</div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Stats Breakdown */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{stats.topView}</div>
                        <div className="text-xs text-blue-600">Top View</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{stats.angles}</div>
                        <div className="text-xs text-green-600">Angle Views</div>
                      </div>
                    </div>

                    {/* Recent Hotspots */}
                    {allHotspots.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Hotspots</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {allHotspots.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                              <div className="flex items-center gap-2">
                                <Target size={12} className="text-purple-500" />
                                <span className="font-medium">
                                  {item.type === 'topView' ? 'Top View' : `Image ${item.imageNumber}`}
                                </span>
                              </div>
                              <div className="text-gray-600">
                                {item.hotspot.apartmentId ? 
                                  getApartmentName(item.hotspot.apartmentId) : 
                                  'No apartment linked'
                                }
                              </div>
                            </div>
                          ))}
                          {allHotspots.length > 3 && (
                            <div className="text-center text-gray-500 text-xs">
                              +{allHotspots.length - 3} more hotspots
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link to={`/admin/floors/${floor.id}/annotate`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                        >
                          <Edit size={14} />
                          Edit Hotspots
                        </motion.button>
                      </Link>
                      <Link to={`/viewer/floors/${floor.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                        >
                          <Eye size={14} />
                          Preview
                        </motion.button>
                      </Link>
                    </div>

                    {/* Detailed View */}
                    {stats.total === 0 && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <Target size={16} />
                          <span className="text-sm font-medium">No hotspots configured</span>
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                          Use the annotator to add interactive hotspots to this floor.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredFloors.length === 0 && (
          <div className="text-center py-12">
            <Target size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No floors found
            </h3>
            <p className="text-gray-600 mb-6">
              {floors.length === 0 
                ? "Create floors first to manage hotspots." 
                : "Try adjusting your search or filters."}
            </p>
            {floors.length === 0 && (
              <Link to="/admin/management/floors">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Floors
                </motion.button>
              </Link>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/floors/f0/annotate">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Target size={18} />
                Open Annotator
              </motion.button>
            </Link>
            
            <Link to="/viewer/floors">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Eye size={18} />
                Preview Viewer
              </motion.button>
            </Link>

            <Link to="/admin/management/floors">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Building2 size={18} />
                Manage Floors
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotManagement;
