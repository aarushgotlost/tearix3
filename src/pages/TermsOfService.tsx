import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4 rounded-2xl">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-lg text-gray-600">
              Last updated: January 2025
            </p>
          </div>

          <div className="prose max-w-none text-sm sm:text-base">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              By accessing and using Tearix AI ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Tearix AI is an AI-powered content creation platform that allows users to generate blogs, stories, and videos using artificial intelligence technology. The service is provided "as is" and we reserve the right to modify or discontinue the service at any time.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              To access certain features of the service, you may be required to create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">4. Content and Intellectual Property</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Content generated using our AI service:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>You retain ownership of content you create using our service</li>
              <li>You are responsible for ensuring your content complies with applicable laws</li>
              <li>You grant us a license to process and store your content to provide the service</li>
              <li>We reserve the right to remove content that violates our policies</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">5. Prohibited Uses</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              You agree not to use the service to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Generate harmful, illegal, or offensive content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Attempt to reverse engineer or hack the service</li>
              <li>Use the service for commercial purposes without authorization</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using our service, you consent to the collection and use of information as outlined in our Privacy Policy.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Tearix AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              We strive to maintain high service availability but do not guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or technical issues.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">9. Modifications to Terms</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:tearix.app@gmail.com" className="text-purple-600 hover:text-purple-700 underline">
                tearix.app@gmail.com
              </a>
            </p>

            <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <p className="text-sm text-gray-600 text-center">
                By using Tearix AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};