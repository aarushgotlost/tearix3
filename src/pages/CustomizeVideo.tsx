import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { getStoryById } from '../services/firestore';
import { Story, VideoCustomization, SUPPORTED_LANGUAGES, ANIMATION_OPTIONS } from '../types';
import { Palette, Type, Monitor, Smartphone, ArrowRight, Loader2, Zap, Play, Image, Upload, X, Grid, Crown, Lock } from 'lucide-react';
import { PricingModal } from '../components/PricingModal';
import { createRazorpayCheckout } from '../services/subscription';

export const CustomizeVideo: React.FC = () => {
  const { user } = useAuth();
  const { canCreateContent, incrementUsage, getRemainingUsage, currentPlan } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storyId = searchParams.get('storyId');
  
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [customization, setCustomization] = useState<VideoCustomization>({
    backgroundColor: '#1e1e1e',
    textColor: '#ffffff',
    fontSize: 72,
    fontFamily: 'Inter',
    aspectRatio: '9:16',
    language: 'en',
    speed: 1.0,
    textAnimation: 'scroll',
    backgroundImage: '',
    startingImage: '',
    outroImage: ''
  });
  const [activeImageTab, setActiveImageTab] = useState<'background' | 'intro' | 'outro' | null>(null);

  // Simple file upload function
  const uploadImageFile = async (file: File, imageType: 'background' | 'intro' | 'outro') => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPG, PNG, WEBP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    console.log('Uploading:', file.name, 'for', imageType);

    try {
      // Convert file to base64 data URL for immediate use
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        console.log('File converted to data URL');
        
        // Update customization immediately
        const key = imageType === 'background' ? 'backgroundImage' :
                   imageType === 'intro' ? 'startingImage' : 'outroImage';
        handleCustomizationChange(key, dataUrl);
        setUploadingImage(false);
      };
      
      reader.onerror = () => {
        setUploadError('Failed to read file');
        setUploadingImage(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError('Failed to process image. Please try again.');
      setUploadingImage(false);
      setActiveImageTab(null); // Hide upload options after successful upload
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeImageTab) {
      uploadImageFile(file, activeImageTab);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file selection
  const selectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && activeImageTab) {
      uploadImageFile(file, activeImageTab);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Use external image URL
  const useExternalImage = (url: string, imageType: 'background' | 'intro' | 'outro') => {
    if (url.trim()) {
      const key = imageType === 'background' ? 'backgroundImage' :
                 imageType === 'intro' ? 'startingImage' : 'outroImage';
      handleCustomizationChange(key, url);
      setUploadError(null);
      setActiveImageTab(null); // Hide upload options after setting URL
    }
  };

  // Handle image settings from ImageManager
  useEffect(() => {
    const imageSettingsKey = searchParams.get('imageSettingsKey');
    if (imageSettingsKey) {
      try {
        const storedSettings = sessionStorage.getItem(imageSettingsKey);
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          setCustomization(prev => ({
            ...prev,
            backgroundImage: parsed.backgroundImage || prev.backgroundImage,
            startingImage: parsed.startingImage || prev.startingImage,
            outroImage: parsed.outroImage || prev.outroImage,
            startingDuration: parsed.startingDuration || 5,
            outroDuration: parsed.outroDuration || 5
          }));
          // Clean up sessionStorage after use
          sessionStorage.removeItem(imageSettingsKey);
        }
        // Clear the URL parameter
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('imageSettingsKey');
        navigate(`${location.pathname}?${newSearchParams}`, { replace: true });
      } catch (error) {
        console.error('Error parsing image settings:', error);
      }
    }
  }, [searchParams, navigate, location.pathname]);

  useEffect(() => {
    const loadStory = async () => {
      if (!storyId) {
        navigate('/generate/story', { replace: true });
        return;
      }

      try {
        const storyData = await getStoryById(storyId);
        if (storyData) {
          setStory(storyData);
          setCustomization(prev => ({
            ...prev,
            language: storyData.language
          }));
        } else {
          navigate('/generate/story', { replace: true });
        }
      } catch (error) {
        console.error('Error loading story:', error);
        navigate('/generate/story', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [storyId, navigate]);

  const handleCustomizationChange = (key: keyof VideoCustomization, value: any) => {
    setCustomization(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    // Check if user can create video
    if (!canCreateContent('video')) {
      setShowPricing(true);
      return;
    }

    if (story && storyId) {
      const params = new URLSearchParams({
        storyId,
        customization: JSON.stringify(customization)
      });
      navigate(`/render/video?${params}`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  const previewStyles = {
    backgroundColor: customization.backgroundColor,
    color: customization.textColor,
    fontSize: `${customization.fontSize}px`,
    fontFamily: customization.fontFamily,
    aspectRatio: customization.aspectRatio === '9:16' ? '9/16' : '16/9'
  };

  const remainingVideos = getRemainingUsage('video');
  const canCreateVideo = canCreateContent('video');

  return (
    <div className="min-h-screen py-6 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-3 sm:p-4 rounded-2xl">
              <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Customize Your Video
          </h1>
          <p className="text-base sm:text-xl text-gray-600 px-4">
            Personalize the look and feel of your story video
          </p>
          {currentPlan.id === 'free' && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600">
                {remainingVideos === Infinity ? 'Unlimited' : `${remainingVideos} videos remaining`} this month
              </span>
              {remainingVideos !== Infinity && remainingVideos <= 0 && (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Customization Panel */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Video Settings</h2>
            
            {/* Story Info */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{story.title}</h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <span>Language: {SUPPORTED_LANGUAGES.find(l => l.code === story.language)?.name}</span>
                <span>•</span>
                <span>Tone: {story.tone}</span>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Background Color
                </label>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <input
                    type="color"
                    value={customization.backgroundColor}
                    onChange={(e) => handleCustomizationChange('backgroundColor', e.target.value)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.backgroundColor}
                    onChange={(e) => handleCustomizationChange('backgroundColor', e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="#1e1e1e"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Text Color
                </label>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <input
                    type="color"
                    value={customization.textColor}
                    onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.textColor}
                    onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  Text Size: {customization.fontSize}px
                </label>
                <input
                  type="range"
                  min="36"
                  max="120"
                  value={customization.fontSize}
                  onChange={(e) => handleCustomizationChange('fontSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                  <span>Small (36px)</span>
                  <span>Large (120px)</span>
                </div>
              </div>

              {/* Video Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  Video Speed: {customization.speed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={customization.speed}
                  onChange={(e) => handleCustomizationChange('speed', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                  <span>Slow (0.5x)</span>
                  <span>Normal (1x)</span>
                  <span>Fast (2x)</span>
                </div>
              </div>

              {/* Text Animation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  Text Animation
                </label>
                <select
                  value={customization.textAnimation}
                  onChange={(e) => handleCustomizationChange('textAnimation', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                >
                  {ANIMATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  Font Family
                </label>
                <select
                  value={customization.fontFamily}
                  onChange={(e) => handleCustomizationChange('fontFamily', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Lato">Lato</option>
                  <option value="Noto Sans">Noto Sans</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                  <option value="Arial Black">Arial Black (Bold)</option>
                  <option value="Impact">Impact (Strong)</option>
                </select>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => handleCustomizationChange('aspectRatio', '9:16')}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-center text-sm ${
                      customization.aspectRatio === '9:16'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">9:16 (Mobile)</span>
                    <span className="sm:hidden">9:16</span>
                  </button>
                  <button
                    onClick={() => handleCustomizationChange('aspectRatio', '16:9')}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-center text-sm ${
                      customization.aspectRatio === '16:9'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <Monitor className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">16:9 (Desktop)</span>
                    <span className="sm:hidden">16:9</span>
                  </button>
                </div>
              </div>
            </div>
              {/* Image Management Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Video Images
                </label>
                
                {/* Image Type Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (customization.backgroundImage && activeImageTab !== 'background') {
                        // If image exists and we're not currently editing, show remove option
                        return;
                      }
                      setActiveImageTab(activeImageTab === 'background' ? null : 'background');
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      activeImageTab === 'background'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : customization.backgroundImage
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <Image className="w-4 h-4 mb-1" />
                      <span>Background</span>
                      {customization.backgroundImage && <span className="text-xs text-green-600">✓</span>}
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (customization.startingImage && activeImageTab !== 'intro') {
                        return;
                      }
                      setActiveImageTab(activeImageTab === 'intro' ? null : 'intro');
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      activeImageTab === 'intro'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : customization.startingImage
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <Play className="w-4 h-4 mb-1" />
                      <span>Intro</span>
                      {customization.startingImage && <span className="text-xs text-green-600">✓</span>}
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (customization.outroImage && activeImageTab !== 'outro') {
                        return;
                      }
                      setActiveImageTab(activeImageTab === 'outro' ? null : 'outro');
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      activeImageTab === 'outro'
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : customization.outroImage
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <X className="w-4 h-4 mb-1" />
                      <span>Outro</span>
                      {customization.outroImage && <span className="text-xs text-green-600">✓</span>}
                    </div>
                  </button>
                </div>
                
                {/* Show Remove Button for Images that Exist */}
                {!activeImageTab && (
                  <div className="space-y-2">
                    {customization.backgroundImage && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                          <Image className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Background Image Set</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveImageTab('background')}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCustomizationChange('backgroundImage', '')}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {customization.startingImage && (
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center">
                          <Play className="w-4 h-4 mr-2 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">Intro Image Set</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveImageTab('intro')}
                            className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCustomizationChange('startingImage', '')}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {customization.outroImage && (
                      <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <div className="flex items-center">
                          <X className="w-4 h-4 mr-2 text-pink-600" />
                          <span className="text-sm font-medium text-pink-800">Outro Image Set</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveImageTab('outro')}
                            className="px-3 py-1 text-xs bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCustomizationChange('outroImage', '')}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {!customization.backgroundImage && !customization.startingImage && !customization.outroImage && (
                      <div className="text-center p-4 text-gray-500 text-sm">
                        No images added yet. Click on the buttons above to add images.
                      </div>
                    )}
                  </div>
                )}
                
                {/* Image Upload Section */}
                {activeImageTab && (
                  <div className="border-2 border-gray-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {activeImageTab === 'background' && 'Background Image'}
                        {activeImageTab === 'intro' && 'Intro Image'}
                        {activeImageTab === 'outro' && 'Outro Image'}
                      </h4>
                      <button
                        onClick={() => setActiveImageTab(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* URL Input */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Image URL</label>
                      <input
                        type="url"
                        value={
                          activeImageTab === 'background' ? customization.backgroundImage :
                          activeImageTab === 'intro' ? customization.startingImage :
                          customization.outroImage
                        }
                        onChange={(e) => {
                          useExternalImage(e.target.value, activeImageTab);
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div className="text-center text-gray-500 text-sm">or</div>
                    
                    {/* Device Upload Section */}
                    <div>
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      
                      <label className="block text-sm text-gray-600 mb-2">Upload from Device</label>
                      <div
                        className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 transition-all cursor-pointer hover:border-purple-400 hover:bg-gray-50"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={selectFile}
                      >
                        {uploadingImage ? (
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Uploading...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              JPG, PNG, WEBP up to 5MB
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Error Message */}
                      {uploadError && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">{uploadError}</p>
                          <button
                            onClick={() => setUploadError(null)}
                            className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Image Options */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Quick Options</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { url: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800', name: 'Nature' },
                          { url: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800', name: 'Abstract' },
                          { url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800', name: 'Gradient' },
                          { url: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800', name: 'Minimal' }
                        ].map((option, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              useExternalImage(option.url, activeImageTab);
                            }}
                            className="p-2 border border-gray-300 rounded-lg hover:border-purple-400 transition-colors text-xs"
                          >
                            <img 
                              src={option.url} 
                              alt={option.name}
                              className="w-full h-12 object-cover rounded mb-1"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <span>{option.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Duration Settings for Intro/Outro */}
                    {(activeImageTab === 'intro' || activeImageTab === 'outro') && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Display Duration: {
                            activeImageTab === 'intro' 
                              ? (customization.startingDuration || 5)
                              : (customization.outroDuration || 5)
                          } seconds
                        </label>
                        <input
                          type="range"
                          min="3"
                          max="10"
                          value={
                            activeImageTab === 'intro' 
                              ? (customization.startingDuration || 5)
                              : (customization.outroDuration || 5)
                          }
                          onChange={(e) => {
                            const key = activeImageTab === 'intro' ? 'startingDuration' : 'outroDuration';
                            handleCustomizationChange(key, parseInt(e.target.value));
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>3 sec</span>
                          <span>10 sec</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Clear Image Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const key = activeImageTab === 'background' ? 'backgroundImage' :
                                   activeImageTab === 'intro' ? 'startingImage' : 'outroImage';
                        handleCustomizationChange(key, '');
                        setActiveImageTab(null);
                      }}
                      className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center"
                      disabled={uploadingImage}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear Image
                    </button>
                    
                    {/* Image Preview */}
                    {(
                      (activeImageTab === 'background' && customization.backgroundImage) ||
                      (activeImageTab === 'intro' && customization.startingImage) ||
                      (activeImageTab === 'outro' && customization.outroImage)
                    ) && (
                      <div className="mt-3">
                        <label className="block text-sm text-gray-600 mb-2">Preview</label>
                        <div className="relative">
                          <img
                            src={
                              activeImageTab === 'background' ? customization.backgroundImage :
                              activeImageTab === 'intro' ? customization.startingImage :
                              customization.outroImage
                            }
                            alt="Preview"
                            className="w-full h-20 object-cover rounded-lg border border-gray-300"
                            onError={() => {
                              const key = activeImageTab === 'background' ? 'backgroundImage' :
                                         activeImageTab === 'intro' ? 'startingImage' : 'outroImage';
                              handleCustomizationChange(key, '');
                              alert('Failed to load image');
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
            <button
              onClick={handleNext}
              disabled={!canCreateVideo}
              className={`w-full mt-6 sm:mt-8 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                canCreateVideo 
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              {!canCreateVideo ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Upgrade to Create Videos
                </>
              ) : (
                <>
                  Render Video
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Preview</h2>
            
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Speed: {customization.speed}x
              </div>
              <div className="flex items-center">
                <Play className="w-4 h-4 mr-1" />
                {customization.textAnimation}
              </div>
            </div>
            
            <div className="flex justify-center">
              <div
                className="relative rounded-2xl overflow-hidden shadow-lg w-full max-w-xs sm:max-w-sm"
                style={{
                  ...previewStyles,
                  backgroundImage: customization.backgroundImage ? `url(${customization.backgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {customization.backgroundImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                )}
                <div className="p-4 sm:p-6 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                  <div className="text-center relative z-10">
                    <div className="mb-4">
                      <Type 
                        className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" 
                        style={{ color: customization.textColor }}
                      />
                      <p 
                        className="text-xs sm:text-sm opacity-75"
                        style={{ color: customization.textColor }}
                      >
                        Preview Text
                      </p>
                    </div>
                    <div 
                      className="max-w-[240px] sm:max-w-[280px] line-clamp-4 sm:line-clamp-6 leading-relaxed text-sm sm:text-base"
                      style={{ 
                        color: customization.textColor,
                        fontFamily: customization.fontFamily,
                        fontSize: `${Math.min(customization.fontSize / 4, 16)}px`,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      {story.content.slice(0, 150)}...
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Video Settings Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <div>Font: {customization.fontSize}px {customization.fontFamily}</div>
                <div>Speed: {customization.speed}x</div>
                <div>Animation: {ANIMATION_OPTIONS.find(a => a.value === customization.textAnimation)?.label}</div>
                <div>Ratio: {customization.aspectRatio}</div>
                <div>
                  Images: {[customization.backgroundImage, customization.startingImage, customization.outroImage].filter(Boolean).length}/3 added
                </div>
                <div className="text-xs">
                  {customization.backgroundImage && '🖼️ Background '}
                  {customization.startingImage && '▶️ Intro '}
                  {customization.outroImage && '🔚 Outro'}
                  {!customization.backgroundImage && !customization.startingImage && !customization.outroImage && 'No images added'}
                </div>
              </div>
            </div>
          </div>
        </div>
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