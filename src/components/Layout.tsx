import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Sparkles, User, LogOut, Menu, X, Crown } from 'lucide-react';
import { useState } from 'react';
import { PricingModal } from './PricingModal';
import { createRazorpayCheckout } from '../services/subscription';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { currentPlan } = useSubscription();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Create Content', href: '/create', current: location.pathname === '/create' },
    { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard' },
  ];

  const handleSelectPlan = async (plan: any, selectedCurrency: string) => {
    if (plan.id === 'free') {
      setShowPricing(false);
      return;
    }

    if (!user) {
      alert('Please sign in to upgrade');
      return;
    }

    try {
      if (plan.razorpayPlanId) {
        const price = plan.priceINR;
        
        await createRazorpayCheckout(
          price,
          'INR',
          plan.name,
          user.email,
          user.displayName,
          user.uid
        );
      } else {
        alert('Payment integration coming soon! Contact support for manual upgrade.');
      }
      setShowPricing(false);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to process upgrade. Please try again.');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Tearix AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    item.current
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Plan indicator */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                      <Crown className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700">
                        {currentPlan.name}
                      </span>
                    </div>
                    {currentPlan.id === 'free' && (
                      <button
                        onClick={() => setShowPricing(true)}
                        className="px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-xs font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {user.displayName}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:block">Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-purple-50 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-purple-100">
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 ${
                      item.current
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold">Tearix AI</span>
            </div>
            <p className="text-gray-400 text-center max-w-md text-sm sm:text-base px-4">
              Unleash your creativity with advanced AI content generation. Create stunning stories, blogs, and videos in multiple languages.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-400 px-4">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm text-center px-4">
              © 2025 Tearix AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onSelectPlan={handleSelectPlan}
        currentPlan={currentPlan.id}
      />
    </div>
  );
};