import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { Loader2, X } from 'lucide-react';
import { useData, Apartment } from '../contexts/DataContext';
import ViewerHeader from '../components/layout/ViewerHeader';
import { threeDService } from '../services/threeDService';
import { cacheUtils } from '../utils/cacheUtils';

const ThreeDViewer: React.FC = () => {
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

  // Initialize Three.js scene with enhanced lighting and environment
  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent multiple initialization
    if (rendererRef.current) {
      console.log('⚠️ Renderer already exists, skipping initialization');
      return;
    }

    console.log('🚀 Initializing Three.js scene...');

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Create camera with optimized settings
    const camera = new THREE.PerspectiveCamera(
      60, // Slightly narrower field of view for better perspective
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    // Better initial camera position for architectural viewing
    camera.position.set(8, 6, 8);
    cameraRef.current = camera;

    // Create renderer with enhanced settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    // Ensure canvas is visible
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    console.log('🖥️ Renderer created and canvas added to DOM:', {
      canvasSize: { width: renderer.domElement.width, height: renderer.domElement.height },
      containerSize: { width: containerRef.current.clientWidth, height: containerRef.current.clientHeight },
      canvasParent: renderer.domElement.parentNode ? 'attached' : 'not attached'
    });

    // Create controls with better settings for architectural viewing
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2; // Prevent going below ground
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    fillLight.position.set(-5, 10, -5);
    scene.add(fillLight);

    console.log('🎬 Scene initialized with enhanced lighting');

    // Load environment background from Firebase
    loadEnvironmentBackground(scene);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Check if canvas is visible after a short delay
    setTimeout(() => {
      const canvas = containerRef.current?.querySelector('canvas');
      console.log('🔍 Canvas visibility check:', {
        canvasExists: !!canvas,
        canvasVisible: canvas ? getComputedStyle(canvas).display !== 'none' : false,
        canvasSize: canvas ? { width: canvas.clientWidth, height: canvas.clientHeight } : null,
        containerSize: containerRef.current ? { width: containerRef.current.clientWidth, height: containerRef.current.clientHeight } : null
      });
      
      // If canvas is missing, try to re-attach it
      if (!canvas && rendererRef.current && containerRef.current) {
        console.log('🔧 Canvas missing, re-attaching...');
        try {
          containerRef.current.appendChild(rendererRef.current.domElement);
          console.log('✅ Canvas re-attached successfully');
        } catch (error) {
          console.error('❌ Failed to re-attach canvas:', error);
        }
      }
    }, 1000);

    // Also check periodically to ensure canvas stays attached
    const canvasCheckInterval = setInterval(() => {
      if (!containerRef.current || !rendererRef.current) return;
      
      const canvas = containerRef.current.querySelector('canvas');
      if (!canvas && rendererRef.current.domElement) {
        console.log('🔧 Canvas disappeared, re-attaching...');
        try {
          containerRef.current.appendChild(rendererRef.current.domElement);
          console.log('✅ Canvas re-attached via interval check');
        } catch (error) {
          console.warn('⚠️ Failed to re-attach canvas via interval:', error);
        }
      }
    }, 2000);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    const originalCleanup = () => {
      clearInterval(canvasCheckInterval);
      console.log('🧹 Cleaning up Three.js scene...');
      window.removeEventListener('resize', handleResize);
      
      // Properly dispose of Three.js objects
      if (rendererRef.current) {
        if (containerRef.current && rendererRef.current.domElement) {
          try {
            if (rendererRef.current.domElement.parentNode === containerRef.current) {
              containerRef.current.removeChild(rendererRef.current.domElement);
              console.log('✅ Canvas removed from DOM');
            }
          } catch (error) {
            console.warn('⚠️ Canvas removal error (likely already removed):', error);
          }
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      // Clear refs
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      modelRef.current = null;
    };

    return originalCleanup;
  }, []);

  // Load environment background from Firebase Storage
  const loadEnvironmentBackground = async (scene: THREE.Scene) => {
    try {
      console.log('🌅 Loading environment background from Firebase...');
      const environmentUrl = await threeDService.getEnvironmentUrl();
      
      if (environmentUrl) {
        const exrLoader = new EXRLoader();
        exrLoader.load(
          environmentUrl,
          (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
            console.log('✅ Environment background loaded successfully');
          },
          undefined,
          (error) => {
            console.warn('⚠️ Failed to load EXR environment, using fallback:', error);
            // Keep the default background color
          }
        );
      }
    } catch (error) {
      console.warn('⚠️ Environment background not available:', error);
    }
  };

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
        console.log(`🏢 Loading 3D model for floor: ${selectedFloor.name}`);
        const modelUrl = await threeDService.getFloorModelUrl(selectedFloor.name);
        
        if (!modelUrl) {
          console.warn(`⚠️ No 3D model found for floor: ${selectedFloor.name}`);
          // Create a fallback model if no model exists in Storage
          const fallbackModel = await createFallbackModel(selectedFloor.name);
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

        console.log(`🔥 Loading 3D model from Firebase Storage:`, modelUrl);
        const gltf = await loader.loadAsync(modelUrl);
        const model = gltf.scene;

        // Enable shadows for the model
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 6 / maxDim; // Slightly larger scale for better viewing
        model.scale.setScalar(scale);
        
        // Position model at ground level (Y=0) instead of centering
        model.position.set(0, 0, 0);
        const modelBox = new THREE.Box3().setFromObject(model);
        const modelCenter = modelBox.getCenter(new THREE.Vector3());
        model.position.x = -modelCenter.x;
        model.position.z = -modelCenter.z;
        model.position.y = -modelBox.min.y; // Place bottom of model at ground level

        // Debug logging
        console.log(`📏 Model dimensions:`, { size, center, maxDim, scale });
        console.log(`📍 Model position after centering:`, model.position);
        console.log(`📦 Model bounding box:`, { min: modelBox.min, max: modelBox.max });

        if (sceneRef.current) {
        sceneRef.current.add(model);
        modelRef.current = model;
        }

        // Update camera position to look at the model
        if (controlsRef.current && cameraRef.current) {
          // Position camera to get a good view of the model
          const distance = Math.max(10, maxDim * scale * 1.5);
          cameraRef.current.position.set(distance, distance * 0.8, distance);
          controlsRef.current.target.set(0, 1, 0); // Look at ground level, slightly above
          controlsRef.current.update();
          console.log(`📷 Camera positioned at:`, cameraRef.current.position);
          console.log(`🎯 Camera target:`, controlsRef.current.target);
        }

        console.log(`✅ Successfully loaded 3D model for ${selectedFloor.name}`);
        
      } catch (err) {
        console.error('❌ Error loading 3D model:', err);
        
        // Provide specific error messages
        let errorMessage = 'Failed to load 3D model';
        if (err instanceof Error) {
          if (err.message.includes('CORS') || err.message.includes('preflight')) {
            errorMessage = 'CORS configuration required for Firebase Storage. Please configure CORS settings.';
          } else if (err.message.includes('retry-limit-exceeded')) {
            errorMessage = 'Firebase Storage access failed. Check CORS configuration and file permissions.';
          } else if (err.message.includes('Unexpected token')) {
            errorMessage = 'Invalid file format. Expected GLB model file.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
        
        // Create a fallback model on error
        const selectedFloor = floors.find(f => f.id === selectedFloorId);
        const fallbackModel = await createFallbackModel(selectedFloor?.name || 'Unknown Floor');
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

  // Create a fallback model with enhanced materials and textures from Firebase
  const createFallbackModel = async (floorName: string) => {
    const group = new THREE.Group();

    try {
      // Try to load floor texture from Firebase
      const textureUrl = await threeDService.getFloorTextureUrl();
      let floorMaterial: THREE.Material;

      if (textureUrl) {
        console.log('🎨 Loading floor texture from Firebase:', textureUrl);
        const textureLoader = new THREE.TextureLoader();
        const floorTexture = await textureLoader.loadAsync(textureUrl);
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(4, 4);
        
        floorMaterial = new THREE.MeshStandardMaterial({
          map: floorTexture,
          roughness: 0.8,
          metalness: 0.1
        });
        console.log('✅ Floor texture loaded successfully');
      } else {
        // Fallback material
        floorMaterial = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.8,
          metalness: 0.2
        });
      }

    // Create a simple floor
      const floorGeometry = new THREE.PlaneGeometry(12, 12);
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      group.add(floor);

      // Add grid helper
      const gridHelper = new THREE.GridHelper(12, 12, 0x888888, 0xcccccc);
      gridHelper.position.y = 0.01; // Slightly above floor to prevent z-fighting
      group.add(gridHelper);

      // Add some basic architectural elements
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.9,
        metalness: 0.1
      });

      // Create simple walls
      const wallGeometry = new THREE.BoxGeometry(0.2, 3, 8);
      const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
      wall1.position.set(-4, 1.5, 0);
      wall1.castShadow = true;
      wall1.receiveShadow = true;
      group.add(wall1);

      const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
      wall2.position.set(4, 1.5, 0);
      wall2.castShadow = true;
      wall2.receiveShadow = true;
      group.add(wall2);

    } catch (error) {
      console.warn('⚠️ Could not load Firebase textures for fallback model:', error);
      
      // Basic fallback without textures
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
    group.add(floor);

      const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
    group.add(gridHelper);
    }

    return group;
  };

  // Handle floor change
  const handleFloorChange = (floorId: string) => {
    setSelectedFloorId(floorId);
    setSelectedApartment(null);
  };

  // Add cache utilities to window for debugging (in development only)
  if (import.meta.env.DEV) {
    (window as any).cacheUtils = cacheUtils;
    console.log('🔧 Cache utilities available in console: window.cacheUtils');
  }

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

export default ThreeDViewer;