import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { ArrowRight, Sparkles, Globe, Video, FileText, Zap, Users, Shield, Crown, Check } from 'lucide-react';
import { PRICING_PLANS, SUPPORTED_CURRENCIES } from '../types';
import { PricingModal } from '../components/PricingModal';
import { createRazorpayCheckout } from '../services/subscription';
import { useState } from 'react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const { currentPlan } = useSubscription();
  const [showPricing, setShowPricing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const features = [
    {
      icon: <Globe className="w-8 h-8 text-purple-600" />,
      title: "Multi-Language Support",
      description: "Generate content in 13+ languages including Hindi, Tamil, Telugu, and more"
    },
    {
      icon: <Video className="w-8 h-8 text-blue-600" />,
      title: "AI Story Video Creation",
      description: "Transform your stories into engaging videos with customizable styles and animations"
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: "Blog & Story Creation",
      description: "Create professional blogs and captivating stories with AI assistance"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Lightning Fast",
      description: "Powered by advanced AI technology for instant content generation"
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "User Dashboard",
      description: "Manage all your creations in one organized, beautiful dashboard"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Secure & Private",
      description: "Your content is protected with Firebase security and encryption"
    }
  ];

  const handleUpgradeClick = (planId: string) => {
    console.log('Upgrade button clicked for plan:', planId);
    
    if (!user) {
      // Redirect to login if not authenticated
      console.log('User not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    if (planId === 'free') {
      // Free plan - just redirect to create content
      console.log('Free plan selected, redirecting to create');
      window.location.href = '/create';
      return;
    }
    
    console.log('Opening pricing modal for plan:', planId);
    setSelectedPlan(planId);
    setShowPricing(true);
  };

  const handleSelectPlan = async (plan: any, selectedCurrency: string) => {
    console.log('Plan selected:', plan, 'Currency:', selectedCurrency);
    
    if (plan.id === 'free') {
      setShowPricing(false);
      window.location.href = '/create';
      return;
    }

    if (!user) {
      console.log('User not found, redirecting to login');
      alert('Please sign in to upgrade your plan');
      window.location.href = '/login';
      return;
    }

    try {
      console.log('Processing payment for plan:', plan.name);
      
      await createRazorpayCheckout(
        plan.priceINR,
        'INR',
        plan.name,
        user.email,
        user.displayName || 'User',
        user.uid
      );
      
      setShowPricing(false);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('❌ Failed to process upgrade. Please try again or contact support.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-12 sm:pt-20 pb-16 sm:pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-3 sm:p-4 rounded-2xl">
                  <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 px-2">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tearix AI
              </span>
              <br />
              <span className="text-gray-800">
                Create Magic
              </span>
            </h1>
            
            <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Transform your ideas into stunning content with our AI-powered platform. Generate blogs, stories, and videos in multiple languages with advanced AI technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Link
                to="/create"
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-purple-300 text-center"
              >
                View Dashboard
              </Link>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 px-4">
              Powerful Features for Content Creators
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Everything you need to create professional content with AI assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-purple-50 transition-colors">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 px-4">
              Simple, Transparent Pricing
            </h2>
            <div className="max-w-3xl mx-auto px-4">
              <p className="text-base sm:text-xl text-gray-600">
                Choose the plan that fits your content creation needs
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {PRICING_PLANS.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl transform hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white border-2 border-purple-500'
                    : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-6 sm:mb-8">
                  <div className={`inline-flex p-3 sm:p-4 rounded-2xl mb-4 ${
                    plan.popular ? 'bg-white bg-opacity-20' : 'bg-gradient-to-r from-purple-100 to-blue-100'
                  }`}>
                    {plan.id === 'free' && <Sparkles className={`w-6 h-6 sm:w-8 sm:h-8 ${plan.popular ? 'text-white' : 'text-purple-600'}`} />}
                    {plan.id === 'pro' && <Zap className={`w-6 h-6 sm:w-8 sm:h-8 ${plan.popular ? 'text-white' : 'text-purple-600'}`} />}
                    {plan.id === 'premium' && <Crown className={`w-6 h-6 sm:w-8 sm:h-8 ${plan.popular ? 'text-white' : 'text-purple-600'}`} />}
                  </div>
                  <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className={`text-3xl sm:text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      ₹{plan.priceINR}
                    </span>
                    <span className={`text-base sm:text-lg ${plan.popular ? 'text-purple-100' : 'text-gray-600'}`}>
                      /{plan.interval}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${
                        plan.popular ? 'text-green-300' : 'text-green-500'
                      }`} />
                      <span className={`text-sm sm:text-base ${
                        plan.popular ? 'text-purple-100' : 'text-gray-700'
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => handleUpgradeClick(plan.id)}
                  className={`block w-full py-3 sm:py-4 px-6 rounded-xl font-semibold text-center transition-all duration-300 ${
                    plan.popular
                      ? 'bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {plan.id === 'free' ? 'Get Started Free' : `Start ${plan.name} Plan`}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              All plans include access to our AI-powered content generation in 19+ languages
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                Secure payments with Razorpay
              </div>
              <div className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                Cancel anytime
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-purple-500" />
                30-day money-back guarantee
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-24 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6 px-4">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-base sm:text-xl text-purple-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Transform your ideas into stunning content with our AI-powered platform. Generate blogs, stories, and story videos in multiple languages with advanced AI technology.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mx-4"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

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