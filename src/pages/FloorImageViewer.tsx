import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Users, MapPin, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData, Apartment } from '../contexts/DataContext';
import ViewerHeader from '../components/layout/ViewerHeader';
import FloorImageViewer from '../components/floors/FloorImageViewer';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FloorImageViewerPage: React.FC = () => {
  const { floorId } = useParams<{ floorId: string }>();
  const { floors, apartments, loading } = useData();
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);

  // Initialize with URL parameter or first floor
  useEffect(() => {
    console.log('🔍 FloorImageViewer - floorId from URL:', floorId);
    console.log('🔍 FloorImageViewer - available floors:', floors.map(f => ({ id: f.id, name: f.name })));
    
    if (floorId) {
      setSelectedFloorId(floorId);
    } else if (floors.length > 0 && !selectedFloorId) {
      setSelectedFloorId(floors[0].id);
    }
  }, [floorId, floors, selectedFloorId]);

  // Get current floor data
  const currentFloor = floors.find(f => f.id === selectedFloorId);
  const floorApartments = apartments.filter(apt => apt.floorId === selectedFloorId);

  // Handle apartment selection
  const handleApartmentSelect = (apartment: Apartment) => {
    setSelectedApartment(apartment);
  };

  // Handle floor change
  const handleFloorChange = (newFloorId: string) => {
    setSelectedFloorId(newFloorId);
    setSelectedApartment(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ViewerHeader />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!currentFloor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ViewerHeader />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Floor not found</p>
            <Link
              to="/viewer/floors"
              className="text-teal-600 hover:text-teal-700 underline"
            >
              Back to floors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ViewerHeader />
      
      <div className="pt-16 h-screen flex flex-col">
        {/* Premium Header */}
        <motion.div
          className="bg-gray-800/80 backdrop-blur-lg p-3 sm:p-4 flex items-center justify-between border-b border-gray-700/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Left – Back & title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/viewer/floors"
              className="text-gray-300 hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h1 className="text-lg sm:text-xl font-semibold text-white">
                {currentFloor.name}
              </h1>
            </div>
          </div>

          {/* Right – controls */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Hotspot toggle */}
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                showHotspots
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
              }`}
              title="Toggle Hotspots"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Floor selector */}
            <select
              value={selectedFloorId}
              onChange={(e) => handleFloorChange(e.target.value)}
              className="bg-gray-700/80 backdrop-blur-lg text-white border border-gray-600/50 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base min-w-0 w-24 sm:w-auto transition-all duration-300 hover:bg-gray-600/80 focus:ring-2 focus:ring-teal-400/30 focus:border-teal-500/50 outline-none cursor-pointer"
            >
              <option value="">Select Floor</option>
              {floors.map(floor => (
                <option key={floor.id} value={floor.id} className="bg-gray-800 text-white">
                  {floor.name}
                </option>
              ))}
            </select>

            {/* Stats (hidden on small screens) */}
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{floorApartments.length} apts</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Floor {currentFloor.level}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Image Viewer */}
        <div className="flex-1 relative">
          <FloorImageViewer
            floorId={selectedFloorId}
            onApartmentSelect={handleApartmentSelect}
            showHotspots={showHotspots}
          />
        </div>

        {/* Instructions */}
        <div className="bg-white border-t border-slate-200 px-4 py-3">
          <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
              <span>Click hotspots to view apartment details</span>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <span>Use arrow keys or swipe to navigate</span>
            <div className="h-4 w-px bg-slate-300" />
            <span>Pinch to zoom or use zoom controls</span>
            <div className="h-4 w-px bg-slate-300" />
            <span>Click angle buttons for quick navigation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorImageViewerPage; 