import { useState, useEffect } from 'react';

interface LocationInfo {
  country: string;
  countryCode: string;
  currency: string;
  timezone: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try to get location from IP
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          setLocation({
            country: data.country_name || 'Unknown',
            countryCode: data.country_code || 'US',
            currency: data.currency || 'USD',
            timezone: data.timezone || 'UTC'
          });
        } else {
          // Fallback to browser timezone detection
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const isIndia = timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta');
          
          setLocation({
            country: isIndia ? 'India' : 'United States',
            countryCode: isIndia ? 'IN' : 'US',
            currency: isIndia ? 'INR' : 'USD',
            timezone: timezone
          });
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        // Default fallback
        setLocation({
          country: 'United States',
          countryCode: 'US',
          currency: 'USD',
          timezone: 'UTC'
        });
      } finally {
        setLoading(false);
      }
    };

    detectLocation();
  }, []);

  const getCurrencyForCountry = (countryCode: string): string => {
    const currencyMap: Record<string, string> = {
      'IN': 'INR',
      'US': 'USD',
      'GB': 'USD',
      'CA': 'USD',
      'AU': 'USD',
      'DE': 'EUR',
      'FR': 'EUR',
      'IT': 'EUR',
      'ES': 'EUR',
      'NL': 'EUR',
      'BE': 'EUR',
      'AT': 'EUR',
      'PT': 'EUR',
      'IE': 'EUR',
      'FI': 'EUR',
      'GR': 'EUR'
    };
    
    return currencyMap[countryCode] || 'USD';
  };

  return {
    location,
    loading,
    currency: location ? getCurrencyForCountry(location.countryCode) : 'USD'
  };
};