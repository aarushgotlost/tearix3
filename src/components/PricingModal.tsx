import React, { useState } from 'react';
import { X, Check, Crown, Zap, Star, Loader2 } from 'lucide-react';
import { PRICING_PLANS, PricingPlan, SUPPORTED_CURRENCIES } from '../types';
import { useAuth } from '../hooks/useAuth';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PricingPlan, currency: string) => void;
  currentPlan?: string;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  currentPlan = 'free'
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (plan.id === 'free') {
      onSelectPlan(plan, currency);
      return;
    }

    if (!user) {
      alert('Please sign in to upgrade your plan');
      return;
    }

    setLoading(plan.id);
    try {
      onSelectPlan(plan, 'INR');
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Failed to select plan. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="w-6 h-6" />;
      case 'pro':
        return <Zap className="w-6 h-6" />;
      case 'premium':
        return <Crown className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'pro':
        return 'from-purple-500 to-blue-600';
      case 'premium':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Choose Your Plan
              </h2>
              <div className="mt-2">
                <p className="text-gray-600">
                  Unlock the full potential of AI content creation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50'
                    : currentPlan === plan.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                {currentPlan === plan.id && (
                  <div className="absolute -top-3 right-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Current Plan
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${getPlanColor(plan.id)} text-white mb-4`}>
                    {getPlanIcon(plan.id)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{plan.priceINR}
                    </span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading === plan.id || currentPlan === plan.id}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                    currentPlan === plan.id
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : currentPlan === plan.id ? (
                    'Current Plan'
                  ) : plan.id === 'free' ? (
                    'Get Started Free'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              All plans include access to our AI-powered content generation in 19+ languages. Prices shown in Indian Rupees (₹).
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <span>✓ Secure payments with Razorpay</span>
              <span>✓ Cancel anytime</span>
              <span>✓ 30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};