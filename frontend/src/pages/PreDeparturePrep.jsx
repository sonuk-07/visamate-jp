import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plane, CheckCircle, Home, Heart, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '../utils';
import { useLanguage } from '../components/LanguageContext';

export default function PreDeparturePrep() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-white pt-24">
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-[#1e3a5f] hover:text-[#c9a962] mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t.preDeparture.backToHome}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1e3a5f]">{t.preDeparture.title}</h1>
          </div>

          <p className="text-xl text-gray-600 mb-12">
            {t.preDeparture.subtitle}
          </p>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">{t.preDeparture.whatWeHelpWith}</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <Home className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.preDeparture.accommodation}</h3>
                  <p className="text-gray-600">{t.preDeparture.accommodationDesc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Heart className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.preDeparture.healthInsurance}</h3>
                  <p className="text-gray-600">{t.preDeparture.healthInsuranceDesc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Book className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.preDeparture.culturalOrientation}</h3>
                  <p className="text-gray-600">{t.preDeparture.culturalOrientationDesc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">{t.preDeparture.checklist}</h2>
            
            <div className="space-y-3">
              {t.preDeparture.checklistItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#c9a962] flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#faf8f5] rounded-3xl p-8">
            <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">{t.preDeparture.orientationTitle}</h3>
            <p className="text-gray-600 mb-4">
              {t.preDeparture.orientationDesc}
            </p>
            <ul className="space-y-2 text-gray-600">
              {t.preDeparture.orientationItems.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white px-12 py-6 text-lg rounded-full"
            >
              {t.preDeparture.cta}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}