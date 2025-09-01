import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Mousewheel, EffectFade } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Loader2, Info, ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Sparkles, Eye } from 'lucide-react';
import { useData, Apartment } from '../../contexts/DataContext';
import { floorService, FloorImageData, Hotspot } from '../../services/floorService';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './FloorImageViewer.css';

interface FloorImageViewerProps {
  floorId: string;
  onApartmentSelect?: (apartment: Apartment) => void;
  showHotspots?: boolean;
}

const FloorImageViewer: React.FC<FloorImageViewerProps> = ({ floorId, onApartmentSelect, showHotspots = true }) => {
  const { floors, apartments } = useData();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [floorImages, setFloorImages] = useState<FloorImageData[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string>(floorId);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [showTopView, setShowTopView] = useState(false);
  const [swipeStartY, setSwipeStartY] = useState(0);
  const [swipeStartTime, setSwipeStartTime] = useState(0);
  const swiperRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [topViewImageSrc, setTopViewImageSrc] = useState('');
  const [topViewHotspots, setTopViewHotspots] = useState<Hotspot[]>([]);
  
  // NEW: Track rendered image dimensions and position
  const [renderedImageRect, setRenderedImageRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current floor data
  const currentFloor = floors.find(f => f.id === selectedFloor);
  const floorApartments = apartments.filter(apt => apt.floorId === selectedFloor);

  // NEW: Update rendered image rect when image loads or window resizes
  const updateRenderedImageRect = () => {
    if (imageRef.current && containerRef.current) {
      const imageRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate the image's position relative to the container
      const relativeRect = new DOMRect(
        imageRect.left - containerRect.left,
        imageRect.top - containerRect.top,
        imageRect.width,
        imageRect.height
      );
      
      console.log('🔍 Image positioning debug:', {
        imageRect: { left: imageRect.left, top: imageRect.top, width: imageRect.width, height: imageRect.height },
        containerRect: { left: containerRect.left, top: containerRect.top, width: containerRect.width, height: containerRect.height },
        relativeRect: { left: relativeRect.left, top: relativeRect.top, width: relativeRect.width, height: relativeRect.height }
      });
      
      setRenderedImageRect(relativeRect);
    }
  };

  // NEW: Calculate hotspot position relative to the rendered image
  const getHotspotPosition = (hotspot: Hotspot) => {
    if (!renderedImageRect || !imageRef.current) {
      // Fallback to simple percentage positioning
      console.log('🔍 Using fallback positioning - no image rect available');
      return { left: `${hotspot.x}%`, top: `${hotspot.y}%` };
    }

    // Calculate position relative to the actual rendered image (like in annotator)
    const imageElement = imageRef.current;
    const containerRect = imageElement.parentElement?.getBoundingClientRect();
    const imageRect = imageElement.getBoundingClientRect();
    
    if (!containerRect) {
      return { left: `${hotspot.x}%`, top: `${hotspot.y}%` };
    }

    // Calculate the actual image dimensions within the container (accounting for object-contain)
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const imageAspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let actualImageWidth, actualImageHeight, offsetX, offsetY;

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider - constrained by width
      actualImageWidth = containerWidth;
      actualImageHeight = containerWidth / imageAspectRatio;
      offsetX = 0;
      offsetY = (containerHeight - actualImageHeight) / 2;
    } else {
      // Image is taller - constrained by height  
      actualImageWidth = containerHeight * imageAspectRatio;
      actualImageHeight = containerHeight;
      offsetX = (containerWidth - actualImageWidth) / 2;
      offsetY = 0;
    }

    // Calculate hotspot position within the actual image area
    const hotspotX = offsetX + (hotspot.x / 100) * actualImageWidth;
    const hotspotY = offsetY + (hotspot.y / 100) * actualImageHeight;

    // Convert to percentage of the container
    const leftPercent = (hotspotX / containerWidth) * 100;
    const topPercent = (hotspotY / containerHeight) * 100;

    const position = { left: `${leftPercent}%`, top: `${topPercent}%` };
    
    console.log('🔍 Hotspot positioning debug (ACCURATE):', {
      hotspot: { x: hotspot.x, y: hotspot.y, apartmentId: hotspot.apartmentId },
      container: { width: containerWidth, height: containerHeight },
      actualImage: { width: actualImageWidth, height: actualImageHeight, offsetX, offsetY },
      hotspotPixels: { x: hotspotX, y: hotspotY },
      position
    });

    return position;
  };

  // NEW: Combine angle-specific hotspots with topView hotspots so buttons appear on all images
  const combinedHotspots = React.useMemo(() => {
    console.log('🔍 Hotspot Debug - currentFloor:', currentFloor);
    console.log('🔍 Hotspot Debug - currentImageIndex:', currentImageIndex);
    console.log('🔍 Hotspot Debug - floorImages:', floorImages);
    
    // Get current image info
    const currentImage = floorImages[currentImageIndex];
    
    // NEW: Debug the 1:1 index mapping system
    console.log('🔍 NEW 1:1 MAPPING SYSTEM:');
    console.log(`  Index ${currentImageIndex} → Hotspot Key "${currentImageIndex + 1}" → Image: ${currentImage?.imageUrl?.split('/').pop()?.split('?')[0]}`);
    const isTopView = currentImage?.imageUrl?.includes('Copie') || 
                     currentImage?.imageUrl?.toLowerCase().includes('overview');
    
    // NEW: Use currentImageIndex + 1 as the image number for perfect 1:1 mapping
    // This ensures Index 1 → Image 1 → Hotspot key "1"
    const imageNumber = String(currentImageIndex + 1);
    
    // Extract actual image number from filename for verification
    const actualImageNumber = currentImage?.imageUrl?.match(/ground-floor-(\d+)|first-floor-(\d+)/)?.[1] || 
                             currentImage?.imageUrl?.match(/ground-floor-(\d+)|first-floor-(\d+)/)?.[2] || 'unknown';
    
    console.log('🔍 Hotspot Debug - isTopView:', isTopView);
    console.log('🔍 Hotspot Debug - imageNumber (calculated):', imageNumber);
    console.log('🔍 Hotspot Debug - actualImageNumber (from filename):', actualImageNumber);
    console.log('🔍 Hotspot Debug - currentImageUrl:', currentImage?.imageUrl);
    
    // CRITICAL: Verify 1:1 mapping
    if (imageNumber !== actualImageNumber && actualImageNumber !== 'unknown') {
      console.error('🚨 MISMATCH DETECTED:', {
        calculatedNumber: imageNumber,
        actualNumber: actualImageNumber,
        currentIndex: currentImageIndex,
        imageUrl: currentImage?.imageUrl
      });
    }
    
    // NEW: Debug available hotspots in database
    console.log('🔍 AVAILABLE HOTSPOTS IN DATABASE:');
    console.log('  - topViewHotspots:', currentFloor?.topViewHotspots?.length || 0, 'hotspots');
    if (currentFloor?.angleHotspots) {
      Object.keys(currentFloor.angleHotspots).forEach(key => {
        const count = currentFloor.angleHotspots?.[key]?.length || 0;
        console.log(`  - angleHotspots["${key}"]`, count, 'hotspots');
      });
    }

    let hotspots: Hotspot[] = [];

    if (isTopView) {
      // On top view image: show only top view hotspots
      hotspots = currentFloor?.topViewHotspots || [];
      console.log('🔍 Hotspot Debug - showing topViewHotspots:', hotspots);
    } else {
      // On numbered images: show only image-specific hotspots for this image number
      hotspots = currentFloor?.angleHotspots?.[imageNumber] || [];
      console.log('🔍 Hotspot Debug - showing angleHotspots for image number', imageNumber, ':', hotspots);
      
      // SUCCESS: Image 10 hotspots are working! Removing excessive debug logs.
    }

    // Map to display format
    const result = hotspots.map((hs, index) => {
      const apt = floorApartments.find((a) => a.id === hs.apartmentId);
      return {
        ...hs,
        id: hs.id || `hotspot-${hs.apartmentId}-${index}`,
        label: apt ? `Apt ${apt.lotNumber}` : 'Apartment',
      };
    });

    console.log('🔍 Hotspot Debug - combinedHotspots result:', result);
    return result;
  }, [floorImages, currentImageIndex, currentFloor, floorApartments]);



  // Calculate current angle based on image index
  const currentAngle = floorImages.length > 0 ? Math.round(floorImages[currentImageIndex]?.angle || 0) : 0;

  // Sync selectedFloor with floorId prop
  useEffect(() => {
    console.log('🔍 FloorImageViewer Component - floorId prop:', floorId);
    setSelectedFloor(floorId);
  }, [floorId]);

  // Haptic feedback function
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
      if ('vibrate' in navigator && navigator.vibrate) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30]
        };
        navigator.vibrate(patterns[type]);
      }
    } catch (error) {
      // Silently handle vibration errors (user hasn't interacted yet)
      console.debug('Vibration not available:', error);
    }
  };

  // Enhanced zoom functions with haptic feedback
  const handleZoomIn = () => {
    const newZoomLevel = Math.min(zoomLevel * 1.5, 5);
    setZoomLevel(newZoomLevel);
    setIsZoomed(newZoomLevel > 1);
    triggerHapticFeedback('light');
  };

  const handleZoomOut = () => {
    const newZoomLevel = Math.max(zoomLevel / 1.5, 1);
    setZoomLevel(newZoomLevel);
    setIsZoomed(newZoomLevel > 1);
    if (newZoomLevel === 1) {
      setPanPosition({ x: 0, y: 0 });
    }
    triggerHapticFeedback('light');
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    triggerHapticFeedback('medium');
  };

  // Enhanced mouse wheel zoom with smooth scaling
  const handleWheel = (e: React.WheelEvent) => {
    // Only handle zoom if Ctrl/Cmd is pressed, otherwise allow normal scrolling
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoomLevel = Math.max(1, Math.min(5, zoomLevel * delta));
      setZoomLevel(newZoomLevel);
      setIsZoomed(newZoomLevel > 1);
      if (newZoomLevel === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
    }
    // If not Ctrl/Cmd, allow normal page scrolling
  };

  // Enhanced touch/mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle drag if zoomed and clicking on the image area
    if (isZoomed && e.target === e.currentTarget) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
      triggerHapticFeedback('light');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isZoomed) {
      e.preventDefault();
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Enhanced touch handling with pinch-to-zoom and swipe-up for top view
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only handle touch events if we're in the image viewer context
    if (e.touches.length === 2) {
      // Pinch-to-zoom start
      e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setDragStart({ x: distance, y: zoomLevel });
      triggerHapticFeedback('light');
    } else if (isZoomed && e.touches.length === 1) {
      // Single touch pan when zoomed
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - panPosition.x, 
        y: e.touches[0].clientY - panPosition.y 
      });
    } else if (e.touches.length === 1) {
      // Single touch - check for swipe up from bottom
      const touch = e.touches[0];
      const screenHeight = window.innerHeight;
      const bottomZone = screenHeight * 0.7; // Bottom 30% of screen
      
      if (touch.clientY > bottomZone && !isZoomed) {
        setSwipeStartY(touch.clientY);
        setSwipeStartTime(Date.now());
        console.log('Swipe detection started:', { clientY: touch.clientY, screenHeight, bottomZone });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom
      e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = (distance / dragStart.x) * dragStart.y;
      const newZoomLevel = Math.max(1, Math.min(5, scale));
      setZoomLevel(newZoomLevel);
      setIsZoomed(newZoomLevel > 1);
      if (newZoomLevel === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
    } else if (isDragging && isZoomed && e.touches.length === 1) {
      // Single touch pan when zoomed
      e.preventDefault();
      setPanPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    } else if (e.touches.length === 1 && swipeStartY > 0 && !isZoomed) {
      // Check for swipe up gesture
      const touch = e.touches[0];
      const deltaY = swipeStartY - touch.clientY;
      const deltaTime = Date.now() - swipeStartTime;
      
      console.log('Swipe move detected:', { deltaY, deltaTime, swipeStartY, currentY: touch.clientY });
      
      // Swipe up detection: moved up at least 50px in less than 800ms
      if (deltaY > 50 && deltaTime < 800) {
        console.log('Swipe up gesture detected! Showing top view');
        setShowTopView(true);
        setSwipeStartY(0);
        triggerHapticFeedback('medium');
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setSwipeStartY(0);
    setSwipeStartTime(0);
  };

  // Dedicated swipe detection overlay
  const handleSwipeOverlayTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && !isZoomed) {
      const touch = e.touches[0];
      const screenHeight = window.innerHeight;
      const bottomZone = screenHeight * 0.7; // Bottom 30% of screen
      
      if (touch.clientY > bottomZone) {
        setSwipeStartY(touch.clientY);
        setSwipeStartTime(Date.now());
        console.log('Swipe overlay detection started:', { clientY: touch.clientY, screenHeight, bottomZone });
      }
    }
  };

  const handleSwipeOverlayTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && swipeStartY > 0 && !isZoomed) {
      const touch = e.touches[0];
      const deltaY = swipeStartY - touch.clientY;
      const deltaTime = Date.now() - swipeStartTime;
      
      console.log('Swipe overlay move detected:', { deltaY, deltaTime, swipeStartY, currentY: touch.clientY });
      
      // Swipe up detection: moved up at least 50px in less than 800ms
      if (deltaY > 50 && deltaTime < 800) {
        console.log('Swipe up gesture detected! Showing top view');
        e.preventDefault();
        e.stopPropagation();
        setShowTopView(true);
        setSwipeStartY(0);
        triggerHapticFeedback('medium');
      }
    }
  };

  const handleSwipeOverlayTouchEnd = () => {
    setSwipeStartY(0);
    setSwipeStartTime(0);
  };

  // Load floor images
  useEffect(() => {
    const loadFloorImages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const images = await floorService.getFloorImages(selectedFloor);
        // Fetch floor details to get hotspots
        let floorData;
        try {
          floorData = await floorService.getById(selectedFloor);
        } catch (e) {
          floorData = undefined;
        }
        // Separate overview (top view) image if present
        let overviewImage: FloorImageData | null = null;
        const regularImages: FloorImageData[] = [];
        images.forEach(img => {
          if (img.imageUrl.includes('Copie') || img.imageUrl.toLowerCase().includes('overview')) {
            overviewImage = img;
          } else {
            regularImages.push(img);
          }
        });
        
        // NEW: Sort images by extracted number to ensure proper order
        const sortedRegularImages = regularImages.sort((a, b) => {
          const numberA = parseInt(a.imageUrl.match(/ground-floor-(\d+)/)?.[1] || 
                                   a.imageUrl.match(/first-floor-(\d+)/)?.[1] || '0');
          const numberB = parseInt(b.imageUrl.match(/ground-floor-(\d+)/)?.[1] || 
                                   b.imageUrl.match(/first-floor-(\d+)/)?.[1] || '0');
          return numberA - numberB;
        });
        
        console.log('🔧 FIXED: Sorted images by filename number');
        sortedRegularImages.forEach((img, idx) => {
          const imgNumber = img.imageUrl.match(/ground-floor-(\d+)/)?.[1] || 
                           img.imageUrl.match(/first-floor-(\d+)/)?.[1] || 'unknown';
          console.log(`  Index ${idx} → Image ${imgNumber} (${img.imageUrl.split('/').pop()?.split('?')[0]})`);
        });
        
        // Hotspots are now handled separately in the combinedHotspots useMemo
        setFloorImages(sortedRegularImages);
        // Set top view image src if overview found
        if (overviewImage && overviewImage.imageUrl) {
          setShowTopView(true);
          setTopViewImageSrc(overviewImage.imageUrl);
        } else {
          setShowTopView(false);
          setTopViewImageSrc('');
        }
        // top view hotspots
        if (floorData && floorData.topViewHotspots) {
          setTopViewHotspots(floorData.topViewHotspots);
        }
      } catch (err) {
        setError('Failed to load floor images');
      } finally {
        setIsLoading(false);
      }
    };
    loadFloorImages();
  }, [selectedFloor]);

  // NEW: Update rendered image rect when image loads, changes, or window resizes
  useEffect(() => {
    const handleImageLoad = () => {
      setTimeout(updateRenderedImageRect, 100); // Small delay to ensure image is rendered
    };

    const handleResize = () => {
      setTimeout(updateRenderedImageRect, 100);
    };

    if (imageRef.current) {
      imageRef.current.addEventListener('load', handleImageLoad);
    }

    window.addEventListener('resize', handleResize);
    
    // Initial update
    setTimeout(updateRenderedImageRect, 100);

    return () => {
      if (imageRef.current) {
        imageRef.current.removeEventListener('load', handleImageLoad);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [currentImageIndex, zoomLevel, panPosition]);

  // Enhanced hotspot click with animations
  const handleHotspotClick = (hotspot: Hotspot) => {
    console.log('🔍 Hotspot Click - hotspot:', hotspot);
    console.log('🔍 Hotspot Click - floorApartments:', floorApartments);
    
    const apartment = floorApartments.find(apt => apt.id === hotspot.apartmentId);
    console.log('🔍 Hotspot Click - found apartment:', apartment);
    
    if (apartment) {
      console.log('🔍 Hotspot Click - setting selectedApartment:', apartment);
      setSelectedApartment(apartment);
      if (onApartmentSelect) {
        onApartmentSelect(apartment);
      }
      triggerHapticFeedback('medium');
    } else {
      console.warn('🔍 Hotspot Click - apartment not found for ID:', hotspot.apartmentId);
      // Test with a mock apartment to see if modal works
      const testApartment = floorApartments[0];
      if (testApartment) {
        console.log('🔍 Hotspot Click - testing with first apartment:', testApartment);
        setSelectedApartment(testApartment);
      }
    }
  };

  // Enhanced slide change with transition effects - CRITICAL: This must properly update currentImageIndex
  const handleSlideChange = (swiper: any) => {
    const newIndex = swiper.realIndex; // Use realIndex instead of activeIndex for loop mode
    console.log('🔍 SLIDE CHANGE:', {
      oldIndex: currentImageIndex,
      newIndex: newIndex,
      imageFileName: floorImages[newIndex]?.imageUrl?.split('/').pop()?.split('?')[0]
    });
    setCurrentImageIndex(newIndex);
    triggerHapticFeedback('light');
    
    // Reset zoom when changing slides
    if (isZoomed) {
      setZoomLevel(1);
      setIsZoomed(false);
      setPanPosition({ x: 0, y: 0 });
    }
  };

  // Enhanced navigation with smooth transitions
  const navigateToAngle = (targetAngle: number) => {
    const targetIndex = floorImages.findIndex(img => 
      Math.abs(img.angle - targetAngle) < 10 || 
      (targetAngle === 0 && img.angle > 350)
    );
    
    if (targetIndex !== -1 && swiperRef.current) {
      swiperRef.current.slideTo(targetIndex, 400);
      triggerHapticFeedback('medium');
    }
  };

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedApartment) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextImage();
          break;
        case '=':
        case '+':
          event.preventDefault();
          handleZoomIn();
          break;
        case '-':
          event.preventDefault();
          handleZoomOut();
          break;
        case '0':
          event.preventDefault();
          handleZoomReset();
          break;
        case 'h':
          event.preventDefault();
          // setShowHotspots(!showHotspots); // This line is removed as per the edit hint
          triggerHapticFeedback('light');
          break;
        case 'Escape':
          event.preventDefault();
          if (isZoomed) {
            handleZoomReset();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedApartment, isZoomed, showHotspots]);

  // Enhanced format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Enhanced navigation functions
  const goToAngle = (targetAngle: number) => {
    navigateToAngle(targetAngle);
  };

  const goToPreviousImage = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const goToNextImage = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  // Loading state with premium animation
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full floor-image-viewer">
        <motion.div 
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative">
            <motion.div
              className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 w-16 h-16 border-4 border-teal-400 border-b-transparent rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-white mb-2">Loading Floor Images</h3>
            <p className="text-gray-300">Preparing your immersive experience...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Error state with premium styling
  if (error) {
    return (
      <div className="flex items-center justify-center h-full floor-image-viewer">
        <motion.div 
          className="text-center p-8 bg-red-500/10 backdrop-blur-lg rounded-2xl border border-red-500/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <X className="w-8 h-8 text-red-400" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Floor Images</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg border border-red-500/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // No images state
  if (floorImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full floor-image-viewer">
        <motion.div 
          className="text-center p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Eye className="w-8 h-8 text-gray-400" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">No Images Available</h3>
          <p className="text-gray-300">No floor images found for {currentFloor?.name}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 floor-image-viewer">
      {/* Main Content */}
      <div 
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        ref={containerRef} // Add ref to the container div
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm sm:text-base">Loading floor images...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400 text-center p-4 sm:p-6">
              <p className="text-sm sm:text-base mb-2">Error loading floor images</p>
              <p className="text-xs sm:text-sm text-gray-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Retry
              </button>
            </div>
          </div>
        ) : !selectedFloor ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center p-4 sm:p-6">
              <p className="text-sm sm:text-base mb-2">Select a floor to view</p>
              <p className="text-xs sm:text-sm text-gray-400">Use the dropdown above to choose a floor</p>
            </div>
          </div>
        ) : floorImages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center p-4 sm:p-6">
              <p className="text-sm sm:text-base mb-2">No images available</p>
              <p className="text-xs sm:text-sm text-gray-400">No floor images found for this floor</p>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Angle Indicator */}
            <motion.div 
              className="angle-indicator"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {currentAngle}°
            </motion.div>

            {/* Enhanced Zoom Controls */}
            <motion.div 
              className="zoom-controls"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 5}
                className="zoom-control-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <motion.button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="zoom-control-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <AnimatePresence>
                {isZoomed && (
                  <motion.button
                    onClick={handleZoomReset}
                    className="zoom-control-btn reset"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
              
              {/* Test Top View Button */}
              <motion.button
                onClick={() => {
                  console.log('🧪 Test button clicked - showing top view');
                  setShowTopView(true);
                }}
                className="zoom-control-btn"
                style={{ backgroundColor: '#059669' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Test Top View"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </motion.button>
            </motion.div>

            {/* Enhanced Zoom Level Indicator */}
            <AnimatePresence>
              {isZoomed && (
                <motion.div 
                  className="zoom-level-indicator"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  {Math.round(zoomLevel * 100)}%
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Navigation Buttons */}
            <motion.button
              onClick={goToPreviousImage}
              className={`nav-button-enhanced hidden sm:block absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 sm:p-4 rounded-full min-w-[48px] min-h-[48px] sm:min-w-[60px] sm:min-h-[60px] transition-all duration-300 ${isZoomed ? 'opacity-0 pointer-events-none' : ''}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isZoomed ? 0 : 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
            <motion.button
              onClick={goToNextImage}
              className={`nav-button-enhanced hidden sm:block absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 sm:p-4 rounded-full min-w-[48px] min-h-[48px] sm:min-w-[60px] sm:min-h-[60px] transition-all duration-300 ${isZoomed ? 'opacity-0 pointer-events-none' : ''}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isZoomed ? 0 : 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            {/* Enhanced Quick Angle Navigation */}
            <motion.div 
              className={`angle-nav-enhanced absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-300 ${isZoomed ? 'opacity-0 pointer-events-none' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isZoomed ? 0 : 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[0, 90, 180, 270].map(angle => (
                <motion.button
                  key={angle}
                  onClick={() => goToAngle(angle)}
                  className={`angle-nav-btn px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center ${
                    Math.abs(currentAngle - angle) < 10 || (angle === 0 && currentAngle > 350)
                      ? 'active'
                      : ''
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {angle}°
                </motion.button>
              ))}
            </motion.div>

            {/* Enhanced Mobile Instructions */}
            <motion.div 
              className="mobile-instructions sm:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {isZoomed ? 'Drag to pan • Pinch to zoom • Use zoom controls' : 'Swipe to rotate • Pinch to zoom • Use zoom controls • Tap hotspots'}
            </motion.div>

            {/* Swipe Up Indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showTopView ? 0 : 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <motion.div
                className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 mb-2"
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <p className="text-white text-xs">Swipe up for top view</p>
              </motion.div>
              <motion.div
                className="text-white/80"
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 15l-6-6-6 6"/>
                </svg>
              </motion.div>
            </motion.div>

            {/* Enhanced Main Image Viewer */}
            <Swiper
              modules={[Navigation, Pagination, Keyboard, Mousewheel, EffectFade]}
              spaceBetween={0}
              slidesPerView={1}
              speed={150}
              allowTouchMove={true}
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
              loop={!isZoomed}
              loopAdditionalSlides={2}
              watchSlidesProgress={true}
              effect="fade"
              fadeEffect={{
                crossFade: true,
              }}
              slideToClickedSlide={false}
              grabCursor={!isZoomed}
              navigation={{
                prevEl: '.swiper-button-prev-custom',
                nextEl: '.swiper-button-next-custom',
              }}
              pagination={{
                clickable: true,
                bulletClass: 'swiper-pagination-bullet-custom',
                bulletActiveClass: 'swiper-pagination-bullet-active-custom',
              }}
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
              breakpoints={{
                320: {
                  touchRatio: 1,
                  threshold: 50,
                  allowTouchMove: true,
                },
                480: {
                  touchRatio: 1,
                  threshold: 50,
                  allowTouchMove: true,
                },
                768: {
                  touchRatio: 1,
                  threshold: 50,
                  allowTouchMove: true,
                },
                1024: {
                  touchRatio: 1,
                  threshold: 50,
                  allowTouchMove: true,
                },
                1200: {
                  touchRatio: 1,
                  threshold: 50,
                  allowTouchMove: true,
                },
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                
                if (swiper.el) {
                  // Enable touch scrolling for mobile
                  swiper.el.style.touchAction = 'pan-y';
                  swiper.el.style.overscrollBehavior = 'contain';
                  
                  // Enable pointer events for swiper wrapper
                  const swiperWrapper = swiper.el.querySelector('.swiper-wrapper');
                  if (swiperWrapper) {
                    (swiperWrapper as HTMLElement).style.pointerEvents = 'auto';
                  }
                  
                  // Disable text selection but keep touch scrolling
                  (swiper.el.style as any).webkitTouchCallout = 'none';
                  (swiper.el.style as any).webkitUserSelect = 'none';
                  swiper.el.style.userSelect = 'none';
                }
              }}
              onSlideChange={handleSlideChange}
              onSliderMove={(swiper) => {
                if (!isZoomed && 'vibrate' in navigator && window.innerWidth <= 768) {
                  navigator.vibrate(5);
                }
              }}
              onLoad={updateRenderedImageRect} // Update rect on image load
              onResize={updateRenderedImageRect} // Update rect on window resize
              className="w-full h-full floor-image-swiper"
            >
              {floorImages.map((imageData, index) => (
                <SwiperSlide key={index} className="relative" style={{ pointerEvents: 'auto' }}>
                  <motion.div 
                    className="relative w-full h-full"
                    style={{ pointerEvents: 'auto' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Enhanced Floor Image */}
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <motion.img
                        src={imageData.imageUrl}
                        alt={`Floor ${currentFloor?.name} - Angle ${Math.round(imageData.angle)}°`}
                        className="w-full h-full object-contain"
                        draggable={false}
                        style={{
                          transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                          imageRendering: 'crisp-edges',
                          maxWidth: '100%',
                          maxHeight: '100%',
                          cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default',
                          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                        }}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        ref={imageRef}
                      />
                    </div>
                    
                    {/* Enhanced Hotspots */}
                    <AnimatePresence>
                      {showHotspots && combinedHotspots.length > 0 && combinedHotspots.map((hotspot, hotspotIndex) => {
                        console.log('🔍 Rendering hotspot:', hotspot, 'at index:', hotspotIndex);
                        return (
                        <div
                          key={`${hotspot.apartmentId}-${hotspot.x}-${hotspot.y}-${hotspotIndex}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔍 HOTSPOT CLICKED!', hotspot);
                            handleHotspotClick(hotspot);
                          }}
                          onMouseDown={(e) => {
                            console.log('🔍 HOTSPOT MOUSE DOWN!', hotspot);
                          }}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔍 HOTSPOT TOUCH START!', hotspot);
                          }}
                          className="hotspot-enhanced absolute w-12 h-12 bg-red-600 rounded-full border-4 border-yellow-400 shadow-xl flex items-center justify-center animate-pulse cursor-pointer"
                          style={{
                            ...getHotspotPosition(hotspot),
                            transform: 'translate(-50%, -50%)',
                            minWidth: '48px',
                            minHeight: '48px',
                            touchAction: 'manipulation',
                            pointerEvents: 'all',
                            zIndex: 99999,
                            position: 'absolute',
                          }}
                          onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                          onMouseLeave={() => setHoveredHotspot(null)}
                        >
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                          
                          {/* Hotspot Label */}
                          <AnimatePresence>
                            {hoveredHotspot === hotspot.id && (
                              <motion.div
                                className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap border border-white/20"
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                              >
                                {hotspot.label}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Full-Screen Swipe Detection Layer - DISABLED FOR HOTSPOT TESTING */}
            {!isZoomed && false && (
              <div
                className="absolute inset-0 z-50 pointer-events-none"
                style={{
                  pointerEvents: 'none', // ALWAYS NONE - DON'T BLOCK HOTSPOTS
                  touchAction: 'none'
                }}
                onTouchStart={(e) => {
                  console.log('🔍 Touch start detected on full-screen layer');
                  const touch = e.touches[0];
                  const screenHeight = window.innerHeight;
                  const bottomZone = screenHeight * 0.6; // Bottom 40% of screen
                  
                  if (touch.clientY > bottomZone) {
                    console.log('🎯 Touch in bottom zone:', { clientY: touch.clientY, screenHeight, bottomZone });
                    setSwipeStartY(touch.clientY);
                    setSwipeStartTime(Date.now());
                  }
                }}
                onTouchMove={(e) => {
                  if (swipeStartY > 0) {
                    const touch = e.touches[0];
                    const deltaY = swipeStartY - touch.clientY;
                    const deltaTime = Date.now() - swipeStartTime;
                    
                    console.log('📱 Touch move:', { deltaY, deltaTime, swipeStartY, currentY: touch.clientY });
                    
                    // More lenient swipe detection: 30px up in 1000ms
                    if (deltaY > 30 && deltaTime < 1000) {
                      console.log('🚀 SWIPE UP DETECTED! Showing top view');
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTopView(true);
                      setSwipeStartY(0);
                      setSwipeStartTime(0);
                    }
                  }
                }}
                onTouchEnd={() => {
                  console.log('✋ Touch end - resetting swipe state');
                  setSwipeStartY(0);
                  setSwipeStartTime(0);
                }}
              />
            )}

            {/* Swipe Detection Overlay - DISABLED FOR HOTSPOT TESTING */}
            {false && (
            <div
              className="absolute bottom-0 left-0 right-0 h-32 z-30 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.1), transparent)',
                pointerEvents: 'none' // ALWAYS NONE - DON'T BLOCK HOTSPOTS
              }}
              onTouchStart={handleSwipeOverlayTouchStart}
              onTouchMove={handleSwipeOverlayTouchMove}
              onTouchEnd={handleSwipeOverlayTouchEnd}
            />
            )}
          </>
        )}
      </div>

      {/* Enhanced Apartment Details Modal */}
      <AnimatePresence>
        {selectedApartment && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <motion.h2 
                    className="text-lg sm:text-xl font-bold text-gray-900"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Apartment {selectedApartment.lotNumber}
                  </motion.h2>
                  <motion.button
                    onClick={() => setSelectedApartment(null)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>
                
                <motion.div 
                  className="space-y-3 sm:space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <motion.div 
                      className="bg-gray-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/50"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Area</p>
                      <p className="text-sm sm:text-base font-semibold text-gray-900">
                        {selectedApartment.area} m²
                      </p>
                    </motion.div>
                    <motion.div 
                      className="bg-gray-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/50"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Type</p>
                      <p className="text-sm sm:text-base font-semibold text-gray-900">
                        {selectedApartment.type}
                      </p>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="bg-gradient-to-r from-teal-50 to-emerald-50 p-3 sm:p-4 rounded-xl border border-teal-200/50"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-xs sm:text-sm text-teal-600 mb-1">Price</p>
                    <p className="text-base sm:text-lg font-bold text-teal-700">
                      {formatCurrency(selectedApartment.price)}
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gray-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/50"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Status</p>
                    <motion.span 
                      className={`inline-flex px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        selectedApartment.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedApartment.status === 'SOLD'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {selectedApartment.status}
                    </motion.span>
                  </motion.div>
                  
                  {selectedApartment.description && (
                    <motion.div 
                      className="bg-gray-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/50"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-sm sm:text-base text-gray-900">
                        {selectedApartment.description}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
                
                <motion.div 
                  className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={() => setSelectedApartment(null)}
                    className="flex-1 px-4 py-2 sm:py-3 bg-gray-200/80 backdrop-blur-sm text-gray-800 rounded-xl hover:bg-gray-300/80 transition-colors text-sm sm:text-base font-medium min-h-[44px] flex items-center justify-center border border-gray-300/50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      onApartmentSelect?.(selectedApartment);
                      setSelectedApartment(null);
                    }}
                    className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all text-sm sm:text-base font-medium min-h-[44px] flex items-center justify-center shadow-lg border border-teal-500/50"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(13, 148, 136, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Details
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top View Overlay */}
      <AnimatePresence>
        {showTopView && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowTopView(false)}
          >
            <motion.div
              className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                onClick={() => setShowTopView(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/20"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Top View Header */}
              <motion.div
                className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-white font-semibold text-lg">Top View</h3>
                <p className="text-gray-300 text-sm">Floor plan overview</p>
              </motion.div>

              {/* Top View Image (acts as relative container) */}
              <div className="relative">
                <motion.img
                  src={topViewImageSrc}
                  alt="Top view of the floor"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  onError={(e) => {
                    console.error('Failed to load top view image:', topViewImageSrc);
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Hotspots on top-view */}
                {topViewHotspots.map((hs, idx) => {
                  const apt = floorApartments.find(a => a.id === hs.apartmentId);
                  if (!apt) return null;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleHotspotClick({ id: hs.apartmentId, x: hs.x, y: hs.y, label: `Apt ${apt.lotNumber}`, apartmentId: hs.apartmentId })}
                      className="absolute z-10 w-8 h-8 sm:w-10 sm:h-10 bg-teal-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                      style={{
                        ...getHotspotPosition(hs), // Use getHotspotPosition
                        transform: 'translate(-50%, -50%)',
                      }}
                      title={`Apartment ${apt.lotNumber}`}
                    >
                      <span className="w-2 h-2 bg-white rounded-full" />
                    </button>
                  );
                })}
              </div>

              {/* Instructions */}
              <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-white text-sm text-center">
                  Tap anywhere to close • Swipe up from bottom to show this view
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default FloorImageViewer; 