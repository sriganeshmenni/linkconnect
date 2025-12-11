import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    try {
      const key = `linkconnect_profile_photo_${(user as any)?.id || 'anon'}`;
      const stored = localStorage.getItem(key);
      if (stored) setPhoto(stored);
    } catch (e) {}
  }, [user]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white">LC</span>
              </div>
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                LinkConnect
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/profile" className="flex items-center">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-orange-200 hover:border-blue-400 transition-all">
                  {photo ? (
                    <img src={photo} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    (user.name && user.name.length > 0)
                      ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                      : <UserCircle className="w-7 h-7" />
                  )}
                </div>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
              <UserCircle className="w-6 h-6" />
              <span className="text-sm font-medium">Profile</span>
            </Link>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span className="text-sm">{user.name}</span>
            </div>
            <div className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs inline-block">
              {user.role.toUpperCase()}
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 justify-start"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
