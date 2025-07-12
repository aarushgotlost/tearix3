import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 sm:p-4 rounded-2xl">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-lg text-gray-600">
              Last updated: January 2025
            </p>
          </div>

          <div className="prose max-w-none text-sm sm:text-base">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We collect information you provide directly to us, such as when you:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Create an account or sign in</li>
              <li>Generate content using our AI services</li>
              <li>Contact us for support</li>
              <li>Subscribe to our newsletter or updates</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">2. Types of Data Collected</h2>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information:</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>Name and email address</li>
              <li>Profile information (if provided)</li>
              <li>Authentication data from third-party providers (Google)</li>
            </ul>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Data:</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
              <li>Content you create using our AI services</li>
              <li>Usage patterns and preferences</li>
              <li>Device information and IP address</li>
              <li>Browser type and version</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and store your generated content</li>
              <li>Authenticate your account and prevent fraud</li>
              <li>Send you technical notices and support messages</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Data is stored securely using Firebase/Google Cloud infrastructure</li>
              <li>Encryption in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Compliance with industry security standards</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
              <li>In case of business transfer or merger</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">6. Third-Party Services</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Our service integrates with third-party providers:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Google Firebase:</strong> For authentication and data storage</li>
              <li><strong>Google AI (Gemini):</strong> For content generation</li>
              <li><strong>Google Analytics:</strong> For usage analytics (if applicable)</li>
            </ul>
            <p className="mb-6 text-gray-700 leading-relaxed">
              These services have their own privacy policies, and we encourage you to review them.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              We retain your information for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and associated data at any time by contacting us.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at{' '}
              <a href="mailto:tearix.app@gmail.com" className="text-purple-600 hover:text-purple-700 underline">
                tearix.app@gmail.com
              </a>
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">13. Cancellation and Refund Policy</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We want you to be completely satisfied with our service:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Free Plan:</strong> No charges apply, cancel anytime</li>
              <li><strong>Paid Plans:</strong> Cancel your subscription anytime from your dashboard</li>
              <li><strong>Refund Policy:</strong> 30-day money-back guarantee for new subscribers</li>
              <li><strong>Refund Process:</strong> Contact us within 30 days of purchase for a full refund</li>
              <li><strong>Processing Time:</strong> Refunds are processed within 5-7 business days</li>
              <li><strong>Partial Refunds:</strong> Pro-rated refunds available for annual subscriptions</li>
            </ul>
            <p className="mb-6 text-gray-700 leading-relaxed">
              To request a cancellation or refund, please contact us at{' '}
              <a href="mailto:tearix.app@gmail.com" className="text-purple-600 hover:text-purple-700 underline">
                tearix.app@gmail.com
              </a>{' '}
              with your account details and reason for cancellation.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">14. Shipping and Delivery</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Tearix AI is a digital service platform. All our products are delivered digitally:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Digital Products:</strong> All content (blogs, stories, videos) is generated and delivered instantly online</li>
              <li><strong>No Physical Shipping:</strong> We do not ship physical products</li>
              <li><strong>Instant Access:</strong> Generated content is immediately available in your dashboard</li>
              <li><strong>Download Options:</strong> Videos can be downloaded directly from the platform</li>
              <li><strong>Cloud Storage:</strong> All your content is securely stored in the cloud and accessible 24/7</li>
              <li><strong>Account Access:</strong> Service access is provided immediately upon successful payment</li>
            </ul>
            <p className="mb-6 text-gray-700 leading-relaxed">
              If you experience any issues accessing your content or account, please contact our support team immediately.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              For any questions, concerns, or support requests, you can reach us through the following channels:
            </p>
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">General Support</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Email:</strong> <a href="mailto:tearix.app@gmail.com" className="text-purple-600 hover:text-purple-700 underline">tearix.app@gmail.com</a></li>
                    <li><strong>Response Time:</strong> Within 24 hours</li>
                    <li><strong>Support Hours:</strong> Monday - Friday, 9 AM - 6 PM IST</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Business Inquiries</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Partnerships:</strong> tearix.app@gmail.com</li>
                    <li><strong>Media & Press:</strong> tearix.app@gmail.com</li>
                    <li><strong>Technical Issues:</strong> tearix.app@gmail.com</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              We strive to respond to all inquiries promptly and provide the best possible support experience. 
              When contacting us, please include your account email and a detailed description of your inquiry for faster assistance.
            </p>

            <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
              <p className="text-sm text-gray-600 text-center">
                Your privacy and satisfaction are important to us. We are committed to protecting your personal information, 
                providing excellent service, and being transparent about our data and business practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};