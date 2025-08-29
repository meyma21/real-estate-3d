import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout: React.FC = () => {
  const location = useLocation();
  const isThreeDViewer = location.pathname === '/admin/viewer';
  
  return (
    <div className="h-screen bg-slate-50 admin-layout flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0">
        <Header />
      </div>
      
      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {!isThreeDViewer && (
          <div className="flex-shrink-0">
            <Sidebar />
          </div>
        )}
        
        {/* Scrollable Main Content */}
        <main className={`flex-1 overflow-y-auto bg-slate-50 ${isThreeDViewer ? '' : 'md:ml-16'}`}>
          <div className={`${isThreeDViewer ? 'px-0 py-0' : 'px-4 py-6'} min-h-full`}>
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Fixed Mobile Nav */}
      <div className="flex-shrink-0 md:hidden">
        <MobileNav />
      </div>
    </div>
  );
};

export default Layout;