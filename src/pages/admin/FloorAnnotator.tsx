import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Floor } from '../../types/floor';
import { Hotspot } from '../../types/floor';
import { Apartment } from '../../contexts/DataContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, RotateCw } from 'lucide-react';
import { floorService, FloorImageData } from '../../services/floorService';
import { apartmentService } from '../../services/apartmentService';

/**
 * Enhanced Admin-only annotator page for hotspots on both top-view and individual 360° images.
 *
 * 1. Dropdown to select which image/angle to annotate (top-view or specific angle)
 * 2. Click on the image to create a hotspot (point)
 * 3. A sidebar shows a list of apartments to link + Delete / Save buttons
 * 4. Persists hotspots using DataContext.updateFloor for now (mock); replace with Firestore in prod.
 */
const FloorAnnotator: React.FC = () => {
  const { floorId } = useParams<{ floorId: string }>();
  const { apartments: mockApartments } = useData(); // Keep for fallback
  // Remove isAdmin and admin redirect logic
  // const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Remove admin-only guard
  // useEffect(() => {
  //   if (!isAdmin) navigate('/');
  // }, [isAdmin, navigate]);

  const [floor, setFloor] = useState<Floor | null>(null);
  const [floorsList, setFloorsList] = useState<Floor[]>([]);
  const [realApartments, setRealApartments] = useState<Apartment[]>([]);
  const [selectedImageType, setSelectedImageType] = useState<'topView' | 'imageNumber'>('topView');
  const [selectedImageNumber, setSelectedImageNumber] = useState<string>('1');
  const [floorImages, setFloorImages] = useState<FloorImageData[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspotIdx, setSelectedHotspotIdx] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [topViewImageUrl, setTopViewImageUrl] = useState<string>('');

  // Load floor details and floor list from backend
  useEffect(() => {
    const fetchData = async () => {
      if (!floorId) return;
      try {
        const [allFloors, currentFloor] = await Promise.all([
          floorService.getAll(),
          floorService.getById(floorId)
        ]);
        setFloorsList(allFloors);
        setFloor(currentFloor);
      } catch (e) {
        console.error('Failed to load floor data', e);
      }
    };
    fetchData();
  }, [floorId]);

  // Load real apartments for this floor
  useEffect(() => {
    const fetchApartments = async () => {
      if (!floor) return;
      try {
        // Try to get apartments by floor ID first
        const apartments = await apartmentService.getByFloor(floor.id);
        setRealApartments(apartments);
      } catch (error) {
        console.error('Failed to load apartments for floor:', error);
        // Fallback to mock apartments if backend fails
        setRealApartments(mockApartments.filter(a => a.floorId === floor.id));
      }
    };
    fetchApartments();
  }, [floor, mockApartments]);

  // Load floor images
  useEffect(() => {
    const loadImages = async () => {
      if (!floor) return;
      setIsLoading(true);
      try {
        console.log('🔍 Loading images for floor:', floor.id);
        const images = await floorService.getFloorImages(floor.id);
        console.log('🔍 Raw images from backend:', images);
        
        // Separate overview (top view) image if present
        let overviewImage: FloorImageData | null = null;
        const regularImages: FloorImageData[] = [];
        images.forEach((img: FloorImageData) => {
          console.log('🔍 Processing image:', img.imageUrl);
          if (img.imageUrl.includes('Copie') || img.imageUrl.toLowerCase().includes('overview')) {
            console.log('🔍 Found overview image:', img.imageUrl);
            overviewImage = img;
          } else {
            console.log('🔍 Adding to regular images:', img.imageUrl);
            regularImages.push(img);
          }
        });
        console.log('🔍 Overview image:', overviewImage);
        console.log('🔍 Regular images:', regularImages);
        
        // NEW: Sort images by extracted number to ensure proper order (same as FloorImageViewer)
        const sortedRegularImages = regularImages.sort((a, b) => {
          const numberA = parseInt(a.imageUrl.match(/ground-floor-(\d+)/)?.[1] || 
                                   a.imageUrl.match(/first-floor-(\d+)/)?.[1] || '0');
          const numberB = parseInt(b.imageUrl.match(/ground-floor-(\d+)/)?.[1] || 
                                   b.imageUrl.match(/first-floor-(\d+)/)?.[1] || '0');
          return numberA - numberB;
        });
        
        console.log('🔧 ANNOTATOR: Sorted images by filename number');
        sortedRegularImages.forEach((img, idx) => {
          const imgNumber = img.imageUrl.match(/ground-floor-(\d+)/)?.[1] || 
                           img.imageUrl.match(/first-floor-(\d+)/)?.[1] || 'unknown';
          console.log(`  Index ${idx} → Image ${imgNumber} (${img.imageUrl.split('/').pop()?.split('?')[0]})`);
        });
        
        setFloorImages(sortedRegularImages);
        
        // Set top view image src if overview found
        setTopViewImageUrl(overviewImage ? (overviewImage as FloorImageData).imageUrl : '');
        
        // NEW: Set selectedImageNumber to "1" for 1:1 mapping (Index 0 → Image 1 → Key "1")
        console.log('🔍 Setting selectedImageNumber to "1" for 1:1 mapping');
        setSelectedImageNumber('1');
      } catch (err) {
        console.error('Failed to load floor images', err);
        // setError('Failed to load floor images'); // This line was not in the original file, so it's removed.
      } finally {
        setIsLoading(false);
      }
    };
    loadImages();
  }, [floor]);

  // Load hotspots based on selected image type
  useEffect(() => {
    if (!floor) return;
    
    if (selectedImageType === 'topView') {
      setHotspots(floor.topViewHotspots || []);
    } else {
      // Load angle-specific hotspots
      const angleKey = selectedImageNumber;
      const angleHotspots = floor.angleHotspots?.[angleKey] || [];
      setHotspots(angleHotspots);
    }
  }, [floor, selectedImageType, selectedImageNumber]);

  const handleImageClick = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const newHotspot: Hotspot = { apartmentId: '', x: xPct, y: yPct };
    setHotspots(prev => [...prev, newHotspot]);
    setSelectedHotspotIdx(hotspots.length); // select newly added
  };

  const saveHotspots = async () => {
    if (!floor) return;
    
    try {
      console.log('🔍 Saving hotspots debug:');
      console.log('  - selectedImageType:', selectedImageType);
      console.log('  - selectedImageNumber:', selectedImageNumber);
      console.log('  - hotspots:', hotspots);
      
      if (selectedImageType === 'topView') {
        console.log('  - Saving as topViewHotspots');
        await floorService.updateHotspots(floor.id, { topViewHotspots: hotspots });
      } else {
        console.log('  - Saving as angleHotspots with key:', selectedImageNumber);
        const currentAngleHotspots = floor.angleHotspots || {};
        currentAngleHotspots[selectedImageNumber] = hotspots;
        console.log('  - Updated angleHotspots:', currentAngleHotspots);
        await floorService.updateHotspots(floor.id, { angleHotspots: currentAngleHotspots });
      }
      
      // Refresh floor data to show updated hotspots
      const updatedFloor = await floorService.getById(floor.id);
      setFloor(updatedFloor);
      
      alert('Hotspots saved successfully!');
    } catch (error) {
      console.error('Failed to save hotspots:', error);
      alert('Failed to save hotspots. Please try again.');
    }
  };

  const deleteHotspot = (idx: number) => {
    setHotspots(prev => prev.filter((_, i) => i !== idx));
    setSelectedHotspotIdx(null);
  };

  const getCurrentImageUrl = () => {
    console.log('🔍 getCurrentImageUrl Debug (NEW 1:1 MAPPING):');
    console.log('  - selectedImageType:', selectedImageType);
    console.log('  - selectedImageNumber:', selectedImageNumber);
    console.log('  - topViewImageUrl:', topViewImageUrl);
    
    if (selectedImageType === 'topView') {
      console.log('  - Returning topViewImageUrl:', topViewImageUrl);
      return topViewImageUrl;
    } else {
      // NEW: Use selectedImageNumber - 1 as array index for 1:1 mapping
      // Image 1 → Index 0, Image 2 → Index 1, etc.
      const imageIndex = parseInt(selectedImageNumber) - 1;
      console.log(`  - Image ${selectedImageNumber} → Index ${imageIndex}`);
      
      if (imageIndex >= 0 && imageIndex < floorImages.length) {
        const imageUrl = floorImages[imageIndex].imageUrl;
        console.log('  - Found image:', imageUrl.split('/').pop()?.split('?')[0]);
        return imageUrl;
      }
      
      console.log('  - Invalid index, returning empty string');
      return '';
    }
  };

  if (!floor) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-semibold">Floor not found.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <RotateCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading floor images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Canvas */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Header with controls */}
        <div className="bg-gray-800 p-4 flex items-center gap-4">
          <Link to="/admin/floors" className="p-2 text-white bg-black/40 rounded-full backdrop-blur-sm">
            <ArrowLeft />
          </Link>

          {/* Floor selector */}
          <select
            value={floor?.id}
            onChange={(e) => navigate(`/admin/floors/${e.target.value}/annotate`)}
            className="bg-gray-700 text-white px-3 py-2 rounded-md"
          >
            {floorsList.map(f => (
              <option key={f.id} value={f.id}>
                {f.name ?? `Floor ${f.level ?? ''}`}
              </option>
            ))}
          </select>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedImageType}
              onChange={(e) => setSelectedImageType(e.target.value as 'topView' | 'imageNumber')}
              className="bg-gray-700 text-white px-3 py-2 rounded-md"
            >
              <option value="topView">Top View</option>
              <option value="imageNumber">360° Image</option>
            </select>
            
            {selectedImageType === 'imageNumber' && (
              <select
                value={selectedImageNumber}
                onChange={(e) => setSelectedImageNumber(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-md"
              >
                {floorImages.map((_, idx) => {
                  // NEW: Use idx + 1 for perfect 1:1 mapping (Index 0 → Image 1 → Key "1")
                  const imageNumber = String(idx + 1);
                  return (
                    <option key={idx} value={imageNumber}>
                      Image {imageNumber}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
          
          <div className="text-white text-sm">
            {selectedImageType === 'topView' ? 'Top View' : `Image ${selectedImageNumber}`}
          </div>
        </div>

        {/* Image canvas */}
        <div className="flex-1 flex items-center justify-center relative" onClick={handleImageClick}>
          <img
            src={getCurrentImageUrl()}
            alt={selectedImageType === 'topView' ? 'Top view' : `Image ${selectedImageNumber}`}
            ref={imageRef}
            className="max-h-full max-w-full object-contain select-none"
          />

          {/* Render hotspots */}
          {hotspots.map((hs, idx) => (
            <button
              key={idx}
              className={`absolute w-6 h-6 rounded-full border-2 ${idx === selectedHotspotIdx ? 'bg-orange-500 border-white' : 'bg-teal-500 border-white'}`}
              style={{ left: `${hs.x}%`, top: `${hs.y}%`, transform: 'translate(-50%, -50%)' }}
              onClick={e => {
                e.stopPropagation();
                setSelectedHotspotIdx(idx);
              }}
            />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-800 text-white p-4 space-y-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">
          Hotspots for {selectedImageType === 'topView' ? 'Top View' : `Image ${selectedImageNumber}`}
        </h2>
        
        <div className="text-sm text-gray-300 mb-4">
          Click on the image to add hotspots, then link them to apartments below.
        </div>
        
        {hotspots.map((hs, idx) => {
          const apt = realApartments.find(a => a.id === hs.apartmentId);
          return (
            <div key={idx} className={`p-2 rounded-md ${idx === selectedHotspotIdx ? 'bg-gray-700' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm">#{idx + 1}</span>
                <button onClick={() => deleteHotspot(idx)} className="text-red-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
              <select
                value={hs.apartmentId}
                onChange={e => {
                  const id = e.target.value;
                  setHotspots(prev => prev.map((h, i) => i === idx ? { ...h, apartmentId: id } : h));
                }}
                className="mt-1 w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:outline-none"
              >
                <option value="">-- Link apartment --</option>
                {realApartments.map(a => (
                  <option key={a.id} value={a.id}>{a.lotNumber}</option>
                ))}
              </select>
              {apt && <p className="mt-1 text-xs text-teal-400">{apt.type} • {apt.area}m²</p>}
            </div>
          );
        })}

        <motion.button
          onClick={saveHotspots}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 p-2 rounded-md text-white"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Save size={16} /> Save
        </motion.button>
      </div>
    </div>
  );
};

export default FloorAnnotator;
 