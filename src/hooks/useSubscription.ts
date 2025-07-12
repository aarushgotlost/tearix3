import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UserSubscription, UsageStats, PRICING_PLANS } from '../types';
import { getUserSubscription, getUserUsage, updateUserUsage } from '../services/subscription';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [subData, usageData] = await Promise.all([
          getUserSubscription(user.uid),
          getUserUsage(user.uid)
        ]);

        setSubscription(subData);
        setUsage(usageData);
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionData();
  }, [user]);

  const getCurrentPlan = () => {
    if (!subscription || subscription.status !== 'active') {
      return PRICING_PLANS.find(p => p.id === 'free')!;
    }
    return PRICING_PLANS.find(p => p.id === subscription.planId) || PRICING_PLANS.find(p => p.id === 'free')!;
  };

  const canCreateContent = (type: 'blog' | 'story' | 'video') => {
    if (!usage) return false;
    
    const plan = getCurrentPlan();
    const limit = plan.limits[type === 'blog' ? 'blogs' : type === 'story' ? 'stories' : 'videos'];
    
    if (limit === -1) return true; // Unlimited
    
    const currentUsage = type === 'blog' ? usage.blogs : 
                        type === 'story' ? usage.stories : usage.videos;
    
    return currentUsage < limit;
  };

  const incrementUsage = async (type: 'blog' | 'story' | 'video') => {
    if (!user || !usage) return false;

    if (!canCreateContent(type)) {
      return false;
    }

    try {
      const newUsage = {
        ...usage,
        [type === 'blog' ? 'blogs' : type === 'story' ? 'stories' : 'videos']: 
          usage[type === 'blog' ? 'blogs' : type === 'story' ? 'stories' : 'videos'] + 1
      };

      await updateUserUsage(user.uid, newUsage);
      setUsage(newUsage);
      return true;
    } catch (error) {
      console.error('Error updating usage:', error);
      return false;
    }
  };

  const getRemainingUsage = (type: 'blog' | 'story' | 'video') => {
    if (!usage) return 0;
    
    const plan = getCurrentPlan();
    const limit = plan.limits[type === 'blog' ? 'blogs' : type === 'story' ? 'stories' : 'videos'];
    
    if (limit === -1) return Infinity;
    
    const currentUsage = type === 'blog' ? usage.blogs : 
                        type === 'story' ? usage.stories : usage.videos;
    
    return Math.max(0, limit - currentUsage);
  };

  return {
    subscription,
    usage,
    loading,
    currentPlan: getCurrentPlan(),
    canCreateContent,
    incrementUsage,
    getRemainingUsage,
    refreshData: async () => {
      if (user) {
        const [subData, usageData] = await Promise.all([
          getUserSubscription(user.uid),
          getUserUsage(user.uid)
        ]);
        setSubscription(subData);
        setUsage(usageData);
      }
    }
  };
};