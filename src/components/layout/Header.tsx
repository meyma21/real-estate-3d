import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-slate-800">
          Real Estate Management
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-slate-100 relative">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <User size={16} className="text-slate-600" />
          </div>
          
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-slate-100"
            title="Logout"
          >
            <LogOut size={18} className="text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;