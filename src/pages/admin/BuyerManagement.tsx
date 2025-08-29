import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Phone,
  Mail,
  User,
  Calendar,
  DollarSign,
  Building2,
  X,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Buyer } from '../../types/buyer';
import Modal from '../../components/common/Modal';

interface BuyerFormData {
  name: string;
  email: string;
  phone: string;
  status: 'INTERESTED' | 'NEGOTIATING' | 'PURCHASED' | 'CANCELLED';
  interestedApartmentIds: string[];
  budget: number;
  notes: string;
  contactDate: string;
}

const BuyerManagement: React.FC = () => {
  const { buyers, apartments, addBuyer, updateBuyer, deleteBuyer } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [formData, setFormData] = useState<BuyerFormData>({
    name: '',
    email: '',
    phone: '',
    status: 'INTERESTED',
    interestedApartmentIds: [],
    budget: 0,
    notes: '',
    contactDate: new Date().toISOString().split('T')[0]
  });

  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = 
      buyer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || buyer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (buyer?: Buyer) => {
    if (buyer) {
      setEditingBuyer(buyer);
      setFormData({
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        status: buyer.status,
        interestedApartmentIds: buyer.interestedApartmentIds || [],
        budget: buyer.budget || 0,
        notes: buyer.notes || '',
        contactDate: buyer.contactDate ? new Date(buyer.contactDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingBuyer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'INTERESTED',
        interestedApartmentIds: [],
        budget: 0,
        notes: '',
        contactDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBuyer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const buyerData: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      contactDate: new Date(formData.contactDate),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      if (editingBuyer) {
        await updateBuyer(editingBuyer.id, buyerData);
      } else {
        await addBuyer(buyerData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving buyer:', error);
      alert('Error saving buyer. Please try again.');
    }
  };

  const handleDelete = async (buyerId: string) => {
    if (window.confirm('Are you sure you want to delete this buyer?')) {
      try {
        await deleteBuyer(buyerId);
      } catch (error) {
        console.error('Error deleting buyer:', error);
        alert('Error deleting buyer. Please try again.');
      }
    }
  };

  const toggleApartmentInterest = (apartmentId: string) => {
    setFormData(prev => ({
      ...prev,
      interestedApartmentIds: prev.interestedApartmentIds.includes(apartmentId)
        ? prev.interestedApartmentIds.filter(id => id !== apartmentId)
        : [...prev.interestedApartmentIds, apartmentId]
    }));
  };

  const getApartmentDisplay = (apartmentId: string) => {
    const apartment = apartments.find(apt => apt.id === apartmentId);
    return apartment ? `${apartment.lotNumber} (${apartment.type})` : 'Unknown Apartment';
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'INTERESTED':
        return <Clock className="text-blue-500" size={16} />;
      case 'NEGOTIATING':
        return <UserCheck className="text-orange-500" size={16} />;
      case 'PURCHASED':
        return <UserCheck className="text-green-500" size={16} />;
      case 'CANCELLED':
        return <UserX className="text-red-500" size={16} />;
      default:
        return <User className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'INTERESTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NEGOTIATING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PURCHASED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statusCounts = {
    INTERESTED: buyers.filter(b => b.status === 'INTERESTED').length,
    NEGOTIATING: buyers.filter(b => b.status === 'NEGOTIATING').length,
    PURCHASED: buyers.filter(b => b.status === 'PURCHASED').length,
    CANCELLED: buyers.filter(b => b.status === 'CANCELLED').length
  };

  return (
    <div className="bg-gray-50 min-h-full py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Buyers Management
            </h1>
            <p className="text-gray-600">
              Manage buyers, potential buyers, and customer information
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus size={20} />
            Add Buyer
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Object.entries(statusCounts).map(([status, count]) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(status)}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {status.toLowerCase()}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {count}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search buyers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="INTERESTED">Interested</option>
              <option value="NEGOTIATING">Negotiating</option>
              <option value="PURCHASED">Purchased</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-gray-600">
              <Filter size={16} className="mr-2" />
              {filteredBuyers.length} of {buyers.length} buyers
            </div>
          </div>
        </div>

        {/* Buyers List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interested In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredBuyers.map((buyer) => (
                    <motion.tr
                      key={buyer.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-orange-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {buyer.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar size={12} />
                              {buyer.contactDate ? new Date(buyer.contactDate).toLocaleDateString() : 
                               buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : 
                               'No date'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            <Mail size={12} />
                            {buyer.email || 'No email'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Phone size={12} />
                            {buyer.phone || 'No phone'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(buyer.status)}`}>
                          {getStatusIcon(buyer.status)}
                          {buyer.status?.toLowerCase() || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <DollarSign size={14} />
                          {buyer.budget?.toLocaleString() || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {buyer.interestedApartmentIds && buyer.interestedApartmentIds.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {buyer.interestedApartmentIds.slice(0, 3).map((aptId) => (
                                <span
                                  key={aptId}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  <Building2 size={10} />
                                  {getApartmentDisplay(aptId)}
                                </span>
                              ))}
                              {buyer.interestedApartmentIds.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{buyer.interestedApartmentIds.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No specific interests</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleOpenModal(buyer)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(buyer.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredBuyers.length === 0 && (
          <div className="text-center py-12">
            <User size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No buyers found
            </h3>
            <p className="text-gray-600 mb-6">
              {buyers.length === 0 
                ? "Get started by adding your first buyer." 
                : "Try adjusting your search or filters."}
            </p>
            {buyers.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenModal()}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add First Buyer
              </motion.button>
            )}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingBuyer ? 'Edit Buyer' : 'Add Buyer'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="INTERESTED">Interested</option>
                  <option value="NEGOTIATING">Negotiating</option>
                  <option value="PURCHASED">Purchased</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Budget and Contact Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Date
                </label>
                <input
                  type="date"
                  value={formData.contactDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Interested Apartments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interested Apartments
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {apartments.map((apartment) => (
                    <label key={apartment.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.interestedApartmentIds.includes(apartment.id)}
                        onChange={() => toggleApartmentInterest(apartment.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm">
                        {apartment.lotNumber} - {apartment.type} ({apartment.area}m²)
                      </span>
                    </label>
                  ))}
                </div>
                {apartments.length === 0 && (
                  <p className="text-gray-500 text-sm">No apartments available</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Additional notes about this buyer..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCloseModal}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {editingBuyer ? 'Update' : 'Create'} Buyer
              </motion.button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default BuyerManagement;
