import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Loader2, X } from 'lucide-react';
import { useData, Apartment } from '../contexts/DataContext';
import ViewerHeader from '../components/layout/ViewerHeader';
import { threeDService } from '../services/threeDService';

const ThreeDViewerSimple: React.FC = () => {
  const { floors, apartments, loading } = useData();
  
  // Refs for Three.js objects
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  
  // State
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with first floor
  useEffect(() => {
    if (floors.length > 0 && !selectedFloorId) {
      setSelectedFloorId(floors[0].id);
    }
  }, [floors, selectedFloorId]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Load 3D model when floor changes
  useEffect(() => {
    if (!selectedFloorId || !sceneRef.current) return;

    const loadModel = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Remove existing model
        if (modelRef.current && sceneRef.current) {
          sceneRef.current.remove(modelRef.current);
          modelRef.current = null;
        }

        // Get the selected floor info
        const selectedFloor = floors.find(f => f.id === selectedFloorId);
        if (!selectedFloor) {
          setError('Floor not found');
          return;
        }

        // Try to get model URL from Firebase Storage based on floor name
        console.log(`Loading 3D model for floor: ${selectedFloor.name}`);
        const modelUrl = await threeDService.getFloorModelUrl(selectedFloor.name);
        
        if (!modelUrl) {
          console.warn(`No 3D model found for floor: ${selectedFloor.name}`);
          // Create a fallback model if no model exists in Storage
          const fallbackModel = createFallbackModel(selectedFloor.name);
          if (sceneRef.current) {
            sceneRef.current.add(fallbackModel);
            modelRef.current = fallbackModel;
          }
          return;
        }

        // Load model from Firebase Storage URL
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        loader.setDRACOLoader(dracoLoader);

        console.log(`Loading 3D model from Firebase Storage:`, modelUrl);
        const gltf = await loader.loadAsync(modelUrl);
        const model = gltf.scene;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        if (sceneRef.current) {
          sceneRef.current.add(model);
          modelRef.current = model;
        }

        console.log(`Successfully loaded 3D model for ${selectedFloor.name}`);
        
      } catch (err) {
        console.error('Error loading 3D model:', err);
        setError(err instanceof Error ? err.message : 'Failed to load 3D model');
        
        // Create a fallback model on error
        const selectedFloor = floors.find(f => f.id === selectedFloorId);
        const fallbackModel = createFallbackModel(selectedFloor?.name || 'Unknown Floor');
        if (sceneRef.current) {
          sceneRef.current.add(fallbackModel);
          modelRef.current = fallbackModel;
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, [selectedFloorId, floors]);

  // Create a fallback model when no 3D model is available
  const createFallbackModel = (floorName: string) => {
    const group = new THREE.Group();

    // Create a simple floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    group.add(floor);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
    group.add(gridHelper);

    return group;
  };

  // Handle floor change
  const handleFloorChange = (floorId: string) => {
    setSelectedFloorId(floorId);
    setSelectedApartment(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ViewerHeader />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-slate-600">Loading floors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ViewerHeader />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-slate-600">Loading 3D model...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ViewerHeader />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <div className="text-red-600 text-center p-4">
            <p className="text-lg font-semibold mb-2">Error Loading 3D Model</p>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ViewerHeader />
      <div className="pt-16 h-screen flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Floors</h2>
          <div className="space-y-2">
            {floors.map(floor => (
              <button
                key={floor.id}
                onClick={() => handleFloorChange(floor.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedFloorId === floor.id
                    ? 'bg-teal-100 text-teal-700 border border-teal-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{floor.name}</div>
                <div className="text-sm text-gray-500">
                  {apartments.filter(apt => apt.floorId === floor.id).length} apartments
                </div>
              </button>
            ))}
          </div>

          {/* Floor info */}
          {selectedFloorId && (
            <div className="mt-6 p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-800 mb-2">Floor Info</h3>
              {(() => {
                const selectedFloor = floors.find(f => f.id === selectedFloorId);
                const floorApartments = apartments.filter(apt => apt.floorId === selectedFloorId);
                return (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Name: {selectedFloor?.name}</p>
                    <p>Apartments: {floorApartments.length}</p>
                    <p>Available: {floorApartments.filter(apt => apt.status === 'AVAILABLE').length}</p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Main 3D viewer */}
        <div className="flex-1 relative">
          <div ref={containerRef} className="w-full h-full" />

          {/* Selected apartment info */}
          {selectedApartment && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{selectedApartment.lotNumber}</h3>
                <button
                  onClick={() => setSelectedApartment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">
                  Status: <span className="font-medium">{selectedApartment.status}</span>
                </p>
                <p className="text-gray-600">
                  Price: <span className="font-medium">{formatCurrency(selectedApartment.price)}</span>
                </p>
                <p className="text-gray-600">
                  Area: <span className="font-medium">{selectedApartment.area} m²</span>
                </p>
                <Link
                  to={`/viewer/apartments`}
                  className="block text-center mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  View All Apartments
                </Link>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                <span>Loading 3D model...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreeDViewerSimple; 