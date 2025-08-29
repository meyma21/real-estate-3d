import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Edit, 
  Save, 
  Trash, 
  Plus, 
  X,
  Home,
  Layers,
  Ruler,
  DollarSign,
  Tag
} from 'lucide-react';
import { useData, Apartment, Buyer, Floor } from '../contexts/DataContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const ApartmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getApartment, 
    updateApartment, 
    deleteApartment, 
    floors,
    buyers,
    addBuyer,
    deleteBuyer, 
    loading 
  } = useData();
  
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedApartment, setEditedApartment] = useState<Apartment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddBuyerModalOpen, setIsAddBuyerModalOpen] = useState(false);
  const [newBuyer, setNewBuyer] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Load apartment data
  useEffect(() => {
    if (id) {
      const apartmentData = getApartment(id);
      if (apartmentData) {
        setApartment(apartmentData);
        setEditedApartment(apartmentData);
      } else {
        navigate('/apartments');
        toast.error('Apartment not found');
      }
    }
  }, [id, getApartment, navigate]);
  
  // Handle edit form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editedApartment) return;
    
    const { name, value } = e.target;
    
    setEditedApartment({
      ...editedApartment,
      [name]: name === 'area' || name === 'price' ? parseFloat(value) || 0 : value
    });
  };
  
  // Handle save
  const handleSave = async () => {
    if (!editedApartment) return;
    
    try {
      const updated = await updateApartment(editedApartment.id, editedApartment);
      setApartment(updated);
      setIsEditing(false);
      toast.success('Apartment updated successfully');
    } catch (error) {
      toast.error('Failed to update apartment');
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!apartment) return;
    
    try {
      await deleteApartment(apartment.id);
      setIsDeleteModalOpen(false);
      navigate('/apartments');
      toast.success('Apartment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete apartment: ' + (error as Error).message);
    }
  };
  
  // Handle buyer form input changes
  const handleBuyerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setNewBuyer({
      ...newBuyer,
      [name]: value
    });
  };
  
  // Handle add buyer
  const handleAddBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apartment) return;
    
    try {
      await addBuyer({
        ...newBuyer,
        apartmentId: apartment.id
      });
      
      setIsAddBuyerModalOpen(false);
      setNewBuyer({
        name: '',
        email: '',
        phone: '',
        notes: ''
      });
      
      toast.success('Buyer added successfully');
    } catch (error) {
      toast.error('Failed to add buyer');
    }
  };
  
  // Handle delete buyer
  const handleDeleteBuyer = async (buyerId: string) => {
    try {
      await deleteBuyer(buyerId);
      toast.success('Buyer removed successfully');
    } catch (error) {
      toast.error('Failed to remove buyer');
    }
  };
  
  if (!apartment) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Get floor data
  const floor = floors.find((f: Floor) => f.id === apartment.floorId);
  
  // Get apartment buyers
  const apartmentBuyers = buyers.filter((b: Buyer) => b.apartmentId === apartment.id);
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/apartments" className="text-slate-500 hover:text-slate-700">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800">
            Apartment {apartment.lotNumber}
          </h1>
          <StatusBadge status={apartment.status} />
        </div>
        
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-outline flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save size={16} />
                    Save
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline flex items-center gap-2"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="btn btn-danger flex items-center gap-2"
              >
                <Trash size={16} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Apartment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-4">Apartment Information</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lotNumber" className="label">Lot Number</label>
                    <input
                      id="lotNumber"
                      name="lotNumber"
                      type="text"
                      className="input"
                      value={editedApartment?.lotNumber || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="label">Type</label>
                    <input
                      id="type"
                      name="type"
                      type="text"
                      className="input"
                      value={editedApartment?.type || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="floorId" className="label">Floor</label>
                    <select
                      id="floorId"
                      name="floorId"
                      className="select"
                      value={editedApartment?.floorId || ''}
                      onChange={handleInputChange}
                      required
                    >
                      {floors.map((floor: Floor) => (
                        <option key={floor.id} value={floor.id}>
                          {floor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="label">Status</label>
                    <select
                      id="status"
                      name="status"
                      className="select"
                      value={editedApartment?.status || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="SOLD">Sold</option>
                      <option value="UNDER_CONSTRUCTION">Under Construction</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="area" className="label">Area (m²)</label>
                    <input
                      id="area"
                      name="area"
                      type="number"
                      step="0.01"
                      min="0"
                      className="input"
                      value={editedApartment?.area || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="label">Price</label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="1000"
                      min="0"
                      className="input"
                      value={editedApartment?.price || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="label">Image URL</label>
                  <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    className="input"
                    value={editedApartment?.imageUrl || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="plan2DUrl" className="label">2D Plan URL</label>
                  <input
                    id="plan2DUrl"
                    name="plan2DUrl"
                    type="url"
                    className="input"
                    value={editedApartment?.plan2DUrl || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="input"
                    value={editedApartment?.description || ''}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                      <Home size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Apartment Type</p>
                      <p className="font-medium">{apartment.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                      <Layers size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Floor</p>
                      <p className="font-medium">{floor?.name || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                      <Ruler size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Area</p>
                      <p className="font-medium">{apartment.area} m²</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                      <DollarSign size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Price</p>
                      <p className="font-medium">{formatCurrency(apartment.price)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                      <Tag size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <StatusBadge status={apartment.status} />
                    </div>
                  </div>
                </div>
                
                {apartment.description && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Description</p>
                    <p className="text-slate-700">{apartment.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Potential Buyers */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-medium text-slate-800">Potential Buyers</h2>
              <button
                onClick={() => setIsAddBuyerModalOpen(true)}
                className="btn btn-secondary flex items-center gap-2 py-1.5"
              >
                <Plus size={16} />
                Add Buyer
              </button>
            </div>
            
            <div className="p-4">
              {apartmentBuyers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No potential buyers yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apartmentBuyers.map((buyer: Buyer) => (
                    <div key={buyer.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{buyer.name}</h3>
                          <p className="text-sm text-slate-500">{buyer.email} | {buyer.phone}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteBuyer(buyer.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove buyer"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      {buyer.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-slate-700">{buyer.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-slate-400">
                        Added on {formatDate(buyer.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Images Column */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-4">Apartment Image</h2>
            
            {apartment.imageUrl ? (
              <div className="relative aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden">
                <img 
                  src={apartment.imageUrl} 
                  alt={`Apartment ${apartment.lotNumber}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-slate-100 rounded-lg flex items-center justify-center">
                <p className="text-slate-400">No image available</p>
              </div>
            )}
          </div>
          
          {/* Floor Plan */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-4">Floor Plan</h2>
            
            {apartment.plan2DUrl ? (
              <div className="relative aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden">
                <img 
                  src={apartment.plan2DUrl} 
                  alt={`Floor plan for ${apartment.lotNumber}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-slate-100 rounded-lg flex items-center justify-center">
                <p className="text-slate-400">No floor plan available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Are you sure you want to delete apartment <strong>{apartment.lotNumber}</strong>?
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Add Buyer Modal */}
      <Modal
        isOpen={isAddBuyerModalOpen}
        onClose={() => setIsAddBuyerModalOpen(false)}
        title="Add Potential Buyer"
      >
        <form onSubmit={handleAddBuyer}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Full Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                value={newBuyer.name}
                onChange={handleBuyerInputChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="label">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                value={newBuyer.email}
                onChange={handleBuyerInputChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="label">Phone *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input"
                value={newBuyer.phone}
                onChange={handleBuyerInputChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="label">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="input"
                placeholder="Enter any additional notes..."
                value={newBuyer.notes}
                onChange={handleBuyerInputChange}
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAddBuyerModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Add Buyer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ApartmentDetail;