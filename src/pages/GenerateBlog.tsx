import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { generateContent } from '../config/gemini';
import { saveBlog } from '../services/firestore';
import { SUPPORTED_LANGUAGES, TONE_OPTIONS } from '../types';
import { FileText, Loader2, Sparkles, Copy, Check, Crown, Lock } from 'lucide-react';
import { PricingModal } from '../components/PricingModal';
import { createRazorpayCheckout } from '../services/subscription';

export const GenerateBlog: React.FC = () => {
  const { user } = useAuth();
  const { canCreateContent, incrementUsage, getRemainingUsage, currentPlan } = useSubscription();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('en');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    // Check if user can create content
    if (!canCreateContent('blog')) {
      setShowPricing(true);
      return;
    }

    setIsGenerating(true);
    try {
      const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === language);
      const prompt = `Write a comprehensive blog post about "${topic}" in ${selectedLang?.name} language. The tone should be ${tone}. The blog should be well-structured with an engaging introduction, detailed main content, and a compelling conclusion. Make it informative and engaging for readers. Include relevant examples and practical insights where appropriate.`;

      const content = await generateContent(prompt);
      
      // Extract title from the first line or generate one
      const lines = content.split('\n').filter(line => line.trim());
      const title = lines[0]?.replace(/^#+\s*/, '') || `Blog about ${topic}`;
      
      setGeneratedBlog(content);
      setBlogTitle(title);
      
      // Increment usage after successful generation
      await incrementUsage('blog');
    } catch (error) {
      console.error('Error generating blog:', error);
      alert('Failed to generate blog. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !generatedBlog) return;

    setIsSaving(true);
    try {
      await saveBlog({
        title: blogTitle,
        content: generatedBlog,
        language,
        tone,
        userId: user.uid
      });
      
      alert('Blog saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedBlog) {
      await navigator.clipboard.writeText(generatedBlog);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const remainingBlogs = getRemainingUsage('blog');
  const canGenerate = canCreateContent('blog');

  return (
    <div className="min-h-screen py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 sm:p-4 rounded-2xl">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            AI Blog Generator
          </h1>
          <p className="text-base sm:text-xl text-gray-600 px-4">
            Create professional blog posts in multiple languages with advanced AI
          </p>
          {currentPlan.id === 'free' && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600">
                {remainingBlogs === Infinity ? 'Unlimited' : `${remainingBlogs} blogs remaining`} this month
              </span>
              {remainingBlogs !== Infinity && remainingBlogs <= 1 && (
                <button
                  onClick={() => setShowPricing(true)}
                  className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-xs font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Upgrade
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your blog topic..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {TONE_OPTIONS.map(toneOption => (
                  <option key={toneOption} value={toneOption}>
                    {toneOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating || !canGenerate}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl text-sm sm:text-base ${
              canGenerate 
                ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Generating Blog...
              </>
            ) : !canGenerate ? (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Upgrade to Generate More Blogs
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Blog
              </>
            )}
          </button>
        </div>

        {generatedBlog && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Generated Blog</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !user}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Blog'
                  )}
                </button>
              </div>
            </div>

            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm sm:text-base">
                {generatedBlog}
              </div>
            </div>
          </div>
        )}
      </div>

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