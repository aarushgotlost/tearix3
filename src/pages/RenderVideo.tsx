import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { getStoryById, saveVideo } from '../services/firestore';
import { Story, VideoCustomization, SUPPORTED_LANGUAGES } from '../types';
import { VideoRenderer } from '../services/videoRenderer';
import { Video, Download, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

export const RenderVideo: React.FC = () => {
  const { user } = useAuth();
  const { incrementUsage } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const storyId = searchParams.get('storyId');
  const customizationParam = searchParams.get('customization');
  
  const [story, setStory] = useState<Story | null>(null);
  const [customization, setCustomization] = useState<VideoCustomization | null>(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!storyId || !customizationParam) {
        navigate('/generate/story', { replace: true });
        return;
      }

      try {
        const [storyData, customizationData] = await Promise.all([
          getStoryById(storyId),
          Promise.resolve(JSON.parse(customizationParam) as VideoCustomization)
        ]);

        if (storyData) {
          setStory(storyData);
          setCustomization(customizationData);
        } else {
          navigate('/generate/story', { replace: true });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        navigate('/generate/story', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [storyId, customizationParam, navigate]);

  const handleRenderVideo = async () => {
    if (!story || !customization || !canvasRef.current) return;

    setRendering(true);
    setProgress(0);
    setError(null);

    try {
      const renderer = new VideoRenderer(canvasRef.current);
      const blob = await renderer.renderVideo(
        story.content,
        story.title,
        customization,
        (progress) => setProgress(progress)
      );

      setVideoBlob(blob);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      
      // Save video metadata to Firestore (without the blob URL)
      if (user) {
        await saveVideo({
          storyId: story.id,
          videoUrl: '', // Don't save blob URL to Firestore
          customization,
          userId: user.uid
        });
        
        // Increment usage after successful video creation
        await incrementUsage('video');
      }
    } catch (error) {
      console.error('Error rendering video:', error);
      setError('Failed to render video. Please try again.');
    } finally {
      setRendering(false);
    }
  };

  const handleDownload = () => {
    if (videoBlob && videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `${story?.title || 'story'}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleGoBack = () => {
    if (storyId) {
      navigate(`/customize/video?storyId=${storyId}`);
    } else {
      navigate('/generate/story');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!story || !customization) {
    return null;
  }

  return (
    <div className="min-h-screen py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-3 sm:p-4 rounded-2xl">
              <Video className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Render Your Video
          </h1>
          <p className="text-base sm:text-xl text-gray-600 px-4">
            Transform your story into a beautiful video
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <button
              onClick={handleGoBack}
              className="flex items-center px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customization
            </button>
            <div className="text-center sm:text-right">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                {story.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {SUPPORTED_LANGUAGES.find(l => l.code === story.language)?.name} • {story.tone}
              </p>
            </div>
          </div>

          {/* Canvas for video rendering */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <canvas
              ref={canvasRef}
              className="border-2 border-gray-300 rounded-2xl shadow-lg w-full max-w-xs sm:max-w-sm"
              style={{ display: rendering || videoUrl ? 'block' : 'none' }}
            />
            {!rendering && !videoUrl && (
              <div className="w-full max-w-xs sm:max-w-sm h-64 sm:h-96 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Video className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-gray-600 px-4">Click "Start Rendering" to begin</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          {rendering && (
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Rendering Progress
                </span>
                <span className="text-sm font-medium text-purple-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm sm:text-base text-red-700">{error}</p>
            </div>
          )}

          {/* Success message */}
          {videoUrl && (
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm sm:text-base text-green-700">Video rendered successfully!</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {!rendering && !videoUrl && (
              <button
                onClick={handleRenderVideo}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <Video className="w-5 h-5 mr-2" />
                Start Rendering
              </button>
            )}

            {rendering && (
              <button
                disabled
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-400 text-white rounded-xl font-semibold flex items-center justify-center cursor-not-allowed text-sm sm:text-base"
              >
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Rendering...
              </button>
            )}

            {videoUrl && (
              <button
                onClick={handleDownload}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Video
              </button>
            )}
          </div>

          {/* Video settings summary */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Video Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="font-medium">Background:</span> {customization.backgroundColor}
              </div>
              <div>
                <span className="font-medium">Text Color:</span> {customization.textColor}
              </div>
              <div>
                <span className="font-medium">Font Size:</span> {customization.fontSize}px
              </div>
              <div>
                <span className="font-medium">Font Family:</span> {customization.fontFamily}
              </div>
              <div>
                <span className="font-medium">Aspect Ratio:</span> {customization.aspectRatio}
              </div>
              <div>
                <span className="font-medium">Speed:</span> {customization.speed}x
              </div>
              <div>
                <span className="font-medium">Animation:</span> {customization.textAnimation}
              </div>
              <div>
                <span className="font-medium">Language:</span> {SUPPORTED_LANGUAGES.find(l => l.code === customization.language)?.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};