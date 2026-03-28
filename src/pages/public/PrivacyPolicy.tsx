import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-orange-100 rounded-xl">
            <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
          <div className="text-sm text-gray-500 border-b border-gray-200 pb-4">
            Last Updated: March 2025
          </div>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Officers Group of Hostels ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We collect information that you voluntarily provide to us when you register on the app, including:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Personal Information: Name, email address, phone number, CNIC</li>
              <li>Guardian Information: Guardian name, phone number</li>
              <li>Account Information: Login credentials, profile data</li>
              <li>Payment Information: Fee payment records and transaction history</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Create and manage your account</li>
              <li>Process admission requests and room allocations</li>
              <li>Handle fee payments and generate receipts</li>
              <li>Send verification and password reset emails</li>
              <li>Communicate important updates about your stay</li>
              <li>Maintain security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share data only with payment processors to complete transactions or when required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information, including encryption for data in transit and secure storage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:<br />
              📧 <a href="mailto:admin@offhostel.org" className="text-orange-600 hover:underline">admin@offhostel.org</a><br />
              📞 <a href="tel:+923358332755" className="text-orange-600 hover:underline">+92 3358332755</a><br />
              📍 Main G.T Road, Mandra, Rawalpindi
            </p>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">
              By using our services, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}