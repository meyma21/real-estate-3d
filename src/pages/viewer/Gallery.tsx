import React, { useState } from 'react';
import ViewerHeader from '../../components/layout/ViewerHeader';
import { X } from 'lucide-react';

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop',
      title: 'Vue extérieure',
      description: 'Vue panoramique du bâtiment principal',
      category: 'exterior'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=800&fit=crop',
      title: 'Salon',
      description: 'Espace de vie lumineux et moderne',
      category: 'interior'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=800&fit=crop',
      title: 'Cuisine',
      description: 'Cuisine équipée haut de gamme',
      category: 'interior'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&h=800&fit=crop',
      title: 'Chambre principale',
      description: 'Suite parentale spacieuse',
      category: 'interior'
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=800&fit=crop',
      title: 'Salle de bain',
      description: 'Salle de bain design avec douche à l\'italienne',
      category: 'interior'
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
      title: 'Terrasse',
      description: 'Terrasse privative avec vue panoramique',
      category: 'exterior'
    },
    {
      id: 7,
      url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&h=800&fit=crop',
      title: 'Piscine',
      description: 'Piscine intérieure chauffée',
      category: 'facilities'
    },
    {
      id: 8,
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop',
      title: 'Salle de sport',
      description: 'Espace fitness moderne',
      category: 'facilities'
    },
    {
      id: 9,
      url: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1200&h=800&fit=crop',
      title: 'Jardin',
      description: 'Espace vert paysager',
      category: 'exterior'
    }
  ];

  const categories = [
    { id: 'all', name: 'Toutes les photos' },
    { id: 'exterior', name: 'Extérieur' },
    { id: 'interior', name: 'Intérieur' },
    { id: 'facilities', name: 'Équipements' }
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredImages = activeCategory === 'all'
    ? images
    : images.filter(image => image.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      <ViewerHeader />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Galerie Photos</h1>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-4 mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${activeCategory === category.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map(image => (
              <div
                key={image.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedImage(image.url)}
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {image.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {image.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-teal-500 transition-colors"
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Selected"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default Gallery; 