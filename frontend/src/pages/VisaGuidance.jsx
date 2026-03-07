import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, CheckCircle, FileCheck, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '../utils';
import { useLanguage } from '../components/LanguageContext';

export default function VisaGuidance() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-white pt-24">
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-[#1e3a5f] hover:text-[#c9a962] mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t.visaGuidance.backToHome}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1e3a5f]">{t.visaGuidance.title}</h1>
          </div>

          <p className="text-xl text-gray-600 mb-12">
            {t.visaGuidance.subtitle}
          </p>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">{t.visaGuidance.comprehensiveSupport}</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <FileCheck className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.visaGuidance.documentation}</h3>
                  <p className="text-gray-600">{t.visaGuidance.documentationDesc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Calendar className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.visaGuidance.interviewPrep}</h3>
                  <p className="text-gray-600">{t.visaGuidance.interviewPrepDesc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.visaGuidance.applicationReview}</h3>
                  <p className="text-gray-600">{t.visaGuidance.applicationReviewDesc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">{t.visaGuidance.countriesWeSupport}</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {t.visaGuidance.countries.map((country, index) => (
                <div key={index} className="bg-[#faf8f5] rounded-lg p-4 text-center">
                  <span className="text-[#1e3a5f] font-medium">{country}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] rounded-3xl p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">{t.visaGuidance.successRate}</h3>
            <p className="text-lg opacity-90">{t.visaGuidance.successRateDesc}</p>
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={() => document.getElementById('appointment-modal-trigger')?.click()}
              className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white px-12 py-6 text-lg rounded-full"
            >
              {t.visaGuidance.cta}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}