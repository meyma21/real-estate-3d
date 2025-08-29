import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Apartment, ApartmentStatus, ApartmentType } from '../../types/apartment';
import { apartmentService } from '../../services/apartmentService';
import { mediaService } from '../../services/mediaService';
import { useAuth } from '../../contexts/AuthContext';

interface PropertyFormProps {
  initialData?: Apartment;
  isEdit?: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, isEdit = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Apartment>>(initialData || {
    number: '',
    type: ApartmentType.APARTMENT,
    status: ApartmentStatus.AVAILABLE,
    price: 0,
    area: 0,
    floorId: '',
    description: '',
    features: [],
    images: [],
    model3dUrl: '',
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedModel, setSelectedModel] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'area' ? Number(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedModel(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload images
      const imageUrls = await Promise.all(
        selectedImages.map(file => mediaService.uploadFile(file, 'image'))
      );

      // Upload 3D model if selected
      let model3dUrl = formData.model3dUrl;
      if (selectedModel) {
        const modelResponse = await mediaService.uploadFile(selectedModel, '3d');
        model3dUrl = modelResponse.url;
      }

      const apartmentData = {
        ...formData,
        images: [...(formData.images || []), ...imageUrls.map(img => img.url)],
        model3dUrl
      };

      if (isEdit && initialData?.id) {
        await apartmentService.update(initialData.id, apartmentData);
      } else {
        await apartmentService.create(apartmentData as Omit<Apartment, 'id'>);
      }

      navigate('/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Number</label>
        <input
          type="text"
          name="number"
          value={formData.number}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {Object.values(ApartmentType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {Object.values(ApartmentStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          required
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Area (m²)</label>
        <input
          type="number"
          name="area"
          value={formData.area}
          onChange={handleInputChange}
          required
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Floor ID</label>
        <input
          type="text"
          name="floorId"
          value={formData.floorId}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="mt-1 block w-full"
        />
        {formData.images && formData.images.length > 0 && (
          <div className="mt-2 grid grid-cols-4 gap-2">
            {formData.images.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Property ${index + 1}`}
                className="h-20 w-20 object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">3D Model</label>
        <input
          type="file"
          accept=".glb,.gltf"
          onChange={handleModelChange}
          className="mt-1 block w-full"
        />
        {formData.model3dUrl && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Current model: {formData.model3dUrl}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/properties')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm; 