// Razorpay configuration
export const RAZORPAY_KEY_ID = 'rzp_test_74gP8bZFJkpoUj';
export const RAZORPAY_SECRET = 'ZrFri1g5jNa4CmJB4GgAN1uV';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
    escape: boolean;
    backdropclose: boolean;
  };
  notes?: {
    plan: string;
    user_id: string;
  };
  retry: {
    enabled: boolean;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      console.log('Razorpay already loaded');
      resolve(true);
      return;
    }

    // Remove any existing script
    const existingScript = document.querySelector('script[src*="razorpay"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      // Add a delay to ensure Razorpay is fully initialized
      setTimeout(() => {
        if (window.Razorpay) {
          resolve(true);
        } else {
          console.error('Razorpay not available after script load');
          resolve(false);
        }
      }, 300);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Razorpay script:', error);
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
};

export const initiateRazorpayPayment = async (
  amount: number,
  currency: string,
  planName: string,
  userEmail: string,
  userName: string,
  onSuccess: (response: any) => void,
  onError: (error: any) => void
) => {
  try {
    console.log('Initiating Razorpay payment for:', { amount, currency, planName, userEmail });
    
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay SDK. Please check your internet connection and try again.');
    }

    // Verify Razorpay is available
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not available. Please refresh the page and try again.');
    }

    // Create payment options without order_id for direct payment
    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100, // Convert to paise
      currency: currency,
      name: 'Tearix AI',
      description: `${planName} Plan Subscription`,
      handler: (response) => {
        console.log('Payment successful:', response);
        try {
          onSuccess(response);
        } catch (error) {
          console.error('Error in success handler:', error);
          onError(error);
        }
      },
      prefill: {
        name: userName || 'User',
        email: userEmail,
      },
      theme: {
        color: '#8b5cf6'
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed by user');
          onError(new Error('Payment cancelled by user'));
        },
        escape: true,
        backdropclose: false
      },
      notes: {
        plan: planName,
        user_id: userEmail
      },
      retry: {
        enabled: true
      }
    };

    console.log('Opening Razorpay with options:', options);

    try {
      const razorpay = new window.Razorpay(options);
      
      // Add comprehensive error handling
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response);
        const errorMsg = response.error?.description || 
                        response.error?.reason || 
                        response.error?.field || 
                        'Payment failed. Please try again.';
        onError(new Error(errorMsg));
      });

      razorpay.on('payment.error', (response: any) => {
        console.error('Payment error:', response);
        onError(new Error('Payment processing error. Please try again.'));
      });

      // Add network error handling
      razorpay.on('payment.network_error', (response: any) => {
        console.error('Network error:', response);
        onError(new Error('Network error. Please check your connection and try again.'));
      });

      // Open the payment modal
      try {
        razorpay.open();
        console.log('Razorpay modal opened successfully');
      } catch (modalError) {
        console.error('Error opening Razorpay modal:', modalError);
        
        // Try alternative approach
        setTimeout(() => {
          try {
            razorpay.open();
            console.log('Razorpay modal opened on retry');
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            onError(new Error('Failed to open payment modal. Please refresh the page and try again.'));
          }
        }, 500);
      }
      
    } catch (razorpayError) {
      console.error('Error creating Razorpay instance:', razorpayError);
      onError(new Error('Failed to initialize payment. Please refresh the page and try again.'));
    }
    
  } catch (error) {
    console.error('Error initiating Razorpay payment:', error);
    onError(error);
  }
};

export const handleRazorpayWebhook = async (event: any) => {
  // This would be handled by your backend in production
  console.log('Razorpay webhook event:', event);
};