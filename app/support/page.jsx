
import React from 'react';

const SupportPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Support Center</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">How can we help you?</h2>
          <p className="text-gray-700 mb-4">
            Our support team is here to assist you with any questions or issues you may have. 
            Please select from the options below or contact us directly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">Frequently Asked Questions</h3>
              <p className="text-gray-600">Find answers to common questions about our platform.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">Contact Support</h3>
              <p className="text-gray-600">Get in touch with our support team directly.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">Tournament Issues</h3>
              <p className="text-gray-600">Report problems or get help with tournament participation.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">Account & Billing</h3>
              <p className="text-gray-600">Help with account settings, payments, and subscriptions.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-[#00FFAA] bg-opacity-20 p-3 rounded-full mr-4">
                <svg className="w-6 h-6 text-[#00FFAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Email</h3>
                <p className="text-gray-600">support@example.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#00FFAA] bg-opacity-20 p-3 rounded-full mr-4">
                <svg className="w-6 h-6 text-[#00FFAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Live Chat</h3>
                <p className="text-gray-600">Available Monday to Friday, 9 AM - 6 PM EST</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#00FFAA] bg-opacity-20 p-3 rounded-full mr-4">
                <svg className="w-6 h-6 text-[#00FFAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Response Time</h3>
                <p className="text-gray-600">We aim to respond to all inquiries within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;