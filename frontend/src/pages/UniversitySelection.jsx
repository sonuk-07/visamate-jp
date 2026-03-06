import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, School, CheckCircle, Globe, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '../utils';
import { useLanguage } from '../components/LanguageContext';

export default function UniversitySelection() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-white pt-24">
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-[#1e3a5f] hover:text-[#c9a962] mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t.universitySelection.backToHome}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center">
              <School className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1e3a5f]">{t.universitySelection.title}</h1>
          </div>

          <p className="text-xl text-gray-600 mb-12">
            {t.universitySelection.subtitle}
          </p>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">{t.universitySelection.whatWeOffer}</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.universitySelection.personalizedAssessment}</h3>
                  <p className="text-gray-600">{t.universitySelection.personalizedAssessmentDesc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Globe className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.universitySelection.globalNetwork}</h3>
                  <p className="text-gray-600">{t.universitySelection.globalNetworkDesc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Users className="w-6 h-6 text-[#c9a962] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">{t.universitySelection.expertCounseling}</h3>
                  <p className="text-gray-600">{t.universitySelection.expertCounselingDesc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">{t.universitySelection.ourProcess}</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-[#1e3a5f] mb-1">{t.universitySelection.step1Title}</h4>
                  <p className="text-gray-600">{t.universitySelection.step1Desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-[#1e3a5f] mb-1">{t.universitySelection.step2Title}</h4>
                  <p className="text-gray-600">{t.universitySelection.step2Desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-[#1e3a5f] mb-1">{t.universitySelection.step3Title}</h4>
                  <p className="text-gray-600">{t.universitySelection.step3Desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div>
                  <h4 className="font-semibold text-[#1e3a5f] mb-1">{t.universitySelection.step4Title}</h4>
                  <p className="text-gray-600">{t.universitySelection.step4Desc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white px-12 py-6 text-lg rounded-full"
            >
              {t.universitySelection.cta}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}