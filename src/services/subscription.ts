import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserSubscription, UsageStats } from '../types';
import { initiateRazorpayPayment } from './razorpay';

export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  try {
    const docRef = doc(db, 'subscriptions', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        currentPeriodStart: data.currentPeriodStart?.toDate() || new Date(),
        currentPeriodEnd: data.currentPeriodEnd?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date()
      } as UserSubscription;
    }
    return null;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
};

export const getUserUsage = async (userId: string): Promise<UsageStats> => {
  try {
    const docRef = doc(db, 'usage', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const resetDate = data.resetDate?.toDate() || new Date();
      
      // Check if we need to reset monthly usage
      const now = new Date();
      const shouldReset = now.getTime() > resetDate.getTime();
      
      if (shouldReset) {
        // Reset usage for new month
        const newResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const resetUsage: UsageStats = {
          userId,
          blogs: 0,
          stories: 0,
          videos: 0,
          resetDate: newResetDate
        };
        
        await updateDoc(docRef, {
          blogs: 0,
          stories: 0,
          videos: 0,
          resetDate: newResetDate
        });
        
        return resetUsage;
      }
      
      return {
        userId,
        blogs: data.blogs || 0,
        stories: data.stories || 0,
        videos: data.videos || 0,
        resetDate
      };
    } else {
      // Create initial usage document
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      
      const initialUsage: UsageStats = {
        userId,
        blogs: 0,
        stories: 0,
        videos: 0,
        resetDate: nextMonth
      };
      
      await setDoc(docRef, {
        ...initialUsage,
        resetDate: nextMonth
      });
      
      return initialUsage;
    }
  } catch (error) {
    console.error('Error getting user usage:', error);
    // Return default usage if error
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    
    return {
      userId,
      blogs: 0,
      stories: 0,
      videos: 0,
      resetDate: nextMonth
    };
  }
};

export const updateUserUsage = async (userId: string, usage: UsageStats): Promise<void> => {
  try {
    const docRef = doc(db, 'usage', userId);
    await updateDoc(docRef, {
      blogs: usage.blogs,
      stories: usage.stories,
      videos: usage.videos
    });
  } catch (error) {
    console.error('Error updating user usage:', error);
    throw error;
  }
};

export const createSubscription = async (subscription: Omit<UserSubscription, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = doc(db, 'subscriptions', subscription.userId);
    await setDoc(docRef, {
      ...subscription,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (userId: string, updates: Partial<UserSubscription>): Promise<void> => {
  try {
    const docRef = doc(db, 'subscriptions', userId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Razorpay integration functions
export const createRazorpayCheckout = async (
  amount: number,
  currency: string,
  planName: string,
  userEmail: string,
  userName: string,
  userId: string
) => {
  try {
    console.log('Creating Razorpay checkout for:', { amount, currency, planName, userEmail, userName });
    
    return new Promise<void>((resolve, reject) => {
      initiateRazorpayPayment(
        amount,
        currency,
        planName,
        userEmail,
        userName,
        async (response) => {
          // Payment successful
          console.log('Payment successful:', response);
          
          try {
            // Determine plan ID from plan name
            const planId = planName.toLowerCase();
            
            // Create subscription record
            const subscription: Omit<UserSubscription, 'id' | 'createdAt'> = {
              userId,
              planId,
              status: 'active',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              razorpaySubscriptionId: response.razorpay_payment_id
            };
            
            await createSubscription(subscription);
            
            // Show success message
            showNotification(`🎉 Payment Successful! Welcome to ${planName} plan. Your subscription is now active.`, 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
            
            resolve();
          } catch (error) {
            console.error('Error creating subscription:', error);
            showNotification('⚠️ Payment successful but there was an error activating your subscription. Please contact support.', 'error');
            reject(error);
          }
        },
        (error) => {
          // Payment failed
          console.error('Payment failed:', error);
          
          let errorMessage = 'Payment failed. Please try again.';
          if (error.message) {
            errorMessage = error.message;
          } else if (error.description) {
            errorMessage = error.description;
          }
          
          // Show error message
          showNotification(`❌ Payment Failed: ${errorMessage}`, 'error');
          
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Error creating Razorpay checkout:', error);
    showNotification('⚠️ Failed to initialize payment. Please try again.', 'error');
    
    throw error;
  }
};

// Simple notification function
const showNotification = (message: string, type: 'success' | 'error') => {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 300);
  }, 5000);
};

export const handleRazorpayWebhook = async (event: any) => {
  // This would be handled by your backend
  console.log('Razorpay webhook event:', event);
};