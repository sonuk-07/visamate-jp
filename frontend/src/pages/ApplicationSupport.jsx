import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, CheckCircle, FileCheck, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '../utils';
import { useLanguage } from '../components/LanguageContext';

export default function ApplicationSupport() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-white pt-24">
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-[#1e3a5f] hover:text-[#c9a962] mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t.applicationSupport.backToHome}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1e3a5f]">{t.applicationSupport.title}</h1>
          </div>

          <p className="text-xl text-gray-600 mb-12">
            {t.applicationSupport.subtitle}
          </p>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">{t.applicationSupport.completeAssistance}</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <FileCheck className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.applicationSupport.documentPrep}</h3>
                  <p className="text-gray-600">{t.applicationSupport.documentPrepDesc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <MessageSquare className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.applicationSupport.essayWriting}</h3>
                  <p className="text-gray-600">{t.applicationSupport.essayWritingDesc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.applicationSupport.applicationReview}</h3>
                  <p className="text-gray-600">{t.applicationSupport.applicationReviewDesc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">{t.applicationSupport.whatsIncluded}</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {t.applicationSupport.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#c9a962] flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={() => document.getElementById('appointment-modal-trigger')?.click()}
              className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white px-12 py-6 text-lg rounded-full"
            >
              {t.applicationSupport.cta}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}