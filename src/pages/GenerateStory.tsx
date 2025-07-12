import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { generateContent } from '../config/gemini';
import { saveStory } from '../services/firestore';
import { SUPPORTED_LANGUAGES, TONE_OPTIONS, WORD_COUNT_OPTIONS } from '../types';
import { BookOpen, Loader2, Sparkles, Copy, Check, Video, Save, Crown, Lock } from 'lucide-react';
import { PricingModal } from '../components/PricingModal';
import { createRazorpayCheckout } from '../services/subscription';

export const GenerateStory: React.FC = () => {
  const { user } = useAuth();
  const { canCreateContent, incrementUsage, getRemainingUsage, currentPlan } = useSubscription();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('en');
  const [tone, setTone] = useState('Storytelling');
  const [wordCount, setWordCount] = useState(800);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check if user can create content
    if (!canCreateContent('story')) {
      setShowPricing(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedStory('');
    setStoryTitle('');
    setStoryId(null);
    
    try {
      const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === language);
      const generationPrompt = `Generate a story and a separate title in ${selectedLang?.name} language.

Prompt: ${prompt}
Tone: ${tone}
Word Count: Write EXACTLY ${wordCount} words or more. This is very important - make the story detailed and comprehensive.

Please format your response exactly like this:
Title: [Generated Title in ${selectedLang?.name}]
Story: [Generated Story in ${selectedLang?.name}]

Make the story engaging, well-structured with a clear beginning, middle, and end. The story MUST be at least ${wordCount} words long - expand with rich descriptions, dialogue, character development, and detailed scenes. Make it suitable for video adaptation with vivid descriptions and compelling narrative flow. Use descriptive language that works well when read aloud. Add plenty of detail, dialogue, and scene descriptions to reach the target word count.`;

      const content = await generateContent(generationPrompt);
      
      // Parse the response to extract title and story
      const lines = content.split('\n');
      let title = '';
      let story = '';
      let isStorySection = false;
      
      for (const line of lines) {
        if (line.startsWith('Title:')) {
          title = line.replace('Title:', '').trim();
        } else if (line.startsWith('Story:')) {
          story = line.replace('Story:', '').trim();
          isStorySection = true;
        } else if (isStorySection && line.trim()) {
          story += '\n' + line;
        }
      }
      
      // Fallback if parsing fails
      if (!title || !story) {
        const contentLines = content.split('\n').filter(line => line.trim());
        title = contentLines[0]?.replace(/^#+\s*/, '') || `Story: ${prompt.slice(0, 50)}...`;
        story = content;
      }
      
      setStoryTitle(title);
      setGeneratedStory(story.trim());
      
      // Increment usage after successful generation
      await incrementUsage('story');
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !generatedStory || !storyTitle) return;

    setIsSaving(true);
    try {
      const savedStoryId = await saveStory({
        title: storyTitle,
        content: generatedStory,
        language,
        tone,
        userId: user.uid
      });
      
      setStoryId(savedStoryId);
      // Don't show alert, just provide visual feedback
    } catch (error) {
      console.error('Error saving story:', error);
      alert('Failed to save story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedStory) {
      const fullText = `${storyTitle}\n\n${generatedStory}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateVideo = async () => {
    if (!user || !generatedStory || !storyTitle) return;

    // Auto-save if not already saved
    if (!storyId) {
      setIsSaving(true);
      try {
        const savedStoryId = await saveStory({
          title: storyTitle,
          content: generatedStory,
          language,
          tone,
          userId: user.uid
        });
        setStoryId(savedStoryId);
        navigate(`/customize/video?storyId=${savedStoryId}`);
      } catch (error) {
        console.error('Error saving story:', error);
        alert('Failed to save story. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      navigate(`/customize/video?storyId=${storyId}`);
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

  const selectedLanguage = SUPPORTED_LANGUAGES.find(l => l.code === language);
  const remainingStories = getRemainingUsage('story');
  const canGenerate = canCreateContent('story');

  return (
    <div className="min-h-screen py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 sm:p-4 rounded-2xl">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            AI Story Generator
          </h1>
          <p className="text-base sm:text-xl text-gray-600 px-4">
            Create captivating stories in multiple languages with advanced AI
          </p>
          {currentPlan.id === 'free' && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600">
                {remainingStories === Infinity ? 'Unlimited' : `${remainingStories} stories remaining`} this month
              </span>
              {remainingStories !== Infinity && remainingStories <= 1 && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the story you want to create... (e.g., 'A child who gets lost in the mountains')"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Length
              </label>
              <select
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {WORD_COUNT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
            disabled={!prompt.trim() || isGenerating || !canGenerate}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl text-sm sm:text-base ${
              canGenerate 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Generating Story in {selectedLanguage?.name}...
              </>
            ) : !canGenerate ? (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Upgrade to Generate More Stories
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Story
              </>
            )}
          </button>
        </div>

        {generatedStory && storyTitle && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Generated Story</h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Language: {selectedLanguage?.name}
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Tone: {tone}
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Length: {wordCount} words
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
                  disabled={isSaving || !user || storyId !== null}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : storyId ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Story
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Story Title */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center">
                {storyTitle}
              </h3>
            </div>

            {/* Story Content */}
            <div className="prose max-w-none mb-6 sm:mb-8">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm sm:text-lg">
                {generatedStory}
              </div>
            </div>

            {/* Create Video Button */}
            <div className="border-t border-gray-200 pt-4 sm:pt-6">
              <div className="text-center">
                <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                  Ready to turn your story into a beautiful video?
                </p>
                <button
                  onClick={handleCreateVideo}
                  disabled={isSaving}
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Saving & Preparing...
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5 mr-2" />
                      🎬 Create Story Video
                    </>
                  )}
                </button>
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