import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, FileCheck, MapPin, HomeIcon, ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { createPageUrl } from '../../utils';

const icons = [GraduationCap, FileCheck, MapPin, HomeIcon];
const pageLinks = ['UniversitySelection', 'ApplicationSupport', 'VisaGuidance', 'PreDeparturePrep'];

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
            {t.services.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {t.services.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.services.items.map((service, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Link to={createPageUrl(pageLinks[index])} className="block h-full">
                  <div className="bg-[#faf8f5] rounded-3xl p-8 h-full transition-all duration-300 group-hover:bg-[#1e3a5f] group-hover:shadow-2xl group-hover:shadow-[#1e3a5f]/20 cursor-pointer">
                    <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                      <Icon className="w-7 h-7 text-[#1e3a5f] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#1e3a5f] mb-3 group-hover:text-white transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-white/80 transition-colors mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center text-[#1e3a5f] group-hover:text-white transition-colors">
                      <span className="text-sm font-medium">Learn More</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}