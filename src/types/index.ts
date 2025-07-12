export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  language: string;
  tone: string;
  createdAt: Date;
  userId: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  language: string;
  tone: string;
  createdAt: Date;
  userId: string;
}

export interface VideoCustomization {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  aspectRatio: '9:16' | '16:9';
  language: string;
  speed: number; // 0.5 to 2.0 (slow to fast)
  textAnimation: 'scroll' | 'fade' | 'typewriter';
  backgroundImage?: string; // URL for background image
  startingImage?: string; // URL for starting image
  outroImage?: string; // URL for outro image
  startingDuration?: number; // Duration for starting image (3-10 seconds)
  outroDuration?: number; // Duration for outro image (3-10 seconds)
}

export interface Video {
  id: string;
  storyId: string;
  videoUrl: string;
  customization: VideoCustomization;
  createdAt: Date;
  userId: string;
}

export interface StoryGenerationOptions {
  prompt: string;
  language: string;
  tone: string;
  wordCount: number;
}
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' }
];

export const WORD_COUNT_OPTIONS = [
  { value: 150, label: '150 words (Short)' },
  { value: 300, label: '300 words (Medium)' },
  { value: 500, label: '500 words (Long)' },
  { value: 800, label: '800 words (Very Long)' },
  { value: 1200, label: '1200 words (Extended)' },
  { value: 1800, label: '1800 words (Epic)' }
];

export const ANIMATION_OPTIONS = [
  { value: 'scroll', label: 'Smooth Scroll' },
  { value: 'fade', label: 'Fade In/Out' },
  { value: 'typewriter', label: 'Typewriter Effect' }
];
export const TONE_OPTIONS = [
  'Professional',
  'Casual',
  'Friendly',
  'Formal',
  'Creative',
  'Informative',
  'Persuasive',
  'Storytelling',
  'Humorous',
  'Inspirational',
  'Adventure',
  'Fantasy',
  'Mystery',
  'Romance',
  'Comedy',
  'Drama',
  'Children\'s Story'
];

export interface PricingPlan {
  id: string;
  name: string;
  priceUSD: number;
  priceINR: number;
  priceEUR: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    blogs: number;
    stories: number;
    videos: number;
  };
  razorpayPlanId?: string;
  popular?: boolean;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' }
};

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  razorpaySubscriptionId?: string;
  createdAt: Date;
}

export interface UsageStats {
  userId: string;
  blogs: number;
  stories: number;
  videos: number;
  resetDate: Date;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceUSD: 0,
    priceINR: 0,
    priceEUR: 0,
    interval: 'month',
    features: [
      '3 Stories per month',
      '2 Blogs per month', 
      '1 Video per month',
      'Basic customization',
      'Standard quality'
    ],
    limits: {
      blogs: 2,
      stories: 3,
      videos: 1
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUSD: 9.99,
    priceINR: 799,
    priceEUR: 8.99,
    interval: 'month',
    features: [
      'Unlimited Stories',
      'Unlimited Blogs',
      '20 Videos per month',
      'Advanced customization',
      'HD quality videos',
      'Priority support',
      'Custom fonts & animations'
    ],
    limits: {
      blogs: -1, // -1 means unlimited
      stories: -1,
      videos: 20
    },
    razorpayPlanId: 'plan_pro_799',
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    priceUSD: 19.99,
    priceINR: 1599,
    priceEUR: 17.99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited Videos',
      '4K quality videos',
      'Custom branding',
      'API access',
      'White-label solution',
      'Dedicated support'
    ],
    limits: {
      blogs: -1,
      stories: -1,
      videos: -1
    },
    razorpayPlanId: 'plan_premium_1599'
  }
];