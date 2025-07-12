import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send, MessageCircle, Phone, MapPin, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen py-6 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 sm:p-4 rounded-2xl">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Get in Touch
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about Tearix AI? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-purple-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a 
                      href="mailto:tearix.app@gmail.com"
                      className="text-purple-600 hover:text-purple-700 transition-colors text-sm sm:text-base"
                    >
                      tearix.app@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Usually within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Support</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Technical support and general inquiries</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white bg-opacity-70 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  <Link to="/terms" className="block text-purple-600 hover:text-purple-700 transition-colors">
                    Terms of Service
                  </Link>
                  <Link to="/privacy" className="block text-purple-600 hover:text-purple-700 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="/dashboard" className="block text-purple-600 hover:text-purple-700 transition-colors">
                    User Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
                  <p className="text-gray-600 mb-4">
                    For support, questions, or feedback, please email us at:
                  </p>
                  <a 
                    href="mailto:tearix.app@gmail.com"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    tearix.app@gmail.com
                  </a>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Response Time</h4>
                    <p className="text-sm text-gray-600">Usually within 24 hours</p>
                  </div>
                  
                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Support Type</h4>
                    <p className="text-sm text-gray-600">Technical & General Support</p>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">What can we help you with?</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Technical support and troubleshooting</li>
                    <li>• Account and billing questions</li>
                    <li>• Feature requests and feedback</li>
                    <li>• Partnership and business inquiries</li>
                    <li>• General questions about our services</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How does the AI content generation work?</h3>
                <p className="text-sm text-gray-600">
                  Our platform uses advanced AI models to generate high-quality content based on your prompts and preferences.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my content private and secure?</h3>
                <p className="text-sm text-gray-600">
                  Yes, all your content is stored securely and privately. We don't share your content with third parties.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I create content in multiple languages?</h3>
                <p className="text-sm text-gray-600">
                  Absolutely! We support 19+ languages including Hindi, Tamil, Telugu, and many more.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I create videos from my stories?</h3>
                <p className="text-sm text-gray-600">
                  After generating a story, you can customize it into a video with our video creation tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};