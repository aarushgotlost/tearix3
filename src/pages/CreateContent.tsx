import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, Video, ArrowRight, Sparkles, Zap, Globe } from 'lucide-react';

export const CreateContent: React.FC = () => {
  const contentTypes = [
    {
      id: 'blog',
      title: 'AI Blog Generator',
      description: 'Create professional blog posts with AI assistance. Perfect for websites, marketing, and content creation.',
      icon: <FileText className="w-8 h-8 text-green-600" />,
      gradient: 'from-green-50 to-blue-50',
      borderColor: 'border-green-100',
      buttonGradient: 'from-green-600 to-blue-600',
      buttonHover: 'hover:from-green-700 hover:to-blue-700',
      link: '/generate/blog',
      features: ['SEO Optimized', 'Multiple Languages', 'Professional Tone']
    },
    {
      id: 'story',
      title: 'AI Story Generator',
      description: 'Generate captivating stories and narratives. Great for entertainment, education, and creative writing.',
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      gradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-100',
      buttonGradient: 'from-purple-600 to-pink-600',
      buttonHover: 'hover:from-purple-700 hover:to-pink-700',
      link: '/generate/story',
      features: ['Creative Storytelling', 'Custom Length', 'Multiple Genres']
    },
    {
      id: 'story-video',
      title: 'Story + Video Creation',
      description: 'Create amazing stories and turn them into beautiful videos. Perfect for social media and content marketing.',
      icon: <Video className="w-8 h-8 text-pink-600" />,
      gradient: 'from-pink-50 to-red-50',
      borderColor: 'border-pink-100',
      buttonGradient: 'from-pink-600 to-red-600',
      buttonHover: 'hover:from-pink-700 hover:to-red-700',
      link: '/generate/story',
      features: ['Story Generation', 'Video Rendering', 'Custom Styling'],
      isPopular: true
    }
  ];

  return (
    <div className="min-h-screen py-6 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-3 sm:p-4 rounded-2xl">
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            What Would You Like to Create?
          </h1>
          <p className="text-base sm:text-xl text-gray-600 px-4 max-w-3xl mx-auto">
            Choose your content type and let our advanced AI help you create amazing content in multiple languages
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {contentTypes.map((type) => (
            <div
              key={type.id}
              className={`relative group bg-gradient-to-br ${type.gradient} rounded-2xl sm:rounded-3xl p-6 sm:p-8 border ${type.borderColor} hover:border-purple-300 transition-all duration-300 hover:shadow-2xl transform hover:scale-105`}
            >
              {type.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-pink-600 to-red-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-all">
                    {type.icon}
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {type.title}
                </h3>
                
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  {type.description}
                </p>
                
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {type.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white bg-opacity-70 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Link
                  to={type.link}
                  className={`inline-flex items-center justify-center w-full px-6 py-3 sm:py-4 bg-gradient-to-r ${type.buttonGradient} text-white rounded-xl font-semibold ${type.buttonHover} transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base group`}
                >
                  Start Creating
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Why Choose Tearix AI?
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Advanced AI technology for professional content creation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Language Support</h3>
              <p className="text-sm text-gray-600">Create content in 19+ languages including Hindi, Tamil, Telugu, and more</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">Generate high-quality content in seconds with our advanced AI models</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <Video className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Video Creation</h3>
              <p className="text-sm text-gray-600">Transform your stories into beautiful videos with customizable styles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};