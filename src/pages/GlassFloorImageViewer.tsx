import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Users, MapPin, Eye, Maximize2, RotateCcw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Home, Settings, Share2, Heart, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData, Apartment } from '../contexts/DataContext';
import ViewerHeader from '../components/layout/ViewerHeader';
import GlassFloorImageViewer from '../components/floors/GlassFloorImageViewer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/glass-morphism.css';

const GlassFloorImageViewerPage: React.FC = () => {
  const { floorId } = useParams<{ floorId: string }>();
  const { floors, apartments, loading } = useData();
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Initialize with URL parameter or first floor
  useEffect(() => {
    console.log('🔍 GlassFloorImageViewer - floorId from URL:', floorId);
    console.log('🔍 GlassFloorImageViewer - available floors:', floors.map(f => ({ id: f.id, name: f.name })));
    
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

  // Auto-hide controls
  useEffect(() => {
    if (isFullscreen) {
      const timer = setTimeout(() => setShowControls(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, showControls]);

  if (loading) {
    return (
      <div className="min-h-screen glass-container">
        <ViewerHeader />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <LoadingSpinner />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-4 text-white/70 text-lg"
            >
              Loading your premium experience...
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!currentFloor) {
    return (
      <div className="min-h-screen glass-container">
        <ViewerHeader />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 glass-hotspot flex items-center justify-center">
              <Home className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Floor Not Found</h2>
            <p className="text-white/70 mb-6">The requested floor could not be found.</p>
            <Link
              to="/viewer/floors"
              className="inline-flex items-center gap-2 px-6 py-3 glass-btn glass-btn-primary"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Floors
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen glass-container ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <ViewerHeader />
      
      <div className="pt-16 h-screen flex flex-col relative overflow-hidden">
        {/* Glass Floating Header */}
        <motion.div
          className={`absolute top-16 left-4 right-4 z-40 ${isFullscreen ? 'top-4' : ''}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="glass-card-strong p-4">
            <div className="flex items-center justify-between">
              {/* Left - Back & Title */}
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/viewer/floors"
                    className="p-3 glass-btn rounded-xl transition-all duration-300 group"
                  >
                    <ArrowLeft className="w-6 h-6 text-white group-hover:text-teal-300" />
                  </Link>
                </motion.div>

                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-7 h-7 text-teal-400" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-white gradient-text">
                      {currentFloor.name}
                    </h1>
                    <p className="text-white/70 text-sm">Floor {currentFloor.level} • {floorApartments.length} Apartments</p>
                  </div>
                </div>
              </div>

              {/* Right - Glass Controls */}
              <div className="flex items-center space-x-3">
                {/* Action Buttons */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-3 rounded-xl transition-all duration-300 glass-btn ${
                    isFavorited 
                      ? 'glass-btn-primary' 
                      : 'glass-btn'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-3 rounded-xl transition-all duration-300 glass-btn ${
                    isBookmarked 
                      ? 'glass-btn-primary' 
                      : 'glass-btn'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 glass-btn rounded-xl transition-all duration-300"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-3 glass-btn rounded-xl transition-all duration-300"
                >
                  <Maximize2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Glass Floor Selector & Stats */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={selectedFloorId}
                  onChange={(e) => handleFloorChange(e.target.value)}
                  className="glass-input text-white border-white/30 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:glass-card-strong focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-800 text-white">Select Floor</option>
                  {floors.map(floor => (
                    <option key={floor.id} value={floor.id} className="bg-slate-800 text-white">
                      {floor.name}
                    </option>
                  ))}
                </select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHotspots(!showHotspots)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 glass-btn ${
                    showHotspots
                      ? 'glass-btn-primary'
                      : 'glass-btn'
                  }`}
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  Hotspots
                </motion.button>
              </div>

              <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{floorApartments.length} Apartments</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Level {currentFloor.level}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Glass Image Viewer Container */}
        <div className="flex-1 relative mt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full"
          >
            <GlassFloorImageViewer
              floorId={selectedFloorId}
              onApartmentSelect={handleApartmentSelect}
              showHotspots={showHotspots}
            />
          </motion.div>
        </div>

        {/* Glass Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-card mx-4 mb-4 p-4"
        >
          <div className="flex items-center justify-center gap-8 text-sm text-white/80">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Click hotspots for details</span>
            </motion.div>
            <div className="h-4 w-px bg-white/30" />
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium">Swipe to navigate</span>
            </motion.div>
            <div className="h-4 w-px bg-white/30" />
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
              <span className="font-medium">Pinch to zoom</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GlassFloorImageViewerPage;

