import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Layers, User, CreditCard, ArrowRight, Settings, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

interface DashboardStats {
  totalApartments: number;
  availableApartments: number;
  soldApartments: number;
  underConstructionApartments: number;
  totalFloors: number;
  totalBuyers: number;
  totalValue: number;
  soldValue: number;
}

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalApartments: 0,
    availableApartments: 0,
    soldApartments: 0,
    underConstructionApartments: 0,
    totalFloors: 0,
    totalBuyers: 0,
    totalValue: 0,
    soldValue: 0
  });
  const [recentApartments, setRecentApartments] = useState<any[]>([]);
  const [floorsList, setFloorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch apartments
        const apartmentsQuery = query(collection(db, 'apartments'));
        const apartmentsSnapshot = await getDocs(apartmentsQuery);
        const apartments = apartmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch floors
        const floorsQuery = query(collection(db, 'floors'));
        const floorsSnapshot = await getDocs(floorsQuery);
        const floors = floorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // store for annotate list
        setFloorsList(floors);

        // Fetch buyers
        const buyersQuery = query(collection(db, 'buyers'));
        const buyersSnapshot = await getDocs(buyersQuery);
        const buyers = buyersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate statistics
        const totalApartments = apartments.length;
        const availableApartments = apartments.filter(apt => apt.status === 'AVAILABLE').length;
        const soldApartments = apartments.filter(apt => apt.status === 'SOLD').length;
        const underConstructionApartments = apartments.filter(apt => apt.status === 'UNDER_CONSTRUCTION').length;
        const totalFloors = floors.length;
        const totalBuyers = buyers.length;
        const totalValue = apartments.reduce((sum, apt) => sum + apt.price, 0);
        const soldValue = apartments
          .filter(apt => apt.status === 'SOLD')
          .reduce((sum, apt) => sum + apt.price, 0);

        setStats({
          totalApartments,
          availableApartments,
          soldApartments,
          underConstructionApartments,
          totalFloors,
          totalBuyers,
          totalValue,
          soldValue
        });

        // Set recent apartments
        setRecentApartments(apartments.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {user?.email}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link 
              to="/admin/settings" 
              className="btn btn-outline flex items-center gap-2"
            >
              <Settings size={16} />
              Settings
            </Link>
          )}
          <Link 
            to="/admin/viewer" 
            className="btn btn-primary flex items-center gap-2"
            target="_blank"
          >
            View 3D Model
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      
      {/* Dynamic Annotate Hotspots Buttons */}
      {isAdmin && floorsList.length > 0 && (
        <div className="my-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg">
          <h3 className="text-lg font-semibold text-teal-800 mb-2">Floor Hotspot Management</h3>
          <p className="text-sm text-teal-600 mb-4">Select a floor to start annotating hotspots</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {floorsList.map((floor: any) => (
              <Link
                key={floor.id}
                to={`/admin/floors/${floor.id}/annotate`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg shadow hover:bg-teal-700 transition-all"
              >
                Annotate {floor.name || `Floor ${floor.level}`}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Apartments</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalApartments}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Home size={24} className="text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <span className="text-green-500 font-medium">{stats.availableApartments}</span> Available
            </div>
            <div>
              <span className="text-red-500 font-medium">{stats.soldApartments}</span> Sold
            </div>
            <div>
              <span className="text-amber-500 font-medium">{stats.underConstructionApartments}</span> In Progress
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Floors</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalFloors}</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg">
              <Layers size={24} className="text-teal-500" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <span className="text-teal-500 font-medium">{stats.totalFloors}</span> Active Floors
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Potential Buyers</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalBuyers}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <User size={24} className="text-purple-500" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <span className="text-purple-500 font-medium">{stats.totalBuyers}</span> Total Inquiries
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Property Value</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <CreditCard size={24} className="text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <span className="text-amber-500 font-medium">{formatCurrency(stats.soldValue)}</span> Sold Value
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-800">Recent Apartments</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Lot Number</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Floor</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Area (m²)</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApartments.map((apartment) => (
                  <tr key={apartment.id} className="table-row border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      <Link to={`/admin/apartments/${apartment.id}`} className="text-teal-600 hover:underline">
                        {apartment.lotNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{apartment.type}</td>
                    <td className="px-4 py-3 text-slate-700">{apartment.floorName || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{apartment.area}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(apartment.price)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={apartment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-center">
            <Link to="/admin/apartments" className="text-teal-600 text-sm font-medium hover:underline">
              View All Apartments
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-medium text-slate-800">Admin Actions</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link 
                to="/admin/users" 
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">User Management</h3>
                  <p className="text-sm text-slate-500">Manage user roles and permissions</p>
                </div>
              </Link>
              
              <Link 
                to="/admin/settings" 
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="p-2 bg-teal-50 rounded-lg">
                  <Settings size={20} className="text-teal-500" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">System Settings</h3>
                  <p className="text-sm text-slate-500">Configure system preferences</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;