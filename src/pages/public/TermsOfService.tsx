import React from "react";
import { Link } from "react-router-dom";
import { ScaleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-orange-100 rounded-xl">
            <ScaleIcon className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
          <div className="text-sm text-gray-500 border-b border-gray-200 pb-4">
            Last Updated: March 2025
          </div>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using the Officers Group of Hostels mobile application and website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed">
              To use our services, you must provide accurate and complete information during registration. You are responsible for maintaining the security of your account and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Admission and Allocation</h2>
            <p className="text-gray-600 leading-relaxed">
              Admission requests are subject to availability and approval by hostel administration. Room allocations are made based on availability and the order of application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Fee Payments</h2>
            <p className="text-gray-600 leading-relaxed">
              All fees must be paid according to the schedule provided. Late payments may result in additional charges or cancellation of accommodation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. User Conduct</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree not to misuse our services, attempt to gain unauthorized access, or provide false information. Violation may result in immediate termination of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to terminate or suspend your account for conduct that violates these Terms or is harmful to other users or the institution.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              Questions about these Terms? Contact us at:<br />
              📧 <a href="mailto:admin@offhostel.org" className="text-orange-600 hover:underline">admin@offhostel.org</a><br />
              📞 <a href="tel:+923358332755" className="text-orange-600 hover:underline">+92 3358332755</a>
            </p>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">
              By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}