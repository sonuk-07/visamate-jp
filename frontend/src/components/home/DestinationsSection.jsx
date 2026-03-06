import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const countryImages = [
  "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600&h=400&fit=crop", // USA
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop", // UK
  "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&h=400&fit=crop", // Canada
  "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&h=400&fit=crop", // Australia
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&h=400&fit=crop", // Germany
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop"  // Japan
];

export default function DestinationsSection() {
  const { t } = useLanguage();

  return (
    <section id="destinations" className="py-24 bg-[#faf8f5]">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
            {t.destinations.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {t.destinations.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.destinations.countries.map((country, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
                <img
                  src={countryImages[index]}
                  alt={country.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f] via-[#1e3a5f]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {country.name}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {country.universities}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 bg-[#c9a962] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0"
                    >
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}