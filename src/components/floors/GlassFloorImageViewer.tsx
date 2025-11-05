import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Mousewheel, EffectFade, Autoplay } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, X, Loader2, Info, ArrowLeft, 
  ZoomIn, ZoomOut, RotateCcw, Sparkles, Eye, Heart, 
  Bookmark, Share2, Maximize2, Play, Pause, Volume2, 
  VolumeX, Settings, Download, RefreshCw, Home
} from 'lucide-react';
import { useData, Apartment } from '../../contexts/DataContext';
import { floorService, FloorImageData, Hotspot } from '../../services/floorService';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/autoplay';
import './FloorImageViewer.css';
import './mobile-scrolling-fix.css';
import '../../styles/glass-morphism.css';

interface GlassFloorImageViewerProps {
  floorId: string;
  onApartmentSelect?: (apartment: Apartment) => void;
  showHotspots?: boolean;
}

const GlassFloorImageViewer: React.FC<GlassFloorImageViewerProps> = ({
  floorId,
  onApartmentSelect,
  showHotspots = true
}) => {
  const navigate = useNavigate();
  const { apartments } = useData();
  const [floorImages, setFloorImages] = useState<FloorImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const swiperRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load floor images
  useEffect(() => {
    const loadFloorImages = async () => {
      if (!floorId) return;
      
      try {
        setLoading(true);
        setError(null);
        const images = await floorService.getFloorImages(floorId);
        console.log('🔍 Loaded floor images:', images);
        console.log('🔍 First image hotspots:', images[0]?.hotspots);
        console.log('🔍 All images with hotspots:', images.map(img => ({ index: img.imageIndex, hotspots: img.hotspots })));
        setFloorImages(images);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error('Failed to load floor images:', err);
        setError(err instanceof Error ? err.message : 'Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    loadFloorImages();
  }, [floorId]);

  // Auto-hide controls
  useEffect(() => {
    if (isFullscreen) {
      const timer = setTimeout(() => setShowControls(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, showControls]);

  // Debug selectedApartment changes
  useEffect(() => {
    console.log('🔍 selectedApartment changed:', selectedApartment);
  }, [selectedApartment]);

  // Handle apartment selection
  const handleApartmentSelect = (apartment: Apartment) => {
    console.log('🔍 handleApartmentSelect called with:', apartment);
    setSelectedApartment(apartment);
    console.log('🔍 selectedApartment state set to:', apartment);
    if (onApartmentSelect) {
      onApartmentSelect(apartment);
    }
  };

  // Handle hotspot click
  const handleHotspotClick = (hotspot: Hotspot) => {
    console.log('🔍 Hotspot clicked:', hotspot);
    const apartment = apartments.find(apt => apt.id === hotspot.apartmentId);
    console.log('🔍 Found apartment:', apartment);
    if (apartment) {
      console.log('🔍 Calling handleApartmentSelect with:', apartment);
      handleApartmentSelect(apartment);
    } else {
      console.log('🔍 No apartment found for hotspot:', hotspot.apartmentId);
    }
  };

  // Navigation functions
  const goToNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const goToPrevious = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const goToSlide = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  // Rotation function
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setShowControls(true);
  };

  // Toggle autoplay
  const toggleAutoplay = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    if (swiperRef.current) {
      if (newPlayingState) {
        // Start autoplay
        if (swiperRef.current.autoplay) {
          swiperRef.current.autoplay.start();
        }
      } else {
        // Stop autoplay
        if (swiperRef.current.autoplay) {
          swiperRef.current.autoplay.stop();
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full glass-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Loader2 className="w-16 h-16 text-teal-400" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/70 text-lg font-medium"
          >
            Loading premium experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full glass-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 glass-hotspot flex items-center justify-center">
            <X className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Error Loading Images</h3>
          <p className="text-white/70 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="glass-btn glass-btn-primary"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (floorImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full glass-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 glass-hotspot flex items-center justify-center">
            <Eye className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">No Images Available</h3>
          <p className="text-white/70 mb-6">This floor doesn't have any images yet.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative h-full glass-container ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Main Image Viewer */}
      <div className="relative h-full overflow-hidden">
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination, Keyboard, Mousewheel, EffectFade, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          speed={800}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          allowTouchMove={true}
          preventClicks={false}
          preventClicksPropagation={false}
          noSwiping={true}
          noSwipingClass="swiper-no-swiping"
          touchStartPreventDefault={false}
          touchRatio={1}
          threshold={50}
          resistance={true}
          resistanceRatio={0.85}
          followFinger={true}
          shortSwipes={true}
          longSwipes={true}
          longSwipesRatio={0.3}
          longSwipesMs={300}
          freeMode={false}
          centeredSlides={true}
          loop={true}
          autoplay={isPlaying ? { delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true, stopOnLastSlide: false } : false}
          keyboard={{
            enabled: true,
            onlyInViewport: true,
          }}
          mousewheel={{
            enabled: true,
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
            invert: false,
          }}
          onSlideChange={(swiper) => setCurrentImageIndex(swiper.realIndex)}
          onSwiper={(swiper) => {
            if (swiper.el) {
              swiper.el.style.touchAction = 'pan-y';
              swiper.el.style.overscrollBehavior = 'contain';
              (swiper.el.style as any).webkitOverflowScrolling = 'touch';
              
              const swiperWrapper = swiper.el.querySelector('.swiper-wrapper');
              if (swiperWrapper) {
                (swiperWrapper as HTMLElement).style.pointerEvents = 'auto';
                (swiperWrapper as HTMLElement).style.touchAction = 'pan-y';
              }
              
              const slides = swiper.el.querySelectorAll('.swiper-slide');
              slides.forEach((slide: any) => {
                slide.style.pointerEvents = 'auto';
                slide.style.touchAction = 'pan-y';
              });
              
              (swiper.el.style as any).webkitTouchCallout = 'none';
              (swiper.el.style as any).webkitUserSelect = 'none';
              swiper.el.style.userSelect = 'none';
              
              swiper.allowTouchMove = true;
              (swiper as any).touchRatio = 1;
              
              // Allow clicks on hotspots
              swiper.el.addEventListener('click', (e: any) => {
                const target = e.target.closest('.glass-hotspot');
                if (target) {
                  e.stopPropagation();
                  console.log('🔍 Click detected on hotspot via Swiper');
                }
              });
            }
          }}
          className="floor-image-swiper h-full"
        >
          {floorImages.map((imageData, index) => (
            <SwiperSlide key={imageData.id || index} className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative h-full w-full flex items-center justify-center"
              >
                <img
                  ref={imageRef}
                  src={imageData.imageUrl}
                  alt={`Floor Image ${index + 1}`}
                  className="max-h-full max-w-full object-contain select-none"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease-out'
                  }}
                  draggable={false}
                />
                
                {/* per-slide hotspots removed; moved to top overlay */}
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Top-level Hotspot Overlay (not inside Swiper) */}
        {showHotspots && floorImages[currentImageIndex]?.hotspots && Array.isArray(floorImages[currentImageIndex].hotspots) && floorImages[currentImageIndex].hotspots!.length > 0 && (
          <div className="pointer-events-none">
            <div className="absolute inset-0 z-30 hotspot-layer" style={{ pointerEvents: 'none' }}>
              {floorImages[currentImageIndex].hotspots!.map((hotspot, hotspotIndex) => {
                const apartment = apartments.find(apt => apt.id === hotspot.apartmentId);
                console.log('🔍 Rendering glass hotspot (overlay):', hotspot, 'apartment:', apartment);
                return (
                  <motion.div
                    key={`overlay-hotspot-${hotspotIndex}-${hotspot.id || hotspotIndex}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + hotspotIndex * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute cursor-pointer z-50 glass-hotspot swiper-no-swiping"
                    style={{
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 44,
                      height: 44,
                      pointerEvents: 'auto'
                    }}
                    onPointerDown={(e) => { e.stopPropagation(); }}
                    onPointerUp={(e) => { e.stopPropagation(); }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔍 Hotspot clicked (overlay)!', hotspot);
                      handleHotspotClick(hotspot);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔍 Hotspot touchend (overlay)!', hotspot);
                      handleHotspotClick(hotspot);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleHotspotClick(hotspot);
                      }
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-10 h-10 glass-hotspot flex items-center justify-center pulse-glow"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 bg-white rounded-full"
                      />
                    </motion.div>

                    {apartment && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 glass-card text-white text-sm rounded-lg whitespace-nowrap pointer-events-none z-40"
                      >
                        {apartment.name}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/20"></div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Glass Navigation Arrows */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-10"
            >
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPrevious}
                className="ml-4 p-3 glass-card text-white rounded-full shadow-lg hover:glass-card-strong transition-all duration-300 pointer-events-auto"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNext}
                className="mr-4 p-3 glass-card text-white rounded-full shadow-lg hover:glass-card-strong transition-all duration-300 pointer-events-auto"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glass Bottom Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-4 left-4 right-4 z-20"
            >
              <div className="glass-card-strong p-4">
                <div className="flex items-center justify-center">

                  {/* Glass Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleAutoplay}
                      className={`p-3 rounded-xl transition-all duration-300 glass-btn ${
                        isPlaying 
                          ? 'glass-btn-primary' 
                          : 'glass-btn'
                      }`}
                      title={isPlaying ? "Pause Slideshow" : "Start Slideshow"}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleZoomIn}
                      className="p-3 glass-btn rounded-xl transition-all duration-300"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleZoomOut}
                      className="p-3 glass-btn rounded-xl transition-all duration-300"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRotate}
                      className="p-3 glass-btn rounded-xl transition-all duration-300"
                      title="Rotate"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleResetZoom}
                      className="p-3 glass-btn rounded-xl transition-all duration-300"
                      title="Reset View"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleFullscreen}
                      className="p-3 glass-btn rounded-xl transition-all duration-300"
                      title="Fullscreen"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Glass Apartment Info Modal */}
      <AnimatePresence>
        {selectedApartment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedApartment(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-modal max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white gradient-text">{selectedApartment.name}</h3>
                <button
                  onClick={() => setSelectedApartment(null)}
                  className="p-2 text-white/70 hover:text-white transition-colors glass-btn rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3 text-white/80">
                <p><strong>Area:</strong> {selectedApartment.area} sq ft</p>
                <p><strong>Bedrooms:</strong> {selectedApartment.bedrooms}</p>
                <p><strong>Bathrooms:</strong> {selectedApartment.bathrooms}</p>
                <p><strong>Price:</strong> ${selectedApartment.price?.toLocaleString()}</p>
                {selectedApartment.description && (
                  <p><strong>Description:</strong> {selectedApartment.description}</p>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 glass-btn glass-btn-primary"
                >
                  View Details
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-btn"
                >
                  <Heart className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlassFloorImageViewer;

