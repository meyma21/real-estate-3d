import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import Layout from './components/layout/Layout';

// Admin Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Apartments from './pages/Apartments';
import ApartmentDetail from './pages/ApartmentDetail';
import Floors from './pages/Floors';
import Buyers from './pages/Buyers';

// Viewer Pages
import ThreeDViewer from './pages/ThreeDViewer';
import GlassFloorImageViewerPage from './pages/GlassFloorImageViewer';
import FloorAnnotator from './pages/admin/FloorAnnotator';
import AdminManagement from './pages/admin/AdminManagement';
import ApartmentManagement from './pages/admin/ApartmentManagement';
import BuyerManagement from './pages/admin/BuyerManagement';
import FloorManagement from './pages/admin/FloorManagement';
import HotspotManagement from './pages/admin/HotspotManagement';
import Gallery from './pages/viewer/Gallery';
import Location from './pages/viewer/Location';
import Contact from './pages/viewer/Contact';
import About from './pages/viewer/About';
import ViewerApartments from './pages/viewer/ViewerApartments';
import Unauthorized from './pages/Unauthorized';
import DebugStorage from './pages/DebugStorage';
import UploadFiles from './pages/UploadFiles';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/debug-storage" element={<DebugStorage />} />
            <Route path="/upload-files" element={<UploadFiles />} />
            <Route path="/viewer" element={<ThreeDViewer />} />
            <Route path="/viewer/floors" element={<GlassFloorImageViewerPage />} />
            <Route path="/viewer/floors/:floorId" element={<GlassFloorImageViewerPage />} />
            <Route path="/viewer/gallery" element={<Gallery />} />
            <Route path="/viewer/location" element={<Location />} />
            <Route path="/viewer/contact" element={<Contact />} />
            <Route path="/viewer/about" element={<About />} />
            <Route path="/viewer/apartments" element={<ViewerApartments />} />
            
            {/* Protected routes with Layout */}
            <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="apartments" element={<Apartments />} />
              <Route path="apartments/:id" element={<ApartmentDetail />} />
              <Route path="buyers" element={<Buyers />} />
              <Route path="floors" element={<Floors />} />
              <Route path="viewer" element={<ThreeDViewer />} />
              <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
              <Route path="users" element={<div>User Management Page (Coming Soon)</div>} />
              <Route path="floors/:floorId/annotate" element={<AdminRoute><FloorAnnotator /></AdminRoute>} />
              
              {/* New Admin Management Routes */}
              <Route path="management" element={<AdminManagement />} />
              <Route path="management/apartments" element={<ApartmentManagement />} />
              <Route path="management/buyers" element={<BuyerManagement />} />
              <Route path="management/floors" element={<FloorManagement />} />
              <Route path="management/hotspots" element={<HotspotManagement />} />
            </Route>
            
            {/* Redirect root to viewer/floors */}
            <Route path="/" element={<Navigate to="/viewer/floors" replace />} />
            <Route path="*" element={<Navigate to="/viewer/floors" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;