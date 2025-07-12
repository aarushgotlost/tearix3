import React from 'react';
import { AlertTriangle, Crown, Zap } from 'lucide-react';
import { UsageStats, PRICING_PLANS } from '../types';

interface UsageBannerProps {
  usage: UsageStats;
  currentPlan: string;
  onUpgrade: () => void;
}

export const UsageBanner: React.FC<UsageBannerProps> = ({
  usage,
  currentPlan,
  onUpgrade
}) => {
  const plan = PRICING_PLANS.find(p => p.id === currentPlan);
  if (!plan) return null;

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const isNearLimit = (used: number, limit: number) => {
    if (limit === -1) return false;
    return used >= limit * 0.8; // 80% of limit
  };

  const isAtLimit = (used: number, limit: number) => {
    if (limit === -1) return false;
    return used >= limit;
  };

  const showBanner = currentPlan === 'free' || 
    isNearLimit(usage.blogs, plan.limits.blogs) ||
    isNearLimit(usage.stories, plan.limits.stories) ||
    isNearLimit(usage.videos, plan.limits.videos);

  if (!showBanner) return null;

  const getStatusColor = () => {
    if (isAtLimit(usage.blogs, plan.limits.blogs) ||
        isAtLimit(usage.stories, plan.limits.stories) ||
        isAtLimit(usage.videos, plan.limits.videos)) {
      return 'from-red-500 to-red-600';
    }
    if (isNearLimit(usage.blogs, plan.limits.blogs) ||
        isNearLimit(usage.stories, plan.limits.stories) ||
        isNearLimit(usage.videos, plan.limits.videos)) {
      return 'from-yellow-500 to-orange-500';
    }
    return 'from-blue-500 to-purple-500';
  };

  return (
    <div className={`bg-gradient-to-r ${getStatusColor()} text-white p-4 rounded-xl mb-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            {currentPlan === 'free' ? (
              <Zap className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {currentPlan === 'free' ? 'Free Plan' : 'Usage Alert'}
            </h3>
            <div className="text-sm opacity-90">
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <span className="font-medium">Stories:</span> {usage.stories}
                  {plan.limits.stories !== -1 && `/${plan.limits.stories}`}
                </div>
                <div>
                  <span className="font-medium">Blogs:</span> {usage.blogs}
                  {plan.limits.blogs !== -1 && `/${plan.limits.blogs}`}
                </div>
                <div>
                  <span className="font-medium">Videos:</span> {usage.videos}
                  {plan.limits.videos !== -1 && `/${plan.limits.videos}`}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {currentPlan === 'free' && (
          <button
            onClick={onUpgrade}
            className="flex items-center space-x-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
          </button>
        )}
      </div>
      
      {/* Usage bars for free plan */}
      {currentPlan === 'free' && (
        <div className="mt-4 space-y-2">
          {[
            { label: 'Stories', used: usage.stories, limit: plan.limits.stories },
            { label: 'Blogs', used: usage.blogs, limit: plan.limits.blogs },
            { label: 'Videos', used: usage.videos, limit: plan.limits.videos }
          ].map(({ label, used, limit }) => (
            <div key={label} className="flex items-center space-x-3">
              <span className="text-xs font-medium w-16">{label}:</span>
              <div className="flex-1 bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${getUsagePercentage(used, limit)}%` }}
                />
              </div>
              <span className="text-xs font-medium w-12">
                {used}/{limit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};