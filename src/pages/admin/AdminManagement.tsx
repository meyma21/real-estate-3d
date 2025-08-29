import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  MapPin, 
  Target,
  Plus,
  Edit,
  Database,
  Settings
} from 'lucide-react';

const AdminManagement: React.FC = () => {
  const managementSections = [
    {
      title: 'Apartments Management',
      description: 'Create, edit, and manage apartment listings with images and details',
      icon: Building2,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      link: '/admin/management/apartments',
      actions: ['View All', 'Add New', 'Bulk Edit']
    },
    {
      title: 'Floors Management',
      description: 'Manage floor plans, images, and layout configurations',
      icon: MapPin,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      link: '/admin/management/floors',
      actions: ['View All', 'Add New', 'Upload Images']
    },
    {
      title: 'Hotspots Management',
      description: 'Configure interactive hotspots and apartment mappings',
      icon: Target,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      link: '/admin/management/hotspots',
      actions: ['View All', 'Edit Mappings', 'Bulk Update']
    },
    {
      title: 'Buyers Management',
      description: 'Manage buyers, potential buyers, and customer information',
      icon: Users,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      link: '/admin/management/buyers',
      actions: ['View All', 'Add New', 'Update Status']
    }
  ];

  const quickStats = [
    { label: 'Total Apartments', value: '0', color: 'text-blue-600' },
    { label: 'Active Floors', value: '0', color: 'text-green-600' },
    { label: 'Total Hotspots', value: '0', color: 'text-purple-600' },
    { label: 'Registered Buyers', value: '0', color: 'text-orange-600' }
  ];

  return (
    <div className="bg-gray-50 min-h-full py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Management Panel
          </h1>
          <p className="text-gray-600">
            Comprehensive management interface for all real estate data
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stat.value}
              </div>
              <div className={`text-sm font-medium ${stat.color}`}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {managementSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className={`${section.color} p-6 text-white`}>
                <div className="flex items-center gap-4 mb-3">
                  <section.icon size={32} />
                  <h3 className="text-xl font-bold">{section.title}</h3>
                </div>
                <p className="text-white/90 text-sm">
                  {section.description}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {section.actions.map((action) => (
                    <span
                      key={action}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {action}
                    </span>
                  ))}
                </div>

                {/* Main Action Button */}
                <Link to={section.link}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${section.color} ${section.hoverColor} text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
                  >
                    <Settings size={18} />
                    Manage {section.title.split(' ')[0]}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Tools */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/floors/f0/annotate">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Hotspot Annotator
              </motion.button>
            </Link>
            
            <Link to="/debug-storage">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Database size={18} />
                Debug Storage
              </motion.button>
            </Link>

            <Link to="/upload-files">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Upload Files
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
