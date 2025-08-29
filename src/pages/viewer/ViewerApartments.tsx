import React, { useState } from 'react';
import ViewerHeader from '../../components/layout/ViewerHeader';
import { Bed, Bath, Ruler, ArrowRight } from 'lucide-react';

const ViewerApartments: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');

  const apartments = [
    {
      id: 1,
      type: 'T2',
      floor: 2,
      area: 45,
      price: 250000,
      bedrooms: 1,
      bathrooms: 1,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
      description: 'Appartement lumineux avec balcon'
    },
    {
      id: 2,
      type: 'T3',
      floor: 3,
      area: 65,
      price: 350000,
      bedrooms: 2,
      bathrooms: 1,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop',
      description: 'Spacieux appartement avec terrasse'
    },
    {
      id: 3,
      type: 'T4',
      floor: 4,
      area: 85,
      price: 450000,
      bedrooms: 3,
      bathrooms: 2,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop',
      description: 'Grand appartement familial'
    },
    {
      id: 4,
      type: 'T2',
      floor: 5,
      area: 48,
      price: 270000,
      bedrooms: 1,
      bathrooms: 1,
      status: 'reserved',
      image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&h=800&fit=crop',
      description: 'Appartement avec vue panoramique'
    },
    {
      id: 5,
      type: 'T3',
      floor: 6,
      area: 70,
      price: 380000,
      bedrooms: 2,
      bathrooms: 2,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop',
      description: 'Appartement avec dressing'
    },
    {
      id: 6,
      type: 'T4',
      floor: 7,
      area: 90,
      price: 480000,
      bedrooms: 3,
      bathrooms: 2,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop',
      description: 'Appartement de standing'
    }
  ];

  const types = [
    { id: 'all', name: 'Tous les types' },
    { id: 'T2', name: 'T2 (1 chambre)' },
    { id: 'T3', name: 'T3 (2 chambres)' },
    { id: 'T4', name: 'T4 (3 chambres)' }
  ];

  const floors = [
    { id: 'all', name: 'Tous les étages' },
    { id: '2', name: '2ème étage' },
    { id: '3', name: '3ème étage' },
    { id: '4', name: '4ème étage' },
    { id: '5', name: '5ème étage' },
    { id: '6', name: '6ème étage' },
    { id: '7', name: '7ème étage' }
  ];

  const filteredApartments = apartments.filter(apartment => {
    const typeMatch = selectedType === 'all' || apartment.type === selectedType;
    const floorMatch = selectedFloor === 'all' || apartment.floor.toString() === selectedFloor;
    return typeMatch && floorMatch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ViewerHeader />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Nos Appartements</h1>
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type d'appartement
                </label>
                <div className="flex flex-wrap gap-2">
                  {types.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                        ${selectedType === type.id
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Étage
                </label>
                <div className="flex flex-wrap gap-2">
                  {floors.map(floor => (
                    <button
                      key={floor.id}
                      onClick={() => setSelectedFloor(floor.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                        ${selectedFloor === floor.id
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {floor.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Apartments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApartments.map(apartment => (
              <div key={apartment.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={apartment.image}
                    alt={`${apartment.type} - ${apartment.description}`}
                    className="object-cover w-full h-full"
                  />
                  {apartment.status === 'reserved' && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Réservé
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-1">
                        {apartment.type}
                      </h3>
                      <p className="text-slate-600">{apartment.description}</p>
                    </div>
                    <p className="text-xl font-bold text-teal-600">
                      {formatPrice(apartment.price)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Bed className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-600">{apartment.bedrooms} chambres</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bath className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-600">{apartment.bathrooms} sdb</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Ruler className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-600">{apartment.area}m²</span>
                    </div>
                  </div>
                  
                  <button
                    className="w-full btn btn-primary flex items-center justify-center space-x-2"
                    onClick={() => window.location.href = `/viewer/apartments/${apartment.id}`}
                  >
                    <span>Voir les détails</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewerApartments; 