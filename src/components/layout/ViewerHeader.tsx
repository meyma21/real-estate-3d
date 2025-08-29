import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, X, Image, Building2, MapPin, Phone, Info } from 'lucide-react';

const ViewerHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { to: '/viewer', label: '3D Viewer', icon: <Home className="w-5 h-5" /> },
    { to: '/viewer/floors', label: 'Floor Images', icon: <Image className="w-5 h-5" /> },
    { to: '/viewer/gallery', label: 'Galerie', icon: <Image className="w-5 h-5" /> },
    { to: '/viewer/location', label: 'Localisation', icon: <MapPin className="w-5 h-5" /> },
    { to: '/viewer/contact', label: 'Contactez-nous', icon: <Phone className="w-5 h-5" /> },
    { to: '/viewer/about', label: 'À propos', icon: <Info className="w-5 h-5" /> },
    { to: '/viewer/apartments', label: 'Appartements', icon: <Building2 className="w-5 h-5" /> }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/viewer" className="text-xl font-bold text-teal-600">
            Real Estate
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-teal-600 bg-teal-50'
                    : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                {link.icon && <span className="mr-1">{link.icon}</span>}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-teal-600 hover:bg-teal-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(link.to)
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon && <span className="mr-1">{link.icon}</span>}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ViewerHeader; 