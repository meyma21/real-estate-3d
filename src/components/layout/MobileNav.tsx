import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Home, Layers, Users, User, Box as Box3d, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useAuth();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  
  return (
    <>
      <button 
        onClick={toggleMenu}
        className="md:hidden fixed bottom-4 right-4 z-40 bg-teal-500 text-white p-3 rounded-full shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={closeMenu}>
          <div 
            className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-medium text-slate-800">Menu</h3>
              <button onClick={closeMenu}>
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            
            <nav className="p-4 space-y-1">
              <NavLink 
                to="/admin/dashboard" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm rounded-md ${
                    isActive 
                      ? 'bg-slate-100 text-teal-600' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
                onClick={closeMenu}
              >
                <LayoutDashboard size={18} className="mr-3" />
                Dashboard
              </NavLink>
              
              <NavLink 
                to="/admin/apartments" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm rounded-md ${
                    isActive 
                      ? 'bg-slate-100 text-teal-600' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
                onClick={closeMenu}
              >
                <Home size={18} className="mr-3" />
                Apartments
              </NavLink>
              
              <NavLink 
                to="/admin/floors" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm rounded-md ${
                    isActive 
                      ? 'bg-slate-100 text-teal-600' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
                onClick={closeMenu}
              >
                <Layers size={18} className="mr-3" />
                Floors
              </NavLink>
              
              <NavLink 
                to="/admin/3d-plans" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm rounded-md ${
                    isActive 
                      ? 'bg-slate-100 text-teal-600' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
                onClick={closeMenu}
              >
                <Box3d size={18} className="mr-3" />
                3D Plans
              </NavLink>
              
              <NavLink 
                to="/admin/buyers" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm rounded-md ${
                    isActive 
                      ? 'bg-slate-100 text-teal-600' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
                onClick={closeMenu}
              >
                <User size={18} className="mr-3" />
                Buyers
              </NavLink>
              
              {isAdmin() && (
                <NavLink 
                  to="/admin/users" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-md ${
                      isActive 
                        ? 'bg-slate-100 text-teal-600' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                  onClick={closeMenu}
                >
                  <Users size={18} className="mr-3" />
                  Users
                </NavLink>
              )}
              
              <NavLink 
                to="/admin/settings" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm rounded-md ${
                    isActive 
                      ? 'bg-slate-100 text-teal-600' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
                onClick={closeMenu}
              >
                <Settings size={18} className="mr-3" />
                Settings
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;