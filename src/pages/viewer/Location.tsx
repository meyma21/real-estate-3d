import React, { useEffect, useRef, useState } from 'react';
import ViewerHeader from '../../components/layout/ViewerHeader';
import { MapPin, Navigation, Train, Bus, Car, ShoppingBag, School, Stethoscope } from 'lucide-react';

const Location: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;

    const initMap = () => {
      try {
        if (!mapRef.current || !isMounted) return;
        
        const location = { lat: 48.8584, lng: 2.2945 }; // Eiffel Tower coordinates
        const mapOptions = {
          zoom: 15,
          center: location,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'cooperative',
          mapTypeId: 'roadmap',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        };

        const map = new window.google.maps.Map(mapRef.current, mapOptions);

        new window.google.maps.Marker({
          position: location,
          map: map,
          title: 'Our Location',
          animation: window.google.maps.Animation.DROP
        });

        setMapError(null);
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMounted) {
          setMapError('Failed to load map. Please try refreshing the page.');
        }
      }
    };

    // Define the initMap function in the global scope
    window.initMap = initMap;

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      if (isMounted) {
        setMapError('Failed to load Google Maps. Please check your internet connection.');
      }
    };
    document.head.appendChild(script);

    return () => {
      isMounted = false;
      document.head.removeChild(script);
      delete window.initMap;
    };
  }, [apiKey]);

  const nearbyPlaces = [
    {
      icon: <Train className="w-6 h-6 text-teal-600" />,
      title: "Gare",
      description: "Gare de Lyon - 5 minutes à pied",
      distance: "500m"
    },
    {
      icon: <Bus className="w-6 h-6 text-teal-600" />,
      title: "Arrêt de bus",
      description: "Lignes 24, 63, 89",
      distance: "100m"
    },
    {
      icon: <Car className="w-6 h-6 text-teal-600" />,
      title: "Parking",
      description: "Parking public sécurisé",
      distance: "200m"
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-teal-600" />,
      title: "Centre commercial",
      description: "Bercy Village",
      distance: "800m"
    },
    {
      icon: <School className="w-6 h-6 text-teal-600" />,
      title: "Écoles",
      description: "École primaire et collège",
      distance: "1km"
    },
    {
      icon: <Stethoscope className="w-6 h-6 text-teal-600" />,
      title: "Hôpital",
      description: "Hôpital Saint-Antoine",
      distance: "1.5km"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <ViewerHeader />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Localisation</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                {mapError ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <p className="text-slate-600">{mapError}</p>
                  </div>
                ) : (
                  <div 
                    ref={mapRef}
                    id="map" 
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      minHeight: '400px'
                    }}
                  ></div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="text-teal-600 mt-1" size={20} />
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Adresse</h2>
                    <p className="text-slate-600">123 Rue du Projet</p>
                    <p className="text-slate-600">75000 Paris, France</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Information Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Accès</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Navigation className="text-teal-600 mt-1" size={20} />
                    <div>
                      <p className="text-slate-800 font-medium">En voiture</p>
                      <p className="text-slate-600">Accès facile depuis le périphérique</p>
                      <p className="text-slate-600">Parking résidentiel disponible</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Train className="text-teal-600 mt-1" size={20} />
                    <div>
                      <p className="text-slate-800 font-medium">En transport en commun</p>
                      <p className="text-slate-600">Métro : Ligne 1, 14</p>
                      <p className="text-slate-600">RER : Ligne A, D</p>
                      <p className="text-slate-600">Bus : Lignes 24, 63, 89</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">À proximité</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyPlaces.map((place, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {place.icon}
                      <div>
                        <p className="text-slate-800 font-medium">{place.title}</p>
                        <p className="text-slate-600 text-sm">{place.description}</p>
                        <p className="text-teal-600 text-sm">{place.distance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Location; 