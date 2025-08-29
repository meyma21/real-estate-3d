import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, Layers, Users, User, Box as Box3d, Settings, Database } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  // Remove isAdmin check for Annotate Hotspots link
  // const { isAdmin } = useAuth();
  
  return (
    <aside className="bg-white border-r border-slate-200 h-full hidden md:block group w-16 hover:w-64 transition-all duration-300 z-10 flex-shrink-0">
      <div className="p-4">
        <nav className="space-y-1">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => 
              `sidebar-link flex items-center px-4 py-3 text-sm rounded-md ${
                isActive 
                  ? 'active bg-slate-50 text-teal-600' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <LayoutDashboard size={18} className="mr-3 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/admin/apartments" 
            className={({ isActive }) => 
              `sidebar-link flex items-center px-4 py-3 text-sm rounded-md ${
                isActive 
                  ? 'active bg-slate-50 text-teal-600' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <Home size={18} className="mr-3 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Apartments</span>
          </NavLink>
          
          <NavLink 
            to="/admin/floors" 
            className={({ isActive }) => 
              `sidebar-link flex items-center px-4 py-3 text-sm rounded-md ${
                isActive 
                  ? 'active bg-slate-50 text-teal-600' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <Layers size={18} className="mr-3 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Floors</span>
          </NavLink>
          
          <NavLink 
            to="/admin/3d-plans" 
            className={({ isActive }) => 
              `sidebar-link flex items-center px-4 py-3 text-sm rounded-md ${
                isActive 
                  ? 'active bg-slate-50 text-teal-600' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <Box3d size={18} className="mr-3 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">3D Plans</span>
          </NavLink>
          
          <NavLink 
            to="/admin/buyers" 
            className={({ isActive }) => 
              `sidebar-link flex items-center px-4 py-3 text-sm rounded-md ${
                isActive 
                  ? 'active bg-slate-50 text-teal-600' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <User size={18} className="mr-3 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Buyers</span>
          </NavLink>

          {/* Admin Management Panel */}
          <NavLink 
            to="/admin/management" 
            className={({ isActive }) => 
              `sidebar-link flex items-center px-4 py-3 text-sm rounded-md ${
                isActive 
                  ? 'active bg-slate-50 text-teal-600' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <Database size={18} className="mr-3 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Management</span>
          </NavLink>
          
          {/* Keep Users link admin-only if needed */}
          {/* {isAdmin && ( ... )} */}
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-200">
        <NavLink 
          to="/admin/settings" 
          className={({ isActive }) => 
            `sidebar-link flex items-center px-4 py-3 text-sm rounded-md ${
              isActive 
                ? 'active bg-slate-50 text-teal-600' 
                : 'text-slate-700 hover:bg-slate-50'
            }`
          }
        >
          <Settings size={18} className="mr-3 flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;