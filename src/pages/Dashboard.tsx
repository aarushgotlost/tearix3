import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { getUserBlogs, getUserStories, getUserVideos } from '../services/firestore';
import { Blog, Story, Video } from '../types';
import { FileText, BookOpen, Video as VideoIcon, Calendar, Globe, Eye, Edit, Download, Clock, X, Crown } from 'lucide-react';
import { PricingModal } from '../components/PricingModal';
import { UsageBanner } from '../components/UsageBanner';
import { createRazorpayCheckout } from '../services/subscription';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { subscription, usage, currentPlan, refreshData } = useSubscription();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'blogs' | 'stories' | 'videos'>('stories');
  const [previewContent, setPreviewContent] = useState<{ type: 'blog' | 'story', content: Blog | Story } | null>(null);
  const [editContent, setEditContent] = useState<{ type: 'blog' | 'story', content: Blog | Story } | null>(null);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const [blogsData, storiesData, videosData] = await Promise.all([
          getUserBlogs(user.uid),
          getUserStories(user.uid),
          getUserVideos(user.uid)
        ]);

        setBlogs(blogsData);
        setStories(storiesData);
        setVideos(videosData);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleUpgrade = () => {
    setShowPricing(true);
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

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  };

  const handlePreview = (type: 'blog' | 'story', content: Blog | Story) => {
    setPreviewContent({ type, content });
  };

  const handleEdit = (type: 'blog' | 'story', content: Blog | Story) => {
    setEditContent({ type, content });
  };

  const closePreview = () => {
    setPreviewContent(null);
  };

  const closeEdit = () => {
    setEditContent(null);
  };

  const handleCreateVideo = (story: Story) => {
    navigate(`/customize/video?storyId=${story.id}`);
  };
  
  const handleRecreateVideo = (video: Video) => {
    // Navigate to customize video with the same story
    navigate(`/customize/video?storyId=${video.storyId}`);
  };

  const tabs = [
    { id: 'stories', label: 'Stories', count: stories.length, icon: BookOpen },
    { id: 'blogs', label: 'Blogs', count: blogs.length, icon: FileText },
    { id: 'videos', label: 'Videos', count: videos.length, icon: VideoIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your creations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Welcome back, {user?.displayName}!
          </h1>
          <p className="text-base sm:text-xl text-gray-600 px-4">
            Manage your AI-generated content and track your creative journey
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              Current Plan: {currentPlan.name}
            </span>
            {currentPlan.id === 'free' && (
              <button
                onClick={handleUpgrade}
                className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-xs font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Usage Banner */}
        {usage && (
          <UsageBanner
            usage={usage}
            currentPlan={currentPlan.id}
            onUpgrade={handleUpgrade}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <div key={tab.id} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">{tab.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{tab.count}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-50 rounded-xl">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{tab.label}</span>
                    <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs hidden sm:inline">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'stories' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {stories.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-gray-600">No stories yet. Start creating!</p>
                  </div>
                ) : (
                  stories.map((story) => (
                    <div key={story.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-purple-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm sm:text-base">{story.title}</h3>
                            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{story.language}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-3">
                        {story.content.slice(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{formatDate(story.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handlePreview('story', story)}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-purple-600 transition-colors"
                            title="Preview Story"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit('story', story)}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit Story"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button 
                            onClick={() => handleCreateVideo(story)}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-pink-600 transition-colors"
                            title="Create Video"
                          >
                            <VideoIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'blogs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {blogs.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-gray-600">No blogs yet. Start writing!</p>
                  </div>
                ) : (
                  blogs.map((blog) => (
                    <div key={blog.id} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-green-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm sm:text-base">{blog.title}</h3>
                            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{blog.language}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-3">
                        {blog.content.slice(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handlePreview('blog', blog)}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-green-600 transition-colors"
                            title="Preview Blog"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit('blog', blog)}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit Blog"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {videos.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <VideoIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-gray-600">No videos yet. Create your first video!</p>
                    <Link
                      to="/create"
                      className="inline-flex items-center mt-4 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all text-sm"
                    >
                      <VideoIcon className="w-4 h-4 mr-2" />
                      Create Video
                    </Link>
                  </div>
                ) : (
                  videos.map((video) => (
                    <div key={video.id} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-pink-100">
                      {/* Video Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                            <VideoIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">
                              {/* Get the story title from the storyId */}
                              Video #{video.id.slice(-6)}
                            </h3>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className="px-2 py-1 bg-white rounded-full">{video.customization.aspectRatio}</span>
                              <span className="px-2 py-1 bg-white rounded-full">{video.customization.textAnimation}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {formatDate(video.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Video Preview */}
                      <div className="mb-4">
                        <div 
                          className="w-full h-32 sm:h-40 rounded-xl flex items-center justify-center relative overflow-hidden border-2 border-white shadow-lg"
                          style={{ 
                            backgroundColor: video.customization.backgroundColor,
                            backgroundImage: video.customization.backgroundImage ? `url(${video.customization.backgroundImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            aspectRatio: video.customization.aspectRatio === '9:16' ? '9/16' : '16/9'
                          }}
                        >
                          {video.customization.backgroundImage && (
                            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                          )}
                          <div className="relative z-10 text-center">
                            <div className="p-3 bg-white bg-opacity-20 rounded-full mb-2">
                              <VideoIcon 
                                className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" 
                                style={{ color: video.customization.textColor }}
                              />
                            </div>
                            <p 
                              className="text-xs sm:text-sm font-bold px-3 py-1 bg-black bg-opacity-50 rounded-full"
                              style={{ 
                                color: video.customization.textColor,
                                fontFamily: video.customization.fontFamily,
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                              }}
                            >
                              {video.customization.aspectRatio}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Video Details */}
                      <div className="mb-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500">Font</div>
                            <div className="text-xs font-semibold text-gray-900 truncate">{video.customization.fontFamily}</div>
                          </div>
                          <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500">Size</div>
                            <div className="text-xs font-semibold text-gray-900">{video.customization.fontSize}px</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500">Speed</div>
                            <div className="text-xs font-semibold text-gray-900">{video.customization.speed}x</div>
                          </div>
                          <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500">Animation</div>
                            <div className="text-xs font-semibold text-gray-900 capitalize">{video.customization.textAnimation}</div>
                          </div>
                        </div>
                        {(video.customization.backgroundImage || video.customization.startingImage || video.customization.outroImage) && (
                          <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500">Custom Images</div>
                            <div className="text-xs font-semibold text-gray-900">
                              {[video.customization.backgroundImage, video.customization.startingImage, video.customization.outroImage].filter(Boolean).length} added
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-pink-200">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(video.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => handleRecreateVideo(video)}
                            className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-xs font-medium"
                            title="Recreate Video"
                          >
                            <VideoIcon className="w-3 h-3 mr-1" />
                            Recreate
                          </button>
                          <button 
                            onClick={() => navigate(`/render/video?storyId=${video.storyId}&customization=${encodeURIComponent(JSON.stringify(video.customization))}`)}
                            className="flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all text-xs font-medium"
                            title="Render Video"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Render
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
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

      {/* Preview Modal */}
      {previewContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {previewContent.content.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>Language: {previewContent.content.language}</span>
                  <span>•</span>
                  <span>Tone: {previewContent.content.tone}</span>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm sm:text-base">
                  {previewContent.content.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Edit {editContent.type === 'blog' ? 'Blog' : 'Story'}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>Language: {editContent.content.language}</span>
                  <span>•</span>
                  <span>Tone: {editContent.content.tone}</span>
                </div>
              </div>
              <button
                onClick={closeEdit}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    defaultValue={editContent.content.title}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    defaultValue={editContent.content.content}
                    rows={15}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={closeEdit}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};